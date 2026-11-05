import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import ClerkTreeLogo from '../../components/Brand/ClerkTreeLogo';
import { useLanguage } from '../../contexts/LanguageContext';
import './CapabilityCards.css';

/*
 * Capability wall for /solutions — agents visibly at work.
 *
 * Everything is HTML/SVG (no video). Two layers of motion:
 *   1. Entrance: pieces carry `cx-p` + an index (--i); the card carries --d.
 *      An IntersectionObserver adds `is-visible` and CSS staggers them in.
 *   2. Live: while the grid is on screen (and motion is allowed) a shared
 *      ticker advances each card's loop — agent steps, extracted fields,
 *      supplier ranking, telemetry. Off-screen or reduced motion: frozen in
 *      the finished state.
 * Effects follow common open-source patterns (Magic UI / React Bits):
 * border beam, shimmer "thinking" text, animated beams along graph edges.
 */

type Lang = 'en' | 'de';

const LABELS = {
  en: {
    vibration: 'Vibration', temperature: 'Temperature', alarms: 'Alarms', health: 'Health',
    model: 'Machina Agent', running: 'Running', done: 'Complete', thinking: 'Thinking',
    steps: [
      'Reading alarm SP-204 · spindle vibration 7.8 mm/s',
      'Searching CNC-07 manual · §4.2 bearing replacement',
      'Checking stock · bearing 6205-2RS, 4 on hand',
      'Drafting work order WO-2481',
      'Routed to technician · awaiting approval',
    ],
    docTitle: 'CNC-07 Service Manual', docPage: 'p. 37 · §4.2',
    fields: [
      ['Part no.', '6205-2RS'],
      ['Torque', '45 Nm'],
      ['Tolerance', '± 0.02 mm'],
      ['Interval', '2,000 h'],
    ],
    cited: 'Cited', extracting: 'Extracting',
    rfq: 'RFQ-1182', rfqMeta: '3 line items · 12 suppliers matched', supplier: 'Supplier', price: 'Price', lead: 'Lead time', risk: 'Risk',
    low: 'Low', medium: 'Medium', recommended: 'Recommended', parsing: 'Parsing drawing', comparing: 'Comparing quotes',
    asset: 'Press 12', similar: 'Similar failure', bearing: 'Bearing', drive: 'Drive', hydraulics: 'Hydraulics', sensor: 'Sensor',
    throughput: 'Throughput', oee: 'OEE', queue: 'Queue pressure',
    docCardTitle: 'Documentation Agent',
    docCardBody: 'Reads manuals, drawings and service reports, then turns torque specs, tolerances and part numbers into structured fields with a citation for every value.',
    rfqCardTitle: 'RFQ Intelligence',
    rfqCardBody: 'Parses incoming RFQs, matches line items to drawings and past quotes, and ranks supplier offers by price, lead time and risk before anyone opens a spreadsheet.',
  },
  de: {
    vibration: 'Vibration', temperature: 'Temperatur', alarms: 'Alarme', health: 'Zustand',
    model: 'Machina Agent', running: 'Läuft', done: 'Fertig', thinking: 'Denkt nach',
    steps: [
      'Alarm SP-204 lesen · Spindelvibration 7,8 mm/s',
      'Handbuch CNC-07 durchsuchen · §4.2 Lagertausch',
      'Lager prüfen · Lager 6205-2RS, 4 vorrätig',
      'Arbeitsauftrag WO-2481 entwerfen',
      'An Techniker übergeben · Freigabe ausstehend',
    ],
    docTitle: 'CNC-07 Servicehandbuch', docPage: 'S. 37 · §4.2',
    fields: [
      ['Teilenr.', '6205-2RS'],
      ['Drehmoment', '45 Nm'],
      ['Toleranz', '± 0,02 mm'],
      ['Intervall', '2.000 h'],
    ],
    cited: 'Belegt', extracting: 'Extrahiert',
    rfq: 'RFQ-1182', rfqMeta: '3 Positionen · 12 Lieferanten gefunden', supplier: 'Lieferant', price: 'Preis', lead: 'Lieferzeit', risk: 'Risiko',
    low: 'Gering', medium: 'Mittel', recommended: 'Empfohlen', parsing: 'Zeichnung wird gelesen', comparing: 'Angebote im Vergleich',
    asset: 'Presse 12', similar: 'Ähnlicher Ausfall', bearing: 'Lager', drive: 'Antrieb', hydraulics: 'Hydraulik', sensor: 'Sensor',
    throughput: 'Durchsatz', oee: 'OEE', queue: 'Rückstau',
    docCardTitle: 'Dokumentations-Agent',
    docCardBody: 'Liest Handbücher, Zeichnungen und Serviceberichte und überführt Drehmomente, Toleranzen und Teilenummern in strukturierte Felder – jeder Wert mit Quelle.',
    rfqCardTitle: 'RFQ-Intelligenz',
    rfqCardBody: 'Liest eingehende Anfragen, ordnet Positionen Zeichnungen und früheren Angeboten zu und bewertet Lieferanten nach Preis, Lieferzeit und Risiko – bevor jemand eine Tabelle öffnet.',
  },
} as const;

