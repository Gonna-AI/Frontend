import { Download, FileText, Package, Plus, Store } from 'lucide-react-dash';
import { useState } from 'react';

import { AlarmChart } from './OverviewView';
import {
  ApplicabilityBadge,
  Chips,
  CitationChip,
  DataTable,
  includes,
  Note,
  PageCard,
  Pill,
  SearchBox,
  usePhone,
} from './common';
import { useHive } from './store';

/* ---------- parts and stock ---------- */

export function PartsView() {
  const { data, openDetail, reservePart } = useHive();
  const [q, setQ] = useState('');
  const rows = data.parts.filter((p) => includes(q, p.number, p.name, p.machine, p.location));
  return (
    <PageCard title="Parts and stock" subtitle="Stock positions come from the ERP; records older than 7 days are flagged" actions={<SearchBox value={q} onChange={setQ} label="Search parts" />}>
      <DataTable
        rows={rows}
        onOpen={(r) => openDetail({ kind: 'part', id: r.id })}
        empty="No parts match."
        card={(r) => ({ icon: Package, title: `${r.number} · ${r.name}`, sub: `${r.machine} · ${r.location}`, pill: <Pill tone={r.onHand - r.reserved < r.min ? 'red' : 'green'}>{r.onHand - r.reserved} available</Pill>, meta: `synced ${r.syncedDaysAgo} d ago` })}
        cols={[
          { header: 'Part', sort: (a, b) => a.number.localeCompare(b.number), render: (r) => <span className="hd-strong">{r.number}<small className="hd-sub-line">{r.name}</small></span> },
          { header: 'Machine', render: (r) => r.machine },
          { header: 'Location', render: (r) => r.location },
          { header: 'Available', sort: (a, b) => a.onHand - a.reserved - (b.onHand - b.reserved), render: (r) => <Pill tone={r.onHand - r.reserved < r.min ? 'red' : 'green'}>{r.onHand - r.reserved} of min {r.min}</Pill> },
          { header: 'Stock record', render: (r) => <span>synced {r.syncedDaysAgo} d ago {r.syncedDaysAgo > 7 && <Pill tone="amber">stale</Pill>}</span> },
          { header: '', render: (r) => (
            <button type="button" className="hd-ghost" disabled={r.onHand - r.reserved <= 0} onClick={(e) => { e.stopPropagation(); reservePart(r.id); }}>Reserve</button>
          ) },
        ]}
      />
    </PageCard>
  );
}

/* ---------- vendors, RFQs, requisitions ---------- */

