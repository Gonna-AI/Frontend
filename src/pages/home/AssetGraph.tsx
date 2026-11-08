// Asset graph for the homepage spotlight (sixtyfour "Lattice"-style).
// Nodes pop in and links draw in ~1.5s when the panel enters view, then an
// ambient loop runs: signal particles travel the links and the at-risk path
// (bearing → CNC-09) pulses orange. CSS/SMIL only, GPU-friendly.
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CalendarClock, ClipboardList, Cog, Disc, Factory, FileText, Radio, Truck, User, Warehouse } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

type Kind = 'machine' | 'component' | 'part' | 'incident' | 'doc' | 'person' | 'supplier';
type Node = { id: string; x: number; y: number; kind: Kind; icon: typeof Factory; label: [string, string]; sub: [string, string]; ring: 0 | 1 | 2; risk?: boolean; draft?: boolean };

const NODES: Node[] = [
  { id: 'hub', x: 500, y: 285, kind: 'incident', icon: AlertTriangle, label: ['Bearing wear', 'Lagerverschleiß'], sub: ['Incident · 82% confidence', 'Störung · 82 % Konfidenz'], ring: 0 },
  { id: 'cnc07', x: 300, y: 160, kind: 'machine', icon: Factory, label: ['CNC-07', 'CNC-07'], sub: ['Machining centre', 'Bearbeitungszentrum'], ring: 1 },
  { id: 'spindle', x: 255, y: 345, kind: 'component', icon: Cog, label: ['Spindle drive end', 'Spindel Antriebsseite'], sub: ['Component', 'Komponente'], ring: 1 },
  { id: 'part', x: 715, y: 190, kind: 'part', icon: Disc, label: ['6205-2RS', '6205-2RS'], sub: ['Bearing, 14 mo in service', 'Lager, 14 Mon. im Einsatz'], ring: 1 },
  { id: 'wo1874', x: 520, y: 95, kind: 'doc', icon: ClipboardList, label: ['WO-1874', 'WO-1874'], sub: ['Last replacement', 'Letzter Tausch'], ring: 1 },
  { id: 'manual', x: 735, y: 385, kind: 'doc', icon: FileText, label: ['Manual §4.3', 'Handbuch §4.3'], sub: ['Failure modes', 'Fehlerbilder'], ring: 1 },
  { id: 'huber', x: 480, y: 470, kind: 'person', icon: User, label: ['M. Huber', 'M. Huber'], sub: ['Maintenance', 'Instandhaltung'], ring: 1 },
  { id: 'line2', x: 115, y: 95, kind: 'machine', icon: Factory, label: ['Line 2', 'Linie 2'], sub: ['4 machines', '4 Maschinen'], ring: 2 },
  { id: 'tag', x: 95, y: 270, kind: 'component', icon: Radio, label: ['VibRMS', 'VibRMS'], sub: ['OPC UA tag, 2 kHz', 'OPC-UA-Tag, 2 kHz'], ring: 2 },
  { id: 'cnc09', x: 895, y: 100, kind: 'machine', icon: Factory, label: ['CNC-09', 'CNC-09'], sub: ['Same bearing, at risk', 'Gleiches Lager, gefährdet'], ring: 2, risk: true },
  { id: 'supplier', x: 905, y: 275, kind: 'supplier', icon: Truck, label: ['Nordlager GmbH', 'Nordlager GmbH'], sub: ['Supplier, 2-day lead', 'Lieferant, 2 Tage'], ring: 2 },
  { id: 'bay', x: 900, y: 455, kind: 'part', icon: Warehouse, label: ['Bay B-12', 'Fach B-12'], sub: ['4 in stock', '4 auf Lager'], ring: 2 },
  { id: 'shift', x: 215, y: 490, kind: 'person', icon: CalendarClock, label: ['Tue 06:00', 'Di 06:00'], sub: ['Planned window', 'Geplantes Fenster'], ring: 2 },
  { id: 'wo2291', x: 690, y: 525, kind: 'doc', icon: ClipboardList, label: ['WO-2291', 'WO-2291'], sub: ['Drafted by agent', 'Vom Agenten erstellt'], ring: 2, draft: true },
];

