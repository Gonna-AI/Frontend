import {
  Download,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Wifi,
  X,
  type LucideIcon,
} from 'lucide-react-dash';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AlarmChart } from './OverviewView';
import type { AlarmState, ApprovalState, AssetStatus, Severity, WorkOrderState } from './placeholder';
import { useHive } from './store';

/* ---------- shared pieces ---------- */

function Chips<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="hd-chips" role="group">
      {options.map((o) => (
        <button key={o} type="button" className={`hd-chip${o === value ? ' is-on' : ''}`} aria-pressed={o === value} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="hd-search">
      <Search size={14} aria-hidden="true" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search" aria-label={label} />
    </label>
  );
}

function Sev({ s }: { s: Severity }) {
  return <span className={`hd-sev is-${s}`}>{s}</span>;
}

function Pill({ tone, children }: { tone: 'green' | 'red' | 'amber' | 'gray' | 'orange' | 'black'; children: React.ReactNode }) {
  return <span className={`hd-pillx is-${tone}`}>{children}</span>;
}

const ASSET_TONE: Record<AssetStatus, 'green' | 'red' | 'amber' | 'gray'> = { Running: 'green', Idle: 'amber', Fault: 'red', Offline: 'gray' };
const ALARM_TONE: Record<AlarmState, 'red' | 'amber' | 'green'> = { Open: 'red', Acknowledged: 'amber', Resolved: 'green' };
const WO_TONE: Record<WorkOrderState, 'gray' | 'amber' | 'orange' | 'green'> = { Draft: 'gray', Submitted: 'amber', 'In progress': 'orange', Done: 'green' };
const APR_TONE: Record<ApprovalState, 'amber' | 'green' | 'red'> = { Pending: 'amber', Approved: 'green', Rejected: 'red' };

interface Col<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  sort?: (a: T, b: T) => number;
}

