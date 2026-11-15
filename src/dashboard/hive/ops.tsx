import { Bell, ClipboardList, Cpu, ShieldCheck, Sparkles, X } from 'lucide-react-dash';
import { useState } from 'react';

import {
  ApplicabilityBadge,
  Chips,
  CitationChip,
  DataTable,
  Field,
  includes,
  Note,
  PageCard,
  Pill,
  SearchBox,
  Sev,
  StatRow,
  type Tone,
} from './common';
import type { AlarmState, ApprovalState, Severity, WorkOrderState } from './placeholder';
import { useHive } from './store';

export const ALARM_TONE: Record<AlarmState, Tone> = { Open: 'red', Acknowledged: 'amber', Resolved: 'green' };
export const WO_TONE: Record<WorkOrderState, Tone> = { Draft: 'gray', Submitted: 'amber', 'In progress': 'orange', Done: 'green' };
export const APR_TONE: Record<ApprovalState, Tone> = { Pending: 'amber', Approved: 'green', Rejected: 'red' };
export const SEV_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

/* ---------- alarms ---------- */

const ALARM_FILTERS = ['All', 'Open', 'Acknowledged', 'Resolved'] as const;

export function AlarmsView({ go }: { go: (section: string) => void }) {
  const { data, openDetail } = useHive();
  const [q, setQ] = useState('');
  const [state, setState] = useState<(typeof ALARM_FILTERS)[number]>('All');
  const open = data.alarms.filter((a) => a.state === 'Open');
  const counts = { All: data.alarms.length, Open: open.length, Acknowledged: data.alarms.filter((a) => a.state === 'Acknowledged').length, Resolved: data.alarms.filter((a) => a.state === 'Resolved').length };
  const rows = data.alarms.filter((a) => (state === 'All' || a.state === state) && includes(q, a.id, a.title, a.machine, a.severity));
  return (
    <>
      <StatRow
        items={[
          { label: 'Open', value: String(counts.Open), tone: 'orange' },
          { label: 'Critical open', value: String(open.filter((a) => a.severity === 'critical').length) },
          { label: 'Acknowledged', value: String(counts.Acknowledged) },
          { label: 'Resolved', value: String(counts.Resolved) },
        ]}
      />
      <PageCard title="Alarms" subtitle="Raised by rules on live signals. Not a replacement for the plant’s safety systems." actions={<SearchBox value={q} onChange={setQ} label="Search alarms" />}>
        <Chips options={ALARM_FILTERS} value={state} onChange={setState} counts={counts} />
        <DataTable
          rows={rows}
          onOpen={(r) => openDetail({ kind: 'alarm', id: r.id })}
          empty="No alarms match."
          card={(r) => ({ icon: Bell, title: r.title, sub: `${r.machine}${r.component ? ' · ' + r.component : ''}`, pill: <Pill tone={ALARM_TONE[r.state]}>{r.state}</Pill>, meta: r.severity, time: r.time })}
          cols={[
            { header: 'ID', render: (r) => r.id },
            { header: 'Alarm', render: (r) => <span className="hd-strong">{r.title}</span> },
            { header: 'Machine', sort: (a, b) => a.machine.localeCompare(b.machine), render: (r) => (
              <button type="button" className="hd-link" onClick={(e) => { e.stopPropagation(); if (r.machineId) go(`machines/${r.machineId}`); }}>{r.machine}</button>
            ) },
            { header: 'Severity', sort: (a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity], render: (r) => <Sev s={r.severity} /> },
            { header: 'State', render: (r) => <Pill tone={ALARM_TONE[r.state]}>{r.state}</Pill> },
            { header: 'Raised', render: (r) => r.raisedAt },
          ]}
        />
      </PageCard>
    </>
  );
}

/* ---------- work orders ---------- */

const WO_FILTERS = ['All', 'Draft', 'Submitted', 'In progress', 'Done'] as const;

