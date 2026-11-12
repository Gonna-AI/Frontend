// A scroll-driven journey through Hive's connected plant graph.
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Header, Footer } from '../../components/Landing/SiteChrome';
import SEO from '../../components/SEO';
import HiveLogo from '../../components/Brand/HiveLogo';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiveScene, type HiveCopy } from './HiveScene';
import { onTierChange } from '../../utils/perf';
import '../LandingFramer.css';
import './Hive.css';

// Each chapter overlaps the next so the story moves with one continuous scene.
// Copy sits in its own column (left on desktop, top on phones) and never covers it.
const CHAPTERS = [
  { start: 0.055, end: 0.245 },
  { start: 0.215, end: 0.425 },
  { start: 0.395, end: 0.625 },
  { start: 0.595, end: 0.82 },
  { start: 0.79, end: 1.04 },
] as const;

const COPY = {
  en: {
    seoTitle: 'Hive: your plant as one living graph',
    seoDesc: 'Hive connects every machine, part, document, work order and person on your shop floor, so every answer arrives with its full context and sources.',
    heroTitle: 'Your plant, connected.',
    heroBody: 'Machines, documents, parts and people, connected in one living map of your operation.',
    heroCta: 'Book a demo',
    heroMore: 'Explore Hive',
    scroll: 'Scroll',
    example: 'ILLUSTRATIVE EXAMPLE · CNC-07',
    chapters: [
      { eyebrow: 'THE INTELLIGENCE LAYER', title: 'Your plant has a story. Hive connects it.', body: 'Every machine has a history, every part has a place, and every signal means more in context. Hive brings the knowledge of your operation together.', detailLabel: 'ONE CONNECTED PICTURE', detail: 'Machines · components · people · work' },
      { eyebrow: 'BUILT AROUND YOUR OPERATION', title: 'The details live in different systems. They belong together.', body: 'Hive links machine signals, manuals, maintenance records and parts data to the equipment they describe. Your team can see the relationships instead of searching each system separately.', detailLabel: 'AN ILLUSTRATIVE QUESTION', detail: 'Why did CNC-07 alarm at 06:12?' },
      { eyebrow: 'KNOWLEDGE IN CONTEXT', title: 'A signal becomes a more complete picture.', body: 'An alarm is connected to the component, its service history and the relevant manual. Agents can follow those connections to bring the right evidence into view.', detailLabel: 'THE EVIDENCE', detail: 'Live signal · manual · past repairs' },
      { eyebrow: 'MADE FOR THE WORK', title: 'The answer should lead somewhere useful.', body: 'ClerkTree brings the findings together with parts and maintenance context, so your team can review the evidence and plan the work with confidence.', detailLabel: 'KEEP PEOPLE IN CONTROL', detail: 'Sources to check. Work to review.' },
      { eyebrow: 'HIVE BY CLERKTREE', title: 'A clearer view of everything connected.', body: 'The relationships behind one question remain available for the next. Hive gives your people and agents a shared understanding of the operation.', detailLabel: 'YOUR OPERATION, IN CONTEXT', detail: 'Built for the people who keep it running.' },
    ],
    scene: {
      card: ['HIVE · NEW QUESTION', 'Why did CNC-07 alarm at 06:12?', 'Line 2 · Spindle unit · Shift A'],
      center: 'CNC-07 · ALARM',
      nodes: [
        { label: 'SIGNALS', short: 'SIGNALS · 3', long: 'Vibration 7.8 mm/s, limit 4.5' },
        { label: 'MANUAL', short: 'MANUAL · p.212', long: 'p.212 · Bearing wear pattern' },
        { label: 'HISTORY', short: 'HISTORY · 2 WO', long: 'WO-1874 · Same fault in March' },
        { label: 'PARTS', short: 'PARTS · BAY 4', long: '6205-2RS · Bay 4 · 6 in stock' },
        { label: 'PEOPLE', short: 'PEOPLE · SHIFT A', long: 'M. Huber · On shift until 14:00' },
      ],
      title: ['QUESTION', 'Why did CNC-07 alarm?'],
      draft: ['DRAFT', 'WO-2291 · Replace spindle bearing'],
    } as HiveCopy,

  },
  de: {
    seoTitle: 'Hive: Ihr Werk als lebendiger Graph',
    seoDesc: 'Hive verbindet jede Maschine, jedes Teil, Dokument, jeden Auftrag und jede Person in Ihrer Fertigung, damit jede Antwort mit vollem Kontext und Quellen kommt.',
    heroTitle: 'Ihr Werk. Verbunden.',
    heroBody: 'Maschinen, Dokumente, Teile und Menschen – verbunden in einem lebendigen Bild Ihres Betriebs.',
    heroCta: 'Demo buchen',
    heroMore: 'Hive entdecken',
    scroll: 'Scrollen',
    example: 'BEISPIEL · CNC-07',
    chapters: [
      { eyebrow: 'DIE INTELLIGENZSCHICHT', title: 'Ihr Werk erzählt eine Geschichte. Hive verbindet sie.', body: 'Jede Maschine hat eine Historie, jedes Teil seinen Platz und jedes Signal einen Zusammenhang. Hive bringt das Wissen Ihres Betriebs zusammen.', detailLabel: 'EIN VERBUNDENES BILD', detail: 'Maschinen · Komponenten · Menschen · Arbeit' },
      { eyebrow: 'FÜR IHREN BETRIEB', title: 'Die Details liegen in verschiedenen Systemen. Sie gehören zusammen.', body: 'Hive verknüpft Maschinensignale, Handbücher, Wartungshistorie und Teiledaten mit den Anlagen, die sie beschreiben. Ihr Team sieht die Zusammenhänge, statt jedes System einzeln zu durchsuchen.', detailLabel: 'EINE BEISPIELFRAGE', detail: 'Warum hat CNC-07 um 06:12 alarmiert?' },
      { eyebrow: 'WISSEN IM ZUSAMMENHANG', title: 'Ein Signal wird zu einem vollständigeren Bild.', body: 'Ein Alarm ist mit der Komponente, ihrer Servicehistorie und dem passenden Handbuch verbunden. Agenten folgen diesen Verbindungen und bringen relevante Belege zusammen.', detailLabel: 'DIE BELEGE', detail: 'Live-Signal · Handbuch · frühere Reparaturen' },
      { eyebrow: 'FÜR DIE ARBEIT GEMACHT', title: 'Eine Antwort sollte weiterhelfen.', body: 'ClerkTree verbindet die Befunde mit Teile- und Wartungsinformationen. So kann Ihr Team die Belege prüfen und die Arbeit fundiert planen.', detailLabel: 'IHR TEAM BEHÄLT DIE KONTROLLE', detail: 'Quellen prüfen. Arbeit freigeben.' },
      { eyebrow: 'HIVE VON CLERKTREE', title: 'Ein klarerer Blick auf alles, was zusammenhängt.', body: 'Die Verbindungen hinter einer Frage bleiben auch für die nächste verfügbar. Hive gibt Ihren Mitarbeitenden und Agenten ein gemeinsames Verständnis des Betriebs.', detailLabel: 'IHR BETRIEB IM ZUSAMMENHANG', detail: 'Für die Menschen, die ihn am Laufen halten.' },
    ],
    scene: {
      card: ['HIVE · NEUE FRAGE', 'Warum hat CNC-07 um 06:12 alarmiert?', 'Linie 2 · Spindeleinheit · Schicht A'],
      center: 'CNC-07 · ALARM',
      nodes: [
        { label: 'SIGNALE', short: 'SIGNALE · 3', long: 'Vibration 7,8 mm/s, Grenze 4,5' },
        { label: 'HANDBUCH', short: 'HANDBUCH · S.212', long: 'S. 212 · Lagerverschleißbild' },
        { label: 'HISTORIE', short: 'HISTORIE · 2 WO', long: 'WO-1874 · Gleicher Fehler im März' },
        { label: 'TEILE', short: 'TEILE · LAGER 4', long: '6205-2RS · Lager 4 · 6 vorrätig' },
        { label: 'PERSONEN', short: 'PERSONEN · SCHICHT A', long: 'M. Huber · Schicht bis 14:00' },
      ],
      title: ['FRAGE', 'Warum hat CNC-07 alarmiert?'],
      draft: ['ENTWURF', 'WO-2291 · Spindellager tauschen'],
    } as HiveCopy,

  },
};

