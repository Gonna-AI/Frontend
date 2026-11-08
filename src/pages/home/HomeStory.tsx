// Homepage story, following sixtyfour's narrative order with ClerkTree content:
// hero (video + agent card + logo strip) → how it works (tabs) → spotlight → case study →
// proof chart → connector panel.
import { type CSSProperties, type RefObject, useEffect, useRef, useState } from 'react';
import { Activity, ArrowRight, BookOpen, ClipboardList, Cpu, History, Package, Wrench } from 'lucide-react';
import Grainient from '../../components/Brand/Grainient';
import ClerkTreeLogo from '../../components/Brand/ClerkTreeLogo';
import { siClaude, siDeepseek, siGooglegemini, siMoonshotai, siX, type SimpleIcon } from 'simple-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import AssetGraph from './AssetGraph';
import ClerkTreeLockup from '../../components/Brand/ClerkTreeLockup';
import { STORY_SCENES } from './StoryScenes';
import './HomeStory.css';

const copy = {
  en: {
    seed: 'CNC-07 spindle vibration alarm',
    orchestrating: 'Orchestrating 5 agents',
    done: 'Work order ready',
    chain: [
      { icon: 'signal', agent: 'Signal agent', tool: 'query_historian(CNC-07, 24h)', wait: 'reading', value: '7.8 mm/s RMS, up 3.7× in 6 h', src: 'OPC UA' },
      { icon: 'book', agent: 'Manual agent', tool: 'search_manuals("6205-2RS")', wait: 'searching', value: 'Outer-race wear, manual §4.3', src: 'Manual' },
      { icon: 'history', agent: 'History agent', tool: 'similar_incidents()', wait: 'matching', value: '2 matching failures, last in March', src: 'CMMS' },
      { icon: 'parts', agent: 'Parts agent', tool: 'check_stock("6205-2RS")', wait: 'checking', value: '4 in stock, bay B-12', src: 'SAP MM' },
      { icon: 'plan', agent: 'Planner agent', tool: 'draft_work_order()', wait: 'drafting', value: 'WO-2291, Tue 06:00 shift, 1.5 h', src: 'Work order' },
    ],
    cited: '5 agents · 9 sources cited',
    storyTitle: ['Work that follows', 'the signal'],
    steps: [
      { icon: 'activity', scene: 'signal', title: 'Start with any machine signal', body: 'Vibration, temperature, an alarm or a note from the floor. ClerkTree connects to the line and notices when something changes.' },
      { icon: 'book', scene: 'docs', title: 'Reason across your knowledge', body: 'Agents read manuals, service history, parts records and production data to explain what is most likely happening.' },
      { icon: 'wrench', scene: 'agent', title: 'Act with a cited work order', body: 'Get a work order with the evidence, parts and people attached, ready for your team to approve.' },
    ],
    spotPill: 'Introducing',
    spotTag: 'Asset graph',
    spotTitle: 'See how your plant connects',
    spotBody: 'ClerkTree links every machine to its components, incidents, parts and suppliers, so a single fault shows its full chain of causes and the people who can fix it.',
    caseTitle: ['Proven on the line,', 'in their words'],
    caseIntro: 'See how plant teams use ClerkTree to catch failures early, plan maintenance and keep lines running.',
    proofEyebrow: 'Internal evaluation',
    proofTitle: ['Leading fault', 'diagnosis accuracy'],
    proofBody: 'How often a system names the right root cause for a real machine fault, given the same signals, manuals and maintenance history.',
    proofStats: [['79.1%', 'diagnosis accuracy'], ['+29.5 pts', 'over the next best model'], ['8', 'systems compared']],
    proofMetric: 'Fault diagnosis accuracy',
    proofAxis: 'Correct root cause, % of incidents',
    proofNote: 'Internal evaluation on historical maintenance incidents. Methodology available on request.',
    proofCta: 'Ask for the evaluation',
    bars: [
      ['ClerkTree Agent', 79.1, true, 'clerktree'],
      ['Claude Opus 5.5', 49.6, false, 'claude'],
      ['GPT-6 Astra (max)', 48.2, false, 'openai'],
      ['Gemini 3.1 Pro', 46.9, false, 'gemini'],
      ['Grok 4.6', 45.3, false, 'grok'],
      ['Kimi K3', 44.1, false, 'kimi'],
      ['DeepSeek V4 Flash', 42.6, false, 'deepseek'],
      ['GLM 5.3', 40.4, false, 'glm'],
    ] as [string, number, boolean, string][],
    apiTitle: ['One connection.', 'Every machine signal.'],
    apiBody: 'Connect historians, PLCs and MES over OPC UA, Modbus or REST. ClerkTree maps each signal to its asset and keeps that context with every finding.',
    apiCta: 'Talk to engineering',
    apiWindow: 'Example connector',
  },
  de: {
    seed: 'CNC-07 Alarm Spindelvibration',
    orchestrating: '5 Agenten koordinieren',
    done: 'Auftrag bereit',
    chain: [
      { icon: 'signal', agent: 'Signal-Agent', tool: 'query_historian(CNC-07, 24h)', wait: 'liest', value: '7,8 mm/s RMS, 3,7× in 6 h', src: 'OPC UA' },
      { icon: 'book', agent: 'Handbuch-Agent', tool: 'search_manuals("6205-2RS")', wait: 'sucht', value: 'Verschleiß Außenring, Handbuch §4.3', src: 'Handbuch' },
      { icon: 'history', agent: 'Historie-Agent', tool: 'similar_incidents()', wait: 'gleicht ab', value: '2 ähnliche Ausfälle, zuletzt im März', src: 'CMMS' },
      { icon: 'parts', agent: 'Teile-Agent', tool: 'check_stock("6205-2RS")', wait: 'prüft', value: '4 auf Lager, Fach B-12', src: 'SAP MM' },
      { icon: 'plan', agent: 'Planungs-Agent', tool: 'draft_work_order()', wait: 'erstellt', value: 'WO-2291, Di 06:00 Schicht, 1,5 h', src: 'Auftrag' },
    ],
    cited: '5 Agenten · 9 Quellen belegt',
    storyTitle: ['Arbeit, die dem', 'Signal folgt'],
    steps: [
      { icon: 'activity', scene: 'signal', title: 'Mit jedem Maschinensignal starten', body: 'Vibration, Temperatur, ein Alarm oder eine Notiz aus der Halle. ClerkTree ist mit der Linie verbunden und erkennt Veränderungen.' },
      { icon: 'book', scene: 'docs', title: 'Über Ihr Wissen hinweg folgern', body: 'Agenten lesen Handbücher, Servicehistorie, Teiledaten und Produktionsdaten und erklären die wahrscheinlichste Ursache.' },
      { icon: 'wrench', scene: 'agent', title: 'Mit belegtem Auftrag handeln', body: 'Ein Arbeitsauftrag mit Belegen, Teilen und Zuständigen, bereit zur Freigabe durch Ihr Team.' },
    ],
    spotPill: 'Neu',
    spotTag: 'Anlagengraph',
    spotTitle: 'Sehen, wie Ihr Werk zusammenhängt',
    spotBody: 'ClerkTree verknüpft jede Maschine mit Komponenten, Störungen, Teilen und Lieferanten. So zeigt ein einzelner Fehler die ganze Ursachenkette und wer ihn beheben kann.',
    caseTitle: ['Bewährt an der Linie,', 'in ihren Worten'],
    caseIntro: 'So nutzen Werksteams ClerkTree, um Ausfälle früh zu erkennen, Wartung zu planen und Linien am Laufen zu halten.',
    proofEyebrow: 'Interne Auswertung',
    proofTitle: ['Führend bei der', 'Fehlerdiagnose'],
    proofBody: 'Wie oft ein System bei einem echten Maschinenfehler die richtige Ursache nennt, mit denselben Signalen, Handbüchern und Wartungsdaten.',
    proofStats: [['79,1 %', 'Diagnosegenauigkeit'], ['+29,5 Pkt.', 'vor dem nächstbesten Modell'], ['8', 'Systeme verglichen']],
    proofMetric: 'Genauigkeit der Fehlerdiagnose',
    proofAxis: 'Richtige Ursache, % der Störungen',
    proofNote: 'Interne Auswertung auf historischen Wartungsfällen. Methodik auf Anfrage.',
    proofCta: 'Auswertung anfragen',
    bars: [
      ['ClerkTree Agent', 79.1, true, 'clerktree'],
      ['Claude Opus 5.5', 49.6, false, 'claude'],
      ['GPT-6 Astra (max)', 48.2, false, 'openai'],
      ['Gemini 3.1 Pro', 46.9, false, 'gemini'],
      ['Grok 4.6', 45.3, false, 'grok'],
      ['Kimi K3', 44.1, false, 'kimi'],
      ['DeepSeek V4 Flash', 42.6, false, 'deepseek'],
      ['GLM 5.3', 40.4, false, 'glm'],
    ] as [string, number, boolean, string][],
    apiTitle: ['Eine Verbindung.', 'Jedes Maschinensignal.'],
    apiBody: 'Historians, SPS und MES über OPC UA, Modbus oder REST anbinden. ClerkTree ordnet jedes Signal seiner Anlage zu und behält den Kontext bei jedem Befund.',
    apiCta: 'Mit Engineering sprechen',
    apiWindow: 'Beispiel-Connector',
  },
};

