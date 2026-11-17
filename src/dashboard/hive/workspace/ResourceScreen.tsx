import { ChevronRight, Plus, Search } from 'lucide-react-dash';
import { useMemo, useState } from 'react';

import { Button } from '@/components/dashboard-ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard-ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/dashboard-ui/dialog';
import { Input } from '@/components/dashboard-ui/input';
import { Progress } from '@/components/dashboard-ui/progress';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/dashboard-ui/sheet';
import { Textarea } from '@/components/dashboard-ui/textarea';
import { cn } from '@/lib/utils';

import { useResource, type Row } from '../api/resource';
import { usePhone } from '../common';
import { useT } from '../i18n';
import { Tabs } from '../modules';
import { useHive } from '../store';
import { ToneBadge } from '../ui';
import { STATUS, type Action, type Column, type Screen, type View } from './types';

const humanize = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'number') return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (Array.isArray(v)) return v.join(', ');
  return String(v).replace(/_/g, ' ');
};

function Cell<T extends Row>({ col, row }: { col: Column<T>; row: T }) {
  if (col.render) return <>{col.render(row)}</>;
  const v = row[col.key];
  switch (col.kind) {
    case 'status': {
      const s = String(v ?? 'unknown');
      return <ToneBadge tone={col.tones?.[s] ?? STATUS[s] ?? 'gray'}>{humanize(s)}</ToneBadge>;
    }
    case 'strong':
      return <span className="font-medium text-foreground">{humanize(v)}</span>;
    case 'mono':
      return <span className="font-mono text-[0.8rem]">{v === undefined || v === null ? '—' : String(v)}</span>;
    case 'muted':
      return <span className="text-muted-foreground">{humanize(v)}</span>;
    case 'number':
      return (
        <span className="tabular-nums">
          {humanize(v)}
          {col.unit && v !== null && v !== undefined ? <span className="text-muted-foreground"> {col.unit}</span> : null}
        </span>
      );
    case 'progress': {
      const n = Math.max(0, Math.min(100, Number(v) || 0));
      return (
        <span className="flex min-w-28 items-center gap-2">
          <Progress value={n} className="h-1.5" />
          <span className="w-9 text-right text-muted-foreground text-xs tabular-nums">{n}%</span>
        </span>
      );
    }
    case 'tags':
      return (
        <span className="flex flex-wrap gap-1">
          {(Array.isArray(v) ? v : String(v ?? '').split(',').filter(Boolean)).map((tag) => (
            <ToneBadge key={String(tag)} tone="gray" className="h-5 px-2 text-[11px]">
              {String(tag).trim()}
            </ToneBadge>
          ))}
        </span>
      );
    default:
      return <>{humanize(v)}</>;
  }
}

function Kpis<T extends Row>({ view, rows }: { view: View<T>; rows: T[] }) {
  if (!view.kpis?.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
      {view.kpis.map((k) => {
        const hot = k.hot?.(rows);
        return (
          <Card key={k.label} className="gap-1.5 py-4">
            <CardHeader className="grid-cols-1 gap-1">
              <CardDescription>{k.label}</CardDescription>
              <CardTitle className={cn('font-semibold text-2xl tabular-nums md:text-3xl', hot && 'text-[var(--hd-orange,#ff4d00)]')}>{k.value(rows)}</CardTitle>
            </CardHeader>
            {k.sub && <CardContent className="text-muted-foreground text-xs">{typeof k.sub === 'function' ? k.sub(rows) : k.sub}</CardContent>}
          </Card>
        );
      })}
    </div>
  );
}

