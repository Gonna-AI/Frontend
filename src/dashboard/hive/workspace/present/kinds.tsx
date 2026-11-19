import { ArrowDown, ArrowRight, ChevronRight } from 'lucide-react-dash';
import { useMemo, useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/dashboard-ui/collapsible';
import { cn } from '@/lib/utils';

import type { Row } from '../../api/resource';
import { ToneBadge, type BadgeTone } from '../../ui';
import { Cell, humanize } from '../cells';
import { STATUS, type Column, type View } from '../types';
import type { Board, Cards, Grouped, Meters, People, Rules, Shifts, Tiles, Timeline } from './types';

export interface KindProps<P> {
  view: View<Row>;
  rows: Row[];
  p: P;
  open: (id: string) => void;
  /** A search is active: groups open so the matches are visible. */
  searching?: boolean;
}

/* ---------- helpers ---------- */

const colOf = (view: View<Row>, key: string): Column<Row> => view.columns.find((c) => c.key === key) ?? { key, label: key.replace(/_/g, ' ') };
const labelOf = (view: View<Row>, key: string) => colOf(view, key).label;
const titleKeyOf = (view: View<Row>) => view.titleKey ?? view.columns.find((c) => c.kind === 'strong')?.key ?? view.columns.find((c) => c.kind === 'mono')?.key ?? view.columns[0].key;
const statusKeys = (view: View<Row>) => view.columns.filter((c) => c.kind === 'status').map((c) => c.key);
const toneOf = (v: unknown, view?: View<Row>, key?: string): BadgeTone => {
  const s = String(v ?? '');
  return (view && key ? colOf(view, key).tones?.[s] : undefined) ?? STATUS[s] ?? 'gray';
};
const DOT: Record<BadgeTone, string> = { green: 'bg-emerald-500', red: 'bg-destructive', amber: 'bg-amber-500', orange: 'bg-[var(--hd-orange,#ff4d00)]', gray: 'bg-muted-foreground/50', black: 'bg-foreground' };
const num = (v: unknown) => {
  const n = parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};
const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

const cardBase = 'group/rec w-full rounded-[var(--hx-r-card,14px)] border bg-card text-left outline-none transition-colors hover:border-foreground/25 focus-visible:ring-[3px] focus-visible:ring-ring/50';

function Pair({ view, row, k }: { view: View<Row>; row: Row; k: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{labelOf(view, k)}</dt>
      <dd className="truncate text-sm">
        <Cell col={{ ...colOf(view, k), kind: colOf(view, k).kind === 'progress' ? 'number' : colOf(view, k).kind === 'strong' ? undefined : colOf(view, k).kind }} row={row} />
      </dd>
    </div>
  );
}

/* ---------- cards ---------- */

export function RecordCards({ view, rows, p, open }: KindProps<Cards>) {
  const tk = titleKeyOf(view);
  const sk = statusKeys(view);
  const idCol = view.columns.find((c) => c.kind === 'mono' && c.key !== tk);
  const sub = p.sub ?? view.columns.find((c) => !c.kind && c.key !== tk && !c.wide)?.key ?? view.columns.find((c) => !c.kind && c.key !== tk)?.key;
  const pct = view.columns.find((c) => c.kind === 'progress');
  const tags = view.columns.find((c) => c.kind === 'tags');
  const used = new Set([tk, sub, p.foot, idCol?.key, pct?.key, tags?.key, ...sk]);
  const meta = (p.meta ?? view.columns.filter((c) => !used.has(c.key)).map((c) => c.key)).filter((k) => !used.has(k)).slice(0, 4);
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => (
        <li key={r.id} className="min-w-0">
          <button type="button" onClick={() => open(r.id)} className={cn(cardBase, 'flex h-full flex-col gap-3 p-4')}>
            <span className="flex min-h-6 flex-wrap items-center gap-1.5">
              {sk.map((k) => (
                <Cell key={k} col={colOf(view, k)} row={r} />
              ))}
              {idCol && <span className="ml-auto truncate font-mono text-[0.75rem] text-muted-foreground">{humanize(r[idCol.key])}</span>}
            </span>
            <span className="grid gap-0.5">
              <span className="line-clamp-2 font-medium text-[0.9375rem] leading-snug">{humanize(r[tk])}</span>
              {sub && r[sub] !== undefined && <span className="truncate text-muted-foreground text-sm">{humanize(r[sub])}</span>}
            </span>
            {pct && (
              <span className="grid gap-1">
                <span className="text-muted-foreground text-xs">{pct.label}</span>
                <Cell col={pct} row={r} />
              </span>
            )}
            {tags && <Cell col={tags} row={r} />}
            {meta.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {meta.map((k) => (
                  <Pair key={k} view={view} row={r} k={k} />
                ))}
              </dl>
            )}
            {p.foot && (
              <span className="mt-auto flex items-center justify-between gap-3 border-t pt-3 text-sm">
                <span className="text-muted-foreground">{p.footLabel ?? labelOf(view, p.foot)}</span>
                <span className="font-medium">{humanize(r[p.foot])}</span>
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------- board ---------- */

const LANE_ORDER = ['open', 'pending', 'awaiting_approval', 'waiting', 'queued', 'proposed', 'investigating', 'in_progress', 'running', 'review', 'in_review', 'mitigated', 'accepted', 'approved', 'completed', 'resolved', 'done', 'closed', 'rejected', 'failed'];

export function RecordBoard({ view, rows, p, open }: KindProps<Board>) {
  const sk = view.statusKey ?? statusKeys(view)[0];
  const tk = titleKeyOf(view);
  const lanes = useMemo(() => {
    const seen = [...new Set(rows.map((r) => String(r[sk] ?? '')))];
    const rank = (s: string) => {
      const i = (p.lanes ?? LANE_ORDER).indexOf(s);
      return i < 0 ? 999 : i;
    };
    return seen.sort((a, b) => rank(a) - rank(b));
  }, [rows, sk, p.lanes]);
  const wide = lanes.length > 4;
  return (
    <div
      className={cn('-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0', wide ? '' : 'lg:grid lg:snap-none lg:overflow-visible lg:[grid-template-columns:repeat(var(--lanes),minmax(0,1fr))]')}
      style={{ ['--lanes' as string]: lanes.length }}
    >
      {lanes.map((lane) => {
        const items = rows.filter((r) => String(r[sk] ?? '') === lane);
        return (
          <section key={lane} aria-label={humanize(lane)} className={cn('flex w-[84%] shrink-0 snap-start flex-col gap-2 rounded-[var(--hx-r-card,14px)] border bg-muted/40 p-2 sm:w-72', !wide && 'lg:w-auto')}>
            <header className="flex items-center justify-between gap-2 px-1.5 pt-1">
              <ToneBadge tone={toneOf(lane, view, sk)} className="capitalize">
                {humanize(lane)}
              </ToneBadge>
              <span className="text-muted-foreground text-xs tabular-nums">{items.length}</span>
            </header>
            <ul className="grid gap-2">
              {items.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => open(r.id)} className={cn(cardBase, 'grid gap-2 rounded-[var(--hx-r-inner,10px)] p-3 shadow-xs')}>
                    <span className="line-clamp-2 font-medium text-sm leading-snug">{humanize(r[tk])}</span>
                    {p.sub && r[p.sub] !== undefined && <span className="truncate text-muted-foreground text-xs">{humanize(r[p.sub])}</span>}
                    {(p.badge || (p.meta?.length ?? 0) > 0) && (
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-0.5">
                        {p.badge && <Cell col={{ ...colOf(view, p.badge), kind: 'status' }} row={r} />}
                        {p.meta?.map((k) => (
                          <span key={k} className="text-muted-foreground text-xs">
                            <span className="opacity-70">{labelOf(view, k)} </span>
                            <span className="text-foreground">
                              <Cell col={{ ...colOf(view, k), kind: colOf(view, k).kind === 'progress' ? 'number' : colOf(view, k).kind === 'strong' ? undefined : colOf(view, k).kind }} row={r} />
                            </span>
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {items.length === 0 && <li className="px-2 py-4 text-center text-muted-foreground text-xs">—</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* ---------- timeline ---------- */

export function RecordTimeline({ view, rows, p, open }: KindProps<Timeline>) {
  const tk = view.columns.some((c) => c.key === titleKeyOf(view) && c.key !== p.time) ? titleKeyOf(view) : (p.detail?.[0] ?? view.columns[0].key);
  const detail = (p.detail ?? []).filter((k) => k !== tk);
  const bk = p.badge;
  return (
    <ol className="relative ml-2 grid gap-1 border-l pl-0">
      {rows.map((r) => (
        <li key={r.id} className="relative min-w-0 pl-6">
          <span aria-hidden="true" className={cn('absolute top-5 -left-[5.5px] size-2.5 rounded-full ring-4 ring-background', DOT[bk ? toneOf(r[bk], view, bk) : 'gray'])} />
          <button type="button" onClick={() => open(r.id)} className="grid w-full min-w-0 gap-1 rounded-[var(--hx-r-inner,10px)] px-3 py-2.5 text-left outline-none transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
              <time className="font-mono">{humanize(r[p.time])}</time>
              {p.tag && r[p.tag] !== undefined && <span className="max-w-full truncate rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.6875rem]">{humanize(r[p.tag])}</span>}
              {bk && <Cell col={{ ...colOf(view, bk), kind: 'status' }} row={r} />}
            </span>
            <span className="font-medium text-[0.9375rem] leading-snug">{humanize(r[tk])}</span>
            {detail.length > 0 && (
              <span className="flex flex-wrap gap-x-3 text-muted-foreground text-sm">
                {detail.map((k) => (
                  <span key={k} className="min-w-0">
                    {humanize(r[k])}
                  </span>
                ))}
              </span>
            )}
          </button>
        </li>
      ))}
    </ol>
  );
}

/* ---------- tiles ---------- */

export function RecordTiles({ view, rows, p, open }: KindProps<Tiles>) {
  const tk = titleKeyOf(view);
  const valueCol = colOf(view, p.value);
  const asWord = valueCol.kind === 'status';
  return (
    <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rows.map((r) => {
        const v = num(r[p.value]);
        const lim = p.limit ? num(r[p.limit]) : null;
        const minLimit = p.limit ? /min/i.test(String(r[p.limit])) : false;
        const ratio = v !== null && lim && !minLimit ? v / lim : null;
        const tone = asWord ? toneOf(r[p.value], view, p.value) : 'gray';
        const pct = p.pct ? Math.max(0, Math.min(100, num(r[p.pct]) ?? 0)) : null;
        return (
          <li key={r.id} className="min-w-0">
            <button type="button" onClick={() => open(r.id)} className={cn(cardBase, 'flex h-full flex-col gap-3 p-4')}>
              <span className="flex items-start justify-between gap-2">
                <span className="line-clamp-2 min-w-0 font-medium text-sm leading-snug">{humanize(r[tk])}</span>
                {p.badge && p.badge !== p.value && <Cell col={{ ...colOf(view, p.badge), kind: 'status' }} row={r} />}
              </span>
              <span className="flex items-baseline gap-1.5">
                {asWord ? (
                  <span className="inline-flex items-center gap-2 font-semibold text-xl capitalize leading-none">
                    <span className={cn('size-2.5 rounded-full', DOT[tone])} aria-hidden="true" />
                    {humanize(r[p.value])}
                  </span>
                ) : (
                  <span className="font-semibold text-3xl tabular-nums leading-none tracking-tight">{v !== null ? fmt(v) : humanize(r[p.value])}</span>
                )}
                {!asWord && p.unit && <span className="text-muted-foreground text-sm">{p.unit.startsWith('%') ? p.unit : String(r[p.unit] ?? p.unit)}</span>}
              </span>
              {ratio !== null && (
                <span className="grid gap-1">
                  <i className="block h-1.5 overflow-hidden rounded-full bg-muted">
                    <b className={cn('block h-full rounded-full', ratio >= 1 ? 'bg-destructive' : ratio >= 0.9 ? 'bg-amber-500' : 'bg-foreground/70')} style={{ width: `${Math.min(100, Math.max(3, ratio * 100))}%` }} />
                  </i>
                  <span className="text-muted-foreground text-xs">
                    {labelOf(view, p.limit!)} {humanize(r[p.limit!])}
                  </span>
                </span>
              )}
              {p.limit && ratio === null && Boolean(r[p.limit]) && r[p.limit] !== '—' && (
                <span className="text-muted-foreground text-xs">
                  {labelOf(view, p.limit)} {humanize(r[p.limit])}
                </span>
              )}
              {pct !== null && (
                <span className="grid gap-1">
                  <i className="block h-1.5 overflow-hidden rounded-full bg-muted">
                    <b className="block h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </i>
                  <span className="text-muted-foreground text-xs">
                    {p.pctLabel ?? labelOf(view, p.pct!)} · {pct}%
                  </span>
                </span>
              )}
              {p.foot && p.foot.length > 0 && (
                <span className="mt-auto flex flex-wrap gap-x-3 gap-y-0.5 border-t pt-3 text-muted-foreground text-xs">
                  {p.foot.map((k) => (
                    <span key={k} className="min-w-0 truncate">
                      {humanize(r[k])}
                    </span>
                  ))}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- meters ---------- */

export function RecordMeters({ view, rows, p, open }: KindProps<Meters>) {
  const lk = p.label ?? titleKeyOf(view);
  const maxAll = Math.max(...rows.map((r) => num(r[p.value]) ?? 0), 1) * 1.05;
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {rows.map((r, i) => {
        const v = num(r[p.value]) ?? 0;
        const mx = p.max ? num(r[p.max]) : null;
        const pct = p.pct ? num(r[p.pct]) : null;
        const ratio = pct !== null ? pct / 100 : mx ? v / mx : v / maxAll;
        const bounded = pct !== null || Boolean(mx);
        const bar = bounded ? (ratio >= 1 ? 'bg-destructive' : ratio >= 0.8 ? 'bg-amber-500' : 'bg-foreground/75') : i === 0 ? 'bg-[var(--hd-orange,#ff4d00)]' : 'bg-foreground/75';
        return (
          <li key={r.id} className="min-w-0">
            <button type="button" onClick={() => open(r.id)} className={cn(cardBase, 'grid gap-3 p-4')}>
              <span className="flex items-start justify-between gap-3">
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate font-medium text-[0.9375rem]">{humanize(r[lk])}</span>
                  {p.sub && <span className="truncate text-muted-foreground text-sm">{humanize(r[p.sub])}</span>}
                </span>
                {p.badge && <Cell col={{ ...colOf(view, p.badge), kind: 'status' }} row={r} />}
              </span>
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-2xl tabular-nums tracking-tight">
                  {fmt(v)}
                  {mx !== null && <span className="font-normal text-base text-muted-foreground"> / {fmt(mx)}</span>}
                  {p.unit && <span className="ml-1.5 font-normal text-muted-foreground text-sm">{r[p.unit] !== undefined ? String(r[p.unit]) : p.unit}</span>}
                </span>
                {bounded && <span className="text-muted-foreground text-sm tabular-nums">{Math.round(ratio * 100)}%</span>}
              </span>
              <i className="block h-2 overflow-hidden rounded-full bg-muted">
                <b className={cn('block h-full rounded-full', bar)} style={{ width: `${Math.min(100, Math.max(2, ratio * 100))}%` }} />
              </i>
              {p.foot && p.foot.length > 0 && (
                <span className="flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground text-xs">
                  {p.foot.map((k) => (
                    <span key={k}>
                      <span className="opacity-70">{labelOf(view, k)} </span>
                      {humanize(r[k])}
                    </span>
                  ))}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- rules: when this, then that ---------- */

export function RecordRules({ view, rows, p, open }: KindProps<Rules>) {
  const tk = titleKeyOf(view);
  const box = (k: string, label: string, r: Row) => (
    <span className="grid min-w-0 gap-1 rounded-[var(--hx-r-inner,10px)] border bg-muted/40 px-3 py-2.5">
      <span className="font-medium text-[0.6875rem] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="min-w-0 break-words text-sm leading-snug">
        <Cell col={{ ...colOf(view, k), kind: colOf(view, k).kind === 'strong' ? undefined : colOf(view, k).kind === 'progress' ? 'number' : colOf(view, k).kind }} row={r} />
      </span>
    </span>
  );
  return (
    <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      {rows.map((r) => {
        const sk = (p.meta ?? []).filter((k) => colOf(view, k).kind === 'status');
        const plain = (p.meta ?? []).filter((k) => colOf(view, k).kind !== 'status');
        return (
          <li key={r.id} className="min-w-0">
            <button type="button" onClick={() => open(r.id)} className={cn(cardBase, 'grid gap-3 p-4')}>
              <span className="flex items-start justify-between gap-3">
                <span className="line-clamp-2 font-medium text-[0.9375rem] leading-snug">{humanize(r[tk])}</span>
                <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
                  {sk.map((k) => (
                    <Cell key={k} col={colOf(view, k)} row={r} />
                  ))}
                </span>
              </span>
              <span className="grid items-stretch gap-1.5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-2">
                {box(p.when, p.whenLabel ?? labelOf(view, p.when), r)}
                <span className="grid place-items-center text-muted-foreground" aria-hidden="true">
                  <ArrowDown className="size-4 md:hidden" />
                  <ArrowRight className="hidden size-4 md:block" />
                </span>
                {box(p.then, p.thenLabel ?? labelOf(view, p.then), r)}
              </span>
              {plain.length > 0 && (
                <dl className="flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground text-xs">
                  {plain.map((k) => (
                    <div key={k} className="flex gap-1.5">
                      <dt className="opacity-70">{labelOf(view, k)}</dt>
                      <dd className="text-foreground">
                        <Cell col={{ ...colOf(view, k), kind: colOf(view, k).kind === 'progress' ? 'number' : colOf(view, k).kind }} row={r} />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- people ---------- */

export function RecordPeople({ view, rows, p, open }: KindProps<People>) {
  const groups = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of rows) m.set(String(r[p.who]), [...(m.get(String(r[p.who])) ?? []), r]);
    return [...m.entries()];
  }, [rows, p.who]);
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {groups.map(([who, items]) => (
        <li key={who} className="min-w-0 rounded-[var(--hx-r-card,14px)] border bg-card p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[var(--hx-r-inner,10px)] border bg-muted font-semibold text-sm">{initials(who)}</span>
            <span className="grid min-w-0 leading-tight">
              <span className="truncate font-medium text-[0.9375rem]">{who}</span>
              <span className="text-muted-foreground text-xs">
                {items.length} {labelOf(view, p.items[0]).toLowerCase()}
              </span>
            </span>
          </div>
          <ul className="grid gap-1">
            {items.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => open(r.id)} className="flex w-full items-center justify-between gap-3 rounded-[var(--hx-r-inner,10px)] px-2.5 py-2 text-left text-sm outline-none transition-colors hover:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <span className="grid min-w-0">
                    <span className="truncate">{humanize(r[p.items[0]])}</span>
                    {p.items[1] && (
                      <span className="text-muted-foreground text-xs">
                        {labelOf(view, p.items[1])} {humanize(r[p.items[1]])}
                      </span>
                    )}
                  </span>
                  {p.badge && <Cell col={{ ...colOf(view, p.badge), kind: 'status' }} row={r} />}
                </button>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/* ---------- shifts across a day ---------- */

function span(hours: string): [number, number] | null {
  const m = /(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/.exec(hours);
  if (!m) return null;
  return [Number(m[1]) + Number(m[2]) / 60, Number(m[3]) + Number(m[4]) / 60];
}

export function RecordShifts({ view, rows, p, open }: KindProps<Shifts>) {
  const tk = titleKeyOf(view);
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => {
        const s = span(String(r[p.hours]));
        const segs: [number, number][] = s ? (s[1] > s[0] ? [[s[0], s[1]]] : [[s[0], 24], [0, s[1]]]) : [];
        return (
          <li key={r.id} className="min-w-0">
            <button type="button" onClick={() => open(r.id)} className={cn(cardBase, 'grid gap-4 p-4')}>
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-[0.9375rem]">{humanize(r[tk])}</span>
                <span className="font-mono text-muted-foreground text-sm">{humanize(r[p.hours])}</span>
              </span>
              <span className="grid gap-1.5" aria-hidden="true">
                <span className="relative block h-3 overflow-hidden rounded-full bg-muted">
                  {segs.map(([a, b]) => (
                    <b key={a} className="absolute inset-y-0 rounded-full bg-foreground/80" style={{ left: `${(a / 24) * 100}%`, width: `${((b - a) / 24) * 100}%` }} />
                  ))}
                </span>
                <span className="flex justify-between text-[0.6875rem] text-muted-foreground tabular-nums">
                  {['00', '06', '12', '18', '24'].map((h) => (
                    <span key={h}>{h}</span>
                  ))}
                </span>
              </span>
              {p.meta && (
                <dl className="grid grid-cols-3 gap-3">
                  {p.meta.map((k) => (
                    <Pair key={k} view={view} row={r} k={k} />
                  ))}
                </dl>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- API reference: grouped ---------- */

const METHOD: Record<string, BadgeTone> = { GET: 'green', POST: 'orange', PATCH: 'amber', PUT: 'amber', DELETE: 'red' };

export function RecordGrouped({ rows, p, open, searching }: KindProps<Grouped>) {
  const groups = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of rows) m.set(String(r[p.by] ?? ''), [...(m.get(String(r[p.by] ?? '')) ?? []), r]);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows, p.by]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  return (
    <div className="grid gap-2">
      {groups.map(([name, items]) => {
        const isOpen = searching || groups.length <= 2 || openGroups[name];
        return (
          <Collapsible key={name} open={isOpen} onOpenChange={(v) => setOpenGroups((o) => ({ ...o, [name]: v }))} className="overflow-hidden rounded-[var(--hx-r-card,14px)] border bg-card">
            <CollapsibleTrigger asChild>
              <button type="button" className="flex w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <ChevronRight className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-90')} />
                <span className="flex-1 font-medium text-[0.9375rem] capitalize">{name || '—'}</span>
                <span className="text-muted-foreground text-xs tabular-nums">{items.length}</span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="divide-y border-t">
                {items.map((r) => (
                  <li key={r.id}>
                    <button type="button" onClick={() => open(r.id)} className="grid w-full gap-1 px-4 py-2.5 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 md:grid-cols-[4.5rem_minmax(0,1.2fr)_minmax(0,1.6fr)] md:items-center md:gap-4">
                      {p.badge ? <ToneBadge tone={METHOD[String(r[p.badge])] ?? 'gray'} className="w-fit font-mono text-[0.6875rem]">{humanize(r[p.badge])}</ToneBadge> : <span />}
                      <span className="break-all font-mono text-[0.8rem]">{humanize(r[p.head])}</span>
                      <span className="text-muted-foreground text-sm">{p.sub ? humanize(r[p.sub]) : ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