export function useHomeCopy() {
  const { language } = useLanguage();
  return copy[language === 'de' ? 'de' : 'en'];
}

/* ---------------- Hero: agent chain on a CRT card over a silver Grainient ---------------- */

const chainIcon = { signal: Activity, book: BookOpen, history: History, parts: Package, plan: ClipboardList };
const TYPE_MS = 34;
const ROW_MS = 950;
const HOLD_MS = 3200;

function useChainClock(total: number, ref: RefObject<HTMLElement | null>) {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setMs(total - HOLD_MS + 1); return undefined; }
    let timer = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    if (ref.current) observer.observe(ref.current);
    timer = window.setInterval(() => { if (visible && !document.hidden) setMs((v) => (v + 50) % total); }, 50);
    return () => { window.clearInterval(timer); observer.disconnect(); };
  }, [total, ref]);
  return ms;
}

export function HeroAgentCard() {
  const c = useHomeCopy();
  const ref = useRef<HTMLDivElement>(null);
  const typeEnd = c.seed.length * TYPE_MS + 300;
  const total = typeEnd + c.chain.length * ROW_MS + HOLD_MS;
  const ms = useChainClock(total, ref);
  const typed = c.seed.slice(0, Math.floor(ms / TYPE_MS));
  const runMs = ms - typeEnd;
  const active = runMs < 0 ? -1 : Math.min(c.chain.length, Math.floor(runMs / ROW_MS));
  const within = runMs - active * ROW_MS;
  const done = active >= c.chain.length;
  const slot = done ? c.done : active < 0 ? c.orchestrating : `${c.chain[active].agent}: ${c.chain[active].wait}`;
  const progress = done ? 1 : Math.max(0, runMs / (c.chain.length * ROW_MS));

  return (
    <div className="hs-crt" ref={ref} aria-hidden="true">
      <div className="hs-seed">
        <span className="hs-seed-ico"><Cpu size={14} strokeWidth={1.75} /></span>
        <span className="hs-seed-id">{typed}<span className={`hs-caret${runMs >= 0 ? ' is-hidden' : ''}`} /></span>
        <span className={`hs-slot${done ? ' is-done' : ''}`} key={slot}>
          <span className="hs-slot-label">{slot}</span>
          <span className="hs-slot-dot" />
        </span>
      </div>
      {c.chain.map((row, i) => {
        const Icon = chainIcon[row.icon as keyof typeof chainIcon];
        const state = i < active ? 'is-done' : i === active ? (within > ROW_MS * 0.62 ? 'is-done is-active' : 'is-active') : '';
        const resolved = state.includes('is-done');
        return (
          <div className={`hs-row ${state}`} key={row.agent} style={{ '--row': i } as CSSProperties}>
            <svg className="hs-row-branch" viewBox="0 0 30 42" aria-hidden="true">
              <path d={i === 0 ? 'M9 0V15Q9 21 15 21H30' : 'M9 -6V15Q9 21 15 21H30'} pathLength={1} />
            </svg>
            <div className="hs-row-box">
              <span className="hs-row-ico"><Icon size={14} strokeWidth={1.75} /></span>
              <span className="hs-row-text">
                <span className="hs-row-k">{row.agent}<em>{row.tool}</em></span>
                <span className="hs-row-v">
                  {!resolved && (
                    <span className="hs-loader">
                      <span className="hs-loader-grid">{[1, 2, 3, 0, 1, 2, 1, 2, 3].map((d, k) => <i key={k} style={{ '--pixel-delay': `${d * 90}ms` } as CSSProperties} />)}</span>
                      {row.wait}
                    </span>
                  )}
                  <span className="hs-row-val">{row.value}</span>
                </span>
              </span>
              <span className="hs-row-src">{row.src}</span>
            </div>
          </div>
        );
      })}
      <div className={`hs-crt-foot${done ? ' is-done' : ''}`}>
        <span className="hs-crt-progress"><i style={{ transform: `scaleX(${progress})` }} /></span>
        <span className="hs-crt-cited">{c.cited}</span>
      </div>
    </div>
  );
}