export function VendorsView() {
  const { data, decideRequisition, notify } = useHive();
  const [tab, setTab] = useState<'Vendors' | 'RFQs' | 'Requisitions'>('RFQs');
  const [open, setOpen] = useState<string | null>('RFQ_0091');
  return (
    <PageCard title="Vendors and RFQs" subtitle="Compare replies by price, lead time and specification match" actions={<button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => notify('Creating RFQs needs the procurement API (placeholder)')}><Plus size={14} /> New RFQ</button>}>
      <Chips options={['Vendors', 'RFQs', 'Requisitions'] as const} value={tab} onChange={setTab} />
      {tab === 'Vendors' && (
        <DataTable
          rows={data.vendors}
          onOpen={() => undefined}
          empty="No vendors."
          card={(r) => ({ icon: Store, title: r.name, sub: `${r.category} · ${r.country}`, meta: `${r.leadTimeDays} days lead time` })}
          cols={[
            { header: 'Vendor', render: (r) => <span className="hd-strong">{r.name}</span> },
            { header: 'Category', render: (r) => r.category },
            { header: 'Country', render: (r) => r.country },
            { header: 'Typical lead time', sort: (a, b) => a.leadTimeDays - b.leadTimeDays, render: (r) => `${r.leadTimeDays} days` },
          ]}
        />
      )}
      {tab === 'RFQs' && (
        <div className="hd-approvals">
          {data.rfqs.map((r) => (
            <article className="hd-rfq" key={r.id}>
              <button type="button" className="hd-approval-main" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                <span className="hd-strong">{r.part}</span>
                <small>{r.id} · {r.replies.length} replies</small>
              </button>
              <Pill tone={r.status === 'Replies in' ? 'orange' : 'gray'}>{r.status}</Pill>
              {open === r.id && r.replies.length > 0 && (
                <div className="hd-compare">
                  <table className="hd-table">
                    <thead>
                      <tr><th>Vendor</th><th>Price</th><th>Lead time</th><th>Spec match</th></tr>
                    </thead>
                    <tbody>
                      {r.replies.map((x) => (
                        <tr key={x.vendor}>
                          <td>{x.vendor}</td>
                          <td>{x.price}</td>
                          <td>{x.leadTime}</td>
                          <td><Pill tone={x.specMatch === 'Match' ? 'green' : x.specMatch === 'Partial' ? 'amber' : 'red'}>{x.specMatch}</Pill></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h4 className="hd-subhead">Vendor replies (untrusted text, shown as written)</h4>
                  {r.replies.map((x) => (
                    <pre className="hd-untrusted" key={x.vendor}>{x.raw}</pre>
                  ))}
                </div>
              )}
              {open === r.id && r.replies.length === 0 && <p className="hd-muted hd-compare">No replies yet.</p>}
            </article>
          ))}
        </div>
      )}
      {tab === 'Requisitions' && (
        <div className="hd-approvals">
          {data.requisitions.map((r) => (
            <article className="hd-approval" key={r.id}>
              <span className="hd-approval-main">
                <span className="hd-strong">{r.part}</span>
                <small>{r.id} · {r.vendor} · {r.total}</small>
              </span>
              {r.state === 'Pending approval' ? (
                <span className="hd-approval-actions">
                  <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => decideRequisition(r.id, 'Rejected')}>Reject</button>
                  <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => decideRequisition(r.id, 'Approved')}>Approve</button>
                </span>
              ) : (
                <Pill tone={r.state === 'Approved' ? 'green' : r.state === 'Rejected' ? 'red' : 'gray'}>{r.state}</Pill>
              )}
            </article>
          ))}
        </div>
      )}
    </PageCard>
  );
}

/* ---------- documents ---------- */

const DOC_FILTERS = ['All', 'Manual', 'Drawing', 'SOP', 'Report'] as const;

export function DocumentsView() {
  const { data, openDetail, notify } = useHive();
  const phone = usePhone();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<(typeof DOC_FILTERS)[number]>('All');
  const [machine, setMachine] = useState('All machines');
  const machines = ['All machines', ...new Set(data.documents.map((d) => d.machine))];
  const rows = data.documents.filter((d) => (kind === 'All' || d.kind === kind) && (machine === 'All machines' || d.machine === machine) && includes(q, d.name, d.machine, d.kind, ...d.passages.map((p) => p.text)));
  return (
    <PageCard
      title="Documents"
      subtitle="Search across manuals, drawings and procedures. Every passage shows whether it applies to the selected machine."
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
      <label className="hd-select hd-select-wide">
        <span className="hd-muted">Applies to</span>
        <select value={machine} onChange={(e) => setMachine(e.target.value)} aria-label="Machine for applicability">
          {machines.map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <div className="hd-doc-grid">
        {rows.map((d) => {
          const hit = q.trim() ? d.passages.find((p) => p.text.toLowerCase().includes(q.trim().toLowerCase())) : undefined;
          return (
            <button type="button" className="hd-doc" key={d.id} onClick={() => openDetail({ kind: 'document', id: d.id })}>
              <span className="hd-doc-icon"><FileText size={18} /></span>
              <b>{d.name}</b>
              <small>{d.kind} · {d.pages} pages · rev. {d.revision}</small>
              <small>{d.machine} · updated {d.updated}</small>
              {hit && (
                <span className="hd-hit">
                  “{hit.text}” <ApplicabilityBadge verdict={hit.applicability} reason={hit.reason} />
                </span>
              )}
            </button>
          );
        })}
        {rows.length === 0 && <p className="hd-empty">No documents match.</p>}
      </div>
      {!phone && <p className="hd-muted hd-fine">Downloads need the document API and follow each document’s access rules.</p>}
    </PageCard>
  );
}

/* ---------- findings and predictions ---------- */

const FIND_FILTERS = ['All', 'Awaiting confirmation', 'Confirmed', 'Rejected'] as const;

export function FindingsView() {
  const { data, decideFinding } = useHive();
  const [filter, setFilter] = useState<(typeof FIND_FILTERS)[number]>('All');
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const rows = data.findings.filter((f) => filter === 'All' || f.status === filter);
  return (
    <PageCard title="Findings and predictions" subtitle="From models, with confidence, version, evidence and age. A person confirms or rejects.">
      <Chips options={FIND_FILTERS} value={filter} onChange={setFilter} />
      <div className="hd-findings">
        {rows.map((f) => (
          <article className="hd-finding" key={f.id}>
            <div className="hd-row">
              <b>{f.title}</b>
              <Pill tone={f.status === 'Confirmed' ? 'green' : f.status === 'Rejected' ? 'red' : 'amber'}>{f.status}</Pill>
            </div>
            <small className="hd-muted">{f.id} · {f.kind} · {f.machine} · confidence {Math.round(f.confidence * 100)}% · {f.model} · {f.age} ago</small>
            <div className="hd-cites">{f.evidence.map((e) => <CitationChip key={e.label} label={e.label} locator={e.locator} applicability={e.applicability} reason={e.reason} />)}</div>
            {f.reason && <small className="hd-muted">Rejected: {f.reason}</small>}
            {f.status === 'Awaiting confirmation' &&
              (rejecting === f.id ? (
                <div className="hd-inline-form">
                  <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" aria-label="Reason for rejecting" />
                  <button type="button" className="hd-btn is-dark hd-btn-sm" disabled={!reason.trim()} onClick={() => { decideFinding(f.id, 'Rejected', reason.trim()); setRejecting(null); setReason(''); }}>Reject</button>
                </div>
              ) : (
                <div className="hd-approval-actions">
                  <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => setRejecting(f.id)}>Reject</button>
                  <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => decideFinding(f.id, 'Confirmed')}>Confirm</button>
                </div>
              ))}
          </article>
        ))}
        {rows.length === 0 && <p className="hd-empty">No findings in this state.</p>}
      </div>
    </PageCard>
  );
}