const EDGES: [string, string, boolean?][] = [
  ['hub', 'cnc07'], ['hub', 'spindle'], ['hub', 'part'], ['hub', 'wo1874'], ['hub', 'manual'], ['hub', 'huber'],
  ['cnc07', 'line2'], ['spindle', 'tag'], ['cnc07', 'spindle'], ['part', 'cnc09', true], ['part', 'supplier'],
  ['part', 'bay'], ['huber', 'shift'], ['huber', 'wo2291'], ['manual', 'wo2291'], ['wo1874', 'part'],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
const curve = (a: Node, b: Node) => {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
  return `M${a.x} ${a.y}Q${(mx + dy * 0.12).toFixed(1)} ${(my - dx * 0.12).toFixed(1)} ${b.x} ${b.y}`;
};

const copy = {
  en: { title: 'Asset graph', crumb: 'Line 2 · CNC-07 bearing incident', nodes: 'nodes', links: 'links', risk: 'at risk', foot: 'One bearing. Every linked machine, part, document and person.', legend: ['Machine', 'Component', 'Part', 'Incident', 'Document', 'Person', 'Supplier'] },
  de: { title: 'Anlagengraph', crumb: 'Linie 2 · Lagerstörung CNC-07', nodes: 'Knoten', links: 'Verbindungen', risk: 'gefährdet', foot: 'Ein Lager. Jede verknüpfte Maschine, jedes Teil, Dokument und jede Person.', legend: ['Maschine', 'Komponente', 'Teil', 'Störung', 'Dokument', 'Person', 'Lieferant'] },
};
const KINDS: Kind[] = ['machine', 'component', 'part', 'incident', 'doc', 'person', 'supplier'];

export default function AssetGraph() {
  const { language } = useLanguage();
  const de = language === 'de' ? 1 : 0;
  const c = copy[de ? 'de' : 'en'];
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.25 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`ag${on ? ' is-on' : ''}`} ref={ref}>
      <div className="ag-bar">
        <span className="ag-brand"><i />{c.title}</span>
        <span className="ag-crumb">{c.crumb}</span>
        <span className="ag-chips">
          <b>{NODES.length} {c.nodes}</b><b>{EDGES.length} {c.links}</b><b className="is-risk">1 {c.risk}</b>
        </span>
      </div>
      <div className="ag-canvas">
        <svg viewBox="0 0 1000 570" preserveAspectRatio="none" aria-hidden="true">
          {EDGES.map(([a, b, risk], i) => {
            const A = byId[a], B = byId[b];
            const ring = Math.max(A.ring, B.ring);
            return (
              <path
                className={`ag-edge${risk ? ' is-risk' : ''}`}
                d={curve(A, B)}
                id={`ag-e${i}`}
                key={`${a}-${b}`}
                pathLength={1}
                style={{ '--d': `${0.12 + ring * 0.28 + i * 0.02}s` } as CSSProperties}
              />
            );
          })}
          {on && EDGES.slice(0, 6).map((_, i) => (
            <circle className="ag-particle" key={`p${i}`} r="3">
              <animateMotion begin={`${1.4 + i * 0.35}s`} dur="2.6s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                <mpath href={`#ag-e${i}`} />
              </animateMotion>
            </circle>
          ))}
          {on && (
            <circle className="ag-particle is-risk" r="3.5">
              <animateMotion begin="1.8s" dur="1.8s" repeatCount="indefinite"><mpath href="#ag-e9" /></animateMotion>
            </circle>
          )}
        </svg>
        {NODES.map((n, i) => {
          const Icon = n.icon;
          return (
            <div
              className={`ag-node is-${n.kind}${n.id === 'hub' ? ' is-hub' : ''}${n.risk ? ' is-risk' : ''}${n.draft ? ' is-draft' : ''}`}
              key={n.id}
              style={{ left: `${n.x / 10}%`, top: `${(n.y / 570) * 100}%`, '--d': `${n.ring * 0.28 + i * 0.03}s` } as CSSProperties}
            >
              <span className="ag-ico"><Icon size={13} strokeWidth={1.75} /></span>
              <span className="ag-txt"><strong>{n.label[de]}</strong><small>{n.sub[de]}</small></span>
            </div>
          );
        })}
      </div>
      <div className="ag-foot">
        <span>{c.foot}</span>
        <ul>{c.legend.map((l, i) => <li className={`is-${KINDS[i]}`} key={l}>{l}</li>)}</ul>
      </div>
    </div>
  );
}
