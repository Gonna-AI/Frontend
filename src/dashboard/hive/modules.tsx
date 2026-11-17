import { Search } from 'lucide-react-dash';
import { useMemo, useState } from 'react';

import { useLang, useT } from './i18n';
import { MODULES, type Block, type Cell, type CellValue, type Tab, type Txt } from './modulesData';
import { NAV } from './nav';

/**
 * The generic screen for Hive modules that are specified but not built yet. It draws the tabs and blocks
 * from modulesData.ts. The point is that every such screen looks and behaves like the finished ones will:
 * the same header, the same tabs, tables that become cards on a phone, and both languages.
 */

function useTx() {
  const { lang } = useLang();
  return (v: Txt) => (typeof v === 'string' ? v : v[lang === 'de' ? 'de' : 'en']);
}

const isCell = (v: CellValue): v is Cell => typeof v === 'object' && 'text' in v;

/* ---------- tabs ---------- */

export function Tabs({ tabs, value, onChange, label }: { tabs: { id: string; title: string }[]; value: string; onChange: (id: string) => void; label: string }) {
  return (
    <div className="hx-tabs-wrap">
      <div className="hx-tabs" role="tablist" aria-label={label}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === value}
            className={`hx-tab${tab.id === value ? ' is-on' : ''}`}
            onClick={(e) => {
              onChange(tab.id);
              e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
            }}
          >
            {tab.title}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- blocks ---------- */

function Panel({ title, sub, children, flush }: { title?: string; sub?: string; children: React.ReactNode; flush?: boolean }) {
  return (
    <section className={`hx-panel${flush ? ' is-flush' : ''}`}>
      {(title || sub) && (
        <header className="hx-panel-head">
          {title && <h2>{title}</h2>}
          {sub && <p>{sub}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

function CellView({ v, label }: { v: CellValue; label: string }) {
  const tr = useTx();
  const c: Cell = isCell(v) ? v : { text: v };
  const text = tr(c.text);
  return (
    <td data-label={label} className={c.mono ? 'is-mono' : undefined}>
      {c.pill ? <span className={`hx-pill is-${c.tone ?? 'gray'}`}>{text}</span> : text}
    </td>
  );
}

function TableBlock({ block }: { block: Extract<Block, { kind: 'table' }> }) {
  const tr = useTx();
  const t = useT();
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<string | null>(null);

  const textOf = (v: CellValue) => tr(isCell(v) ? v.text : v);
  const options = useMemo(() => {
    if (block.filterCol === undefined) return [];
    return [...new Set(block.rows.map((row) => textOf(row[block.filterCol!])))];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tr changes with the language, which is what we want
  }, [block, tr]);

  const rows = block.rows.filter((row) => {
    if (pick !== null && block.filterCol !== undefined && textOf(row[block.filterCol]) !== pick) return false;
    if (q.trim() && !row.some((cell) => textOf(cell).toLowerCase().includes(q.trim().toLowerCase()))) return false;
    return true;
  });
  const labels = block.cols.map((c) => tr(c.label));

  return (
    <Panel title={tr(block.title)} sub={block.sub ? tr(block.sub) : undefined} flush>
      {(block.searchable || options.length > 1) && (
        <div className="hx-toolbar">
          {block.searchable && (
            <label className="hx-find">
              <Search size={15} aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search')} aria-label={t('Search')} />
            </label>
          )}
          {options.length > 1 && (
            <div className="hx-filters" role="group" aria-label={t('Filter')}>
              <button type="button" className={`hx-chip${pick === null ? ' is-on' : ''}`} aria-pressed={pick === null} onClick={() => setPick(null)}>
                {t('All')}
              </button>
              {options.map((o) => (
                <button key={o} type="button" className={`hx-chip${pick === o ? ' is-on' : ''}`} aria-pressed={pick === o} onClick={() => setPick(pick === o ? null : o)}>
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="hx-tablewrap">
        <table className="hx-table">
          <thead>
            <tr>
              {block.cols.map((c, i) => (
                <th key={i} className={c.align === 'end' ? 'is-end' : undefined} scope="col">
                  {labels[i]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <CellView key={ci} v={cell} label={labels[ci]} />
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr className="is-empty">
                <td colSpan={block.cols.length}>{t('Nothing found.')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function BlockView({ block }: { block: Block }) {
  const tr = useTx();
  switch (block.kind) {
    case 'kpis':
      return (
        <div className={`hx-kpis is-${Math.min(block.items.length, 4)}`}>
          {block.items.map((k, i) => (
            <div key={i} className={`hx-kpi${k.hot ? ' is-hot' : ''}`}>
              <span>{tr(k.label)}</span>
              <b>{tr(k.value)}</b>
              <small>
                {k.delta && <em className={k.up ? 'is-up' : 'is-down'}>{k.up ? '↗' : '↘'} {k.delta}</em>}
                {k.sub && <span>{tr(k.sub)}</span>}
              </small>
            </div>
          ))}
        </div>
      );
    case 'table':
      return <TableBlock block={block} />;
    case 'bars': {
      const max = block.max ?? Math.max(...block.rows.map((r) => r.value)) * 1.15;
      return (
        <Panel title={tr(block.title)} sub={block.sub ? tr(block.sub) : undefined}>
          <ul className="hx-bars">
            {block.rows.map((r, i) => (
              <li key={i} className={r.hot ? 'is-hot' : undefined}>
                <span>{tr(r.label)}</span>
                <i aria-hidden="true">
                  <b style={{ width: `${Math.max(2, Math.min(100, (r.value / max) * 100))}%` }} />
                </i>
                <em>
                  {r.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  {block.unit ? ` ${block.unit}` : ''}
                </em>
              </li>
            ))}
          </ul>
        </Panel>
      );
    }
    case 'steps':
      return (
        <Panel title={tr(block.title)} sub={block.sub ? tr(block.sub) : undefined}>
          <ol className="hx-steps">
            {block.items.map((s, i) => (
              <li key={i} className={s.tone ? `is-${s.tone}` : undefined}>
                <span className="hx-step-n">{i + 1}</span>
                <div>
                  <h3>
                    {tr(s.title)}
                    {s.tag && <small>{tr(s.tag)}</small>}
                  </h3>
                  <p>{tr(s.text)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      );
    case 'cards':
      return (
        <Panel title={tr(block.title)} sub={block.sub ? tr(block.sub) : undefined}>
          <div className="hx-cards">
            {block.items.map((c, i) => (
              <article key={i} className="hx-card">
                <header>
                  {c.tag && <span className={`hx-pill is-${c.tone ?? 'gray'}`}>{tr(c.tag)}</span>}
                  {c.meta && <small>{tr(c.meta)}</small>}
                </header>
                <h3>{tr(c.title)}</h3>
                <p>{tr(c.text)}</p>
              </article>
            ))}
          </div>
        </Panel>
      );
    case 'code':
      return (
        <Panel title={tr(block.title)} sub={block.sub ? tr(block.sub) : undefined}>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable block must be reachable by keyboard */}
          <pre className="hx-code" tabIndex={0}>
            <code>{block.code}</code>
          </pre>
        </Panel>
      );
    case 'note':
      return (
        <p className="hx-note" role="note">
          {tr(block.text)}
        </p>
      );
  }
}

/* ---------- screen ---------- */

export default function ModuleView({ id, area, go }: { id: string; area?: string; go: (section: string) => void }) {
  const t = useT();
  const tr = useTx();
  const def = MODULES[id];
  const tabs: Tab[] = def?.tabs ?? [];
  const current = tabs.find((tab) => tab.id === area) ?? tabs[0];
  if (!def || !current) return null;

  return (
    <div className="hx-module">
      <Tabs tabs={tabs.map((tab) => ({ id: tab.id, title: tr(tab.title) }))} value={current.id} onChange={(tab) => go(`${id}/${tab}`)} label={t(NAV[id].title)} />
      <div className="hx-blocks" key={current.id}>
        {current.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>
    </div>
  );
}