/* ---------- reports ---------- */

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
  const [scope, setScope] = useState<'Site' | 'Line' | 'Machine'>('Site');
  const rows = data.kpis.filter((k) => k.scope === scope);
  const download = () => {
    const lines = [`${scope.toLowerCase()},oee,availability,performance,quality,downtime_min`, ...rows.map((r) => `${r.name},${r.oee},${r.availability},${r.performance},${r.quality},${r.downtimeMin}`)];
    const url = URL.createObjectURL(new Blob([lines.join('\n') + '\n'], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `hive-kpis-by-${scope.toLowerCase()}-placeholder.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Downloaded placeholder KPI CSV');
  };
  return (
    <>
      <Note icon={Package}>KPIs are shown by site, line or machine only, never by person. Period: last 7 days, computed 12 minutes ago (placeholder).</Note>
      <PageCard
        title="Reports"
        subtitle="OEE and its factors"
        actions={
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={download}>
            <Download size={14} /> CSV
          </button>
        }
      >
        <Chips options={['Site', 'Line', 'Machine'] as const} value={scope} onChange={setScope} />
        <DataTable
          rows={rows.map((r) => ({ ...r, id: r.name }))}
          onOpen={() => undefined}
          empty="No data."
          card={(r) => ({ icon: Package, title: r.name, sub: `Availability ${r.availability}% · Performance ${r.performance}% · Quality ${r.quality}%`, pill: <Pill tone="orange">OEE {r.oee}%</Pill>, meta: `${r.downtimeMin} min downtime` })}
          cols={[
            { header: scope, render: (r) => <span className="hd-strong">{r.name}</span> },
            { header: 'OEE %', sort: (a, b) => a.oee - b.oee, render: (r) => r.oee.toFixed(1) },
            { header: 'Availability %', sort: (a, b) => a.availability - b.availability, render: (r) => r.availability.toFixed(1) },
            { header: 'Performance %', render: (r) => r.performance.toFixed(1) },
            { header: 'Quality %', render: (r) => r.quality.toFixed(1) },
            { header: 'Downtime (min)', sort: (a, b) => a.downtimeMin - b.downtimeMin, render: (r) => r.downtimeMin },
          ]}
        />
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