type Labels = (typeof LABELS)[Lang];

const piece = (i: number, extra?: CSSProperties) => ({ '--i': i, ...extra }) as CSSProperties;

/* ---------- Live ticker ---------- */

const LiveContext = createContext(false);

/** Counts up every `ms` while the wall is live; frozen otherwise. */
function useTick(ms: number) {
  const live = useContext(LiveContext);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!live) return undefined;
    const id = window.setInterval(() => setTick((value) => value + 1), ms);
    return () => window.clearInterval(id);
  }, [live, ms]);
  return { tick, live };
}

/** A looping phase 0..length-1, or the last phase when not live. */
function usePhase(length: number, ms: number) {
  const { tick, live } = useTick(ms);
  return live ? tick % length : length - 1;
}

function ModelChip({ l, running }: { l: Labels; running: boolean }) {
  return (
    <span className="cx-model">
      <ClerkTreeLogo markClassName="cx-model__mark" labelClassName="sr-only" />
      <span>{l.model}</span>
      <span className={`cx-model__state${running ? ' is-running' : ''}`}>
        <span className="cx-live" />
        {running ? l.running : l.done}
      </span>
    </span>
  );
}

/* ---------- 1. Machine signal capture ---------- */
function SignalVis({ l }: { l: Labels }) {
  const { tick } = useTick(1600);
  const scores = [94, 93, 95, 94, 92, 94, 96, 95];
  const streams = [
    { label: l.vibration, d: 'M0 22 C 30 6, 52 38, 84 20 S 136 30, 168 18 S 220 34, 260 24' },
    { label: l.temperature, d: 'M0 26 C 40 24, 70 16, 110 20 S 170 30, 210 18 S 240 22, 260 24' },
    { label: l.alarms, d: 'M0 24 L 70 24 L 78 8 L 86 34 L 94 24 L 180 24 L 186 14 L 192 24 L 260 24' },
  ];
  return (
    <div className="cx-sig">
      <div className="cx-sig__rows">
        {streams.map((s, index) => (
          <div className="cx-sig__row" key={s.label}>
            <span className="cx-p cx-sig__label" style={piece(index)}>{s.label}</span>
            <svg className="cx-sig__wave" viewBox="0 0 260 48" preserveAspectRatio="none">
              <path className="cx-draw" d={s.d} pathLength={1} style={piece(index)} />
              <circle className="cx-pulse" r="2.6">
                <animateMotion dur={`${2.6 + index * 0.7}s`} repeatCount="indefinite" path={s.d} />
              </circle>
            </svg>
          </div>
        ))}
      </div>
      <svg className="cx-sig__merge" viewBox="0 0 40 150" preserveAspectRatio="none" aria-hidden="true">
        <path className="cx-draw" d="M0 25 C 24 25, 16 75, 40 75" pathLength={1} style={piece(3)} />
        <path className="cx-draw" d="M0 75 L 40 75" pathLength={1} style={piece(3)} />
        <path className="cx-draw" d="M0 125 C 24 125, 16 75, 40 75" pathLength={1} style={piece(3)} />
      </svg>
      <div className="cx-p cx-score" style={piece(4)}>
        <span className="cx-score__label"><span className="cx-live" />{l.health}</span>
        <span className="cx-score__value" key={tick}>{scores[tick % scores.length]}</span>
      </div>
    </div>
  );
}

