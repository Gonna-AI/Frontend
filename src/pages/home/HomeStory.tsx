// Homepage story, following sixtyfour's narrative order with ClerkTree content:
// hero demo card → logo wall → how it works (tabs) → spotlight → case study →
// proof chart → (capability bento, rendered by LandingFramer) → connector panel.
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { Activity, ArrowRight, BookOpen, Wrench } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CapabilityStage, type CapabilitySceneId } from '../solutions/CapabilityCards';
import ClerkTreeLockup from '../../components/Brand/ClerkTreeLockup';
import './HomeStory.css';

const copy = {
  en: {
    agent: 'ClerkTree Agent',
    investigating: 'Investigating',
    done: 'Work order ready',
    agentRows: [
      ['Signal', 'CNC-07 spindle vibration 7.8 mm/s, up 3.7×'],
      ['Context', 'Matches bearing 6205-2RS wear, manual §4.3'],
      ['Action', 'Work order WO-2291 drafted, part reserved'],
    ],
    cited: '3 sources cited',
    logosTitle: 'Maintenance, operations and engineering teams run on ClerkTree.',
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
    spotFoot: 'One spindle. Every linked part, incident and supplier.',
    legend: ['Machine', 'Component', 'Incident', 'Part', 'Supplier'],
    caseTitle: ['Proven on the line,', 'in their words'],
    caseIntro: 'See how plant teams use ClerkTree to catch failures early, plan maintenance and keep lines running.',
    proofEyebrow: 'Internal evaluation',
    proofTitle: ['Leading fault', 'diagnosis accuracy'],
    proofBody: 'How often a system names the right root cause for a real machine fault, given the same signals, manuals and maintenance history.',
    proofStats: [['79.1%', 'diagnosis accuracy'], ['+29.5 pts', 'over the best baseline'], ['6', 'systems compared']],
    proofMetric: 'Fault diagnosis accuracy',
    proofAxis: 'Correct root cause, % of incidents',
    proofNote: 'Internal evaluation on historical maintenance incidents. Methodology available on request.',
    proofCta: 'Ask for the evaluation',
    bars: [
      ['ClerkTree Agent', 79.1, true],
      ['LLM with manual search (RAG)', 49.6, false],
      ['General-purpose LLM', 46.2, false],
      ['Vendor condition monitoring', 44.8, false],
      ['Rule-based CMMS alerts', 41.3, false],
      ['Keyword search over work orders', 40.7, false],
    ] as [string, number, boolean][],
    bentoEyebrow: 'Capabilities',
    bentoTitle: ['Where teams use', 'ClerkTree'] as [string, string],
    bentoIntro: 'From the first signal to the finished work order, each agent does one job well and hands the evidence to the next.',
    apiTitle: ['One connection.', 'Every machine signal.'],
    apiBody: 'Connect historians, PLCs and MES over OPC UA, Modbus or REST. ClerkTree maps each signal to its asset and keeps that context with every finding.',
    apiCta: 'Talk to engineering',
    apiWindow: 'Example connector',
  },
  de: {
    agent: 'ClerkTree Agent',
    investigating: 'Analysiert',
    done: 'Auftrag bereit',
    agentRows: [
      ['Signal', 'CNC-07 Spindelvibration 7,8 mm/s, 3,7× erhöht'],
      ['Kontext', 'Passt zu Verschleiß Lager 6205-2RS, Handbuch §4.3'],
      ['Aktion', 'Auftrag WO-2291 erstellt, Teil reserviert'],
    ],
    cited: '3 Quellen belegt',
    logosTitle: 'Instandhaltung, Betrieb und Engineering arbeiten mit ClerkTree.',
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
    spotFoot: 'Eine Spindel. Alle verknüpften Teile, Störungen und Lieferanten.',
    legend: ['Maschine', 'Komponente', 'Störung', 'Teil', 'Lieferant'],
    caseTitle: ['Bewährt an der Linie,', 'in ihren Worten'],
    caseIntro: 'So nutzen Werksteams ClerkTree, um Ausfälle früh zu erkennen, Wartung zu planen und Linien am Laufen zu halten.',
    proofEyebrow: 'Interne Auswertung',
    proofTitle: ['Führend bei der', 'Fehlerdiagnose'],
    proofBody: 'Wie oft ein System bei einem echten Maschinenfehler die richtige Ursache nennt, mit denselben Signalen, Handbüchern und Wartungsdaten.',
    proofStats: [['79,1 %', 'Diagnosegenauigkeit'], ['+29,5 Pkt.', 'vor der besten Alternative'], ['6', 'Systeme verglichen']],
    proofMetric: 'Genauigkeit der Fehlerdiagnose',
    proofAxis: 'Richtige Ursache, % der Störungen',
    proofNote: 'Interne Auswertung auf historischen Wartungsfällen. Methodik auf Anfrage.',
    proofCta: 'Auswertung anfragen',
    bars: [
      ['ClerkTree Agent', 79.1, true],
      ['LLM mit Handbuchsuche (RAG)', 49.6, false],
      ['Allgemeines LLM', 46.2, false],
      ['Zustandsüberwachung des Herstellers', 44.8, false],
      ['Regelbasierte CMMS-Alarme', 41.3, false],
      ['Stichwortsuche in Aufträgen', 40.7, false],
    ] as [string, number, boolean][],
    bentoEyebrow: 'Fähigkeiten',
    bentoTitle: ['Wo Teams', 'ClerkTree einsetzen'] as [string, string],
    bentoIntro: 'Vom ersten Signal bis zum fertigen Auftrag erledigt jeder Agent eine Aufgabe gut und gibt die Belege weiter.',
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

/* ---------------- Hero demo card (sits on the hero video) ---------------- */

export function HeroAgentCard() {
  const c = useHomeCopy();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStep(4); return undefined; }
    const timer = window.setInterval(() => setStep((s) => (s + 1) % 6), 1400);
    return () => window.clearInterval(timer);
  }, []);
  const shown = Math.min(step, 3);
  const done = step >= 3;
  return (
    <div className="hs-agent" aria-hidden="true">
      <div className="hs-agent-head">
        <span className="hs-agent-name"><i />{c.agent}</span>
        <span className={`hs-agent-status${done ? ' is-done' : ''}`}><i />{done ? c.done : c.investigating}</span>
      </div>
      {c.agentRows.map(([label, value], i) => (
        <div className={`hs-agent-row${i < shown ? ' is-in' : ''}`} key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
      <div className={`hs-agent-foot${done ? ' is-in' : ''}`}>{c.cited}</div>
    </div>
  );
}

/* ---------------- Logo wall ---------------- */

export type ClientLogo = { alt: string; src: string; width: number; mobileWidth: number };

export function LogoWall({ logos }: { logos: ClientLogo[] }) {
  const c = useHomeCopy();
  return (
    <section className="hs-section hs-logos" aria-labelledby="hs-logos-title">
      <h2 id="hs-logos-title" data-agero-reveal="up">{c.logosTitle}</h2>
      <div className="hs-logo-track" data-agero-reveal="up">
        {[0, 1].map((group) => (
          <div className="hs-logo-set" aria-hidden={group > 0} key={group}>
            {logos.map((logo) => (
              <img
                alt={group === 0 ? logo.alt : ''}
                decoding="async"
                height="32"
                key={`${group}-${logo.src}`}
                loading="lazy"
                src={logo.src}
                style={{ '--logo-width': `${logo.width}px`, '--logo-mobile-width': `${logo.mobileWidth}px` } as CSSProperties}
                width={logo.width}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- How it works: step tabs + live scene ---------------- */

const STEP_MS = 6500;
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
      <div className="hs-story-stage" data-agero-reveal="up">
        {c.steps.map((step, i) => (
          <div className={`hs-story-scene${i === active ? ' is-active' : ''}`} key={step.scene}>
            {i === active && <CapabilityStage scene={step.scene as CapabilitySceneId} />}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Spotlight (dark panel) ---------------- */

export function Spotlight() {
  const c = useHomeCopy();
  return (
    <section className="hs-section hs-panel hs-dark hs-spot" aria-labelledby="hs-spot-title">
      <div className="hs-spot-copy" data-agero-reveal="up">
        <span className="hs-pill">{c.spotPill}<b>{c.spotTag}</b></span>
        <h2 id="hs-spot-title">{c.spotTitle}</h2>
        <p>{c.spotBody}</p>
      </div>
      <div className="hs-spot-stage" data-agero-reveal="up">
        <CapabilityStage scene="graph" />
        <div className="hs-spot-foot">
          <span>{c.spotFoot}</span>
          <ul>
            {c.legend.map((item, i) => <li key={item} style={{ '--dot': i } as CSSProperties}>{item}</li>)}
          </ul>
        </div>
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
          {c.bars.map(([label, value, ours], i) => (
            <li className={ours ? 'is-ours' : undefined} key={label} style={{ '--v': value / 100, '--i': i } as CSSProperties}>
              <span className="hs-bar-label">{label}</span>
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
