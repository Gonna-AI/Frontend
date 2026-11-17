/**
 * Home, laid out like shadcn's dashboard-01: four figures, one chart, one tabbed table.
 * It answers the questions in the order the specification gives (APP-HOME): what is wrong,
 * what is waiting for me, how is the plant doing.
 */
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-dash';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Badge } from '@/components/dashboard-ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard-ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/dashboard-ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/dashboard-ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/dashboard-ui/tabs';

import { formatDuration, localize, useT } from './i18n';
import { useAttention } from './OverviewView';
import { NAV } from './nav';
import { STATE_LABEL, type MachineState } from './placeholder';
import { useHive } from './store';
import { PILL_LIST, PILL_TRIGGER, TAB_LIST, TAB_TRIGGER, ToneBadge, type BadgeTone } from './ui';

const STATE_TONE: Record<MachineState, BadgeTone> = { producing: 'green', idle: 'amber', setup: 'orange', planned_stop: 'gray', unplanned_stop: 'red', fault: 'red', off: 'gray', unknown: 'gray' };

function Figure({ label, value, unit, trend, up, foot, sub, onClick, accent }: { label: string; value: string; unit?: string; trend?: string; up?: boolean; foot: string; sub: string; onClick: () => void; accent?: boolean }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className="@container/card cursor-pointer gap-2 border-t-[3px] transition-shadow hover:shadow-md" style={{ borderTopColor: accent ? 'var(--hd-orange,#ff4d00)' : 'var(--foreground)' }} role="link" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <CardHeader className="grid-cols-1">
        <div className="flex items-center justify-between gap-2">
          <CardDescription className="text-[0.9375rem] font-medium">{label}</CardDescription>
          {trend && (
            <Badge variant="outline" className={`hidden sm:inline-flex ${accent ? 'border-[var(--hd-orange,#ff4d00)]/40 text-[var(--hd-orange,#ff4d00)]' : ''}`}>
              <Icon />
              {trend}
            </Badge>
          )}
        </div>
        <CardTitle className="font-semibold text-3xl tabular-nums sm:text-4xl">
          {value}
          {unit && <span className="ml-1 font-normal text-base text-muted-foreground">{unit}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-0.5 text-[0.9375rem]">
        <span className="font-medium">{foot}</span>
        <span className="hidden text-muted-foreground sm:block">{sub}</span>
        {trend && <span className="text-muted-foreground sm:hidden">{trend}</span>}
      </CardContent>
    </Card>
  );
}

