/**
 * Home: what is wrong, what is waiting for me, how the plant is doing, in that order (APP-HOME).
 * Each question is one card, and every row in it opens the screen that answers it.
 */
import { ArrowRight, ChevronRight } from 'lucide-react-dash';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Button } from '@/components/dashboard-ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard-ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/dashboard-ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/dashboard-ui/tabs';

import { formatDuration, useT } from './i18n';
import { useAttention } from './OverviewView';
import { MACHINE_STATES, STATE_LABEL, type MachineState } from './placeholder';
import { useHive } from './store';
import { PILL_LIST, PILL_TRIGGER, StatStrip, ToneBadge, type BadgeTone } from './ui';

const STATE_TONE: Record<MachineState, BadgeTone> = { producing: 'green', idle: 'amber', setup: 'orange', planned_stop: 'gray', unplanned_stop: 'red', fault: 'red', off: 'gray', unknown: 'gray' };
const STATE_BAR: Record<MachineState, string> = { producing: 'bg-emerald-500', idle: 'bg-amber-400', setup: 'bg-[var(--hd-orange,#ff4d00)]', planned_stop: 'bg-muted-foreground/40', unplanned_stop: 'bg-destructive', fault: 'bg-destructive', off: 'bg-muted-foreground/25', unknown: 'bg-muted-foreground/15' };
const DOT: Record<BadgeTone, string> = { green: 'bg-emerald-500', red: 'bg-destructive', amber: 'bg-amber-500', orange: 'bg-[var(--hd-orange,#ff4d00)]', gray: 'bg-muted-foreground/50', black: 'bg-foreground' };

/** A card that answers one question, with a link to the full list. */
function Panel({ title, sub, action, onAction, children }: { title: string; sub?: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="grid-cols-1 gap-0.5 border-b px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          {action && (
            <Button variant="ghost" size="sm" className="-mr-2 gap-1 text-muted-foreground" onClick={onAction}>
              {action}
              <ArrowRight />
            </Button>
          )}
        </div>
        {sub && <CardDescription>{sub}</CardDescription>}
      </CardHeader>
      {children}
    </Card>
  );
}

function Row({ onClick, lead, title, sub, trail }: { onClick: () => void; lead?: React.ReactNode; title: React.ReactNode; sub?: React.ReactNode; trail?: React.ReactNode }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex w-full items-center gap-3 px-5 py-3 text-left outline-none transition-colors hover:bg-accent/50 focus-visible:bg-accent/50">
        {lead}
        <span className="grid min-w-0 flex-1 leading-snug">
          <span className="truncate font-medium text-sm">{title}</span>
          {sub && <span className="truncate text-muted-foreground text-xs">{sub}</span>}
        </span>
        {trail}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
      </button>
    </li>
  );
}

