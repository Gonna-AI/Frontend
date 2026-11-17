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
import { formatAgo, formatNumber, localize, useT, useTn } from './i18n';

/* ---------- parts and stock ---------- */

export function PartsView() {
  const t = useT();
  const { data, openDetail, reservePart } = useHive();
  const [q, setQ] = useState('');
  const rows = data.parts.filter((p) => includes(q, p.number, p.name, p.machine, p.location));
  return (
    <PageCard title={t('Parts and stock')} subtitle={t('Stock positions come from the ERP; records older than 7 days are flagged')} actions={<SearchBox value={q} onChange={setQ} label={t('Search parts')} />}>
      <DataTable
        rows={rows}
        onOpen={(r) => openDetail({ kind: 'part', id: r.id })}
        empty={t('No parts match.')}
        card={(r) => ({ icon: Package, title: `${r.number} · ${r.name}`, sub: `${r.machine} · ${r.location}`, pill: <Pill tone={r.onHand - r.reserved < r.min ? 'red' : 'green'}><span>{t('{n} available', { n: r.onHand - r.reserved })}</span></Pill>, meta: t('synced {age}', { age: formatAgo(r.syncedDaysAgo * 86400) }) })}
        cols={[
          { header: t('Part'), sort: (a, b) => a.number.localeCompare(b.number), render: (r) => <span className="hd-strong">{r.number}<small className="hd-sub-line">{r.name}</small></span> },
          { header: t('Machine'), render: (r) => r.machine },
          { header: t('Location'), render: (r) => r.location },
          { header: t('Available'), sort: (a, b) => a.onHand - a.reserved - (b.onHand - b.reserved), render: (r) => <Pill tone={r.onHand - r.reserved < r.min ? 'red' : 'green'}><span>{t('{n} of min {min}', { n: r.onHand - r.reserved, min: r.min })}</span></Pill> },
          { header: t('Stock record'), render: (r) => <span>{t('synced {age}', { age: formatAgo(r.syncedDaysAgo * 86400) })} {r.syncedDaysAgo > 7 && <Pill tone="amber">{t('stale')}</Pill>}</span> },
          { header: '', render: (r) => (
            <button type="button" className="hd-ghost" disabled={r.onHand - r.reserved <= 0} onClick={(e) => { e.stopPropagation(); reservePart(r.id); }}>{t('Reserve')}</button>
          ) },
        ]}
      />
    </PageCard>
  );
}

/* ---------- vendors, RFQs, requisitions ---------- */