function DataTable<T extends { id: string }>({ rows, cols, onOpen, empty }: { rows: T[]; cols: Col<T>[]; onOpen: (row: T) => void; empty: string }) {
  const [sortIdx, setSortIdx] = useState<number | null>(null);
  const [desc, setDesc] = useState(false);
  const sorted = useMemo(() => {
    if (sortIdx === null || !cols[sortIdx]?.sort) return rows;
    const cmp = cols[sortIdx].sort!;
    return [...rows].sort((a, b) => (desc ? -cmp(a, b) : cmp(a, b)));
  }, [rows, cols, sortIdx, desc]);

  return (
    <div className="hd-table-wrap">
      <table className="hd-table">
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={c.header} aria-sort={sortIdx === i ? (desc ? 'descending' : 'ascending') : undefined}>
                {c.sort ? (
                  <button
                    type="button"
                    className="hd-th-btn"
                    onClick={() => {
                      if (sortIdx === i) setDesc((d) => !d);
                      else {
                        setSortIdx(i);
                        setDesc(false);
                      }
                    }}
                  >
                    {c.header}
                    {sortIdx === i ? (desc ? ' ↓' : ' ↑') : ''}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.id}
              className="is-clickable"
              tabIndex={0}
              onClick={() => onOpen(r)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onOpen(r);
              }}
            >
              {cols.map((c) => (
                <td key={c.header}>{c.render(r)}</td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={cols.length} className="hd-empty">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PageCard({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="hd-card hd-page">
      <div className="hd-row hd-page-head">
        <div>
          <h2 className="hd-card-title is-lg">{title}</h2>
          {subtitle && <p className="hd-muted">{subtitle}</p>}
        </div>
        {actions && <div className="hd-act-tools">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

function StatRow({ items }: { items: { label: string; value: string; tone?: 'orange' }[] }) {
  return (
    <div className="hd-statrow">
      {items.map((i) => (
        <div key={i.label} className={`hd-stat${i.tone === 'orange' ? ' is-accent' : ''}`}>
          <span>{i.label}</span>
          <b>{i.value}</b>
        </div>
      ))}
    </div>
  );
}

const includes = (q: string, ...vals: string[]) => !q.trim() || vals.some((v) => v.toLowerCase().includes(q.trim().toLowerCase()));

/* ---------- views ---------- */

const ASSET_FILTERS = ['All', 'Running', 'Idle', 'Fault', 'Offline'] as const;

export function AssetsView() {
  const { data, openDetail } = useHive();
  const [params, setParams] = useSearchParams();
  const siteFilter = params.get('site');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<(typeof ASSET_FILTERS)[number]>('All');
  const rows = data.assets.filter((a) => (status === 'All' || a.status === status) && (!siteFilter || a.site === siteFilter) && includes(q, a.name, a.type, a.site));
  return (
    <PageCard
      title="Assets"
      subtitle={siteFilter ? `Showing ${siteFilter}` : 'Every machine and system in the plant graph'}
      actions={
        <>
          {siteFilter && (
            <button type="button" className="hd-ghost" onClick={() => setParams({})}>
              <X size={12} /> {siteFilter}
            </button>
          )}
          <SearchBox value={q} onChange={setQ} label="Search assets" />
        </>
      }
    >
      <Chips options={ASSET_FILTERS} value={status} onChange={setStatus} />
      <DataTable
        rows={rows}
        onOpen={(r) => openDetail({ kind: 'asset', id: r.id })}
        empty="No assets match."
        cols={[
          { header: 'Asset', sort: (a, b) => a.name.localeCompare(b.name), render: (r) => <span className="hd-strong">{r.name}<small className="hd-sub-line">{r.type}</small></span> },
          { header: 'Site', sort: (a, b) => a.site.localeCompare(b.site), render: (r) => r.site },
          { header: 'Status', render: (r) => <Pill tone={ASSET_TONE[r.status]}>{r.status}</Pill> },
          { header: 'OEE', sort: (a, b) => a.oee - b.oee, render: (r) => <span className="hd-meter"><i style={{ width: `${r.oee}%` }} /><b>{r.oee ? `${r.oee.toFixed(1)}%` : '—'}</b></span> },
          { header: 'Last signal', render: (r) => r.lastSignal },
          { header: 'Signals', sort: (a, b) => a.signals - b.signals, render: (r) => r.signals },
        ]}
      />
    </PageCard>
  );
}

const ALARM_FILTERS = ['All', 'Open', 'Acknowledged', 'Resolved'] as const;
const SEV_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function AlarmsView() {
  const { data, openDetail } = useHive();
  const [q, setQ] = useState('');
  const [state, setState] = useState<(typeof ALARM_FILTERS)[number]>('All');
  const open = data.alarms.filter((a) => a.state === 'Open');
  const rows = data.alarms.filter((a) => (state === 'All' || a.state === state) && includes(q, a.id, a.title, a.asset, a.severity));
  return (
    <>
      <StatRow
        items={[
          { label: 'Open', value: String(open.length), tone: 'orange' },
          { label: 'Critical open', value: String(open.filter((a) => a.severity === 'critical').length) },
          { label: 'Acknowledged', value: String(data.alarms.filter((a) => a.state === 'Acknowledged').length) },
          { label: 'Resolved', value: String(data.alarms.filter((a) => a.state === 'Resolved').length) },
        ]}
      />
      <PageCard title="Alarms" subtitle="Raised by rules on live signals" actions={<SearchBox value={q} onChange={setQ} label="Search alarms" />}>
        <Chips options={ALARM_FILTERS} value={state} onChange={setState} />
        <DataTable
          rows={rows}
          onOpen={(r) => openDetail({ kind: 'alarm', id: r.id })}
          empty="No alarms match."
          cols={[
            { header: 'ID', render: (r) => r.id },
            { header: 'Alarm', render: (r) => <span className="hd-strong">{r.title}</span> },
            { header: 'Asset', sort: (a, b) => a.asset.localeCompare(b.asset), render: (r) => r.asset },
            { header: 'Severity', sort: (a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity], render: (r) => <Sev s={r.severity} /> },
            { header: 'State', render: (r) => <Pill tone={ALARM_TONE[r.state]}>{r.state}</Pill> },
            { header: 'Raised', render: (r) => r.raisedAt },
          ]}
        />
      </PageCard>
    </>
  );
}

const WO_FILTERS = ['All', 'Draft', 'Submitted', 'In progress', 'Done'] as const;

export function WorkOrdersView() {
  const { data, openDetail, notify } = useHive();
  const [q, setQ] = useState('');
  const [state, setState] = useState<(typeof WO_FILTERS)[number]>('All');
  const rows = data.workOrders.filter((w) => (state === 'All' || w.state === state) && includes(q, w.id, w.title, w.asset));
  return (
    <PageCard
      title="Work orders"
      subtitle="Drafted here, written to the maintenance or ERP system after a person approves"
      actions={
        <>
          <SearchBox value={q} onChange={setQ} label="Search work orders" />
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => notify('Creating work orders needs the work-order API (placeholder)')}>
            <Plus size={14} /> New
          </button>
        </>
      }
    >
      <Chips options={WO_FILTERS} value={state} onChange={setState} />
      <DataTable
        rows={rows}
        onOpen={(r) => openDetail({ kind: 'workOrder', id: r.id })}
        empty="No work orders match."
        cols={[
          { header: 'ID', render: (r) => r.id },
          { header: 'Work order', render: (r) => <span className="hd-strong">{r.title}</span> },
          { header: 'Asset', sort: (a, b) => a.asset.localeCompare(b.asset), render: (r) => r.asset },
          { header: 'Priority', sort: (a, b) => SEV_RANK[a.priority] - SEV_RANK[b.priority], render: (r) => <Sev s={r.priority} /> },
          { header: 'System', render: (r) => r.target },
          { header: 'State', render: (r) => <Pill tone={WO_TONE[r.state]}>{r.state}</Pill> },
          { header: 'Due', render: (r) => r.due },
        ]}
      />
    </PageCard>
  );
}

export function ApprovalsView() {
  const { data, openDetail, setApprovalState } = useHive();
  const pending = data.approvals.filter((a) => a.state === 'Pending');
  return (
    <>
      <div className="hd-note" role="note">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>
          Approvals are decisions for people. An assistant can recommend an action, but it never approves one. Only low-risk business-system actions (tier T1) appear here; nothing on this
          page can reach a machine.
        </span>
      </div>
      <PageCard title="Approvals" subtitle={`${pending.length} waiting for a decision`}>
        <div className="hd-approvals">
          {data.approvals.map((a) => (
            <article className="hd-approval" key={a.id}>
              <button type="button" className="hd-approval-main" onClick={() => openDetail({ kind: 'approval', id: a.id })}>
                <span className="hd-strong">{a.title}</span>
                <small>
                  {a.id} · {a.asset} · {a.source} · {a.requestedAt}
                </small>
              </button>
              <Pill tone="gray">{a.tier}</Pill>
              {a.state === 'Pending' ? (
                <span className="hd-approval-actions">
                  <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => setApprovalState(a.id, 'Rejected')}>
                    Reject
                  </button>
                  <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => setApprovalState(a.id, 'Approved')}>
                    Approve
                  </button>
                </span>
              ) : (
                <Pill tone={APR_TONE[a.state]}>{a.state}</Pill>
              )}
            </article>
          ))}
        </div>
      </PageCard>
    </>
  );
}

const DOC_FILTERS = ['All', 'Manual', 'Drawing', 'SOP', 'Report'] as const;

export function DocumentsView() {
  const { data, openDetail, notify } = useHive();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<(typeof DOC_FILTERS)[number]>('All');
  const rows = data.documents.filter((d) => (kind === 'All' || d.kind === kind) && includes(q, d.name, d.asset, d.kind));
  return (
    <PageCard
      title="Documents"
      subtitle="Manuals, drawings and procedures linked to assets"
      actions={
        <>
          <SearchBox value={q} onChange={setQ} label="Search documents" />
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => notify('Uploads need the document API (placeholder)')}>
            <Plus size={14} /> Upload
          </button>
        </>
      }
    >
      <Chips options={DOC_FILTERS} value={kind} onChange={setKind} />
      <div className="hd-doc-grid">
        {rows.map((d) => (
          <button type="button" className="hd-doc" key={d.id} onClick={() => openDetail({ kind: 'document', id: d.id })}>
            <span className="hd-doc-icon">
              <FileText size={18} />
            </span>
            <b>{d.name}</b>
            <small>
              {d.kind} · {d.pages} pages
            </small>
            <small>
              {d.asset} · updated {d.updated}
            </small>
          </button>
        ))}
        {rows.length === 0 && <p className="hd-empty">No documents match.</p>}
      </div>
    </PageCard>
  );
}

export function SitesView({ go }: { go: (section: string) => void }) {
  const { data } = useHive();
  return (
    <PageCard title="Sites" subtitle={`${data.plant.name} · ${data.sites.length} sites`}>
      <div className="hd-site-grid">
        {data.sites.map((s) => {
          const assets = data.assets.filter((a) => a.site === s.name);
          const faults = assets.filter((a) => a.status === 'Fault').length;
          return (
            <button type="button" className="hd-site" key={s.id} onClick={() => go(`assets?site=${encodeURIComponent(s.name)}`)}>
              <div className="hd-row">
                <b>{s.name}</b>
                <Pill tone={s.state === 'Active' ? 'green' : 'gray'}>{s.state}</Pill>
              </div>
              <div className="hd-big sm">{s.oee}</div>
              <small>OEE this week</small>
              <div className="hd-site-meta">
                <span>{assets.length} assets</span>
                <span>{s.signals}</span>
                <span className={faults ? 'is-bad' : ''}>{faults} faults</span>
              </div>
            </button>
          );
        })}
      </div>
    </PageCard>
  );
}

const LINK_TONE = { Online: 'green', Buffering: 'amber', Offline: 'red' } as const;

export function GatewaysView() {
  const { data, notify } = useHive();
  return (
    <PageCard
      title="Gateways"
      subtitle="Edge gateways reading your machines; data is buffered when the link drops"
      actions={
        <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => notify('Enrolment needs the gateway API (placeholder)')}>
          <Plus size={14} /> Enroll
        </button>
      }
    >
      <DataTable
        rows={data.gatewayFleet}
        onOpen={() => notify('Gateway details need the gateway API (placeholder)')}
        empty="No gateways."
        cols={[
          { header: 'Gateway', render: (r) => <span className="hd-act"><span className="hd-act-icon"><Wifi size={13} /></span>{r.id}</span> },
          { header: 'Site', sort: (a, b) => a.site.localeCompare(b.site), render: (r) => r.site },
          { header: 'Link', render: (r) => <Pill tone={LINK_TONE[r.link]}>{r.link}</Pill> },
          { header: 'Buffer', sort: (a, b) => a.bufferPct - b.bufferPct, render: (r) => <span className="hd-meter"><i style={{ width: `${r.bufferPct}%` }} /><b>{r.bufferPct}%</b></span> },
          { header: 'Drivers', render: (r) => r.drivers },
          { header: 'Version', render: (r) => r.version },
          { header: 'Uptime', render: (r) => r.uptime },
        ]}
      />
    </PageCard>
  );
}

const FEED_FILTERS = ['All', 'alarm', 'work_order', 'approval', 'gateway', 'document'] as const;
const FEED_LABEL: Record<string, string> = { All: 'All', alarm: 'Alarms', work_order: 'Work orders', approval: 'Approvals', gateway: 'Gateways', document: 'Documents' };

export function ActivityView() {
  const { data } = useHive();
  const [kind, setKind] = useState<(typeof FEED_FILTERS)[number]>('All');
  const items = data.feed.filter((f) => kind === 'All' || f.kind === kind);
  const days = [...new Set(items.map((i) => i.day))];
  return (
    <PageCard title="Activity" subtitle="Everything that happened across the plant, newest first">
      <div className="hd-chips" role="group">
        {FEED_FILTERS.map((f) => (
          <button key={f} type="button" className={`hd-chip${f === kind ? ' is-on' : ''}`} aria-pressed={f === kind} onClick={() => setKind(f)}>
            {FEED_LABEL[f]}
          </button>
        ))}
      </div>
      {days.map((day) => (
        <div key={day} className="hd-day">
          <h3>{day}</h3>
          <ol className="hd-timeline">
            {items
              .filter((i) => i.day === day)
              .map((i) => (
                <li key={i.id} className={`is-${i.kind}`}>
                  <time>{i.at}</time>
                  <span>{i.text}</span>
                </li>
              ))}
          </ol>
        </div>
      ))}
      {items.length === 0 && <p className="hd-empty">Nothing here yet.</p>}
    </PageCard>
  );
}

function OeeLines({ data }: { data: { label: string; hall1: number; hall2: number; store: number }[] }) {
  const w = 360;
  const h = 150;
  const min = 60;
  const max = 95;
  const x = (i: number) => 12 + (i * (w - 24)) / (data.length - 1);
  const y = (v: number) => h - 18 - ((v - min) / (max - min)) * (h - 30);
  const line = (k: 'hall1' | 'hall2' | 'store') => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="hd-lines" role="img" aria-label="Weekly OEE by site for the last eight weeks (placeholder)">
      {[60, 70, 80, 90].map((t) => (
        <g key={t}>
          <line x1="12" x2={w - 12} y1={y(t)} y2={y(t)} className="hd-gridline" />
          <text x="0" y={y(t) + 3} className="hd-axis-text">{t}</text>
        </g>
      ))}
      <path d={line('store')} className="hd-line is-gray" />
      <path d={line('hall2')} className="hd-line is-black" />
      <path d={line('hall1')} className="hd-line is-orange" />
      {data.map((d, i) => (
        <text key={d.label} x={x(i)} y={h - 2} textAnchor="middle" className="hd-axis-text">{d.label}</text>
      ))}
    </svg>
  );
}

export function ReportsView() {
  const { data, notify } = useHive();
  const download = () => {
    const rows = ['week,halle_1,halle_2,lager', ...data.oeeTrend.map((r) => `${r.label},${r.hall1},${r.hall2},${r.store}`)];
    const url = URL.createObjectURL(new Blob([rows.join('\n') + '\n'], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hive-oee-weekly-placeholder.csv';
    a.click();
    URL.revokeObjectURL(url);
    notify('Downloaded placeholder OEE CSV');
  };
  return (
    <>
      <PageCard
        title="Reports"
        subtitle="Weekly OEE and alarm trends (placeholder data)"
        actions={
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={download}>
            <Download size={14} /> Download CSV
          </button>
        }
      >
        <div className="hd-report-grid">
          <div className="hd-panel">
            <div className="hd-chart-head">
              <span>OEE by site, %</span>
              <span className="hd-legend">
                <i className="hd-dot is-orange" /> Halle 1
                <i className="hd-dot is-black" /> Halle 2
                <i className="hd-dot is-gray" /> Lager
              </span>
            </div>
            <OeeLines data={data.oeeTrend} />
          </div>
          <div className="hd-panel hd-report-chart">
            <AlarmChart data={data.alarmVolume} />
          </div>
        </div>
      </PageCard>
    </>
  );
}

/* ---------- settings ---------- */

function Toggle({ label, hint, on, onChange }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="hd-toggle">
      <span>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden="true" />
    </label>
  );
}

export function SettingsView({ dark, setDark, compact, setCompact }: { dark: boolean; setDark: (v: boolean) => void; compact: boolean; setCompact: (v: boolean) => void }) {
  const { apiState, notify } = useHive();
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  const apiText: Record<string, string> = {
    unconfigured: 'Not configured: showing placeholder data',
    checking: 'Checking…',
    online: 'Online',
    offline: 'Configured but not reachable',
  };
  return (
    <PageCard title="Settings" subtitle="Display preferences are saved in this browser only">
      <div className="hd-settings">
        <Toggle label="Dark theme" hint="Switches the whole Hive dashboard" on={dark} onChange={setDark} />
        <Toggle label="Compact tables" hint="Tighter rows, more on screen" on={compact} onChange={setCompact} />
        <Toggle label="Alarm emails" hint="Placeholder: notifications need the notification API" on={email} onChange={(v) => { setEmail(v); notify('Saved on this page only (placeholder)'); }} />
        <Toggle label="Push notifications" hint="Placeholder: mobile app not connected" on={push} onChange={(v) => { setPush(v); notify('Saved on this page only (placeholder)'); }} />
        <div className="hd-kv">
          <span>Hive API</span>
          <b>{apiText[apiState]}</b>
        </div>
      </div>
    </PageCard>
  );
}

/* ---------- detail drawer ---------- */

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="hd-kv">
      <span>{k}</span>
      <b>{v}</b>
    </div>
  );
}

export function DetailDrawer() {
  const { data, detail, openDetail, setAlarmState, setApprovalState, setWorkOrderState } = useHive();
  if (!detail) return null;
  const close = () => openDetail(null);

  let title = '';
  let sub = '';
  let body: React.ReactNode = null;
  let foot: React.ReactNode = null;

  if (detail.kind === 'asset') {
    const a = data.assets.find((x) => x.id === detail.id);
    if (a) {
      title = a.name;
      sub = a.type;
      body = (
        <>
          <Field k="Site" v={a.site} />
          <Field k="Status" v={<Pill tone={ASSET_TONE[a.status]}>{a.status}</Pill>} />
          <Field k="OEE" v={a.oee ? `${a.oee.toFixed(1)}%` : '—'} />
          <Field k="Signals" v={a.signals} />
          <Field k="Last signal" v={a.lastSignal} />
          <h4>Open alarms</h4>
          {data.alarms.filter((x) => x.asset === a.name && x.state !== 'Resolved').map((x) => (
            <button key={x.id} type="button" className="hd-link-row" onClick={() => openDetail({ kind: 'alarm', id: x.id })}>
              <Sev s={x.severity} /> {x.title}
            </button>
          ))}
          {data.alarms.every((x) => x.asset !== a.name || x.state === 'Resolved') && <p className="hd-muted">None.</p>}
        </>
      );
    }
  } else if (detail.kind === 'alarm') {
    const a = data.alarms.find((x) => x.id === detail.id);
    if (a) {
      title = a.title;
      sub = `${a.id} · ${a.asset}`;
      body = (
        <>
          <Field k="Severity" v={<Sev s={a.severity} />} />
          <Field k="State" v={<Pill tone={ALARM_TONE[a.state]}>{a.state}</Pill>} />
          <Field k="Raised" v={a.raisedAt} />
          <p className="hd-detail-text">{a.detail}</p>
        </>
      );
      foot = (
        <>
          <button type="button" className="hd-btn is-light hd-btn-sm" disabled={a.state !== 'Open'} onClick={() => setAlarmState(a.id, 'Acknowledged')}>
            Acknowledge
          </button>
          <button type="button" className="hd-btn is-dark hd-btn-sm" disabled={a.state === 'Resolved'} onClick={() => setAlarmState(a.id, 'Resolved')}>
            Resolve
          </button>
        </>
      );
    }
  } else if (detail.kind === 'workOrder') {
    const w = data.workOrders.find((x) => x.id === detail.id);
    if (w) {
      title = w.title;
      sub = `${w.id} · ${w.asset}`;
      body = (
        <>
          <Field k="Priority" v={<Sev s={w.priority} />} />
          <Field k="State" v={<Pill tone={WO_TONE[w.state]}>{w.state}</Pill>} />
          <Field k="Written to" v={w.target === 'CMMS' ? 'Maintenance system' : 'ERP'} />
          <Field k="Due" v={w.due} />
        </>
      );
      foot = (
        <button type="button" className="hd-btn is-dark hd-btn-sm" disabled={w.state === 'Done'} onClick={() => setWorkOrderState(w.id, w.state === 'Draft' ? 'Submitted' : w.state === 'Submitted' ? 'In progress' : 'Done')}>
          {w.state === 'Draft' ? 'Submit' : w.state === 'Submitted' ? 'Start' : w.state === 'In progress' ? 'Mark done' : 'Done'}
        </button>
      );
    }
  } else if (detail.kind === 'approval') {
    const a = data.approvals.find((x) => x.id === detail.id);
    if (a) {
      title = a.title;
      sub = `${a.id} · ${a.asset}`;
      body = (
        <>
          <Field k="Tier" v={a.tier} />
          <Field k="Source" v={a.source} />
          <Field k="Requested" v={a.requestedAt} />
          <Field k="State" v={<Pill tone={APR_TONE[a.state]}>{a.state}</Pill>} />
          <p className="hd-detail-text">A person decides this. The assistant can recommend it but cannot approve it.</p>
        </>
      );
      foot =
        a.state === 'Pending' ? (
          <>
            <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => setApprovalState(a.id, 'Rejected')}>
              Reject
            </button>
            <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => setApprovalState(a.id, 'Approved')}>
              Approve
            </button>
          </>
        ) : null;
    }
  } else if (detail.kind === 'document') {
    const d = data.documents.find((x) => x.id === detail.id);
    if (d) {
      title = d.name;
      sub = d.id;
      body = (
        <>
          <Field k="Type" v={d.kind} />
          <Field k="Asset" v={d.asset} />
          <Field k="Pages" v={d.pages} />
          <Field k="Updated" v={d.updated} />
          <p className="hd-detail-text">Preview and search inside documents arrive with the document API.</p>
        </>
      );
    }
  } else {
    const e = data.events.find((x) => x.id === detail.id);
    if (e) {
      title = e.activity;
      sub = `${e.id} · ${e.asset}`;
      body = (
        <>
          <Field k="Status" v={e.status} />
          <Field k="Asset" v={e.asset} />
          <Field k="When" v={e.at} />
        </>
      );
    }
  }

  if (!title) return null;
  return (
    <div className="hd-drawer-wrap" onClick={close}>
      <aside className="hd-drawer" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header className="hd-drawer-head">
          <div>
            <h3>{title}</h3>
            <small>{sub}</small>
          </div>
          <button type="button" className="hd-icon-btn" aria-label="Close details" onClick={close}>
            <X size={16} />
          </button>
        </header>
        <div className="hd-drawer-body">{body}</div>
        {foot && <footer className="hd-drawer-foot">{foot}</footer>}
      </aside>
    </div>
  );
}

export type { LucideIcon };
