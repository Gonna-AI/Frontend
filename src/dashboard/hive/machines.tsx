import { ArrowLeft, Cpu, Info, Lock, Plus, Sparkles } from 'lucide-react-dash';
import { useEffect, useMemo, useState } from 'react';

import {
  ApplicabilityBadge,
  CitationChip,
  Chips,
  Field,
  formatAge,
  LiveValue,
  MobileCard,
  Note,
  PageCard,
  Pill,
  SearchBox,
  Sev,
  StateBadge,
  usePhone,
  includes,
} from './common';
import { MACHINE_STATES, STATE_LABEL, type HiveMachine, type MachineState } from './placeholder';
import { useHive } from './store';

type StateFilter = 'all' | MachineState;
const FILTERS: StateFilter[] = ['all', ...MACHINE_STATES];

/* ---------- list ---------- */

export function MachinesView({ go, site }: { go: (section: string) => void; site: string | null }) {
  const { data } = useHive();
  const phone = usePhone();
  const [q, setQ] = useState('');
  const [state, setState] = useState<StateFilter>('all');

  const scoped = data.machines.filter((m) => !site || m.site === site);
  const counts = useMemo(() => {
    const c: Partial<Record<StateFilter, number>> = { all: scoped.length };
    for (const st of MACHINE_STATES) c[st] = scoped.filter((m) => m.state === st).length;
    return c;
  }, [scoped]);
  const rows = scoped.filter((m) => (state === 'all' || m.state === state) && includes(q, m.key, m.name, m.type, m.line));

  const groups = useMemo(() => {
    const map = new Map<string, HiveMachine[]>();
    for (const m of rows) map.set(`${m.area} · ${m.line}`, [...(map.get(`${m.area} · ${m.line}`) ?? []), m]);
    return [...map.entries()];
  }, [rows]);

  const labels = { all: 'All', ...STATE_LABEL } as Record<StateFilter, string>;

  return (
    <PageCard
      title="Machines"
      subtitle={site ? `Showing ${site}` : 'Grouped by area and line, with the age of every state'}
      actions={<SearchBox value={q} onChange={setQ} label="Search machines" />}
    >
      <Chips options={FILTERS} value={state} onChange={setState} counts={counts} labels={labels} />
      {groups.map(([group, ms]) => (
        <div className="hd-group" key={group}>
          <h3>{group}</h3>
          {phone ? (
            <div className="hd-mlist">
              {ms.map((m) => (
                <MobileCard key={m.id} onClick={() => go(`machines/${m.id}`)} spec={{ icon: Cpu, title: m.key, sub: `${m.type} · ${m.site}`, pill: <StateBadge state={m.state} ageS={m.stateAgeS} />, meta: m.openAlarms ? `${m.openAlarms} open alarm${m.openAlarms > 1 ? 's' : ''}` : m.oee ? `OEE ${m.oee.toFixed(1)}%` : '' }} />
              ))}
            </div>
          ) : (
            <div className="hd-machine-grid">
              {ms.map((m) => (
                <button type="button" key={m.id} className="hd-machine" onClick={() => go(`machines/${m.id}`)}>
                  <div className="hd-row">
                    <b>{m.key}</b>
                    {m.openAlarms > 0 && <span className="hd-count-dot">{m.openAlarms}</span>}
                  </div>
                  <small>{m.type}</small>
                  <StateBadge state={m.state} ageS={m.stateAgeS} />
                  <span className="hd-machine-meta">{m.oee ? `OEE ${m.oee.toFixed(1)}%` : 'OEE not available'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {groups.length === 0 && <p className="hd-empty">No machines match.</p>}
    </PageCard>
  );
}

/* ---------- detail ---------- */

const RANGES = ['15 min', '1 hour', '1 shift', '24 hours', '7 days'] as const;
const TABS = ['History', 'Documents', 'Findings', 'Work', 'Actions'] as const;

function seeded(i: number, n: number, base: number, amp: number): number[] {
  return Array.from({ length: n }, (_, k) => base + Math.sin((k + i * 7) / 5) * amp * 0.6 + Math.sin((k + i * 3) / 2.3) * amp * 0.25);
}

function HistoryChart({ machine, signals, range }: { machine: HiveMachine; signals: string[]; range: string }) {
  const w = 640;
  const h = 200;
  const n = 60;
  const chosen = machine.signals.filter((s) => signals.includes(s.key));
  const colors = ['var(--hd-orange)', 'var(--hd-text)', '#a9a9ad', '#e8a317'];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="hd-lines" role="img" aria-label={`History of ${chosen.map((s) => s.label).join(', ')} over ${range} (placeholder)`}>
      {[0, 1, 2, 3].map((t) => (
        <line key={t} x1="0" x2={w} y1={20 + t * 50} y2={20 + t * 50} className="hd-gridline" />
      ))}
      {chosen.map((s, i) => {
        const base = s.value || 1;
        const pts = seeded(i + range.length, n, base, Math.max(base * 0.08, 0.5));
        const lo = Math.min(...pts);
        const hi = Math.max(...pts);
        const span = hi - lo || 1;
        const d = pts.map((v, k) => `${k ? 'L' : 'M'}${((k / (n - 1)) * (w - 8) + 4).toFixed(1)},${(h - 24 - ((v - lo) / span) * (h - 60)).toFixed(1)}`).join(' ');
        return <path key={s.key} d={d} className="hd-line" style={{ stroke: colors[i % colors.length] }} />;
      })}
    </svg>
  );
}

const TIMELINE: Record<string, { state: MachineState; w: number }[]> = {
  ast_cnc07: [{ state: 'producing', w: 46 }, { state: 'idle', w: 8 }, { state: 'producing', w: 28 }, { state: 'unplanned_stop', w: 6 }, { state: 'fault', w: 12 }],
};

export function MachineDetail({ id, go }: { id: string; go: (section: string) => void }) {
  const { data, notes, addNote, openDetail, setAlarmState, decideFinding, reservePart } = useHive();
  const phone = usePhone();
  const machine = data.machines.find((m) => m.id === id);
  const [tab, setTab] = useState<(typeof TABS)[number]>('History');
  const [range, setRange] = useState<(typeof RANGES)[number]>('1 hour');
  const [chosen, setChosen] = useState<string[]>(() => machine?.signals.slice(0, 2).map((s) => s.key) ?? []);
  const [note, setNote] = useState('');
  const [tick, setTick] = useState(0);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const t = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (!machine) {
    return (
      <PageCard title="Not available">
        <p className="hd-muted">This machine is not available to you.</p>
        <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => go('machines')}>
          Back to machines
        </button>
      </PageCard>
    );
  }

  const live = machine.state === 'producing' || machine.state === 'fault';
  const alarms = data.alarms.filter((a) => a.machineId === machine.id && a.state !== 'Resolved');
  const docs = data.documents.filter((d) => d.machine === machine.key);
  const findings = data.findings.filter((f) => f.machine === machine.key);
  const wos = data.workOrders.filter((w) => w.machineId === machine.id);
  const parts = data.parts.filter((p) => p.machine === machine.key);
  const timeline = TIMELINE[machine.id] ?? [{ state: machine.state, w: 100 }];
  const stateColor: Record<MachineState, string> = { producing: '#1fa35c', idle: '#e8a317', setup: 'var(--hd-orange)', planned_stop: '#a9a9ad', unplanned_stop: '#e5484d', fault: '#c0272d', off: '#d4d4d6', unknown: 'repeating-linear-gradient(135deg,#d4d4d6 0 3px,#eee 3px 6px)' };

  return (
    <>
      <button type="button" className="hd-back" onClick={() => go('machines')}>
        <ArrowLeft size={14} /> Machines
      </button>

      <PageCard>
        <div className="hd-row hd-mhead">
          <div>
            <h2 className="hd-card-title is-lg">{machine.key}</h2>
            <p className="hd-muted">
              {machine.name} · {machine.site} › {machine.area} › {machine.line}
            </p>
          </div>
          <StateBadge state={machine.state} ageS={machine.stateAgeS + tick} />
        </div>

        <div className="hd-control-strip" aria-label="Control status">
          <span><i className="hd-sdot is-producing" /> Gateway connected</span>
          <span><Lock size={12} /> Kill switch: not engaged</span>
          <span>Remote enable: off · {formatAge(machine.stateAgeS)}</span>
          <span className="hd-muted">Shown from cloud data. The gateway check decides.</span>
        </div>
      </PageCard>

      {alarms.length > 0 && (
        <PageCard title="Open alarms">
          <div className="hd-alarm-list">
            {alarms.map((a) => (
              <div className="hd-alarm-row" key={a.id}>
                <button type="button" onClick={() => { go('alarms'); openDetail({ kind: 'alarm', id: a.id }); }}>
                  <Sev s={a.severity} />
                  <span>
                    <b>{a.title}</b>
                    <small>
                      {a.component ?? machine.key} · {a.raisedAt}
                      {a.value ? ` · ${a.value} (limit ${a.limit})` : ''}
                    </small>
                  </span>
                </button>
                <button type="button" className="hd-btn is-light hd-btn-sm" disabled={a.state !== 'Open'} onClick={() => setAlarmState(a.id, 'Acknowledged')}>
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </PageCard>
      )}

      <PageCard title="Live signals" subtitle="Values show their age; limits come from the alarm definition">
        <div className="hd-signals">
          {machine.signals.map((s, i) => {
            const jitter = live && s.quality === 'good' ? Math.sin((tick + i * 2) / 2) * Math.max(Math.abs(s.value) * 0.004, 0.02) : 0;
            const age = s.quality === 'stale' ? s.ageS + tick : s.ageS + (tick % 3);
            return (
              <div className="hd-signal" key={s.key}>
                <span>{s.label}</span>
                <LiveValue value={s.value + jitter} unit={s.unit} decimals={s.decimals} limit={s.limit} quality={s.quality} ageS={age} />
              </div>
            );
          })}
        </div>
        <p className="hd-muted hd-fine">Placeholder values, simulated in this browser. Alarms and states shown are not a replacement for the plant’s safety systems.</p>
      </PageCard>

      <PageCard>
        <div className="hd-tabbar" role="tablist">
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={`hd-chip${tab === t ? ' is-on' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'History' && (
          <>
            <Chips options={RANGES} value={range} onChange={setRange} />
            <div className="hd-chips" role="group" aria-label="Signals">
              {machine.signals.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`hd-chip${chosen.includes(s.key) ? ' is-on' : ''}`}
                  aria-pressed={chosen.includes(s.key)}
                  onClick={() => setChosen((c) => (c.includes(s.key) ? c.filter((k) => k !== s.key) : c.length < 4 ? [...c, s.key] : c))}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="hd-panel">
              <HistoryChart machine={machine} signals={chosen} range={range} />
              <h4 className="hd-subhead">State timeline</h4>
              <div className="hd-timeline-bar" role="img" aria-label="State timeline">
                {timeline.map((t, i) => (
                  <span key={i} style={{ width: `${t.w}%`, background: stateColor[t.state] }} title={STATE_LABEL[t.state]} />
                ))}
              </div>
              <div className="hd-state-row">
                {[...new Set(timeline.map((t) => t.state))].map((st) => (
                  <span className="hd-state-count" key={st}>
                    <i className={`hd-sdot is-${st}`} /> {STATE_LABEL[st]}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'Documents' && (
          <div className="hd-docs-tab">
            {docs.map((d) => (
              <div className="hd-doc-block" key={d.id}>
                <div className="hd-row">
                  <button type="button" className="hd-link" onClick={() => go('documents')}>
                    <b>{d.name}</b> <small>rev. {d.revision}</small>
                  </button>
                  <ApplicabilityBadge verdict={d.applicability} />
                </div>
                {d.passages.filter((p) => p.applicability !== 'does_not_apply').map((p) => (
                  <p className="hd-passage" key={p.text}>
                    <span>{p.text}</span>
                    <small>
                      p. {p.page} <ApplicabilityBadge verdict={p.applicability} reason={p.reason} />
                    </small>
                  </p>
                ))}
                {d.passages.some((p) => p.applicability === 'does_not_apply') && (
                  <details className="hd-excluded">
                    <summary>Excluded passages</summary>
                    {d.passages.filter((p) => p.applicability === 'does_not_apply').map((p) => (
                      <p className="hd-passage" key={p.text}>
                        <span>{p.text}</span>
                        <small>
                          p. {p.page} <ApplicabilityBadge verdict={p.applicability} reason={p.reason} />
                        </small>
                      </p>
                    ))}
                  </details>
                )}
              </div>
            ))}
            {docs.length === 0 && <p className="hd-empty">No documents are bound to this machine.</p>}
          </div>
        )}

        {tab === 'Findings' && (
          <div className="hd-findings">
            {findings.map((f) => (
              <article className="hd-finding" key={f.id}>
                <div className="hd-row">
                  <b>{f.title}</b>
                  <Pill tone={f.status === 'Confirmed' ? 'green' : f.status === 'Rejected' ? 'red' : 'amber'}>{f.status}</Pill>
                </div>
                <small className="hd-muted">
                  {f.kind} · confidence {Math.round(f.confidence * 100)}% · {f.model} · {f.age} ago
                </small>
                <div className="hd-cites">{f.evidence.map((e) => <CitationChip key={e.label} label={e.label} locator={e.locator} applicability={e.applicability} reason={e.reason} />)}</div>
                {f.status === 'Awaiting confirmation' &&
                  (rejecting === f.id ? (
                    <div className="hd-inline-form">
                      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" aria-label="Reason for rejecting" />
                      <button type="button" className="hd-btn is-dark hd-btn-sm" disabled={!reason.trim()} onClick={() => { decideFinding(f.id, 'Rejected', reason.trim()); setRejecting(null); setReason(''); }}>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="hd-approval-actions">
                      <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => setRejecting(f.id)}>Reject</button>
                      <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => decideFinding(f.id, 'Confirmed')}>Confirm</button>
                    </div>
                  ))}
              </article>
            ))}
            {findings.length === 0 && <p className="hd-empty">No findings or predictions for this machine.</p>}
          </div>
        )}

        {tab === 'Work' && (
          <>
            <h4 className="hd-subhead">Work orders</h4>
            {wos.map((w) => (
              <button type="button" key={w.id} className="hd-link-row" onClick={() => { go('work-orders'); openDetail({ kind: 'workOrder', id: w.id }); }}>
                <Pill tone="gray">{w.state}</Pill> {w.id} · {w.title}
              </button>
            ))}
            {wos.length === 0 && <p className="hd-muted">None.</p>}
            <h4 className="hd-subhead">Parts bound to this machine</h4>
            {parts.map((p) => (
              <div className="hd-kv" key={p.id}>
                <span>{p.number} · {p.name}</span>
                <b>
                  {p.onHand - p.reserved} available · synced {p.syncedDaysAgo} d ago {p.syncedDaysAgo > 7 && <Pill tone="amber">stale</Pill>}{' '}
                  <button type="button" className="hd-ghost" onClick={() => reservePart(p.id)} disabled={p.onHand - p.reserved <= 0}>Reserve</button>
                </b>
              </div>
            ))}
            {parts.length === 0 && <p className="hd-muted">None.</p>}
            <h4 className="hd-subhead">Notes</h4>
            <div className="hd-inline-form">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" aria-label="Add a note" />
              <button type="button" className="hd-btn is-dark hd-btn-sm" disabled={!note.trim()} onClick={() => { addNote(machine.id, note.trim()); setNote(''); }}>
                <Plus size={14} /> Add
              </button>
            </div>
            {(notes[machine.id] ?? []).map((n, i) => (
              <p className="hd-passage" key={i}>
                <span>{n.text}</span>
                <small>{n.at}</small>
              </p>
            ))}
          </>
        )}

        {tab === 'Actions' && (
          <Note icon={Info}>
            Machine control is not enabled for this tenant, so no commands are offered. Nothing on this page can write a value to a machine; any change to a machine would have to go through the engineered command catalogue with the required approvals.
          </Note>
        )}
      </PageCard>

      <div className="hd-row hd-assist-link">
        <button
          type="button"
          className="hd-btn is-light hd-btn-sm"
          onClick={() => go('assistant')}
        >
          <Sparkles size={14} /> Ask the assistant about {machine.key}
        </button>
        {!phone && <Field k="Context" v={machine.key} />}
      </div>
    </>
  );
}