export default function HomeView({ go }: { go: (section: string) => void }) {
  const t = useT();
  const { data } = useHive();
  const { attention, waiting } = useAttention(go);
  const [range, setRange] = useState<'8' | '4'>('8');
  const [tab, setTab] = useState('attention');

  const critical = attention.filter((a) => a.tone === 'red').length;
  const openAlarms = data.alarms.filter((a) => a.state === 'Open').length;
  const online = data.machines.filter((m) => m.state !== 'unknown' && m.state !== 'off').length;
  const pendingApprovals = data.approvals.filter((a) => a.state === 'Pending');
  const tiles = Object.fromEntries(data.tiles.map((x) => [x.key, x]));
  const volume = useMemo(() => data.alarmVolume.slice(range === '4' ? -4 : 0), [data.alarmVolume, range]);

  const chartConfig = { raised: { label: t('Raised'), color: 'var(--hd-orange,#ff4d00)' }, resolved: { label: t('Resolved'), color: 'var(--muted-foreground)' } } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      {/* No bottom bar on a phone: the four places people go all day are big tiles right here. */}
      <nav className="grid grid-cols-2 gap-3 md:hidden" aria-label={t('Quick access')}>
        {(['machines', 'alarms', 'inbox', 'assistant'] as const).map((id) => {
          const Icon = NAV[id].icon;
          const n = id === 'alarms' ? openAlarms : id === 'inbox' ? waiting : undefined;
          return (
            <a
              key={id}
              href={`/dashboard/hive/${id}`}
              onClick={(e) => {
                e.preventDefault();
                go(id);
              }}
              className="relative flex min-h-24 flex-col justify-between rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow active:shadow-inner"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--hd-orange,#ff4d00)_14%,transparent)] text-[var(--hd-orange,#ff4d00)]">
                <Icon className="size-5" strokeWidth={1.9} />
              </span>
              <span className="font-semibold text-[1.0625rem]">{t(NAV[id].title)}</span>
              {n !== undefined && n > 0 && <span className="absolute top-3 right-3 grid h-7 min-w-7 place-items-center rounded-full bg-[var(--hd-orange,#ff4d00)] px-2 font-semibold text-[var(--hd-on-accent,#fff)] text-sm">{n}</span>}
            </a>
          );
        })}
      </nav>

      <section className="grid grid-cols-2 gap-3 @container/main md:gap-4 xl:grid-cols-4" aria-label={t('Key figures')}>
        <Figure
          label={t('Plant availability')}
          value={data.plant.availability.replace('%', '')}
          unit="%"
          trend={`${data.plant.delta}`}
          up={data.plant.deltaUp}
          foot={t('than last week')}
          sub={`${data.plant.name} · ${t('Total {n} sites', { n: data.sites.length })}`}
          onClick={() => go('production')}
        />
        <Figure
          label={t('Open alarms')}
          value={String(openAlarms)}
          trend={critical ? `${critical} ${t('critical')}` : undefined}
          up
          accent
          foot={critical ? t('Needs attention first') : t('Nothing critical')}
          sub={tiles.alarms ? `${tiles.alarms.delta} ${t('This month').toLowerCase()}` : ''}
          onClick={() => go('alarms')}
        />
        <Figure label={t('Machines online')} value={`${online}`} unit={`/ ${data.machines.length}`} foot={t('Machine states')} sub={t('Unknown is never shown as off.')} onClick={() => go('machines')} />
        <Figure label={t('Waiting for me')} value={String(waiting)} foot={t('Approvals and findings')} sub={t('Decisions only a person can make')} onClick={() => go('inbox')} />
      </section>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle>{t('Alarm volume')}</CardTitle>
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

      <Tabs value={tab} onValueChange={setTab} className="flex-col gap-4">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className={TAB_LIST}>
            <TabsTrigger value="attention" className={`${TAB_TRIGGER} gap-1.5`}>
              {t('Needs attention')} <Badge variant="secondary" className="h-5 px-1.5">{attention.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="waiting" className={`${TAB_TRIGGER} gap-1.5`}>
              {t('Waiting for me')} <Badge variant="secondary" className="h-5 px-1.5">{pendingApprovals.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="machines" className={`${TAB_TRIGGER} gap-1.5`}>
              {t('Machines')} <Badge variant="secondary" className="h-5 px-1.5">{data.machines.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="connections" className={`${TAB_TRIGGER} gap-1.5`}>
              {t('Connections')} <Badge variant="secondary" className="h-5 px-1.5">{data.gatewayFleet.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="attention">
          <Card className="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">{t('What')}</TableHead>
                  <TableHead>{t('Priority')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('Where')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attention.slice(0, 8).map((a) => (
                  <TableRow key={a.key} className="cursor-pointer" tabIndex={0} onClick={a.open} onKeyDown={(e) => e.key === 'Enter' && a.open()}>
                    <TableCell className="py-3 pl-4">
                      <span className="block font-medium">{a.title}</span>
                      <span className="block text-muted-foreground text-xs sm:hidden">{a.where}</span>
                    </TableCell>
                    <TableCell>
                      <ToneBadge tone={a.tone === 'red' ? 'red' : a.tone === 'orange' ? 'orange' : a.tone === 'amber' ? 'amber' : 'gray'}>{t(a.label)}</ToneBadge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{a.where}</TableCell>
                  </TableRow>
                ))}
                {attention.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                      {t('Nothing needs attention. Last checked just now.')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <p className="border-t px-4 py-3 text-muted-foreground text-xs">{t('Alarms shown here are not a replacement for the plant’s safety systems.')}</p>
          </Card>
        </TabsContent>

        <TabsContent value="waiting">
          <Card className="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">{t('Request')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('Machine')}</TableHead>
                  <TableHead>{t('Tier')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer" tabIndex={0} onClick={() => go('inbox')} onKeyDown={(e) => e.key === 'Enter' && go('inbox')}>
                    <TableCell className="whitespace-normal py-3 pl-4 font-medium">{a.title}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{a.machine}</TableCell>
                    <TableCell>
                      <ToneBadge>{a.tier}</ToneBadge>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingApprovals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                      {t('Nothing waiting for you.')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="machines">
          <Card className="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">{t('Machine')}</TableHead>
                  <TableHead>{t('State')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('Line')}</TableHead>
                  <TableHead className="hidden pr-4 text-right md:table-cell">OEE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.machines.map((m) => (
                  <TableRow key={m.id} className="cursor-pointer" tabIndex={0} onClick={() => go(`machines/${m.id}`)} onKeyDown={(e) => e.key === 'Enter' && go(`machines/${m.id}`)}>
                    <TableCell className="py-3 pl-4">
                      <span className="block font-medium">{m.key}</span>
                      <span className="block text-muted-foreground text-xs">{m.type}</span>
                    </TableCell>
                    <TableCell>
                      <ToneBadge tone={STATE_TONE[m.state]}>
                        {t(STATE_LABEL[m.state])} · {formatDuration(m.stateAgeS)}
                      </ToneBadge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{m.line}</TableCell>
                    <TableCell className="hidden pr-4 text-right tabular-nums md:table-cell">{m.oee ? `${localize(String(m.oee))} %` : '–'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card className="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">{t('Gateway')}</TableHead>
                  <TableHead>{t('Link')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('Version')}</TableHead>
                  <TableHead className="hidden pr-4 text-right sm:table-cell">{t('Buffer')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.gatewayFleet.map((g) => (
                  <TableRow key={g.id} className="cursor-pointer" tabIndex={0} onClick={() => go('admin/connections')} onKeyDown={(e) => e.key === 'Enter' && go('admin/connections')}>
                    <TableCell className="py-3 pl-4 font-medium">{g.site}</TableCell>
                    <TableCell>
                      <ToneBadge tone={g.link === 'Online' ? 'green' : g.link === 'Buffering' ? 'amber' : 'red'}>{t(g.link)}</ToneBadge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {g.version} · {g.uptime}
                    </TableCell>
                    <TableCell className="hidden pr-4 text-right tabular-nums sm:table-cell">{g.bufferPct} %</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
