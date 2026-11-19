import { Search } from 'lucide-react-dash';
import { useMemo, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard-ui/card';
import { Input } from '@/components/dashboard-ui/input';
import { Tabs as UiTabs, TabsList, TabsTrigger } from '@/components/dashboard-ui/tabs';
import { Button } from '@/components/dashboard-ui/button';

import { cn } from '@/lib/utils';

import { useLang, useT } from './i18n';
import { MODULES, type Block, type Cell, type CellValue, type Tab, type Txt } from './modulesData';
import { NAV } from './nav';
import { StatStrip, TAB_LIST, TAB_TRIGGER, ToneBadge } from './ui';

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
    <UiTabs value={value} onValueChange={onChange} aria-label={label} className="flex-col">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <TabsList className={TAB_LIST}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className={TAB_TRIGGER}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </UiTabs>
  );
}

/* ---------- blocks ---------- */

function Panel({ title, sub, children, flush }: { title?: string; sub?: string; children: React.ReactNode; flush?: boolean }) {
  return (
    <Card className={flush ? 'gap-0 overflow-hidden py-0' : undefined}>
      {(title || sub) && (
        <CardHeader className={flush ? 'grid-cols-1 py-5' : 'grid-cols-1'}>
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {sub && <CardDescription>{sub}</CardDescription>}
        </CardHeader>
      )}
      {flush ? children : <CardContent>{children}</CardContent>}
    </Card>
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
        <div className="flex flex-wrap items-center gap-2 px-6 pb-3">
          {block.searchable && (
            <div className="relative w-full sm:w-64">
              <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" aria-hidden="true" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search')} aria-label={t('Search')} className="pl-9" />
            </div>
          )}
          {options.length > 1 && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('Filter')}>
              <Button type="button" size="sm" variant={pick === null ? 'default' : 'outline'} aria-pressed={pick === null} onClick={() => setPick(null)}>
                {t('All')}
              </Button>
              {options.map((o) => (
                <Button key={o} type="button" size="sm" variant={pick === o ? 'default' : 'outline'} aria-pressed={pick === o} onClick={() => setPick(pick === o ? null : o)}>
                  {o}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      <ul className="hx-rows mx-5 mb-5 divide-y overflow-hidden rounded-[var(--hx-r-inner,10px)] border">
        {rows.map((row, ri) => {
          const cells = row.map((cell, ci) => ({ cell: isCell(cell) ? cell : ({ text: cell } as Cell), label: labels[ci] }));
          const [head, second, ...rest] = cells;
          const pills = rest.filter((c) => c.cell.pill);
          const plain = rest.filter((c) => !c.cell.pill);
          return (
            <li key={ri} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <span className="grid min-w-0 flex-1 basis-56 leading-snug">
                <span className={cn('truncate font-medium text-sm', head.cell.mono && 'font-mono text-[0.8125rem]')}>{tr(head.cell.text)}</span>
                {second && (second.cell.pill ? <span className="mt-1"><ToneBadge tone={second.cell.tone ?? 'gray'}>{tr(second.cell.text)}</ToneBadge></span> : <span className={cn('truncate text-muted-foreground text-xs', second.cell.mono && 'font-mono')}>{tr(second.cell.text)}</span>)}
              </span>
              <span className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1.5">
                {plain.map((c, i) => (
                  <span key={i} className="grid text-right leading-tight">
                    <span className="text-[0.6875rem] text-muted-foreground uppercase tracking-wide">{c.label}</span>
                    <span className={cn('text-sm tabular-nums', c.cell.mono && 'font-mono text-[0.8125rem]')}>{tr(c.cell.text)}</span>
                  </span>
                ))}
                {pills.map((c, i) => (
                  <ToneBadge key={i} tone={c.cell.tone ?? 'gray'}>
                    {tr(c.cell.text)}
                  </ToneBadge>
                ))}
              </span>
            </li>
          );
        })}
        {rows.length === 0 && <li className="px-4 py-8 text-center text-muted-foreground text-sm">{t('Nothing found.')}</li>}
      </ul>
    </Panel>
  );
}

function BlockView({ block }: { block: Block }) {
  const tr = useTx();
  switch (block.kind) {
    case 'kpis':
      return (
        <StatStrip
          items={block.items.map((k) => ({
            label: tr(k.label),
            value: tr(k.value),
            hot: k.hot,
            sub: k.delta || k.sub ? (
              <span className="flex flex-wrap items-center gap-1.5">
                {k.delta && <ToneBadge tone={k.up ? 'green' : 'red'}>{k.up ? '↗' : '↘'} {k.delta}</ToneBadge>}
                {k.sub && <span>{tr(k.sub)}</span>}
              </span>
            ) : undefined,
          }))}
        />
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
                  {c.tag && <ToneBadge tone={c.tone ?? 'gray'}>{tr(c.tag)}</ToneBadge>}
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
        <p className="rounded-xl border bg-muted/50 px-4 py-3 text-muted-foreground text-sm leading-relaxed" role="note">
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
    <div className="flex flex-col gap-4 md:gap-6">
      <Tabs tabs={tabs.map((tab) => ({ id: tab.id, title: tr(tab.title) }))} value={current.id} onChange={(tab) => go(`${id}/${tab}`)} label={t(NAV[id].title)} />
      <div className="flex animate-in flex-col gap-4 fade-in-0 md:gap-6" key={current.id}>
        {current.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>
    </div>
  );
}