export function WorkOrdersView() {
  const { data, openDetail, notify } = useHive();
  const [q, setQ] = useState('');
  const [state, setState] = useState<(typeof WO_FILTERS)[number]>('All');
  const counts = Object.fromEntries(WO_FILTERS.map((f) => [f, f === 'All' ? data.workOrders.length : data.workOrders.filter((w) => w.state === f).length])) as Record<(typeof WO_FILTERS)[number], number>;
  const rows = data.workOrders.filter((w) => (state === 'All' || w.state === state) && includes(q, w.id, w.title, w.machine));
  return (
    <PageCard
      title="Work orders"
      subtitle="Drafted here, written to the maintenance or ERP system after a person approves"
      actions={
        <>
          <SearchBox value={q} onChange={setQ} label="Search work orders" />
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => notify('Creating work orders needs the work-order API (placeholder)')}>
            New
          </button>
        </>
      }
    >
      <Chips options={WO_FILTERS} value={state} onChange={setState} counts={counts} />
      <DataTable
        rows={rows}
        onOpen={(r) => openDetail({ kind: 'workOrder', id: r.id })}
        empty="No work orders match."
        card={(r) => ({ icon: ClipboardList, title: r.title, sub: `${r.id} · ${r.machine}`, pill: <Pill tone={WO_TONE[r.state]}>{r.state}</Pill>, meta: `Due ${r.due}` })}
        cols={[
          { header: 'ID', render: (r) => r.id },
          { header: 'Work order', render: (r) => <span className="hd-strong">{r.title}</span> },
          { header: 'Machine', sort: (a, b) => a.machine.localeCompare(b.machine), render: (r) => r.machine },
          { header: 'Priority', sort: (a, b) => SEV_RANK[a.priority] - SEV_RANK[b.priority], render: (r) => <Sev s={r.priority} /> },
          { header: 'System', render: (r) => r.target },
          { header: 'State', render: (r) => <Pill tone={WO_TONE[r.state]}>{r.state}</Pill> },
          { header: 'Due', render: (r) => r.due },
        ]}
      />
    </PageCard>
  );
}

/* ---------- inbox: approvals and notifications ---------- */

function ReviewDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, setApprovalState } = useHive();
  const a = data.approvals.find((x) => x.id === id);
  const [ack, setAck] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  if (!a) return null;
  const pending = a.state === 'Pending';
  return (
    <div className="hd-drawer-wrap" onClick={onClose}>
      <aside className="hd-drawer" role="dialog" aria-modal="true" aria-label={a.title} onClick={(e) => e.stopPropagation()}>
        <header className="hd-drawer-head">
          <div>
            <h3>{a.title}</h3>
            <small>
              {a.id} · {a.machine} · {a.source}
            </small>
          </div>
          <button type="button" className="hd-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        <div className="hd-drawer-body">
          <Note icon={ShieldCheck}>{a.summary}</Note>
          <Field k="Tier" v={a.tier} />
          <Field k="State" v={<Pill tone={APR_TONE[a.state]}>{a.state}</Pill>} />
          <Field k="Requested" v={a.requestedAt} />
          {a.fields.map((f) => (
            <Field key={f.k} k={f.k} v={f.v} />
          ))}
          <h4>Evidence</h4>
          {a.evidence.length === 0 && <p className="hd-muted">No evidence attached.</p>}
          <div className="hd-cites">
            {a.evidence.map((e) => (
              <CitationChip key={e.label} label={e.label} locator={e.locator} applicability={e.applicability} reason={e.reason} />
            ))}
          </div>
          {a.rejectReason && <p className="hd-detail-text">Rejected: {a.rejectReason}</p>}
          <p className="hd-detail-text">A person decides this. The assistant can recommend it but cannot approve it.</p>
        </div>
        {pending && (
          <footer className="hd-drawer-foot is-col">
            {rejecting ? (
              <div className="hd-inline-form">
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" aria-label="Reason for rejecting" />
                <button type="button" className="hd-btn is-dark hd-btn-sm" disabled={!reason.trim()} onClick={() => { setApprovalState(a.id, 'Rejected', reason.trim()); onClose(); }}>
                  Reject
                </button>
              </div>
            ) : (
              <>
                <label className="hd-check">
                  <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> I reviewed the evidence above
                </label>
                <div className="hd-approval-actions">
                  <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => setRejecting(true)}>Reject</button>
                  <button type="button" className="hd-btn is-dark hd-btn-sm" disabled={!ack} onClick={() => { setApprovalState(a.id, 'Approved'); onClose(); }}>Approve</button>
                </div>
              </>
            )}
          </footer>
        )}
      </aside>
    </div>
  );
}

