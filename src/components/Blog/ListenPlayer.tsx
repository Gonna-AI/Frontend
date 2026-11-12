import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Headphones, List, Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import { articleToSegments, fingerprint, hasSpeech, splitSentences } from '../../utils/articleSpeech';
import './ListenPlayer.css';

/**
 * "Listen to this article", like a podcast episode.
 *
 * - With a generated MP3 (npm run audio; used only while it still matches the text) it is real audio:
 *   it keeps playing with the screen locked or in another app and shows lock-screen controls.
 * - Without one it reads the article with the browser's own voice, sentence by sentence. That works
 *   everywhere speech synthesis exists, but phones stop it when the screen locks.
 * Either way: speed, 15 s back / 30 s forward, chapters (the article's sections), and it remembers
 * where you stopped.
 */

type Chapter = { title: string; id: string; start: number };
type Entry = { file: string; hash: string; duration: number; chapters: Chapter[] };
type Props = { slug: string; title: string; authors: string[]; markdown: string | null; de: boolean; cover?: string };

const RATES = [0.8, 1, 1.25, 1.5, 1.75, 2];
const STORAGE_KEY = 'ct-listen';
const CHARS_PER_SECOND = 15; // the browser voice's pace at 1x, to estimate time and position

let manifest: Promise<Record<string, Entry>> | null = null;
const loadManifest = () => (manifest ??= fetch('/journal/audio/manifest.json').then((r): Promise<Record<string, Entry>> => (r.ok ? r.json() : Promise.resolve({}))).catch((): Record<string, Entry> => ({})));

const clock = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
};

type Saved = { rate?: number; [slug: string]: number | undefined };
const readSaved = (): Saved => { try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } };
const writeSaved = (patch: Saved) => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSaved(), ...patch })); } catch { /* storage blocked: it just will not remember */ } };

const voiceScore = (v: SpeechSynthesisVoice) => (/^en(-|_|$)/i.test(v.lang) ? 10 : 0) + (/en[-_](US|GB)/i.test(v.lang) ? 2 : 0) + (/natural|neural|premium|enhanced|siri|google|samantha|daniel|karen|serena/i.test(v.name) ? 5 : 0) + (v.localService ? 0 : 1);