function Breakdown<T extends Row>({ view, rows }: { view: View<T>; rows: T[] }) {
  const b = view.breakdown;
  const data = useMemo(() => {
    if (!b) return [];
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = humanize(r[b.by]);
      m.set(k, (m.get(k) ?? 0) + (b.sum ? Number(r[b.sum]) || 0 : 1));
    }
    return [...m.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8);
  }, [b, rows]);
  if (!b || data.length < 2) return null;
  const max = Math.max(...data.map(([, v]) => v)) * 1.1;
  return (
    <Card>
      <CardHeader className="grid-cols-1">
        <CardTitle className="text-base">{b.title}</CardTitle>
        {b.sub && <CardDescription>{b.sub}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ul className="hx-bars">
          {data.map(([label, v], i) => (
            <li key={label} className={i === 0 ? 'is-hot' : undefined}>
              <span className="capitalize">{label}</span>
              <i aria-hidden="true">
                <b style={{ width: `${Math.max(3, (v / max) * 100)}%` }} />
              </i>
              <em>
                {v.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                {b.unit ? ` ${b.unit}` : ''}
              </em>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SourceBadge({ source, loading }: { source: 'live' | 'placeholder'; loading: boolean }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-muted-foreground text-xs" title={source === 'live' ? t('Read from the HIVE API') : t('Shown until the HIVE API is connected')}>
      <span className={cn('size-1.5 rounded-full', loading ? 'animate-pulse bg-muted-foreground' : source === 'live' ? 'bg-emerald-500' : 'bg-amber-500')} />
      {loading ? t('Loading') : source === 'live' ? t('Live') : t('Placeholder')}
    </span>
  );
}

function CreateDialog<T extends Row>({ view, onClose, onCreate }: { view: View<T>; onClose: () => void; onCreate: (row: T) => void }) {
  const t = useT();
  const c = view.create!;
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(c.fields.map((f) => [f.key, f.options?.[0] ?? ''])));
  const missing = c.fields.some((f) => f.required && !values[f.key]?.trim());
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{c.label}</DialogTitle>
          <DialogDescription>{view.resource.object.replace(/_/g, ' ')}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (missing) return;
            onCreate(c.make(values));
          }}
        >
          {c.fields.map((f) => (
            <label key={f.key} className="grid gap-1.5 text-sm">
              <span className="font-medium">
                {f.label}
                {f.required && <span className="text-muted-foreground"> *</span>}
              </span>
              {f.type === 'select' ? (
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  value={values[f.key]}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                >
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {humanize(o)}
                    </option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <Textarea value={values[f.key]} placeholder={f.placeholder} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
              ) : (
                <Input type={f.type === 'number' ? 'number' : 'text'} value={values[f.key]} placeholder={f.placeholder} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
              )}
            </label>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('Cancel')}
            </Button>
            <Button type="submit" disabled={missing}>
              {c.label}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DetailSheet<T extends Row>({ view, row, onClose, onAction }: { view: View<T>; row: T; onClose: () => void; onAction: (a: Action<T>) => void }) {
  const t = useT();
  const titleKey = view.titleKey ?? view.columns[0].key;
  const statusCol = view.columns.find((c) => c.kind === 'status' && c.key === view.statusKey) ?? view.columns.find((c) => c.kind === 'status');
  const fields = [...view.columns.filter((c) => c.key !== titleKey), ...(view.detail ?? [])];
  const actions = (view.actions ?? []).filter((a) => !a.when || a.when(row));
  const [confirming, setConfirming] = useState<Action<T> | null>(null);
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="gap-2 border-b pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {statusCol && <Cell col={statusCol} row={row} />}
            <span className="font-mono text-muted-foreground text-xs">{row.id}</span>
          </div>
          <SheetTitle className="text-xl leading-snug">{humanize(row[titleKey])}</SheetTitle>
          <SheetDescription>{view.title}</SheetDescription>
        </SheetHeader>
        <dl className="grid gap-0 px-4 py-2">
          {fields.map((f) => (
            <div key={f.key} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-3 border-b py-2.5 text-sm last:border-0">
              <dt className="text-muted-foreground">{f.label}</dt>
              <dd className="min-w-0 break-words">
                <Cell col={f as Column<T>} row={row} />
              </dd>
            </div>
          ))}
        </dl>
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t px-4 py-4">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <Button key={a.label} variant={a.danger ? 'destructive' : 'outline'} size="sm" onClick={() => (a.confirm ? setConfirming(a) : onAction(a))}>
                  {Icon && <Icon />}
                  {a.label}
                </Button>
              );
            })}
          </div>
        )}
        {confirming && (
          <div className="mx-4 mb-4 rounded-xl border bg-muted/40 p-4 text-sm" role="alertdialog" aria-label={confirming.label}>
            <p className="font-medium">{confirming.label}?</p>
            <p className="mt-1 text-muted-foreground">{confirming.confirm}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant={confirming.danger ? 'destructive' : 'default'} onClick={() => (onAction(confirming), setConfirming(null))}>
                {t('Confirm')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                {t('Cancel')}
              </Button>
            </div>
          </div>
        )}
        <p className="mt-auto border-t px-4 py-3 font-mono text-[11px] text-muted-foreground">
          {view.resource.list} · {view.resource.path}
        </p>
      </SheetContent>
    </Sheet>
  );
}