export function InboxView({ go }: { go: (section: string) => void }) {
  const { data, markRead, markAllRead } = useHive();
  const [tab, setTab] = useState<'Approvals' | 'Notifications'>('Approvals');
  const [review, setReview] = useState<string | null>(null);
  const pending = data.approvals.filter((a) => a.state === 'Pending');
  const unread = data.notifications.filter((n) => !n.read).length;
  return (
    <>
      <Note icon={ShieldCheck}>
        Approvals are decisions for people. An assistant can recommend an action, but it never approves one. Only low-risk business-system actions (tier T1) appear here; nothing on this page can reach a machine.
      </Note>
      <PageCard
        title="Inbox"
        subtitle={`${pending.length} approvals waiting · ${unread} unread`}
        actions={tab === 'Notifications' ? <button type="button" className="hd-ghost" onClick={markAllRead}>Mark all read</button> : undefined}
      >
        <Chips options={['Approvals', 'Notifications'] as const} value={tab} onChange={setTab} counts={{ Approvals: pending.length, Notifications: unread }} />
        {tab === 'Approvals' ? (
          <div className="hd-approvals">
            {data.approvals.map((a) => (
              <article className="hd-approval" key={a.id}>
                <button type="button" className="hd-approval-main" onClick={() => setReview(a.id)}>
                  <span className="hd-strong">{a.title}</span>
                  <small>
                    {a.id} · {a.machine} · {a.source} · {a.requestedAt}
                  </small>
                </button>
                <Pill tone="gray">{a.tier}</Pill>
                {a.state === 'Pending' ? (
                  <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => setReview(a.id)}>Review</button>
                ) : (
                  <Pill tone={APR_TONE[a.state]}>{a.state}</Pill>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="hd-approvals">
            {data.notifications.map((n) => (
              <article className={`hd-approval${n.read ? '' : ' is-unread'}`} key={n.id}>
                <button
                  type="button"
                  className="hd-approval-main"
                  onClick={() => {
                    markRead(n.id);
                    if (n.to.section === 'inbox' && n.to.id) {
                      setTab('Approvals');
                      setReview(n.to.id);
                    } else go(n.to.section);
                  }}
                >
                  <span className="hd-strong">{n.text}</span>
                  <small>{n.at}</small>
                </button>
                {!n.read && <Pill tone="orange">New</Pill>}
              </article>
            ))}
          </div>
        )}
      </PageCard>
      {review && <ReviewDialog id={review} onClose={() => setReview(null)} />}
    </>
  );
}

/* ---------- activity ---------- */

const FEED_FILTERS = ['All', 'alarm', 'work_order', 'approval', 'gateway', 'document'] as const;
const FEED_LABEL = { All: 'All', alarm: 'Alarms', work_order: 'Work orders', approval: 'Approvals', gateway: 'Gateways', document: 'Documents' } as const;

export function ActivityView() {
  const { data } = useHive();
  const [kind, setKind] = useState<(typeof FEED_FILTERS)[number]>('All');
  const items = data.feed.filter((f) => kind === 'All' || f.kind === kind);
  const days = [...new Set(items.map((i) => i.day))];
  return (
    <PageCard title="Activity" subtitle="What happened across the plant, newest first. Events show the action and time, never a person.">
      <Chips options={FEED_FILTERS} value={kind} onChange={setKind} labels={FEED_LABEL} />
      {days.map((day) => (
        <div key={day} className="hd-day">
          <h3>{day}</h3>
          <ol className="hd-timeline">
            {items.filter((i) => i.day === day).map((i) => (
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

/* ---------- detail drawer (alarm, work order, document, event, part) ---------- */

export function DetailDrawer({ go }: { go: (section: string) => void }) {
  const { data, detail, openDetail, setAlarmState, setWorkOrderState } = useHive();
  if (!detail) return null;
  const close = () => openDetail(null);

  let title = '';
  let sub = '';
  let body: React.ReactNode = null;
  let foot: React.ReactNode = null;

  if (detail.kind === 'alarm') {
    const a = data.alarms.find((x) => x.id === detail.id);
    if (a) {
      title = a.title;
      sub = `${a.id} · ${a.machine}`;
      body = (
        <>
          <Field k="Severity" v={<Sev s={a.severity} />} />
          <Field k="State" v={<Pill tone={ALARM_TONE[a.state]}>{a.state}</Pill>} />
          <Field k="Where" v={`${a.machine}${a.component ? ' · ' + a.component : ''}`} />
          {a.value && <Field k="Value / limit" v={`${a.value} / ${a.limit}`} />}
          <Field k="Raised" v={a.raisedAt} />
          <p className="hd-detail-text">{a.detail}</p>
          <div className="hd-link-actions">
            <button type="button" className="hd-ghost" onClick={() => { close(); go(`machines/${a.machineId}`); }}><Cpu size={12} /> Open machine</button>
            <button type="button" className="hd-ghost" onClick={() => { close(); go('assistant'); }}><Sparkles size={12} /> Ask assistant</button>
          </div>
        </>
      );
      foot = (
        <>
          <button type="button" className="hd-btn is-light hd-btn-lg" disabled={a.state !== 'Open'} onClick={() => setAlarmState(a.id, 'Acknowledged')}>
            Acknowledge
          </button>
          <button type="button" className="hd-btn is-dark hd-btn-lg" disabled={a.state === 'Resolved'} onClick={() => setAlarmState(a.id, 'Resolved')}>
            Resolve
          </button>
        </>
      );
    }
  } else if (detail.kind === 'workOrder') {
    const w = data.workOrders.find((x) => x.id === detail.id);
    if (w) {
      title = w.title;
      sub = `${w.id} · ${w.machine}`;
      body = (
        <>
          <Field k="Priority" v={<Sev s={w.priority} />} />
          <Field k="State" v={<Pill tone={WO_TONE[w.state]}>{w.state}</Pill>} />
          <Field k="Written to" v={w.target === 'CMMS' ? 'Maintenance system' : 'ERP'} />
          <Field k="Due" v={w.due} />
          <h4>Parts</h4>
          {w.parts.length ? w.parts.map((p) => <p className="hd-detail-text" key={p}>{p}</p>) : <p className="hd-muted">None.</p>}
          <h4>Evidence</h4>
          {w.evidence.length ? w.evidence.map((p) => <p className="hd-detail-text" key={p}>{p}</p>) : <p className="hd-muted">None.</p>}
        </>
      );
      foot = (
        <button type="button" className="hd-btn is-dark hd-btn-sm" disabled={w.state === 'Done'} onClick={() => setWorkOrderState(w.id, w.state === 'Draft' ? 'Submitted' : w.state === 'Submitted' ? 'In progress' : 'Done')}>
          {w.state === 'Draft' ? 'Submit' : w.state === 'Submitted' ? 'Start' : w.state === 'In progress' ? 'Complete' : 'Done'}
        </button>
      );
    }
  } else if (detail.kind === 'document') {
    const d = data.documents.find((x) => x.id === detail.id);
    if (d) {
      title = d.name;
      sub = `${d.id} · revision ${d.revision}`;
      body = (
        <>
          <Field k="Type" v={d.kind} />
          <Field k="Machine" v={d.machine} />
          <Field k="Pages" v={d.pages} />
          <Field k="Updated" v={d.updated} />
          <h4>Passages</h4>
          {d.passages.filter((p) => p.applicability !== 'does_not_apply').map((p) => (
            <p className="hd-passage" key={p.text}>
              <span>{p.text}</span>
              <small>p. {p.page} <ApplicabilityBadge verdict={p.applicability} reason={p.reason} /></small>
            </p>
          ))}
          {d.passages.some((p) => p.applicability === 'does_not_apply') && (
            <details className="hd-excluded">
              <summary>Excluded passages</summary>
              {d.passages.filter((p) => p.applicability === 'does_not_apply').map((p) => (
                <p className="hd-passage" key={p.text}>
                  <span>{p.text}</span>
                  <small>p. {p.page} <ApplicabilityBadge verdict={p.applicability} reason={p.reason} /></small>
                </p>
              ))}
            </details>
          )}
        </>
      );
    }
  } else if (detail.kind === 'part') {
    const p = data.parts.find((x) => x.id === detail.id);
    if (p) {
      title = `${p.number} · ${p.name}`;
      sub = p.machine;
      body = (
        <>
          <Field k="On hand" v={p.onHand} />
          <Field k="Reserved" v={p.reserved} />
          <Field k="Minimum" v={p.min} />
          <Field k="Location" v={p.location} />
          <Field k="Stock record" v={`synced ${p.syncedDaysAgo} d ago${p.syncedDaysAgo > 7 ? ' (stale)' : ''}`} />
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
          <Field k="Where" v={e.asset} />
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