const ss = (a: number, b: number, x: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const ease = (t: number) => t * t * (3 - 2 * t);

/** How a chapter's copy looks at story progress p: rises in, settles, lifts away. */
function chapterState(i: number, p: number, reduced: boolean) {
  const { start, end } = CHAPTERS[i];
  // Chapters overlap by 0.03, so one leaves fully before the next arrives.
  const enter = ease(ss(start + 0.015, start + 0.06, p));
  const exit = ease(ss(end - 0.045, end - 0.015, p));
  const opacity = Math.min(enter, 1 - exit);
  return {
    opacity,
    y: reduced ? 0 : (1 - enter) * 32 - exit * 32,
    blur: reduced || opacity >= 1 ? 0 : (1 - opacity) * 5,
  };
}
const chapterRange = (i: number): [number, number] => [CHAPTERS[i].start + 0.015, CHAPTERS[i].end - 0.015];
const HERO_RANGE: [number, number] = [0.009, 0.041];

// Where the browser can run scroll-linked animations itself, the copy is animated that way: it then
// moves in lockstep with the scroll position on the compositor, untouched by anything the main
// thread is doing (drawing the scene, collecting garbage). Elsewhere it is updated per frame in JS.
const scrollTimelinesAvailable = typeof window !== 'undefined' && 'ScrollTimeline' in window && 'rangeStart' in Animation.prototype;

function HiveStory() {
  const { language } = useLanguage();
  const c = language === 'de' ? COPY.de : COPY.en;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<HiveScene | null>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const scene = new HiveScene(canvas);
    sceneRef.current = scene;
    const host = canvas.parentElement!;
    const sticky = host.parentElement!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mains = () => chapterRefs.current.map((chapter) => chapter?.firstElementChild as HTMLElement | null);
    let storyTop = 0;
    let span = 0;
    let currentChapter = -2;
    const measure = () => {
      storyTop = wrap.getBoundingClientRect().top + window.scrollY;
      span = wrap.offsetHeight - sticky.clientHeight;
    };
    const readTarget = () => (span > 0 ? Math.min(1, Math.max(0, (window.scrollY - storyTop) / span)) : 0);

    // ---- copy on scroll timelines -------------------------------------------------------------
    // Ranges are absolute scroll offsets (not a share of the page), so the mobile toolbar growing
    // or shrinking the viewport never shifts them.
    let scrollTimelines = scrollTimelinesAvailable;
    let animations: Animation[] = [];
    let builtFor = '';
    let probeFrame = 0;
    const buildTimelines = () => {
      if (!scrollTimelines || span <= 0) return;
      const key = `${storyTop}|${span}`;
      if (key === builtFor) return;
      builtFor = key;
      animations.forEach((animation) => animation.cancel());
      animations = [];
      const timeline = new ScrollTimeline({ source: document.scrollingElement ?? document.documentElement, axis: 'block' });
      const at = (p: number) => `${(storyTop + p * span).toFixed(1)}px`;
      const add = (el: HTMLElement | null, frames: Keyframe[], [from, to]: [number, number]) => {
        if (!el) return;
        animations.push(el.animate(frames, { timeline, rangeStart: at(from), rangeEnd: at(to), fill: 'both', duration: 'auto' } as KeyframeAnimationOptions));
      };
      mains().forEach((main, i) => {
        const [from, to] = chapterRange(i);
        // Sampled densely from the same curve the JS path uses; the browser interpolates linearly between.
        const motion: Keyframe[] = [];
        const soften: Keyframe[] = [];
        for (let k = 0; k <= 48; k++) {
          const f = k / 48;
          const st = chapterState(i, from + (to - from) * f, reduced);
          motion.push({ offset: f, opacity: st.opacity, translate: `0 ${st.y.toFixed(2)}px` });
          soften.push({ offset: f, filter: `blur(${st.blur.toFixed(2)}px)` });
        }
        // Position and fade run on the compositor. The blur cannot (it spreads beyond the box), so it
        // is a separate animation: if the main thread is busy only the softness lags, never the text.
        add(main, motion, [from, to]);
        if (!reduced) add(main, soften, [from, to]);
        // Visibility is not a compositor property, so it gets its own (discrete) animation.
        add(main, [{ visibility: 'hidden' }, { visibility: 'visible', offset: 0.001 }, { visibility: 'visible', offset: 0.999 }, { visibility: 'hidden' }], [from, to]);
      });
      add(heroRef.current, [{ opacity: 1 }, { opacity: 0 }], HERO_RANGE);
      add(heroRef.current, [{ visibility: 'visible' }, { visibility: 'visible', offset: 0.999 }, { visibility: 'hidden' }], HERO_RANGE);
    };
    // A browser that has scroll timelines but ignores pixel ranges would show the copy at the wrong
    // places without any error. A range that ends before the top of the page must read as finished;
    // if it does not, the copy goes back to the per-frame path.
    const verifyTimelines = () => {
      if (!scrollTimelines) return;
      const timeline = new ScrollTimeline({ source: document.scrollingElement ?? document.documentElement, axis: 'block' });
      const probe = wrap.animate([{ opacity: 1 }, { opacity: 1 }], { timeline, rangeStart: '-2px', rangeEnd: '-1px', fill: 'both', duration: 'auto' } as KeyframeAnimationOptions);
      probeFrame = requestAnimationFrame(() => { probeFrame = requestAnimationFrame(() => {
        probeFrame = 0;
        const ok = probe.effect?.getComputedTiming().progress === 1;
        probe.cancel();
        if (ok) return;
        scrollTimelines = false;
        animations.forEach((animation) => animation.cancel());
        animations = [];
        render(readTarget());
      }); });
    };

    // ---- copy per frame (fallback) ------------------------------------------------------------
    const dpr = () => window.devicePixelRatio || 1;
    const snap = (v: number) => Math.round(v * dpr()) / dpr();
    const render = (p: number) => {
      let nextChapter = -1;
      CHAPTERS.forEach(({ start, end }, i) => {
        if (p >= start + 0.012 && p < end - 0.012) nextChapter = i;
      });
      // Screen-reader state and the scroll hint follow the story in both modes; written straight to
      // the DOM, since a React update mid-scroll would re-render the header with it.
      if (nextChapter !== currentChapter) {
        currentChapter = nextChapter;
        chapterRefs.current.forEach((chapter, i) => chapter?.setAttribute('aria-hidden', String(i !== nextChapter)));
        hintRef.current?.classList.toggle('is-hidden', nextChapter >= 0);
      }
      if (scrollTimelines) return;
      mains().forEach((main, i) => {
        if (!main) return;
        const st = chapterState(i, p, reduced);
        main.style.opacity = st.opacity.toFixed(3);
        main.style.visibility = st.opacity > 0 ? 'visible' : 'hidden';
        // Whole device pixels and no blur at rest, so the text is never drawn between pixels.
        main.style.translate = `0 ${snap(st.y)}px`;
        main.style.filter = st.blur > 0.01 ? `blur(${st.blur.toFixed(2)}px)` : '';
      });
      const hero = heroRef.current;
      if (hero) {
        const out = ss(HERO_RANGE[0], HERO_RANGE[1], p);
        hero.style.opacity = String(1 - out);
        hero.style.visibility = out >= 1 ? 'hidden' : 'visible';
      }
    };

    // Without scroll timelines the scene owns the clock: each frame it eases towards the scroll
    // position and hands the value it draws at to the copy, so text and scene move together.
    // Without the scene (no WebGL, reduced motion, off screen) the copy follows the scroll position.
    scene.onFrame = render;
    const onScroll = () => {
      const target = readTarget();
      scene.setTarget(target);
      if (!scene.running) render(target);
    };
    const onResize = () => { measure(); buildTimelines(); onScroll(); };
    const ro = new ResizeObserver(() => { const r = host.getBoundingClientRect(); scene.resize(r.width, r.height); onResize(); });
    ro.observe(host);
    measure();
    buildTimelines();
    verifyTimelines();
    const initial = readTarget();
    scene.setProgress(initial);
    render(initial);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !document.hidden) scene.start(); else scene.stop();
    });
    io.observe(host);
    const onVis = () => (document.hidden || !visible ? scene.stop() : scene.start());
    // The device proved slower than it reported: rebuild the scene at the lower internal resolution
    // (the scene waits for the scroll to rest before it does).
    const offTier = onTierChange(() => { const r = host.getBoundingClientRect(); scene.resize(r.width, r.height); });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      ro.disconnect(); io.disconnect(); offTier();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      if (probeFrame) cancelAnimationFrame(probeFrame);
      animations.forEach((animation) => animation.cancel());
      scene.onFrame = null;
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => { sceneRef.current?.setCopy(c.scene); }, [c]);

  const seeHow = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (wrap.offsetHeight - window.innerHeight) * 0.08, behavior: 'smooth' });
  };

  return (
    <div className="hv-scroll" ref={wrapRef}>
      <div className="hv-head"><Header brand="hive" /></div>
      <div className="hv-sticky">
        <div className="hv-stage"><canvas className="hv-canvas" ref={canvasRef} aria-hidden="true" /></div>
        <div className="hv-hero" ref={heroRef}>
          <HiveLogo className="hv-hero-logo" />
          <h1>{c.heroTitle}</h1>
          <p>{c.heroBody}</p>
          <div className="hv-hero-actions">
            <a className="hv-btn" href="/contact">{c.heroCta}<ArrowRight size={16} /></a>
            <button className="hv-btn is-ghost" onClick={seeHow} type="button">{c.heroMore}</button>
          </div>
        </div>
        <span className="hv-scrollhint" aria-hidden="true" ref={hintRef}>{c.scroll}<i /></span>
        {c.chapters.map((chapter, i) => (
          <section
            aria-hidden="true"
            className="hv-chapter"
            key={i}
            ref={(element) => { chapterRefs.current[i] = element; }}
          >
            <div className="hv-chapter-main">
              <span className="hv-chapter-eyebrow">{chapter.eyebrow}</span>
              <h2>{chapter.title}</h2>
              <p>{chapter.body}</p>
              <div className="hv-chapter-detail">
                <span>{chapter.detailLabel}</span>
                <p>{chapter.detail}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function Hive() {
  const { language } = useLanguage();
  const c = language === 'de' ? COPY.de : COPY.en;
  // Dark canvas edge to edge, including overscroll.
  useEffect(() => {
    const els = [document.documentElement, document.body];
    const prev = els.map((el) => el.style.background);
    els.forEach((el) => { el.style.background = '#0d0d0e'; });
    return () => els.forEach((el, i) => { el.style.background = prev[i]; });
  }, []);
  return (
    <div className="ct-works hv-page" id="ct-works">
      <SEO title={c.seoTitle} description={c.seoDesc} canonical="https://clerktree.com/hive" />
      <HiveStory />

      <Footer />
    </div>
  );
}