export default function HomeView({ go }: { go: (section: string) => void }) {
  const t = useT();
  const { data } = useHive();
  const { attention, waiting } = useAttention(go);
  const [range, setRange] = useState<'8' | '4'>('8');

  const critical = attention.filter((a) => a.tone === 'red').length;
  const openAlarms = data.alarms.filter((a) => a.state === 'Open').length;
  const online = data.machines.filter((m) => m.state !== 'unknown' && m.state !== 'off').length;
  const pending = data.approvals.filter((a) => a.state === 'Pending');
  const volume = useMemo(() => data.alarmVolume.slice(range === '4' ? -4 : 0), [data.alarmVolume, range]);
  const counts = MACHINE_STATES.map((s) => [s, data.machines.filter((m) => m.state === s).length] as const).filter(([, n]) => n > 0);
  const watch = data.machines.filter((m) => m.state === 'fault' || m.state === 'unplanned_stop' || m.openAlarms > 0);
  const chartConfig = { raised: { label: t('Raised'), color: 'var(--hd-orange)' }, resolved: { label: t('Resolved'), color: 'var(--muted-foreground)' } } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <StatStrip
        items={[
          { label: t('Plant availability'), value: <>{data.plant.availability.replace('%', '')}<span className="font-normal text-base text-muted-foreground"> %</span></>, sub: `${data.plant.deltaUp ? '↗' : '↘'} ${data.plant.delta} ${t('than last week')}` },
          { label: t('Open alarms'), value: String(openAlarms), hot: critical > 0, sub: critical ? `${critical} ${t('critical')}` : t('Nothing critical') },
          { label: t('Machines online'), value: <>{online}<span className="font-normal text-base text-muted-foreground"> / {data.machines.length}</span></>, sub: `${data.sites.length} ${t('Sites').toLowerCase()}` },
          { label: t('Waiting for me'), value: String(waiting), sub: t('Approvals and findings') },
        ]}
      />

      <div className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel title={t('Needs attention')} sub={t('Ordered by priority. Critical first.')} action={t('All alarms')} onAction={() => go('alarms')}>
          <ul className="divide-y">
            {attention.slice(0, 5).map((a) => (
              <Row
                key={a.key}
                onClick={a.open}
                lead={<span className={`size-2.5 shrink-0 rounded-full ${DOT[a.tone === 'red' ? 'red' : a.tone === 'orange' ? 'orange' : a.tone === 'amber' ? 'amber' : 'gray']}`} aria-hidden="true" />}
                title={a.title}
                sub={a.where}
                trail={<ToneBadge tone={a.tone === 'red' ? 'red' : a.tone === 'orange' ? 'orange' : a.tone === 'amber' ? 'amber' : 'gray'}>{t(a.label)}</ToneBadge>}
              />
            ))}
            {attention.length === 0 && <li className="px-5 py-10 text-center text-muted-foreground text-sm">{t('Nothing needs attention. Last checked just now.')}</li>}
          </ul>
          <p className="border-t px-5 py-3 text-muted-foreground text-xs">{t('Alarms shown here are not a replacement for the plant’s safety systems.')}</p>
        </Panel>

        <Panel title={t('Waiting for me')} sub={t('Decisions only a person can make')} action={t('Inbox')} onAction={() => go('inbox')}>
          <ul className="divide-y">
            {pending.slice(0, 4).map((a) => (
              <Row key={a.id} onClick={() => go('inbox')} title={a.title} sub={a.machine} trail={<ToneBadge>{a.tier}</ToneBadge>} />
            ))}
            {pending.length === 0 && <li className="px-5 py-10 text-center text-muted-foreground text-sm">{t('Nothing waiting for you.')}</li>}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <Panel title={t('Plant now')} sub={t('Machine states')} action={t('All machines')} onAction={() => go('machines')}>
          <CardContent className="grid gap-4 py-5">
            <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={counts.map(([s, n]) => `${t(STATE_LABEL[s])} ${n}`).join(', ')}>
              {counts.map(([s, n]) => (
                <span key={s} className={`${STATE_BAR[s]} first:rounded-l-full last:rounded-r-full`} style={{ flex: n }} />
              ))}
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {counts.map(([s, n]) => (
                <li key={s} className="flex items-center gap-2">
                  <span className={`size-2.5 shrink-0 rounded-full ${STATE_BAR[s]}`} aria-hidden="true" />
                  <span className="flex-1 truncate text-muted-foreground">{t(STATE_LABEL[s])}</span>
                  <b className="font-medium tabular-nums">{n}</b>
                </li>
              ))}
            </ul>
          </CardContent>
          {watch.length > 0 && (
            <ul className="divide-y border-t">
              {watch.slice(0, 3).map((m) => (
                <Row key={m.id} onClick={() => go(`machines/${m.id}`)} title={m.key} sub={`${m.type} · ${m.site}`} trail={<ToneBadge tone={STATE_TONE[m.state]}>{t(STATE_LABEL[m.state])} · {formatDuration(m.stateAgeS)}</ToneBadge>} />
              ))}
            </ul>
          )}
        </Panel>

        <Card className="@container/card">
          <CardHeader>
            <CardTitle className="text-base">{t('Alarm volume')}</CardTitle>
            <CardDescription>{t('Alarms raised and resolved per week')}</CardDescription>
            <CardAction>
              <Tabs value={range} onValueChange={(v) => setRange(v as '8' | '4')} aria-label={t('Time range')}>
                <TabsList className={PILL_LIST}>
                  <TabsTrigger value="8" className={PILL_TRIGGER}>{t('8 weeks')}</TabsTrigger>
                  <TabsTrigger value="4" className={PILL_TRIGGER}>{t('4 weeks')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
              <AreaChart data={volume} margin={{ left: 4, right: 4 }}>
                <defs>
                  <linearGradient id="hv-raised" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-raised)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-raised)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="hv-resolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-resolved)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-resolved)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area dataKey="resolved" type="natural" fill="url(#hv-resolved)" stroke="var(--color-resolved)" strokeWidth={1.5} />
                <Area dataKey="raised" type="natural" fill="url(#hv-raised)" stroke="var(--color-raised)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Panel title={t('Connections')} sub={t('Gateways and the edge buffer')} action={t('Manage')} onAction={() => go('gateways')}>
        <ul className="grid divide-y md:grid-cols-2 md:divide-y-0 md:[&>li]:border-b md:[&>li:nth-child(odd)]:border-r md:[&>li:nth-last-child(-n+2)]:border-b-0">
          {data.gatewayFleet.map((g) => (
            <Row key={g.id} onClick={() => go('gateways')} lead={<span className={`size-2.5 shrink-0 rounded-full ${g.link === 'Online' ? 'bg-emerald-500' : g.link === 'Buffering' ? 'bg-amber-500' : 'bg-destructive'}`} aria-hidden="true" />} title={g.site} sub={`${g.version} · ${g.uptime} · ${g.drivers}`} trail={<ToneBadge tone={g.link === 'Online' ? 'green' : g.link === 'Buffering' ? 'amber' : 'red'}>{t(g.link)}</ToneBadge>} />
          ))}
        </ul>
      </Panel>
    </div>
  );
}