export function VendorsView() {
  const t = useT();
  const tn = useTn();
  const { data, decideRequisition, notify } = useHive();
  const [tab, setTab] = useState<'Vendors' | 'RFQs' | 'Requisitions'>('RFQs');
  const [open, setOpen] = useState<string | null>('RFQ_0091');
  return (
    <PageCard title={t('Vendors and RFQs')} subtitle={t('Compare replies by price, lead time and specification match')} actions={<button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => notify(t('Creating RFQs needs the procurement API (placeholder)'))}><Plus size={14} /> {t('New RFQ')}</button>}>
      <Chips options={['Vendors', 'RFQs', 'Requisitions'] as const} value={tab} onChange={setTab} />
      {tab === 'Vendors' && (
        <DataTable
          rows={data.vendors}
          onOpen={() => undefined}
          empty={t('No vendors.')}
          card={(r) => ({ icon: Store, title: r.name, sub: `${r.category} · ${r.country}`, meta: t('{n} days lead time', { n: r.leadTimeDays }) })}
          cols={[
            { header: t('Vendor'), render: (r) => <span className="hd-strong">{r.name}</span> },
            { header: t('Category'), render: (r) => r.category },
            { header: t('Country'), render: (r) => r.country },
            { header: t('Typical lead time'), sort: (a, b) => a.leadTimeDays - b.leadTimeDays, render: (r) => t('{n} days', { n: r.leadTimeDays }) },
          ]}
        />
      )}
      {tab === 'RFQs' && (
        <div className="hd-approvals">
          {data.rfqs.map((r) => (
            <article className="hd-rfq" key={r.id}>
              <button type="button" className="hd-approval-main" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                <span className="hd-strong">{r.part}</span>
                <small>{r.id} · {tn(r.replies.length, '{n} reply', '{n} replies')}</small>
              </button>
              <Pill tone={r.status === 'Replies in' ? 'orange' : 'gray'}>{r.status}</Pill>
              {open === r.id && r.replies.length > 0 && (
                <div className="hd-compare">
                  <table className="hx-table">
                    <thead>
                      <tr><th>{t('Vendor')}</th><th>{t('Price')}</th><th>{t('Lead time')}</th><th>{t('Spec match')}</th></tr>
                    </thead>
                    <tbody>
                      {r.replies.map((x) => (
                        <tr key={x.vendor}>
                          <td data-label={t('Vendor')}>{x.vendor}</td>
                          <td data-label={t('Price')}>{x.price}</td>
                          <td data-label={t('Lead time')}>{x.leadTime}</td>
                          <td data-label={t('Spec match')}><Pill tone={x.specMatch === 'Match' ? 'green' : x.specMatch === 'Partial' ? 'amber' : 'red'}>{x.specMatch}</Pill></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h4 className="hd-subhead">{t('Vendor replies (untrusted text, shown as written)')}</h4>
                  {r.replies.map((x) => (
                    <pre className="hd-untrusted" key={x.vendor}>{x.raw}</pre>
                  ))}
                </div>
              )}
              {open === r.id && r.replies.length === 0 && <p className="hd-muted hd-compare">{t('No replies yet.')}</p>}
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
                  <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => decideRequisition(r.id, 'Rejected')}>{t('Reject')}</button>
                  <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => decideRequisition(r.id, 'Approved')}>{t('Approve')}</button>
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
  const t = useT();
  const { data, openDetail, notify } = useHive();
  const phone = usePhone();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<(typeof DOC_FILTERS)[number]>('All');
  const [machine, setMachine] = useState('All machines');
  const machines = ['All machines', ...new Set(data.documents.map((d) => d.machine))];
  const rows = data.documents.filter((d) => (kind === 'All' || d.kind === kind) && (machine === 'All machines' || d.machine === machine) && includes(q, d.name, d.machine, d.kind, ...d.passages.map((p) => p.text)));
  return (
    <PageCard
      title={t('Documents')}
      subtitle={t('Search across manuals, drawings and procedures. Every passage shows whether it applies to the selected machine.')}
      actions={
        <>
          <SearchBox value={q} onChange={setQ} label={t('Search documents')} />
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => notify(t('Uploads need the document API (placeholder)'))}>
            <Plus size={14} /> {t('Upload')}
          </button>
        </>
      }
    >
      <Chips options={DOC_FILTERS} value={kind} onChange={setKind} />
      <label className="hd-select hd-select-wide">
        <span className="hd-muted">{t('Applies to')}</span>
        <select value={machine} onChange={(e) => setMachine(e.target.value)} aria-label={t('Machine for applicability')}>
          {machines.map((m) => <option key={m} value={m}>{t(m)}</option>)}
        </select>
      </label>
      <div className="hd-doc-grid">
        {rows.map((d) => {
          const hit = q.trim() ? d.passages.find((p) => p.text.toLowerCase().includes(q.trim().toLowerCase())) : undefined;
          return (
            <button type="button" className="hd-doc" key={d.id} onClick={() => openDetail({ kind: 'document', id: d.id })}>
              <span className="hd-doc-icon"><FileText size={18} /></span>
              <b>{d.name}</b>
              <small>{t(d.kind)} · {t('{n} pages · rev. {r}', { n: d.pages, r: d.revision })}</small>
              <small>{d.machine} · {t('updated {date}', { date: localize(d.updated) })}</small>
              {hit && (
                <span className="hd-hit">
                  “{hit.text}” <ApplicabilityBadge verdict={hit.applicability} reason={hit.reason} />
                </span>
              )}
            </button>
          );
        })}
        {rows.length === 0 && <p className="hd-empty">{t('No documents match.')}</p>}
      </div>
      {!phone && <p className="hd-muted hd-fine">{t('Downloads need the document API and follow each document’s access rules.')}</p>}
    </PageCard>
  );
}

/* ---------- findings and predictions ---------- */

const FIND_FILTERS = ['All', 'Awaiting confirmation', 'Confirmed', 'Rejected'] as const;

export function FindingsView() {
  const t = useT();
  const { data, decideFinding } = useHive();
  const [filter, setFilter] = useState<(typeof FIND_FILTERS)[number]>('All');
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const rows = data.findings.filter((f) => filter === 'All' || f.status === filter);
  return (
    <PageCard title={t('Findings and predictions')} subtitle={t('From models, with confidence, version, evidence and age. A person confirms or rejects.')}>
      <Chips options={FIND_FILTERS} value={filter} onChange={setFilter} />
      <div className="hd-findings">
        {rows.map((f) => (
          <article className="hd-finding" key={f.id}>
            <div className="hd-row">
              <b>{f.title}</b>
              <Pill tone={f.status === 'Confirmed' ? 'green' : f.status === 'Rejected' ? 'red' : 'amber'}>{f.status}</Pill>
            </div>
            <small className="hd-muted">{f.id} · {t(f.kind)} · {f.machine} · {t('confidence {n} %', { n: Math.round(f.confidence * 100) })} · {f.model} · {formatAgo(f.ageS)}</small>
            <div className="hd-cites">{f.evidence.map((e) => <CitationChip key={e.label} label={e.label} locator={e.locator} applicability={e.applicability} reason={e.reason} />)}</div>
            {f.reason && <small className="hd-muted">{t('Rejected: {reason}', { reason: f.reason })}</small>}
            {f.status === 'Awaiting confirmation' &&
              (rejecting === f.id ? (
                <div className="hd-inline-form">
                  <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('Reason (required)')} aria-label={t('Reason for rejecting')} />
                  <button type="button" className="hd-btn is-dark hd-btn-sm" disabled={!reason.trim()} onClick={() => { decideFinding(f.id, 'Rejected', reason.trim()); setRejecting(null); setReason(''); }}>{t('Reject')}</button>
                </div>
              ) : (
                <div className="hd-approval-actions">
                  <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => setRejecting(f.id)}>{t('Reject')}</button>
                  <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => decideFinding(f.id, 'Confirmed')}>{t('Confirm')}</button>
                </div>
              ))}
          </article>
        ))}
        {rows.length === 0 && <p className="hd-empty">{t('No findings in this state.')}</p>}
      </div>
    </PageCard>
  );
}

/* ---------- reports ---------- */

function OeeLines({ data }: { data: { label: string; hall1: number; hall2: number; store: number }[] }) {
  const t = useT();
  const w = 360;
  const h = 150;
  const min = 60;
  const max = 95;
  const x = (i: number) => 12 + (i * (w - 24)) / (data.length - 1);
  const y = (v: number) => h - 18 - ((v - min) / (max - min)) * (h - 30);
  const line = (k: 'hall1' | 'hall2' | 'store') => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="hd-lines" role="img" aria-label={t('Weekly OEE by site for the last eight weeks (placeholder)')}>
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
  const t = useT();
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
    notify(t('Downloaded placeholder KPI CSV'));
  };
  return (
    <>
      <Note icon={Package}>{t('KPIs are shown by site, line or machine only, never by person. Period: last 7 days, computed 12 minutes ago (placeholder).')}</Note>
      <PageCard
        title={t('Reports')}
        subtitle={t('OEE and its factors')}
        actions={
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={download}>
            <Download size={14} /> {t('CSV')}
          </button>
        }
      >
        <Chips options={['Site', 'Line', 'Machine'] as const} value={scope} onChange={setScope} />
        <DataTable
          rows={rows.map((r) => ({ ...r, id: r.name }))}
          onOpen={() => undefined}
          empty={t('No data.')}
          card={(r) => ({ icon: Package, title: r.name, sub: t('Availability {a} % · Performance {p} % · Quality {q} %', { a: formatNumber(r.availability, 1), p: formatNumber(r.performance, 1), q: formatNumber(r.quality, 1) }), pill: <Pill tone="orange">OEE {formatNumber(r.oee, 1)} %</Pill>, meta: t('{n} min downtime', { n: r.downtimeMin }) })}
          cols={[
            { header: t(scope), render: (r) => <span className="hd-strong">{r.name}</span> },
            { header: t('OEE %'), sort: (a, b) => a.oee - b.oee, render: (r) => r.oee.toFixed(1) },
            { header: t('Availability %'), sort: (a, b) => a.availability - b.availability, render: (r) => r.availability.toFixed(1) },
            { header: t('Performance %'), render: (r) => r.performance.toFixed(1) },
            { header: t('Quality %'), render: (r) => r.quality.toFixed(1) },
            { header: t('Downtime (min)'), sort: (a, b) => a.downtimeMin - b.downtimeMin, render: (r) => r.downtimeMin },
          ]}
        />
        <div className="hd-report-grid">
          <div className="hd-panel">
            <div className="hd-chart-head">
              <span>{t('OEE by site, %')}</span>
              <span className="hd-legend">
                <i className="hd-dot is-orange" /> {t('Halle 1')}
                <i className="hd-dot is-black" /> {t('Halle 2')}
                <i className="hd-dot is-gray" /> {t('Lager')}
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