export default function ListenPlayer({ slug, title, authors, markdown, de, cover }: Props) {
  const authorKey = authors.join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps -- authorKey stands for authors, whose array identity changes every render
  const segments = useMemo(() => (markdown ? articleToSegments(markdown, { title, authors }) : []), [markdown, title, authorKey]);
  const [mode, setMode] = useState<'loading' | 'audio' | 'voice' | 'none'>('loading');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [rate, setRate] = useState(() => readSaved().rate ?? 1);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);
  const [started, setStarted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ---- which engine: the generated MP3 if it still matches this text, else the browser voice -------------
  useEffect(() => {
    if (!segments.length) return undefined;
    let alive = true;
    (async () => {
      let match: Entry | null = null;
      try { const [all, hash] = await Promise.all([loadManifest(), fingerprint(segments)]); if (all[slug]?.hash === hash) match = all[slug]; } catch { /* no manifest, or no crypto: voice mode */ }
      if (!alive) return;
      setEntry(match);
      setMode(match ? 'audio' : hasSpeech() ? 'voice' : 'none');
      setTime(readSaved()[slug] ?? 0);
    })();
    return () => { alive = false; };
  }, [segments, slug]);

  // ---- browser-voice timeline ---------------------------------------------------------------------------------
  const sentences = useMemo(() => segments.flatMap((segment, index) => splitSentences(segment.text).map((text) => ({ text, segment: index, kind: segment.kind }))), [segments]);
  const timeline = useMemo(() => {
    let at = 0;
    const starts = sentences.map((s) => { const here = at; at += s.text.length / CHARS_PER_SECOND + (s.kind === 'heading' ? 0.9 : 0.3); return here; });
    const chapters: Chapter[] = segments.flatMap((segment, index) => {
      if (segment.kind !== 'heading' || !segment.id) return [];
      const first = sentences.findIndex((s) => s.segment === index);
      return first >= 0 ? [{ title: segment.text, id: segment.id, start: starts[first] }] : [];
    });
    return { starts, duration: at, chapters };
  }, [sentences, segments]);

  const duration = mode === 'audio' ? entry?.duration ?? 0 : timeline.duration;
  // The MP3's chapters are matched to the page's headings by title, so the ids always belong to this page.
  const chapters = useMemo(() => {
    if (mode !== 'audio') return timeline.chapters;
    const ids = new Map(segments.flatMap((s) => (s.kind === 'heading' && s.id ? [[s.text, s.id] as const] : [])));
    return (entry?.chapters ?? []).map((c) => ({ ...c, id: ids.get(c.title) ?? c.id }));
  }, [mode, entry, segments, timeline.chapters]);

  // ---- the voice engine ---------------------------------------------------------------------------------------
  const voiceRef = useRef({ index: 0, token: 0, playing: false, rate: 1 });
  const voicePick = useRef<SpeechSynthesisVoice | null>(null);
  const pickVoice = useCallback(() => {
    const all = window.speechSynthesis.getVoices();
    voicePick.current = all.length ? [...all].sort((a, b) => voiceScore(b) - voiceScore(a))[0] : null;
  }, []);
  useEffect(() => {
    if (mode !== 'voice') return undefined;
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, [mode, pickVoice]);

  const speakFrom = useCallback((from: number) => {
    const state = voiceRef.current;
    window.speechSynthesis.cancel();
    const token = ++state.token;
    state.index = Math.min(Math.max(0, from), sentences.length - 1);
    state.playing = true;
    const next = () => {
      if (token !== state.token || !state.playing) return;
      const sentence = sentences[state.index];
      if (!sentence) { state.playing = false; setPlaying(false); setTime(0); writeSaved({ [slug]: 0 }); return; }
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.lang = voicePick.current?.lang || 'en-US';
      if (voicePick.current) utterance.voice = voicePick.current;
      utterance.rate = state.rate;
      utterance.onstart = () => setTime(timeline.starts[state.index] ?? 0);
      utterance.onend = () => { if (token !== state.token) return; state.index += 1; next(); };
      utterance.onerror = (event) => { if (token === state.token && event.error !== 'interrupted' && event.error !== 'canceled') { state.playing = false; setPlaying(false); } };
      window.speechSynthesis.speak(utterance);
    };
    next();
  }, [sentences, slug, timeline.starts]);

  const stopVoice = useCallback(() => { voiceRef.current.playing = false; voiceRef.current.token += 1; window.speechSynthesis?.cancel(); }, []);

  // Chrome silently pauses long speech; nudging it keeps it going.
  useEffect(() => {
    if (mode !== 'voice' || !playing) return undefined;
    const keepAlive = window.setInterval(() => { if (window.speechSynthesis.speaking) window.speechSynthesis.resume(); }, 10000);
    return () => window.clearInterval(keepAlive);
  }, [mode, playing]);

  useEffect(() => () => { if (hasSpeech()) { voiceRef.current.playing = false; voiceRef.current.token += 1; window.speechSynthesis.cancel(); } }, []);

  // ---- one set of controls over both engines ------------------------------------------------------------------
  const indexAt = useCallback((seconds: number) => { let i = 0; while (i + 1 < timeline.starts.length && timeline.starts[i + 1] <= seconds) i += 1; return i; }, [timeline.starts]);

  const play = useCallback(async () => {
    setStarted(true);
    if (mode === 'audio') {
      const audio = audioRef.current;
      if (!audio) return;
      audio.playbackRate = rate;
      if (Math.abs(audio.currentTime - time) > 1) audio.currentTime = time;
      try { await audio.play(); } catch { setPlaying(false); }
    } else if (mode === 'voice') {
      voiceRef.current.rate = rate;
      speakFrom(indexAt(time));
      setPlaying(true);
    }
  }, [mode, rate, time, speakFrom, indexAt]);

  const pause = useCallback(() => {
    if (mode === 'audio') audioRef.current?.pause();
    else { stopVoice(); setPlaying(false); }
    writeSaved({ [slug]: time });
  }, [mode, slug, time, stopVoice]);

  const seek = useCallback((seconds: number) => {
    const target = Math.min(Math.max(0, seconds), Math.max(0, duration - 0.5));
    setTime(target);
    writeSaved({ [slug]: target });
    if (mode === 'audio') { if (audioRef.current) audioRef.current.currentTime = target; }
    else if (voiceRef.current.playing) speakFrom(indexAt(target));
  }, [duration, mode, slug, speakFrom, indexAt]);

  const toggle = () => (playing ? pause() : void play());
  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length] ?? 1;
    setRate(next);
    writeSaved({ rate: next });
    voiceRef.current.rate = next;
    if (mode === 'audio' && audioRef.current) audioRef.current.playbackRate = next;
    else if (mode === 'voice' && voiceRef.current.playing) speakFrom(voiceRef.current.index);
  };

  const current = useMemo(() => { let active: Chapter | undefined; for (const chapter of chapters) if (chapter.start <= time + 0.25) active = chapter; return active; }, [chapters, time]);
  const jump = (offset: number) => {
    const at = chapters.findIndex((c) => c === current);
    const target = chapters[at + offset];
    if (target) seek(target.start); else if (offset < 0) seek(0);
  };

  // ---- lock-screen / headset controls ------------------------------------------------------------------------
  const latest = useRef({ play, pause, seek, jump, time });
  latest.current = { play, pause, seek, jump, time };
  useEffect(() => {
    if (mode === 'loading' || mode === 'none' || !('mediaSession' in navigator)) return undefined;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata({ title, artist: authors.join(', ') || 'ClerkTree', album: 'ClerkTree Journal', artwork: [{ src: cover || '/icon-512.png', sizes: '512x512', type: 'image/png' }] });
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => void latest.current.play()], ['pause', () => latest.current.pause()],
      ['seekbackward', () => latest.current.seek(latest.current.time - 15)], ['seekforward', () => latest.current.seek(latest.current.time + 30)],
      ['previoustrack', () => latest.current.jump(-1)], ['nexttrack', () => latest.current.jump(1)],
      ['seekto', (d) => { if (typeof d.seekTime === 'number') latest.current.seek(d.seekTime); }],
    ];
    for (const [action, handler] of handlers) { try { session.setActionHandler(action, handler); } catch { /* this browser lacks the action */ } }
    return () => { for (const [action] of handlers) { try { session.setActionHandler(action, null); } catch { /* ignore */ } } };
  }, [mode, title, authors, cover]);
  useEffect(() => {
    if (!('mediaSession' in navigator) || mode === 'loading' || mode === 'none') return;
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    try { if (duration > 0) navigator.mediaSession.setPositionState({ duration, playbackRate: rate, position: Math.min(time, duration) }); } catch { /* not supported */ }
  }, [mode, playing, duration, rate, time]);

  // ---- remember the position; mark the section being read; follow the visitor with a mini bar -----------------
  useEffect(() => {
    if (!playing) return undefined;
    const save = window.setInterval(() => writeSaved({ [slug]: latest.current.time }), 5000);
    return () => window.clearInterval(save);
  }, [playing, slug]);
  useEffect(() => {
    if (!current || !playing) return undefined;
    const el = document.getElementById(current.id);
    el?.classList.add('is-listening');
    return () => el?.classList.remove('is-listening');
  }, [current, playing]);
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;
    const io = new IntersectionObserver(([e]) => setCardVisible(e.isIntersecting), { rootMargin: '0px 0px -80px 0px' });
    io.observe(card);
    return () => io.disconnect();
  }, [mode]);

  if (mode === 'loading' || mode === 'none') return null;

  const copy = de
    ? { label: 'Artikel anhören', sub: mode === 'audio' ? 'Vorgelesen, auf Englisch' : 'Mit der Stimme Ihres Browsers, auf Englisch', back: '15 Sekunden zurück', fwd: '30 Sekunden vor', speed: 'Geschwindigkeit', chapters: 'Kapitel', play: 'Abspielen', pause: 'Pausieren', position: 'Position', lock: 'Die Browserstimme stoppt, wenn das Handy sperrt.', min: 'Min.' }
    : { label: 'Listen to this article', sub: mode === 'audio' ? 'Narrated' : "Read aloud by your browser's voice", back: 'Back 15 seconds', fwd: 'Forward 30 seconds', speed: 'Playback speed', chapters: 'Chapters', play: 'Play', pause: 'Pause', position: 'Position', lock: 'Browser voice stops when your phone locks.', min: 'min' };
  const progress = duration ? Math.min(100, (time / duration) * 100) : 0;
  const remaining = Math.max(0, duration - time);
  const showMini = started && !cardVisible;

  return (
    <>
      <div className="jr-listen" ref={cardRef} role="group" aria-label={copy.label}>
        {mode === 'audio' && entry && (
          <audio
            onEnded={() => { setPlaying(false); setTime(0); writeSaved({ [slug]: 0 }); }}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            preload="none"
            ref={audioRef}
            src={`/journal/audio/${entry.file}`}
          />
        )}
        <div className="jr-listen-head">
          <button aria-label={playing ? copy.pause : copy.play} className="jr-listen-play" onClick={toggle} type="button">
            {playing ? <Pause aria-hidden="true" fill="currentColor" size={20} /> : <Play aria-hidden="true" fill="currentColor" size={20} />}
          </button>
          <div className="jr-listen-title">
            <span><Headphones aria-hidden="true" size={13} /> {copy.label}</span>
            <small>{copy.sub} · {Math.max(1, Math.round(duration / 60))} {copy.min}</small>
          </div>
          <div className="jr-listen-actions">
            <button aria-label={copy.back} onClick={() => seek(time - 15)} type="button"><RotateCcw aria-hidden="true" size={18} strokeWidth={1.6} /><b>15</b></button>
            <button aria-label={copy.fwd} onClick={() => seek(time + 30)} type="button"><RotateCw aria-hidden="true" size={18} strokeWidth={1.6} /><b>30</b></button>
            <button aria-label={`${copy.speed}: ${rate}×`} className="jr-listen-rate" onClick={cycleRate} type="button">{rate}×</button>
            {chapters.length > 0 && (
              <button aria-expanded={chaptersOpen} aria-label={copy.chapters} className={chaptersOpen ? 'is-on' : undefined} onClick={() => setChaptersOpen((open) => !open)} type="button"><List aria-hidden="true" size={18} strokeWidth={1.6} /></button>
            )}
          </div>
        </div>
        <div className="jr-listen-scrub">
          <span>{clock(time)}</span>
          <input
            aria-label={copy.position}
            aria-valuetext={`${clock(time)} / ${clock(duration)}`}
            max={Math.max(1, Math.round(duration))}
            min={0}
            onChange={(event) => seek(Number(event.target.value))}
            step={1}
            style={{ ['--p' as string]: `${progress}%` }}
            type="range"
            value={Math.round(time)}
          />
          <span>-{clock(remaining)}</span>
        </div>
        {chaptersOpen && (
          <ol className="jr-listen-chapters">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <button className={chapter === current ? 'is-current' : undefined} onClick={() => { seek(chapter.start); if (!playing) void play(); setChaptersOpen(false); }} type="button">
                  <span>{chapter.title}</span><time>{clock(chapter.start)}</time>
                </button>
              </li>
            ))}
          </ol>
        )}
        {mode === 'voice' && <p className="jr-listen-note">{copy.lock}</p>}
      </div>

      {showMini && (
        <div className="jr-listen-mini" role="group" aria-label={copy.label}>
          <button aria-label={playing ? copy.pause : copy.play} className="jr-listen-play is-small" onClick={toggle} type="button">
            {playing ? <Pause aria-hidden="true" fill="currentColor" size={16} /> : <Play aria-hidden="true" fill="currentColor" size={16} />}
          </button>
          <div className="jr-listen-mini-text">
            <span>{current?.title ?? title}</span>
            <i aria-hidden="true"><b style={{ width: `${progress}%` }} /></i>
          </div>
          <button aria-label={copy.back} className="jr-listen-mini-skip" onClick={() => seek(time - 15)} type="button"><RotateCcw aria-hidden="true" size={17} strokeWidth={1.6} /></button>
          <button aria-label={`${copy.speed}: ${rate}×`} className="jr-listen-rate" onClick={cycleRate} type="button">{rate}×</button>
        </div>
      )}
    </>
  );
}
