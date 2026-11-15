import { useMemo, useState } from 'react';

import { Chips, Field, PageCard } from './common';
import type { GraphNode } from './placeholder';
import { useHive } from './store';

const KINDS: GraphNode['kind'][] = ['Machine', 'Component', 'Document', 'Work order', 'Vendor', 'Part'];
const KIND_COLOR: Record<GraphNode['kind'], string> = {
  Machine: 'var(--hd-orange)',
  Component: 'var(--hd-text)',
  Document: '#a9a9ad',
  'Work order': '#e8a317',
  Vendor: '#1fa35c',
  Part: '#7a7aff',
};

export function GraphView() {
  const { data } = useHive();
  const [view, setView] = useState<'Graph' | 'List'>('Graph');
  const [hidden, setHidden] = useState<Set<GraphNode['kind']>>(new Set());
  const [selected, setSelected] = useState<string>('n_cnc07');

  const nodes = data.graph.nodes.filter((n) => !hidden.has(n.kind));
  const ids = new Set(nodes.map((n) => n.id));
  const edges = data.graph.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
  const byId = useMemo(() => new Map(data.graph.nodes.map((n) => [n.id, n])), [data.graph.nodes]);
  const sel = byId.get(selected);
  const links = data.graph.edges.filter((e) => e.from === selected || e.to === selected);

  return (
    <PageCard title="Graph" subtitle="The plant as one connected picture: machines, parts, documents, work and vendors">
      <div className="hd-row hd-graph-bar">
        <Chips options={['Graph', 'List'] as const} value={view} onChange={setView} />
        <div className="hd-chips" role="group" aria-label="Node kinds">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              className={`hd-chip${hidden.has(k) ? '' : ' is-on'}`}
              aria-pressed={!hidden.has(k)}
              onClick={() => setHidden((h) => { const n = new Set(h); if (n.has(k)) n.delete(k); else n.add(k); return n; })}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="hd-graph-wrap">
        {view === 'Graph' ? (
          <svg viewBox="0 0 640 400" className="hd-graph" role="img" aria-label="Relationship graph around CNC-07 (placeholder). The List view shows the same data as text.">
            {edges.map((e) => {
              const a = byId.get(e.from)!;
              const b = byId.get(e.to)!;
              const on = e.from === selected || e.to === selected;
              return (
                <g key={`${e.from}-${e.to}`}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`hd-edge${on ? ' is-on' : ''}`} />
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} textAnchor="middle" className="hd-edge-label">{e.rel}</text>
                </g>
              );
            })}
            {nodes.map((n) => (
              <g key={n.id} className={`hd-node${n.id === selected ? ' is-on' : ''}`} tabIndex={0} role="button" aria-label={`${n.kind} ${n.label}`} onClick={() => setSelected(n.id)} onKeyDown={(e) => { if (e.key === 'Enter') setSelected(n.id); }}>
                <circle cx={n.x} cy={n.y} r={n.kind === 'Machine' ? 22 : 16} fill={KIND_COLOR[n.kind]} />
                <text x={n.x} y={n.y + (n.kind === 'Machine' ? 38 : 31)} textAnchor="middle">{n.label}</text>
              </g>
            ))}
          </svg>
        ) : (
          <ul className="hd-graph-list">
            {nodes.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => setSelected(n.id)} className={n.id === selected ? 'is-on' : ''}>
                  <b>{n.label}</b> <small>{n.kind}</small>
                </button>
                <ul>
                  {data.graph.edges.filter((e) => e.from === n.id).map((e) => (
                    <li key={e.to}>
                      {e.rel} → {byId.get(e.to)?.label}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}

        {sel && (
          <aside className="hd-panel hd-graph-detail" aria-label="Selected node">
            <h3>{sel.label}</h3>
            <small className="hd-muted">{sel.kind}</small>
            <p className="hd-detail-text">{sel.detail}</p>
            <h4>Connections</h4>
            {links.map((e) => {
              const other = byId.get(e.from === selected ? e.to : e.from)!;
              return (
                <button key={`${e.from}${e.to}`} type="button" className="hd-link-row" onClick={() => setSelected(other.id)}>
                  <small>{e.from === selected ? e.rel : `is ${e.rel} by`}</small> {other.label}
                </button>
              );
            })}
            <Field k="Connections" v={links.length} />
          </aside>
        )}
      </div>
    </PageCard>
  );
}