function ViewBody<T extends Row>({ view }: { view: View<T> }) {
  const t = useT();
  const phone = usePhone();
  const { notify } = useHive();
  const res = useResource(view.resource);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const statuses = useMemo(() => (view.statusKey ? [...new Set(res.rows.map((r) => String(r[view.statusKey!] ?? '')))].filter(Boolean) : []), [res.rows, view.statusKey]);
  const rows = res.rows.filter((r) => {
    if (status && String(r[view.statusKey!]) !== status) return false;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      return Object.values(r).some((v) => (Array.isArray(v) ? v.join(' ') : String(v ?? '')).toLowerCase().includes(needle));
    }
    return true;
  });
  const open = openId ? res.rows.find((r) => r.id === openId) : undefined;
  const phoneCols = view.columns.filter((c) => !c.wide).slice(0, 4);

  const run = (row: T, a: Action<T>) => {
    res.update(row.id, a.apply(row));
    notify(a.done);
  };

  return (
    <div className="flex animate-in flex-col gap-4 fade-in-0 md:gap-6">
      <Kpis view={view} rows={res.rows} />
      <Breakdown view={view} rows={res.rows} />
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 md:px-5">
          <div className="relative w-full sm:w-64">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" aria-hidden="true" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${t('Search')} ${view.title.toLowerCase()}`} aria-label={t('Search')} className="pl-9" />
          </div>
          {statuses.length > 1 && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('Filter')}>
              <Button type="button" size="sm" variant={status === null ? 'default' : 'outline'} aria-pressed={status === null} onClick={() => setStatus(null)}>
                {t('All')} <span className="tabular-nums opacity-60">{res.rows.length}</span>
              </Button>
              {statuses.map((s) => (
                <Button key={s} type="button" size="sm" variant={status === s ? 'default' : 'outline'} aria-pressed={status === s} onClick={() => setStatus(status === s ? null : s)} className="capitalize">
                  {humanize(s)} <span className="tabular-nums opacity-60">{res.rows.filter((r) => String(r[view.statusKey!]) === s).length}</span>
                </Button>
              ))}
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <SourceBadge source={res.source} loading={res.loading} />
            {view.create && (
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus />
                {view.create.label}
              </Button>
            )}
          </div>
        </div>
        {view.note && <p className="border-b bg-muted/30 px-4 py-2.5 text-muted-foreground text-xs md:px-5">{view.note}</p>}
        {phone ? (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id}>
                <button type="button" className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-muted/60" onClick={() => setOpenId(r.id)}>
                  <span className="grid min-w-0 flex-1 gap-1 text-sm">
                    <span className="truncate font-medium">
                      <Cell col={{ ...phoneCols[0], kind: phoneCols[0].kind === 'mono' ? 'mono' : 'strong' }} row={r} />
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
                      {phoneCols.slice(1).map((c) => (
                        <span key={c.key}>
                          <Cell col={c} row={r} />
                        </span>
                      ))}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="hx-tablewrap">
            <table className="hx-table">
              <thead>
                <tr>
                  {view.columns.map((c) => (
                    <th key={c.key} scope="col" className={c.align === 'end' ? 'is-end' : undefined}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => setOpenId(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setOpenId(r.id);
                    }}
                  >
                    {view.columns.map((c) => (
                      <td key={c.key} data-label={c.label} className={cn(c.align === 'end' && 'is-end', c.kind === 'mono' && 'is-mono')}>
                        <Cell col={c} row={r} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows.length === 0 && <p className="px-5 py-10 text-center text-muted-foreground text-sm">{t('Nothing found.')}</p>}
      </Card>
      {open && <DetailSheet view={view} row={open} onClose={() => setOpenId(null)} onAction={(a) => run(open, a)} />}
      {creating && (
        <CreateDialog
          view={view}
          onClose={() => setCreating(false)}
          onCreate={(row) => {
            res.add(row);
            setCreating(false);
            notify(view.create!.done);
          }}
        />
      )}
    </div>
  );
}

export default function ResourceScreen({ screen, area, go }: { screen: Screen; area?: string; go: (s: string) => void }) {
  const current = screen.views.find((v) => v.id === area) ?? screen.views[0];
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {screen.views.length > 1 && <Tabs tabs={screen.views.map((v) => ({ id: v.id, title: v.title }))} value={current.id} onChange={(id) => go(`${screen.id}/${id}`)} label={screen.title} />}
      <ViewBody key={`${screen.id}/${current.id}`} view={current} />
    </div>
  );
}
