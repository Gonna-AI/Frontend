// A scroll-driven journey through Hive's connected plant graph.
import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Header, Footer } from '../../components/Landing/AgeroChrome';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiveScene, type HiveCopy } from './HiveScene';
import '../LandingFramer.css';
import './Hive.css';

// Each chapter overlaps the next so the product story moves with the same
// continuous scene, without moving the pinned frame itself.
const CHAPTERS = [
  { start: 0.055, end: 0.245, placement: 'left' },
  { start: 0.215, end: 0.425, placement: 'right' },
  { start: 0.395, end: 0.625, placement: 'left' },
  { start: 0.595, end: 0.82, placement: 'right' },
  { start: 0.79, end: 1.04, placement: 'center' },
] as const;

const COPY = {
  en: {
    seoTitle: 'Hive: your plant as one living graph',
    seoDesc: 'Hive connects every machine, part, document, work order and person on your shop floor, so every answer arrives with its full context and sources.',
    heroEyebrow: 'CLERKTREE · HIVE',
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
    heroEyebrow: 'CLERKTREE · HIVE',
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

function HiveStory() {
  const { language } = useLanguage();
  const c = language === 'de' ? COPY.de : COPY.en;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HiveScene | null>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeChapter, setActiveChapter] = useState(-1);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const scene = new HiveScene(canvas);
    sceneRef.current = scene;
    const host = canvas.parentElement!;
    let scrollFrame = 0;
    let storyTop = 0;
    let span = 0;
    let currentChapter = -1;
    const measure = () => {
      storyTop = wrap.getBoundingClientRect().top + window.scrollY;
      span = wrap.offsetHeight - host.clientHeight;
    };
    const update = () => {
      scrollFrame = 0;
      const p = span > 0 ? Math.min(1, Math.max(0, (window.scrollY - storyTop) / span)) : 0;
      scene.setProgress(p);
      let nextChapter = -1;
      CHAPTERS.forEach(({ start, end }, i) => {
        const opacity = Math.min(ss(start, start + 0.025, p), 1 - ss(end - 0.025, end, p));
        const chapter = chapterRefs.current[i];
        if (chapter) {
          chapter.style.opacity = String(opacity);
          chapter.style.visibility = opacity > 0 ? 'visible' : 'hidden';
        }
        if (p >= start + 0.012 && p < end - 0.012) nextChapter = i;
      });
      if (nextChapter !== currentChapter) { currentChapter = nextChapter; setActiveChapter(nextChapter); }
      const hero = heroRef.current;
      if (hero) {
        const out = ss(0.009, 0.041, p);
        hero.style.opacity = String(1 - out);
        hero.style.visibility = out >= 1 ? 'hidden' : 'visible';
      }
    };
    const onScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(update); };
    const onResize = () => { measure(); onScroll(); };
    const ro = new ResizeObserver(() => { const r = host.getBoundingClientRect(); scene.resize(r.width, r.height); onResize(); });
    ro.observe(host);
    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !document.hidden) scene.start(); else scene.stop();
    });
    io.observe(host);
    const onVis = () => (document.hidden || !visible ? scene.stop() : scene.start());
    document.addEventListener('visibilitychange', onVis);
    return () => {
      ro.disconnect(); io.disconnect();
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
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
      <div className="hv-head"><Header /></div>
      <div className="hv-sticky">
        <canvas className="hv-canvas" ref={canvasRef} aria-hidden="true" />
        <div className="hv-hero" ref={heroRef}>
          <span className="hv-hero-eyebrow">{c.heroEyebrow}</span>
          <h1>{c.heroTitle}</h1>
          <p>{c.heroBody}</p>
          <div className="hv-hero-actions">
            <a className="hv-btn" href="/contact">{c.heroCta}<ArrowRight size={16} /></a>
            <button className="hv-btn is-ghost" onClick={seeHow} type="button">{c.heroMore}</button>
          </div>
        </div>
        <span className={`hv-scrollhint${activeChapter >= 0 ? ' is-hidden' : ''}`} aria-hidden="true">{c.scroll}<i /></span>
        {c.chapters.map((chapter, i) => (
          <section
            aria-hidden={activeChapter !== i}
            className={`hv-chapter hv-chapter--${CHAPTERS[i].placement}`}
            key={i}
            ref={(element) => { chapterRefs.current[i] = element; }}
          >
            <div className="hv-chapter-main">
              <span className="hv-chapter-eyebrow">{chapter.eyebrow}</span>
              <h2>{chapter.title}</h2>
              <p>{chapter.body}</p>
            </div>
            <div className="hv-chapter-detail">
              <span>{chapter.detailLabel}</span>
              <p>{chapter.detail}</p>
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
    <div className="agero-works hv-page" id="agero-works">
      <SEO title={c.seoTitle} description={c.seoDesc} canonical="https://clerktree.com/hive" />
      <HiveStory />

      <Footer />
    </div>
  );
}
