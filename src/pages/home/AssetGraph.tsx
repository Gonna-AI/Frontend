// Asset graph for the homepage spotlight: a camera-driven story.
// 1 alarm on CNC-07 (tight zoom) → 2 the cause, a worn bearing → 3 pull back,
// clusters of linked machines/parts/docs/people bloom in → 4 swoop to CNC-09,
// next at risk → 5 spare in stock + technician free → 6 the whole picture.
// The world is one transformed layer (GPU), links keep 1px via non-scaling-stroke.
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CalendarClock, ClipboardList, Cog, Disc, Factory, FileText, Radio, Truck, User, Warehouse } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

type Kind = 'machine' | 'component' | 'part' | 'incident' | 'doc' | 'person' | 'supplier';
type GNode = { id: string; x: number; y: number; kind: Kind; icon: typeof Factory; label: [string, string]; sub: [string, string]; at: number; risk?: boolean; draft?: boolean };

const W = 1000, H = 570;

// `at` = the story step in which the node appears.
const NODES: GNode[] = [
  { id: 'cnc07', x: 250, y: 205, kind: 'machine', icon: Factory, label: ['CNC-07', 'CNC-07'], sub: ['Vibration alarm', 'Vibrationsalarm'], at: 0 },
  { id: 'tag', x: 120, y: 300, kind: 'component', icon: Radio, label: ['Vibration 7.8 mm/s', 'Vibration 7,8 mm/s'], sub: ['Live signal, 3.7× normal', 'Live-Signal, 3,7× normal'], at: 0 },
  { id: 'hub', x: 470, y: 285, kind: 'incident', icon: AlertTriangle, label: ['Worn bearing', 'Lager verschlissen'], sub: ['Root cause · 82% sure', 'Ursache · 82 % sicher'], at: 1 },
  { id: 'spindle', x: 300, y: 400, kind: 'component', icon: Cog, label: ['Spindle', 'Spindel'], sub: ['Drive end', 'Antriebsseite'], at: 1 },
  { id: 'part', x: 690, y: 205, kind: 'part', icon: Disc, label: ['Bearing 6205-2RS', 'Lager 6205-2RS'], sub: ['14 months old, rated 12', '14 Monate alt, für 12 ausgelegt'], at: 1 },
  { id: 'manual', x: 640, y: 395, kind: 'doc', icon: FileText, label: ['Manual §4.3', 'Handbuch §4.3'], sub: ['Matches this pattern', 'Passt zu diesem Muster'], at: 2 },
  { id: 'wo1874', x: 470, y: 110, kind: 'doc', icon: ClipboardList, label: ['WO-1874', 'WO-1874'], sub: ['Last replaced here', 'Zuletzt hier getauscht'], at: 2 },
  { id: 'line2', x: 110, y: 110, kind: 'machine', icon: Factory, label: ['Line 2', 'Linie 2'], sub: ['Stops if CNC-07 stops', 'Steht, wenn CNC-07 steht'], at: 2 },
  { id: 'cnc09', x: 900, y: 120, kind: 'machine', icon: Factory, label: ['CNC-09', 'CNC-09'], sub: ['Same bearing, next to fail', 'Gleiches Lager, fällt als Nächstes aus'], at: 3, risk: true },
  { id: 'supplier', x: 895, y: 285, kind: 'supplier', icon: Truck, label: ['Nordlager GmbH', 'Nordlager GmbH'], sub: ['2-day delivery', '2 Tage Lieferzeit'], at: 3 },
  { id: 'bay', x: 870, y: 460, kind: 'part', icon: Warehouse, label: ['Spare in Bay B-12', 'Ersatz in Fach B-12'], sub: ['4 in stock', '4 auf Lager'], at: 4 },
  { id: 'huber', x: 470, y: 480, kind: 'person', icon: User, label: ['M. Huber', 'M. Huber'], sub: ['Technician, free Tue', 'Techniker, Di frei'], at: 4 },
  { id: 'shift', x: 240, y: 505, kind: 'person', icon: CalendarClock, label: ['Tue 06:00', 'Di 06:00'], sub: ['Planned stop, 1.5 h', 'Geplanter Stopp, 1,5 h'], at: 4 },
  { id: 'wo2291', x: 680, y: 520, kind: 'doc', icon: ClipboardList, label: ['WO-2291', 'WO-2291'], sub: ['Drafted, ready to approve', 'Erstellt, bereit zur Freigabe'], at: 4, draft: true },
];