/* ---------------- Logo wall ---------------- */

export type ClientLogo = { alt: string; src: string; width: number; mobileWidth: number };

/** Endless client-logo strip under the hero (sixtyfour-style): three copies scroll as one track. */
export function LogoStrip({ logos, label }: { logos: ClientLogo[]; label: string }) {
  return (
    <div className="hs-strip" aria-label={label} role="region">
      <div className="hs-strip-track">
        {[0, 1, 2].map((group) => (
          <div className="hs-logo-set" aria-hidden={group > 0} key={group}>
            {logos.map((logo) => (
              <img
                alt={group === 0 ? logo.alt : ''}
                decoding="async"
                height="28"
                key={`${group}-${logo.src}`}
                src={logo.src}
                style={{ '--logo-width': `${logo.width}px`, '--logo-mobile-width': `${logo.mobileWidth}px` } as CSSProperties}
                width={logo.width}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- How it works: step tabs + live scene ---------------- */

const STEP_MS = 9000;
const stepIcon = { activity: Activity, book: BookOpen, wrench: Wrench };

export function StoryTabs() {
  const c = useHomeCopy();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!inView || paused) return undefined;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % c.steps.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [active, inView, paused, c.steps.length]);

  return (
    <section className="hs-section hs-story" aria-labelledby="hs-story-title" ref={ref}>
      <div className="hs-story-copy">
        <h2 id="hs-story-title" data-agero-reveal="up">{c.storyTitle[0]}<br />{c.storyTitle[1]}</h2>
        <div className="hs-steps" role="tablist" aria-orientation="vertical" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          {c.steps.map((step, i) => {
            const Icon = stepIcon[step.icon as keyof typeof stepIcon];
            const on = i === active;
            return (
              <button
                aria-selected={on}
                className={`hs-step${on ? ' is-active' : ''}${on && inView && !paused ? ' is-running' : ''}`}
                key={step.title}
                onClick={() => setActive(i)}
                role="tab"
                style={{ '--step-ms': `${STEP_MS}ms` } as CSSProperties}
                type="button"
              >
                <span className="hs-step-ico" aria-hidden="true"><Icon size={16} strokeWidth={1.6} /></span>
                <span className="hs-step-text">
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </span>
                <span className="hs-step-progress" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
      <div className="hs-story-stage hs-visual" data-agero-reveal="up">
        <Grainient preset="silver" still />
        {c.steps.map((step, i) => {
          const Scene = STORY_SCENES[i];
          return (
            <div className={`hs-story-scene${i === active ? ' is-active' : ''}`} key={step.scene}>
              {i === active && <Scene />}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Spotlight (dark panel) ---------------- */

export function Spotlight() {
  const c = useHomeCopy();
  return (
    <section className="hs-section hs-panel hs-dark hs-spot" aria-labelledby="hs-spot-title">
      <Grainient preset="black" />
      <div className="hs-spot-copy" data-agero-reveal="up">
        <span className="hs-pill">{c.spotPill}<b>{c.spotTag}</b></span>
        <h2 id="hs-spot-title">{c.spotTitle}</h2>
        <p>{c.spotBody}</p>
      </div>
      <div className="hs-spot-stage" data-agero-reveal="up">
        <AssetGraph />
      </div>
    </section>
  );
}

/* ---------------- Case study (silver panel) ---------------- */

type CaseStudyProps = {
  quote: string;
  name: string;
  role: string;
  image: string;
  stats: [string, string][];
};

export function CaseStudy({ quote, name, role, image, stats }: CaseStudyProps) {
  const c = useHomeCopy();
  return (
    <section className="hs-section hs-panel hs-silver hs-case" aria-labelledby="hs-case-title">
      <Grainient preset="silver" />
      <div className="hs-case-head" data-agero-reveal="up">
        <h2 id="hs-case-title">{c.caseTitle[0]}<br />{c.caseTitle[1]}</h2>
        <p>{c.caseIntro}</p>
      </div>
      <article className="hs-case-card" data-agero-reveal="up">
        <div className="hs-case-quote">
          <div className="hs-case-brands">
            <ClerkTreeLockup className="hs-case-lockup" title="ClerkTree" />
            <span aria-hidden="true" />
            <strong>THD GmbH</strong>
          </div>
          <span className="hs-case-mark" aria-hidden="true">“</span>
          <blockquote>{quote.replace(/^["“]|["”]$/g, '')}</blockquote>
          <div className="hs-case-author">
            <strong>{name}</strong>
            <span>{role}</span>
          </div>
        </div>
        <div className="hs-case-media">
          <img alt="THD GmbH plant" decoding="async" loading="lazy" src={image} />
        </div>
      </article>
      <dl className="hs-case-stats" data-agero-reveal="up">
        {stats.map(([value, label]) => (
          <div key={label}><dt>{value}</dt><dd>{label}</dd></div>
        ))}
      </dl>
    </section>
  );
}

/* ---------------- Proof chart (dark panel) ---------------- */

const MODEL_ICONS: Record<string, SimpleIcon> = { claude: siClaude, gemini: siGooglegemini, grok: siX, kimi: siMoonshotai, deepseek: siDeepseek };
const MODEL_MONOGRAMS: Record<string, string> = { openai: 'G6', glm: 'Z' };

function ModelMark({ id }: { id: string }) {
  if (id === 'clerktree') return <span className="hs-model is-ours"><ClerkTreeLogo markClassName="hs-model-svg" labelClassName="sr-only" /></span>;
  const icon = MODEL_ICONS[id];
  if (icon) return <span className="hs-model"><svg className="hs-model-svg" viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} fill="currentColor" /></svg></span>;
  return <span className="hs-model is-mono">{MODEL_MONOGRAMS[id] ?? '·'}</span>;
}

export function ProofChart() {
  const c = useHomeCopy();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setShown(true); }, { threshold: 0.25 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="hs-section hs-panel hs-dark hs-proof" aria-labelledby="hs-proof-title">
      <Grainient preset="black" />
      <div className="hs-proof-copy" data-agero-reveal="up">
        <span className="hs-eyebrow">{c.proofEyebrow}</span>
        <h2 id="hs-proof-title">{c.proofTitle[0]}<br />{c.proofTitle[1]}</h2>
        <p>{c.proofBody}</p>
        <dl className="hs-proof-stats">
          {c.proofStats.map(([value, label]) => (
            <div key={label}><dt>{value}</dt><dd>{label}</dd></div>
          ))}
        </dl>
        <p className="hs-proof-note">{c.proofNote}</p>
        <a className="hs-btn hs-btn-light" href="/contact">{c.proofCta}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <div className={`hs-chart${shown ? ' is-in' : ''}`} ref={ref} data-agero-reveal="up">
        <div className="hs-chart-head">
          <span>{c.proofMetric}</span>
        </div>
        <ol className="hs-bars">
          {c.bars.map(([label, value, ours, model], i) => (
            <li className={ours ? 'is-ours' : undefined} key={label} style={{ '--v': value / 100, '--i': i } as CSSProperties}>
              <span className="hs-bar-label"><ModelMark id={model} />{label}</span>
              <span className="hs-bar-track"><span className="hs-bar-fill" /></span>
              <span className="hs-bar-value">{value.toFixed(1)}%</span>
            </li>
          ))}
        </ol>
        <div className="hs-chart-axis" aria-hidden="true">
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
        <p className="hs-chart-caption">{c.proofAxis}</p>
      </div>
    </section>
  );
}

/* ---------------- Connector panel (silver) ---------------- */

const SNIPPETS = {
  'OPC UA': `source: opc-ua
endpoint: opc.tcp://line-2.plant.local:4840
security: SignAndEncrypt
assets:
  - id: CNC-07
    signals:
      spindle.vibration: ns=2;s=CNC07.Spindle.VibRMS
      spindle.temperature: ns=2;s=CNC07.Spindle.Temp
sample_every: 500ms`,
  Modbus: `source: modbus-tcp
host: 10.20.4.17
port: 502
unit_id: 3
registers:
  - name: press.hydraulic_pressure
    address: 40021
    type: float32
    scale: 0.1
poll_every: 1s`,
  REST: `POST /v1/signals
{
  "asset": "CNC-07",
  "signal": "spindle.vibration",
  "value": 7.8,
  "unit": "mm/s",
  "at": "2026-11-08T09:41:12Z"
}`,
};

function highlight(line: string) {
  const m = line.match(/^(\s*-?\s*)([\w."]+)(:)(.*)$/);
  if (!m) return <>{line}</>;
  return <>{m[1]}<span className="hs-k">{m[2]}</span>{m[3]}<span className="hs-v">{m[4]}</span></>;
}

export function ConnectorPanel() {
  const c = useHomeCopy();
  const tabs = Object.keys(SNIPPETS) as (keyof typeof SNIPPETS)[];
  const [tab, setTab] = useState<keyof typeof SNIPPETS>('OPC UA');
  return (
    <section className="hs-section hs-panel hs-silver hs-api" aria-labelledby="hs-api-title">
      <Grainient preset="silver" />
      <div className="hs-api-copy" data-agero-reveal="up">
        <h2 id="hs-api-title">{c.apiTitle[0]}<br />{c.apiTitle[1]}</h2>
        <p>{c.apiBody}</p>
        <a className="hs-btn hs-btn-light" href="/contact">{c.apiCta}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <div className="hs-code" data-agero-reveal="up">
        <div className="hs-code-bar">
          <strong>{c.apiWindow}</strong>
          <div className="hs-code-tabs" role="tablist">
            {tabs.map((name) => (
              <button aria-selected={tab === name} className={tab === name ? 'is-active' : undefined} key={name} onClick={() => setTab(name)} role="tab" type="button">{name}</button>
            ))}
          </div>
        </div>
        <pre><code>{SNIPPETS[tab].split('\n').map((line, i) => (
          <span className="hs-line" key={`${tab}-${i}`}><i>{i + 1}</i>{highlight(line)}{'\n'}</span>
        ))}</code></pre>
      </div>
    </section>
  );
}
