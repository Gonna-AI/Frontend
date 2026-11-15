import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  BellRing,
  ChevronDown,
  ClipboardList,
  Cpu,
  EllipsisVertical,
  Plus,
  Radio,
  Sparkles,
  Wifi,
  type LucideIcon,
} from 'lucide-react-dash';
import { useMemo, useState } from 'react';

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
  const [site, setSite] = useState(overview.plant.name);
  const { attention, waiting } = useAttention(go);
  const usedPct = Math.round((overview.bufferUsedGb / overview.bufferTotalGb) * 100);

  const stateCounts = useMemo(
    () => MACHINE_STATES.map((st) => [st, overview.machines.filter((m) => m.state === st).length] as const),
    [overview.machines],
  );
  const lines = useMemo(() => {
    const map = new Map<string, HiveMachine[]>();
    for (const m of overview.machines) map.set(m.line, [...(map.get(m.line) ?? []), m]);
    return [...map.entries()];
  }, [overview.machines]);

  return (
    <>
      <div className="hd-grid">
      {/* Plant availability */}
      <section className="hd-card hd-balance" aria-labelledby="hd-plant">
        <div className="hd-row">
          <span id="hd-plant" className="hd-label">
            {t('Plant availability')}
          </span>
          <label className="hd-select">
            <select value={site} onChange={(e) => setSite(e.target.value)} aria-label={t('Site')}>
              <option>{overview.plant.name}</option>
            </select>
            <ChevronDown size={12} aria-hidden="true" />
          </label>
        </div>
        <div className="hd-big">{overview.plant.availability}</div>
        <div className="hd-sub">
          <Delta up={overview.plant.deltaUp}>{overview.plant.delta}</Delta>
          <span>{t('than last week')}</span>
        </div>
        <div className="hd-actions">
          <button type="button" className="hd-btn is-dark" onClick={() => go('alarms')}>
            <ArrowLeftRight size={16} /> {t('Open alarms')}
          </button>
          <button type="button" className="hd-btn is-light" onClick={() => go('work-orders')}>
            <ClipboardList size={16} /> {t('Work order')}
          </button>
        </div>
        <div className="hd-panel hd-wallets">
          <div className="hd-panel-title">
            <strong>{t('Sites')}</strong>
            <span>{t('Total {n} sites', { n: overview.sites.length })}</span>
          </div>
          <div className="hd-wallet-row">
            {overview.sites.map((s) => (
              <button type="button" className="hd-wallet" key={s.id} onClick={() => go('machines')}>
                <div className="hd-wallet-top">
                  <span className="hd-site-chip">{s.name.slice(0, 1)}</span>
                  <b>{s.name}</b>
                  <EllipsisVertical size={12} aria-hidden="true" />
                </div>
                <div className="hd-wallet-amount">{s.oee}</div>
                <small>{s.signals}</small>
                <em className={s.state === 'Active' ? 'is-active' : 'is-inactive'}>{t(s.state)}</em>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tiles */}
      <section className="hd-tiles" aria-label={t('Key figures')}>
        {overview.tiles.map((tile, i) => {
          const Icon = TILE_ICON[tile.key];
          return (
            <div className={`hd-tile${i === 0 ? ' is-accent' : ''}`} key={tile.key}>
              <div className="hd-row">
                <span>{t(tile.label)}</span>
                <span className="hd-tile-icon">
                  <Icon size={14} />
                </span>
              </div>
              <div className="hd-tile-value">{localize(tile.value)}</div>
              <div className="hd-sub">
                <Delta up={tile.up}>{localize(tile.delta)}</Delta>
                <span>{t('This month')}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Chart */}
      <section className="hd-card hd-income" aria-labelledby="hd-alarms">
        <h2 id="hd-alarms">{t('Alarm volume')}</h2>
        <p className="hd-muted">{t('View alarms raised and resolved over the last eight weeks')}</p>
        <AlarmChart data={overview.alarmVolume} />
      </section>

      {/* Buffer */}
      <section className="hd-card hd-limit" aria-labelledby="hd-buffer">
        <h2 id="hd-buffer" className="hd-card-title">
          {t('Edge buffer usage')}
        </h2>
        <div
          className="hd-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={usedPct}
          aria-label={t('Edge buffer used')}
        >
          <span style={{ width: `${usedPct}%` }} />
        </div>
        <div className="hd-progress-meta">
          <b>{formatQuantity(overview.bufferUsedGb, 'GB')}</b>
          <small>{t('used out of')}</small>
          <span>{formatQuantity(overview.bufferTotalGb, 'GB')}</span>
        </div>
      </section>

      {/* Gateways */}
      <section className="hd-card hd-cards" aria-labelledby="hd-gateways">
        <div className="hd-row">
          <div className="hd-title-with-icon">
            <span className="hd-ico-chip">
              <Wifi size={15} />
            </span>
            <h2 id="hd-gateways" className="hd-card-title">
              {t('Gateways')}
            </h2>
          </div>
          <button type="button" className="hd-ghost" onClick={() => go('admin/gateways')}>
            <Plus size={12} /> {t('Enroll')}
          </button>
        </div>
        <div className="hd-gw-row">
          {overview.gateways.map((g, i) => (
            <button type="button" className={`hd-gw ${i === 0 ? 'is-black' : 'is-orange'}`} key={g.id} onClick={() => go('admin/gateways')}>
              <div className="hd-gw-top">
                <Wifi size={13} aria-hidden="true" />
                <span className="hd-gw-state">{t(g.state)}</span>
                {i === 0 ? (
                  <span className="hd-gw-logo" aria-hidden="true">
                    <i />
                    <i />
                  </span>
                ) : (
                  <Sparkles size={22} className="hd-gw-spark" aria-hidden="true" />
                )}
              </div>
              <div className="hd-gw-meta">
                <div>
                  <small>{t('Gateway ID')}</small>
                  <span>{g.id.replace(/.*· /, '**** **** ')}</span>
                </div>
                <div>
                  <small>{t('Version')}</small>
                  <span>{g.version}</span>
                </div>
                <div>
                  <small>{t('Uptime')}</small>
                  <span>{g.uptime}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Needs attention: ordered by a fixed rule */}
      <section className="hd-card hd-activity" aria-labelledby="hd-events">
        <div className="hd-row">
          <h2 id="hd-events" className="hd-card-title is-lg">
            {t('Needs attention')}
          </h2>
          <div className="hd-act-tools">
            <button type="button" className="hd-ghost" onClick={() => go('inbox')}>
              {t('Waiting for me · {n}', { n: waiting })}
            </button>
          </div>
        </div>
        <ol className="hd-attention">
          {attention.slice(0, 8).map((a) => (
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
        {attention.length > 8 && (
          <button type="button" className="hd-ghost hd-attn-more" onClick={() => go('alarms')}>
            {t('{n} more', { n: attention.length - 8 })}
          </button>
        )}
        <p className="hd-muted hd-attn-note">{t('Alarms shown here are not a replacement for the plant’s safety systems.')}</p>
      </section>

      {/* Plant overview by line, using the eight machine states */}
      <section className="hd-card hd-plant" aria-labelledby="hd-plant-overview">
        <div className="hd-row">
          <h2 id="hd-plant-overview" className="hd-card-title is-lg">
            {t('Plant overview')}
          </h2>
          <button type="button" className="hd-ghost" onClick={() => go('machines')}>
            {t('All machines')}
          </button>
        </div>
        <div className="hd-state-row">
          {stateCounts.map(([st, n]) => (
            <span key={st} className={`hd-state-count${n ? '' : ' is-zero'}`}>
              <i className={`hd-sdot is-${st}`} /> {t(STATE_LABEL[st])} <b>{n}</b>
            </span>
          ))}
        </div>
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
      </div>
    </>
  );
}
