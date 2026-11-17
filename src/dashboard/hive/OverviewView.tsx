import { ArrowDownRight, ArrowLeftRight, ArrowUpRight, BellRing, ClipboardList, Cpu, Radio, type LucideIcon } from 'lucide-react-dash';
import { useMemo } from 'react';

import { MACHINE_STATES, STATE_LABEL, type HiveMachine, type HiveOverview } from './placeholder';
import { useHive } from './store';
import { formatDuration, formatQuantity, localize, useT } from './i18n';

const TILE_ICON: Record<HiveOverview['tiles'][number]['key'], LucideIcon> = {
  signals: Radio,
  alarms: BellRing,
  assets: Cpu,
  workOrders: ClipboardList,
};

export function Delta({ up, children }: { up: boolean; children: React.ReactNode }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`hd-delta ${up ? 'is-up' : 'is-down'}`}>
      <Icon size={11} strokeWidth={2.4} aria-hidden="true" />
      {children}
    </span>
  );
}

export function AlarmChart({ data }: { data: HiveOverview['alarmVolume'] }) {
  const t = useT();
  const max = 50;
  const ticks = [50, 40, 30, 20, 10, 0];
  return (
    <div className="hd-chart" role="img" aria-label={t('Alarms raised and resolved per week, last eight weeks (placeholder)')}>
      <div className="hd-chart-head">
        <span>{t('Raised and resolved')}</span>
        <span className="hd-legend">
          <i className="hd-dot is-orange" /> {t('Raised')}
          <i className="hd-dot is-black" /> {t('Resolved')}
        </span>
      </div>
      <div className="hd-chart-plot">
        <div className="hd-chart-axis" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t}>{t === 0 ? '00' : t}</span>
          ))}
        </div>
        <div className="hd-chart-area">
          <div className="hd-chart-grid" aria-hidden="true">
            {ticks.map((t) => (
              <i key={t} />
            ))}
          </div>
          <div className="hd-bars">
            {data.map((d) => (
              <div className="hd-bar-col" key={d.label}>
                <div className="hd-bar">
                  <span className="hd-bar-raised" style={{ height: `${(Math.max(d.raised - d.resolved, 0) / max) * 100}%` }} />
                  <span className="hd-bar-resolved" style={{ height: `${(d.resolved / max) * 100}%` }} />
                </div>
                <span className="hd-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


export interface AttentionItem {
  key: string;
  title: string;
  where: string;
  label: string;
  tone: 'red' | 'orange' | 'amber' | 'gray';
  rank: number;
  time?: string;
  open: () => void;
}

/** The fixed attention order: critical alarms, high alarms, link down, medium alarms, findings, approvals. */
export function useAttention(go: (section: string) => void): { attention: AttentionItem[]; waiting: number } {
  const { data, openDetail } = useHive();
  const t = useT();
  return useMemo(() => {
    const items: AttentionItem[] = [];
    for (const a of data.alarms.filter((x) => x.state === 'Open')) {
      const rank = a.severity === 'critical' ? 1 : a.severity === 'high' ? 4 : a.severity === 'medium' ? 6 : 9;
      items.push({ key: a.id, title: a.title, where: `${a.machine}${a.component ? ' · ' + a.component : ''}`, label: a.severity, tone: a.severity === 'critical' ? 'red' : a.severity === 'high' ? 'orange' : 'amber', rank, time: a.time, open: () => { go('alarms'); openDetail({ kind: 'alarm', id: a.id }); } });
    }
    for (const g of data.gatewayFleet.filter((x) => x.link !== 'Online')) {
      items.push({ key: g.id, title: t('Gateway {state}', { state: t(g.link).toLowerCase() }), where: g.site, label: 'connection', tone: 'orange', rank: 5, open: () => go('admin/gateways') });
    }
    for (const f of data.findings.filter((x) => x.status === 'Awaiting confirmation')) {
      items.push({ key: f.id, title: f.title, where: f.machine, label: 'finding', tone: 'gray', rank: 7, open: () => go('findings') });
    }
    const pending = data.approvals.filter((x) => x.state === 'Pending');
    for (const p of pending) {
      items.push({ key: p.id, title: p.title, where: p.machine, label: 'approval', tone: 'gray', rank: 8, open: () => go('inbox') });
    }
    items.sort((x, y) => x.rank - y.rank);
    return { attention: items, waiting: pending.length };
  }, [data, go, openDetail, t]);
}

export default function OverviewView({ go }: { go: (section: string) => void }) {
  const t = useT();
  const { data: overview } = useHive();
  const { attention, waiting } = useAttention(go);
  const usedPct = Math.round((overview.bufferUsedGb / overview.bufferTotalGb) * 100);

  const stateCounts = useMemo(() => MACHINE_STATES.map((st) => [st, overview.machines.filter((m) => m.state === st).length] as const), [overview.machines]);
  const lines = useMemo(() => {
    const map = new Map<string, HiveMachine[]>();
    for (const m of overview.machines) map.set(m.line, [...(map.get(m.line) ?? []), m]);
    return [...map.entries()];
  }, [overview.machines]);
  const critical = attention.filter((a) => a.tone === 'red').length;
  const online = overview.machines.filter((m) => m.state !== 'unknown' && m.state !== 'off').length;

  return (
    <div className="hx-home">
      {/* Where the plant stands: the answer to "how is it going" before anything else */}
      <section className="hx-hero" aria-labelledby="hx-plant">
        <div className="hx-hero-main">
          <span id="hx-plant" className="hx-eyebrow">
            {t('Plant availability')} · {overview.plant.name}
          </span>
          <div className="hx-hero-num">{overview.plant.availability}</div>
          <div className="hx-hero-sub">
            <Delta up={overview.plant.deltaUp}>{overview.plant.delta}</Delta>
            <span>{t('than last week')}</span>
          </div>
          <div className="hx-hero-sites">
            {overview.sites.map((s) => (
              <button type="button" key={s.id} onClick={() => go('machines')}>
                <span>{s.name}</span>
                <b>{s.oee}</b>
                <i className={s.state === 'Active' ? 'is-active' : 'is-inactive'} aria-label={t(s.state)} />
              </button>
            ))}
          </div>
        </div>
        <div className="hx-hero-side">
          <dl className="hx-hero-stats">
            <div className={critical ? 'is-hot' : undefined}>
              <dt>{t('Critical')}</dt>
              <dd>{critical}</dd>
            </div>
            <div>
              <dt>{t('Waiting for me')}</dt>
              <dd>{waiting}</dd>
            </div>
            <div>
              <dt>{t('Online')}</dt>
              <dd>
                {online}
                <small> / {overview.machines.length}</small>
              </dd>
            </div>
          </dl>
          <div className="hx-hero-actions">
            <button type="button" className="hd-btn is-accent" onClick={() => go('alarms')}>
              <ArrowLeftRight size={16} /> {t('Open alarms')}
            </button>
            <button type="button" className="hd-btn is-light" onClick={() => go('work-orders')}>
              <ClipboardList size={16} /> {t('Work order')}
            </button>
          </div>
        </div>
      </section>

      <section className="hx-kpis is-4" aria-label={t('Key figures')}>
        {overview.tiles.map((tile, i) => {
          const Icon = TILE_ICON[tile.key];
          return (
            <div className={`hx-kpi${i === 0 ? ' is-hot' : ''}`} key={tile.key}>
              <span>
                <Icon size={14} aria-hidden="true" /> {t(tile.label)}
              </span>
              <b>{localize(tile.value)}</b>
              <small>
                <em className={tile.up ? 'is-up' : 'is-down'}>
                  {tile.up ? '↗' : '↘'} {localize(tile.delta)}
                </em>
                <span>{t('This month')}</span>
              </small>
            </div>
          );
        })}
      </section>

      <div className="hx-split">
        {/* Needs attention: ordered by a fixed rule */}
        <section className="hx-panel" aria-labelledby="hx-attn">
          <header className="hx-panel-head is-row">
            <div>
              <h2 id="hx-attn">{t('Needs attention')}</h2>
              <p>{t('Ordered by priority. Critical first.')}</p>
            </div>
            <button type="button" className="hx-link" onClick={() => go('inbox')}>
              {t('Waiting for me · {n}', { n: waiting })}
            </button>
          </header>
          <ol className="hd-attention">
            {attention.slice(0, 6).map((a) => (
              <li key={a.key}>
                <button type="button" onClick={() => a.open()}>
                  <span className={`hd-attn-dot is-${a.tone}`} aria-hidden="true" />
                  <span className="hd-attn-text">
                    <b>{a.title}</b>
                    <small>{a.where}</small>
                  </span>
                  <span className="hd-attn-label">{t(a.label)}</span>
                </button>
              </li>
            ))}
            {attention.length === 0 && <li className="hd-empty">{t('Nothing needs attention. Last checked just now.')}</li>}
          </ol>
          {attention.length > 6 && (
            <button type="button" className="hx-link is-block" onClick={() => go('alarms')}>
              {t('{n} more', { n: attention.length - 6 })}
            </button>
          )}
          <p className="hx-fine">{t('Alarms shown here are not a replacement for the plant’s safety systems.')}</p>
        </section>

        {/* Machine states, all eight, never merged */}
        <section className="hx-panel" aria-labelledby="hx-states">
          <header className="hx-panel-head is-row">
            <div>
              <h2 id="hx-states">{t('Machine states')}</h2>
              <p>{t('Unknown is never shown as off.')}</p>
            </div>
            <button type="button" className="hx-link" onClick={() => go('machines')}>
              {t('All machines')}
            </button>
          </header>
          <ul className="hx-states">
            {stateCounts.map(([st, n]) => (
              <li key={st} className={n ? undefined : 'is-zero'}>
                <i className={`hd-sdot is-${st}`} aria-hidden="true" />
                <span>{t(STATE_LABEL[st])}</span>
                <b>{n}</b>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Plant overview by line */}
      <section className="hx-panel" aria-labelledby="hx-lines">
        <header className="hx-panel-head is-row">
          <div>
            <h2 id="hx-lines">{t('Plant overview')}</h2>
            <p>{t('By line, with the age of every state.')}</p>
          </div>
        </header>
        <div className="hd-lines-grid">
          {lines.map(([line, ms]) => (
            <div className="hd-linebox" key={line}>
              <h3>{line}</h3>
              <div className="hd-tiles-mini">
                {ms.map((m) => (
                  <button type="button" key={m.id} className={`hd-mtile is-${m.state}`} onClick={() => go(`machines/${m.id}`)} title={`${t(STATE_LABEL[m.state])} · ${formatDuration(m.stateAgeS)}`}>
                    <b>{m.key}</b>
                    <small>
                      {t(STATE_LABEL[m.state])} · {formatDuration(m.stateAgeS)}
                    </small>
                    {m.openAlarms > 0 && <em>{m.openAlarms}</em>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="hx-split is-even">
        <section className="hx-panel" aria-labelledby="hx-volume">
          <header className="hx-panel-head">
            <h2 id="hx-volume">{t('Alarm volume')}</h2>
            <p>{t('View alarms raised and resolved over the last eight weeks')}</p>
          </header>
          <AlarmChart data={overview.alarmVolume} />
        </section>

        <section className="hx-panel" aria-labelledby="hx-conn">
          <header className="hx-panel-head is-row">
            <div>
              <h2 id="hx-conn">{t('Connections')}</h2>
              <p>{t('Gateways and the edge buffer')}</p>
            </div>
            <button type="button" className="hx-link" onClick={() => go('admin/gateways')}>
              {t('Manage')}
            </button>
          </header>
          <ul className="hx-gws">
            {overview.gatewayFleet.map((g) => (
              <li key={g.id}>
                <button type="button" onClick={() => go('admin/gateways')}>
                  <i className={`hx-link-dot is-${g.link.toLowerCase()}`} aria-hidden="true" />
                  <span className="hx-gw-name">
                    <b>{g.site}</b>
                    <small>
                      {g.version} · {g.uptime}
                    </small>
                  </span>
                  <span className={`hx-pill is-${g.link === 'Online' ? 'green' : g.link === 'Buffering' ? 'amber' : 'red'}`}>{t(g.link)}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="hx-buffer">
            <div className="hd-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={usedPct} aria-label={t('Edge buffer used')}>
              <span style={{ width: `${usedPct}%` }} />
            </div>
            <p>
              <b>{formatQuantity(overview.bufferUsedGb, 'GB')}</b> <small>{t('used out of')}</small> <span>{formatQuantity(overview.bufferTotalGb, 'GB')}</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