const EDGES: [string, string, boolean?][] = [
  ['tag', 'cnc07'], ['cnc07', 'hub'], ['hub', 'spindle'], ['hub', 'part'], ['cnc07', 'spindle'],
  ['hub', 'manual'], ['hub', 'wo1874'], ['wo1874', 'part'], ['cnc07', 'line2'],
  ['part', 'cnc09', true], ['part', 'supplier'],
  ['part', 'bay'], ['hub', 'huber'], ['huber', 'shift'], ['huber', 'wo2291'], ['manual', 'wo2291'],
];

// Clusters of related entities that bloom in when the camera pulls back.
const CLUSTERS = [
  { x: 150, y: 150, n: 16, r: 95, near: 'line2' },
  { x: 800, y: 190, n: 14, r: 90, near: 'part' },
  { x: 700, y: 410, n: 12, r: 80, near: 'manual' },
  { x: 380, y: 500, n: 14, r: 90, near: 'huber' },
  { x: 120, y: 360, n: 9, r: 60, near: 'tag' },
];

type Cam = { x: number; y: number; s: number };
const STEPS: { cam: Cam; ms: number; focus?: string[] }[] = [
  { cam: { x: 210, y: 245, s: 2.3 }, ms: 1500, focus: ['cnc07', 'tag'] },
  { cam: { x: 420, y: 285, s: 1.75 }, ms: 1600, focus: ['hub'] },
  { cam: { x: 500, y: 300, s: 1 }, ms: 2000 },
  { cam: { x: 820, y: 190, s: 1.9 }, ms: 1900, focus: ['cnc09', 'part'] },
  { cam: { x: 640, y: 470, s: 1.55 }, ms: 1900, focus: ['bay', 'huber', 'wo2291'] },
  { cam: { x: 500, y: 300, s: 1 }, ms: 2800 },
];

const copy = {
  en: {
    title: 'Asset graph', crumb: 'Line 2 · Why did CNC-07 alarm?', nodes: 'entities', links: 'links', risk: 'at risk',
    captions: [
      'A vibration alarm goes off on CNC-07.',
      'ClerkTree traces it to the cause: a worn bearing.',
      'Then it pulls in everything connected to it.',
      'The same bearing runs in CNC-09. That machine is next.',
      'A spare is in stock and a technician is free Tuesday.',
      'One graph. One decision, with every source attached.',
    ],
    legend: ['Machine', 'Component', 'Part', 'Cause', 'Document', 'Person', 'Supplier'],
  },
  de: {
    title: 'Anlagengraph', crumb: 'Linie 2 · Warum alarmiert CNC-07?', nodes: 'Elemente', links: 'Verbindungen', risk: 'gefährdet',
    captions: [
      'An CNC-07 geht ein Vibrationsalarm los.',
      'ClerkTree findet die Ursache: ein verschlissenes Lager.',
      'Dann holt es alles dazu, was damit verbunden ist.',
      'Dasselbe Lager läuft in CNC-09. Diese Maschine ist die nächste.',
      'Ein Ersatzteil ist auf Lager, ein Techniker hat Dienstag Zeit.',
      'Ein Graph. Eine Entscheidung, mit allen Quellen.',
    ],
    legend: ['Maschine', 'Komponente', 'Teil', 'Ursache', 'Dokument', 'Person', 'Lieferant'],
  },
};
const KINDS: Kind[] = ['machine', 'component', 'part', 'incident', 'doc', 'person', 'supplier'];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
const curve = (a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.12) => {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
  return `M${a.x} ${a.y}Q${(mx + dy * bend).toFixed(1)} ${(my - dx * bend).toFixed(1)} ${b.x} ${b.y}`;
};
const rand = (i: number) => ((Math.sin(i * 78.233) * 43758.5453) % 1 + 1) % 1;