/* ---------- 2. Maintenance agent: a run log, step by step ---------- */
function AgentRunVis({ l }: { l: Labels }) {
  const total = l.steps.length;
  // phases 0..total-1 = working on that step; total..total+1 = holding finished
  const phase = usePhase(total + 2, 1500);
  const running = phase < total;
  return (
    <div className="cx-run">
      <div className="cx-p cx-run__head" style={piece(0)}>
        <ModelChip l={l} running={running} />
      </div>
      <ol className="cx-run__steps">
        {l.steps.map((step, index) => {
          const state = index < phase ? 'done' : index === phase ? 'active' : 'idle';
          return (
            <li className={`cx-p cx-run__step is-${state}`} key={step} style={piece(1 + index * 0.6)}>
              <span className="cx-run__marker" aria-hidden="true" />
              <span className={state === 'active' ? 'cx-shimmer' : undefined}>{step}</span>
            </li>
          );
        })}
      </ol>
      <div className="cx-p cx-run__foot" style={piece(5)}>
        {running ? <span className="cx-shimmer">{l.thinking}…</span> : <span>WO-2481 · {l.done}</span>}
        <span className="cx-run__count">{Math.min(phase, total)}/{total}</span>
      </div>
    </div>
  );
}

/* ---------- 3. Documentation agent: read a page, extract cited fields ---------- */
function DocVis({ l }: { l: Labels }) {
  const fields = l.fields;
  const phase = usePhase(fields.length + 2, 1300);
  const filled = Math.min(phase, fields.length);
  const live = useContext(LiveContext);
  return (
    <div className="cx-doc">
      <div className={`cx-p cx-doc__page${live ? ' is-scanning' : ''}`} style={piece(0)}>
        <div className="cx-doc__title">
          <span>{l.docTitle}</span>
          <small>{l.docPage}</small>
        </div>
        {Array.from({ length: 9 }, (_, row) => (
          <span
            className={`cx-doc__line${[1, 3, 5, 7].includes(row) && filled > [1, 3, 5, 7].indexOf(row) ? ' is-hit' : ''}`}
            key={row}
            style={{ width: `${[92, 78, 88, 64, 90, 72, 84, 58, 80][row]}%` }}
          />
        ))}
        <span className="cx-doc__scan" aria-hidden="true" />
      </div>
      <dl className="cx-doc__fields">
        {fields.map(([label, value], index) => (
          <div className={`cx-p cx-doc__field${index < filled ? ' is-filled' : ''}`} key={label} style={piece(1 + index)}>
            <dt>{label}</dt>
            <dd>{index < filled ? value : <span className="cx-shimmer">{l.extracting}…</span>}</dd>
            {index < filled && <span className="cx-doc__cite">{l.cited}</span>}
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ---------- 4. RFQ intelligence: parse, compare, recommend ---------- */
function RfqVis({ l }: { l: Labels }) {
  const suppliers = [
    { name: 'Kessler GmbH', price: '€ 18,420', lead: '12 d', risk: l.low, best: true },
    { name: 'Nordwerk AG', price: '€ 17,980', lead: '28 d', risk: l.medium },
    { name: 'Präzision Bayern', price: '€ 19,150', lead: '9 d', risk: l.low },
  ];
  // 0 parsing, 1..3 rows appear, 4 recommend, 5 hold
  const phase = usePhase(6, 1200);
  const status = phase === 0 ? l.parsing : phase < 4 ? l.comparing : l.recommended;
  return (
    <div className="cx-rfq">
      <div className="cx-p cx-rfq__head" style={piece(0)}>
        <span className="cx-rfq__id">
          <strong>{l.rfq}</strong>
          <small>{l.rfqMeta}</small>
        </span>
        <span className={`cx-rfq__status${phase >= 4 ? ' is-done' : ''}`}>
          {phase < 4 ? <span className="cx-shimmer">{status}…</span> : status}
        </span>
      </div>
      <div className="cx-p cx-rfq__table" role="presentation" style={piece(1)}>
        <div className="cx-rfq__row is-head">
          <span>{l.supplier}</span>
          <span>{l.price}</span>
          <span>{l.lead}</span>
          <span>{l.risk}</span>
        </div>
        {suppliers.map((s, index) => (
          <div
            className={`cx-rfq__row${phase > index ? ' is-in' : ''}${s.best && phase >= 4 ? ' is-best' : ''}`}
            key={s.name}
          >
            <span>{s.name}</span>
            <span>{s.price}</span>
            <span>{s.lead}</span>
            <span>{s.risk}</span>
            {s.best && <span className="cx-rfq__pick">{l.recommended}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 5. Asset intelligence: beams travel the relationship graph ---------- */
function GraphVis({ l }: { l: Labels }) {
  const nodes = [
    { x: 58, y: 46, label: l.bearing, hot: true },
    { x: 250, y: 40, label: l.drive },
    { x: 266, y: 150, label: l.hydraulics },
    { x: 44, y: 156, label: l.sensor },
  ];

  return (
    <div className="cx-graph">
      <svg viewBox="0 0 310 200" aria-hidden="true">
        {nodes.map((n, index) => {
          const d = `M155 98 L ${n.x} ${n.y}`;
          return (
            <g key={n.label}>
              <path className={`cx-draw cx-graph__edge${n.hot ? ' cx-hot' : ''}`} d={d} pathLength={1} style={piece(1 + index)} />
              <circle className={`cx-beam-dot${n.hot ? ' is-hot' : ''}`} r={n.hot ? 3 : 2.2}>
                <animateMotion dur={`${1.8 + index * 0.45}s`} begin={`${index * 0.35}s`} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          );
        })}
        <path className="cx-draw cx-graph__edge cx-dim" d="M58 46 L 44 156" pathLength={1} style={piece(5)} />
      </svg>
      <div className="cx-p cx-graph__core" style={piece(0)}>{l.asset}</div>
      {nodes.map((n, index) => (
        <div
          className={`cx-p cx-graph__node${n.hot ? ' is-hot' : ''}`}
          key={n.label}
          style={piece(2 + index, { left: `${(n.x / 310) * 100}%`, top: `${(n.y / 200) * 100}%` })}
        >
          {n.label}
        </div>
      ))}
      <div className="cx-p cx-graph__note" style={piece(6)}>
        <span className="cx-dot cx-dot--signal" />
        {l.similar} · 0.91
      </div>
    </div>
  );
}

/* ---------- 6. Production analytics: live hourly throughput ---------- */
const BASE_BARS = [46, 58, 64, 61, 72, 78, 34, 69, 82, 88, 84, 90];

function ThroughputVis({ l }: { l: Labels }) {
  const { tick, live } = useTick(2200);
  const shift = live ? tick % BASE_BARS.length : 0;
  const bars = BASE_BARS.map((_, index) => BASE_BARS[(index + shift) % BASE_BARS.length]);
  const dip = bars.indexOf(Math.min(...bars));
  const peak = bars.indexOf(Math.max(...bars));
  const oee = (86.2 + ((tick * 7) % 19) / 10).toFixed(1);
  return (
    <div className="cx-tp">
      <div className="cx-tp__head">
        <span className="cx-p cx-tp__metric" style={piece(0)}>
          <small><span className="cx-live" />{l.oee}</small>
          <strong>{oee}%</strong>
        </span>
        <span className="cx-p cx-tp__metric" style={piece(1)}>
          <small>{l.throughput}</small>
          <strong>{(1240 + ((tick * 37) % 90)).toLocaleString('en-US')}/h</strong>
        </span>
      </div>
      <div className="cx-tp__plot">
        {bars.map((h, index) => (
          <span
            className={`cx-p cx-tp__bar${index === dip ? ' is-flag' : ''}${index === peak ? ' is-peak' : ''}`}
            key={index}
            style={piece(2 + index * 0.5, { '--h': `${h}%` } as CSSProperties)}
          />
        ))}
        <span className="cx-p cx-tp__flag" style={piece(9, { left: `clamp(0%, calc(${dip} / 12 * 100%), calc(100% - 96px))` })}>{l.queue}</span>
      </div>
      <div className="cx-tp__axis">
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
      </div>
    </div>
  );
}

/* ---------- Card + wall ---------- */

type Card = { key: string; title: string; body: string; vis: ReactNode; wide?: boolean; beam?: boolean };

function CapabilityCard({ card, index }: { card: Card; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });

  const paint = () => {
    frame.current = 0;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${(point.current.x - rect.left).toFixed(1)}px`);
    el.style.setProperty('--my', `${(point.current.y - rect.top).toFixed(1)}px`);
  };

  const onPointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;
    point.current = { x: event.clientX, y: event.clientY };
    if (!frame.current) frame.current = requestAnimationFrame(paint);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <article
      className={`cx-card${card.wide ? ' cx-card--wide' : ''}${card.beam ? ' has-beam' : ''}`}
      ref={ref}
      style={{ '--d': `${index * 120}ms` } as CSSProperties}
      onPointerEnter={onPointer}
      onPointerMove={onPointer}
      aria-labelledby={`cx-${card.key}-t`}
    >
      <span className="cx-light" aria-hidden="true" />
      {card.beam && <span className="cx-border-beam" aria-hidden="true" />}
      <div className="cx-vis" aria-hidden="true">{card.vis}</div>
      <div className="cx-copy">
        <h3 id={`cx-${card.key}-t`}>{card.title}</h3>
        <p>{card.body}</p>
      </div>
    </article>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return reduced;
}

export default function CapabilityCards() {
  const { t, language } = useLanguage();
  const l = LABELS[language === 'de' ? 'de' : 'en'];
  const gridRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const live = onScreen && !reducedMotion;

  // SVG <animateMotion> beams/pulses run on their own clock: pause them with the wall.
  useEffect(() => {
    gridRef.current?.querySelectorAll('svg').forEach((svg) => {
      if (live) svg.unpauseAnimations();
      else svg.pauseAnimations();
    });
  }, [live]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return undefined;
    }
    // Entrance: once. Live loop: only while any part of the wall is on screen.
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRevealed(true);
        reveal.disconnect();
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
    );
    const presence = new IntersectionObserver(([entry]) => setOnScreen(Boolean(entry?.isIntersecting)), { threshold: 0 });
    reveal.observe(grid);
    presence.observe(grid);
    return () => {
      reveal.disconnect();
      presence.disconnect();
    };
  }, []);

  const cards: Card[] = [
    { key: 'signal', title: t('solutions.card1Title'), body: t('solutions.card1Desc'), vis: <SignalVis l={l} />, wide: true },
    { key: 'agent', title: t('solutions.card2Title'), body: t('solutions.card2Desc'), vis: <AgentRunVis l={l} />, beam: true },
    { key: 'docs', title: l.docCardTitle, body: l.docCardBody, vis: <DocVis l={l} /> },
    { key: 'rfq', title: l.rfqCardTitle, body: l.rfqCardBody, vis: <RfqVis l={l} />, wide: true },
    { key: 'graph', title: t('solutions.card3Title'), body: t('solutions.card3Desc'), vis: <GraphVis l={l} /> },
    { key: 'throughput', title: t('solutions.card5Title'), body: t('solutions.card5Desc'), vis: <ThroughputVis l={l} />, wide: true },
  ];

  return (
    <section className="cx-section" aria-labelledby="cx-title">
      <header className="cx-head">
        <p className="cx-eyebrow">{t('solutions.capabilitiesEyebrow')}</p>
        <h2 id="cx-title">{t('solutions.capabilitiesTitle')}</h2>
      </header>
      <LiveContext.Provider value={live}>
        <div className={`cx-grid${revealed ? ' is-visible' : ''}${live ? ' is-live' : ''}`} ref={gridRef}>
          {cards.map((card, index) => (
            <CapabilityCard card={card} index={index} key={card.key} />
          ))}
        </div>
      </LiveContext.Provider>
    </section>
  );
}