export default function AssetGraph() {
  const { language } = useLanguage();
  const de = language === 'de' ? 1 : 0;
  const c = copy[de ? 'de' : 'en'];
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(-1);
  const [inView, setInView] = useState(false);

  const dust = useMemo(() => CLUSTERS.flatMap((cl, ci) => Array.from({ length: cl.n }, (_, i) => {
    const k = ci * 40 + i;
    const a = rand(k) * Math.PI * 2, r = Math.sqrt(rand(k + 7)) * cl.r;
    return { x: cl.x + Math.cos(a) * r, y: cl.y + Math.sin(a) * r * 0.75, size: 2 + rand(k + 3) * 3, near: byId[cl.near], d: i * 0.016 + ci * 0.04 };
  })), []);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStep(STEPS.length - 1); return undefined; }
    if (!inView) return undefined;
    const next = step < 0 ? 0 : (step + 1) % STEPS.length;
    const timer = window.setTimeout(() => setStep(next), step < 0 ? 120 : STEPS[step].ms);
    return () => window.clearTimeout(timer);
  }, [step, inView]);

  const s = Math.max(step, 0);
  const cam = STEPS[s].cam;
  const focus = STEPS[s].focus;
  const tx = (0.5 - (cam.x / W) * cam.s) * 100;
  const ty = (0.5 - (cam.y / H) * cam.s) * 100;
  const shown = (n: GNode) => step >= 0 && n.at <= s;
  const visibleNodes = NODES.filter(shown).length + (s >= 2 ? dust.length : 0);
  const visibleEdges = EDGES.filter(([a, b]) => shown(byId[a]) && shown(byId[b])).length + (s >= 2 ? dust.length : 0);

  return (
    <div className={`ag${step >= 0 ? ' is-on' : ''}${focus ? ' has-focus' : ''}`} ref={ref}>
      <div className="ag-bar">
        <span className="ag-brand"><i />{c.title}</span>
        <span className="ag-crumb">{c.crumb}</span>
        <span className="ag-chips">
          <b>{visibleNodes} {c.nodes}</b><b>{visibleEdges} {c.links}</b>{s >= 3 && <b className="is-risk">1 {c.risk}</b>}
        </span>
      </div>
      <div className="ag-canvas">
        <div className="ag-world" style={{ transform: `translate(${tx}%, ${ty}%) scale(${cam.s})`, '--z': cam.s } as CSSProperties}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
            <g className={`ag-dust${s >= 2 ? ' is-in' : ''}`}>
              {dust.map((d, i) => (
                <path className="ag-dust-link" d={curve(d, d.near, 0.08)} key={`l${i}`} pathLength={1} style={{ '--d': `${d.d}s` } as CSSProperties} />
              ))}
              {dust.map((d, i) => (
                <circle className="ag-dot" cx={d.x} cy={d.y} key={`d${i}`} r={d.size} style={{ '--d': `${d.d}s` } as CSSProperties} />
              ))}
            </g>
            {EDGES.map(([a, b, risk], i) => {
              const on = shown(byId[a]) && shown(byId[b]);
              const lit = focus ? focus.includes(a) || focus.includes(b) : false;
              return (
                <path
                  className={`ag-edge${on ? ' is-in' : ''}${risk ? ' is-risk' : ''}${lit ? ' is-lit' : ''}`}
                  d={curve(byId[a], byId[b])}
                  id={`ag-e${i}`}
                  key={`${a}-${b}`}
                  pathLength={1}
                />
              );
            })}
            {s >= 2 && [1, 2, 3, 5, 12].map((e, i) => (
              <circle className="ag-particle" key={`p${e}`} r="3">
                <animateMotion begin={`${i * 0.25}s`} dur="1.5s" repeatCount="indefinite"><mpath href={`#ag-e${e}`} /></animateMotion>
              </circle>
            ))}
            {s >= 3 && (
              <circle className="ag-particle is-risk" r="4">
                <animateMotion dur="1s" repeatCount="indefinite"><mpath href="#ag-e9" /></animateMotion>
              </circle>
            )}
          </svg>
          {NODES.map((n) => {
            const Icon = n.icon;
            const dim = focus ? !focus.includes(n.id) && n.id !== 'hub' : false;
            return (
              <div
                className={`ag-node is-${n.kind}${n.id === 'hub' ? ' is-hub' : ''}${n.risk ? ' is-risk' : ''}${n.draft ? ' is-draft' : ''}${shown(n) ? ' is-in' : ''}${dim ? ' is-dim' : ''}${focus?.includes(n.id) ? ' is-focus' : ''}${n.id === 'cnc07' && s === 0 ? ' is-alarm' : ''}`}
                key={n.id}
                style={{ left: `${n.x / 10}%`, top: `${(n.y / H) * 100}%` } as CSSProperties}
              >
                <span className="ag-ico"><Icon size={13} strokeWidth={1.75} /></span>
                <span className="ag-txt"><strong>{n.label[de]}</strong><small>{n.sub[de]}</small></span>
              </div>
            );
          })}
        </div>
        <div className="ag-caption" key={s} aria-live="polite">
          <span>{s + 1}/{STEPS.length}</span>
          <p>{c.captions[s]}</p>
        </div>
      </div>
      <div className="ag-foot">
        <ul>{c.legend.map((l, i) => <li className={`is-${KINDS[i]}`} key={l}>{l}</li>)}</ul>
      </div>
    </div>
  );
}
