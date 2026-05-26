import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Users, StickyNote, CheckSquare, Plus, Check, Edit2, X, Kanban } from 'lucide-react';
import { useCRMDeals, useUpdateDeal, useDeleteDeal, useCRMActivities, useCreateActivity, useCRMContacts, useCRMCompanies, useCRMPipeline, useCRMStages } from '../../hooks/useCRM';
import type { CRMActivity } from '../../types/crm';
import { supabase } from '../../config/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import CRMLayout from './CRMLayout';

const ACT_META: Record<CRMActivity['type'], { icon: React.ElementType; label: string; color: string }> = {
  call:    { icon: Phone,       label: 'Call',    color: '#6366F1' },
  email:   { icon: Mail,        label: 'Email',   color: '#FF8A5B' },
  meeting: { icon: Users,       label: 'Meeting', color: '#F59E0B' },
  note:    { icon: StickyNote,  label: 'Note',    color: '#10B981' },
  task:    { icon: CheckSquare, label: 'Task',    color: '#EC4899' },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">{label}</label>
      {children}
    </div>
  );
}

function ActivityItem({ activity }: { activity: CRMActivity }) {
  const qc = useQueryClient();
  const meta = ACT_META[activity.type];
  const Icon = meta.icon;
  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('crm_activities').update({ completed: !activity.completed }).eq('id', activity.id);
    qc.invalidateQueries({ queryKey: ['crm', 'activities'] });
  };
  return (
    <div className={cn('flex gap-3 p-3 rounded-lg border border-white/[0.06] bg-[#1c1c1c]', activity.completed && 'opacity-40')}>
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${meta.color}18` }}>
        <Icon className="h-3 w-3" style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: meta.color }}>{meta.label}</span>
          {activity.due_date && <span className="text-[11px] text-[#555]">{new Date(activity.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
        </div>
        {activity.title && <p className={cn('mt-0.5 text-[13px] font-medium text-[#e0e0e0]', activity.completed && 'line-through')}>{activity.title}</p>}
        {activity.body && <p className="mt-1 text-[12px] text-[#656565] leading-relaxed">{activity.body}</p>}
        <p className="mt-1 text-[10px] text-[#3a3a3a]">{new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      </div>
      {activity.type === 'task' && (
        <button onClick={toggle} className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors', activity.completed ? 'border-[#10B981]/50 bg-[#10B981]/15 text-[#10B981]' : 'border-white/[0.12] text-white/20 hover:border-white/25')}>
          {activity.completed && <Check className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}

function LogActivityModal({ dealId, onClose }: { dealId: string; onClose: () => void }) {
  const create = useCreateActivity();
  const [form, setForm] = useState<{ type: CRMActivity['type']; title: string; body: string; due_date: string }>({ type: 'note', title: '', body: '', due_date: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-2xl border border-white/[0.1] bg-[#1c1c1c] p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 text-[14px] font-semibold text-white">Log activity</h2>
        <div className="flex gap-1.5 flex-wrap mb-4">
          {(Object.keys(ACT_META) as CRMActivity['type'][]).map(t => {
            const m = ACT_META[t];
            const active = form.type === t;
            return (
              <button key={t} onClick={() => set('type', t)} className={cn('flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors', !active && 'border-white/[0.08] text-[#656565] hover:text-white/70')} style={active ? { borderColor: `${m.color}60`, backgroundColor: `${m.color}15`, color: m.color } : {}}>
                <m.icon className="h-3 w-3" /> {m.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          <input autoFocus value={form.title} onChange={e => set('title', e.target.value)} placeholder="Title…" className="crm-input" />
          <textarea rows={3} value={form.body} onChange={e => set('body', e.target.value)} placeholder="Notes…" className="crm-input resize-none" />
          {form.type === 'task' && <input type="datetime-local" value={form.due_date} onChange={e => set('due_date', e.target.value)} className="crm-input" />}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
          <button
            onClick={() => create.mutate({ type: form.type, title: form.title || undefined, body: form.body || undefined, deal_id: dealId, due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined }, { onSuccess: onClose })}
            disabled={create.isPending}
            className="crm-btn-primary"
          >
            {create.isPending ? 'Saving…' : 'Log'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deals = [] } = useCRMDeals();
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const { data: pipeline } = useCRMPipeline();
  const { data: stages = [] } = useCRMStages(pipeline?.id);
  const { data: activities = [] } = useCRMActivities({ deal_id: id });
  const update = useUpdateDeal();
  const remove = useDeleteDeal();

  const deal = deals.find(d => d.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [showLog, setShowLog] = useState(false);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  if (!deal) {
    return (
      <CRMLayout title="Deals">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-[14px] text-white/30 mb-4">Deal not found or still loading.</p>
            <button onClick={() => navigate('/crm/deals')} className="crm-btn-ghost">← Back to Deals</button>
          </div>
        </div>
      </CRMLayout>
    );
  }

  const stage = deal.crm_pipeline_stages;
  const stageColor = stage?.color ?? '#6366F1';

  const saveEdits = () => update.mutate({ id: deal.id, ...form }, { onSuccess: () => setEditing(false) });

  return (
    <CRMLayout title="Deals">
      <div className="flex h-full">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => navigate('/crm/deals')} className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Deals
            </button>
            <span className="text-white/15">/</span>
            <span className="text-[12px] text-white/50 truncate">{deal.name}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF8A5B]/15">
                <Kanban className="h-5 w-5 text-[#FF8A5B]" />
              </div>
              <div>
                <h1 className="text-[18px] font-semibold text-white leading-tight">{deal.name}</h1>
                {stage && (
                  <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${stageColor}20`, color: stageColor }}>
                    {stage.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {editing ? (
                <>
                  <button onClick={() => { setEditing(false); setForm({}); }} className="crm-btn-ghost flex items-center gap-1"><X className="h-3 w-3" /> Cancel</button>
                  <button onClick={saveEdits} disabled={update.isPending} className="crm-btn-primary">{update.isPending ? 'Saving…' : 'Save'}</button>
                </>
              ) : (
                <button onClick={() => { setEditing(true); setForm({ ...deal }); }} className="crm-btn-ghost flex items-center gap-1.5"><Edit2 className="h-3 w-3" /> Edit</button>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Deal value', value: deal.amount != null ? `$${deal.amount.toLocaleString()}` : '—' },
              { label: 'Probability', value: deal.probability != null ? `${deal.probability}%` : '—' },
              { label: 'Close date', value: deal.close_date ? new Date(deal.close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-white/[0.06] bg-[#1c1c1c] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-1">{label}</p>
                <p className="text-[15px] font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-white/[0.06] bg-[#1c1c1c] p-4 mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-2">Notes</p>
            {editing ? (
              <textarea rows={4} value={(form.notes as string) ?? ''} onChange={e => set('notes', e.target.value || null)} className="crm-input resize-none w-full" placeholder="Add notes…" />
            ) : (
              <p className="text-[13px] text-[#808080] leading-relaxed whitespace-pre-wrap">{deal.notes || 'No notes yet.'}</p>
            )}
          </div>

          {/* Activity timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/30">Activity ({activities.length})</p>
              <button onClick={() => setShowLog(true)} className="flex items-center gap-1.5 text-[12px] text-[#FF8A5B]/70 hover:text-[#FF8A5B] transition-colors">
                <Plus className="h-3.5 w-3.5" /> Log activity
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {activities.length === 0
                ? <p className="py-8 text-center text-[13px] text-[#3a3a3a]">No activities yet.</p>
                : activities.map(a => <ActivityItem key={a.id} activity={a} />)
              }
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-[240px] shrink-0 border-l border-white/[0.06] overflow-y-auto p-5 flex flex-col gap-5">
          <Field label="Stage">
            {editing ? (
              <select value={(form.stage_id as string) ?? ''} onChange={e => set('stage_id', e.target.value || null)} className="crm-input">
                <option value="">— None —</option>
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            ) : <p className="text-[13px] text-[#c0c0c0]">{stage?.name ?? '—'}</p>}
          </Field>
          <Field label="Amount">
            {editing ? (
              <input type="number" value={(form.amount as number) ?? ''} onChange={e => set('amount', e.target.value ? parseFloat(e.target.value) : null)} className="crm-input" />
            ) : <p className="text-[13px] text-[#c0c0c0]">{deal.amount != null ? `$${deal.amount.toLocaleString()} ${deal.currency}` : '—'}</p>}
          </Field>
          <Field label="Probability (%)">
            {editing ? (
              <input type="number" min={0} max={100} value={(form.probability as number) ?? ''} onChange={e => set('probability', e.target.value ? parseInt(e.target.value) : null)} className="crm-input" />
            ) : <p className="text-[13px] text-[#c0c0c0]">{deal.probability != null ? `${deal.probability}%` : '—'}</p>}
          </Field>
          <Field label="Close date">
            {editing ? (
              <input type="date" value={(form.close_date as string)?.slice(0, 10) ?? ''} onChange={e => set('close_date', e.target.value || null)} className="crm-input" />
            ) : <p className="text-[13px] text-[#c0c0c0]">{deal.close_date ? new Date(deal.close_date).toLocaleDateString() : '—'}</p>}
          </Field>
          <Field label="Contact">
            {editing ? (
              <select value={(form.contact_id as string) ?? ''} onChange={e => set('contact_id', e.target.value || null)} className="crm-input">
                <option value="">— None —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            ) : (
              deal.crm_contacts
                ? <button onClick={() => navigate(`/crm/contacts/${deal.crm_contacts!.id}`)} className="text-[13px] text-[#FF8A5B] hover:underline text-left">{deal.crm_contacts.first_name} {deal.crm_contacts.last_name}</button>
                : <p className="text-[13px] text-[#c0c0c0]">—</p>
            )}
          </Field>
          <Field label="Company">
            {editing ? (
              <select value={(form.company_id as string) ?? ''} onChange={e => set('company_id', e.target.value || null)} className="crm-input">
                <option value="">— None —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              deal.crm_companies
                ? <button onClick={() => navigate(`/crm/companies/${deal.crm_companies!.id}`)} className="text-[13px] text-[#FF8A5B] hover:underline text-left">{deal.crm_companies.name}</button>
                : <p className="text-[13px] text-[#c0c0c0]">—</p>
            )}
          </Field>
          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <button onClick={() => { if (confirm('Delete this deal?')) remove.mutate(deal.id, { onSuccess: () => navigate('/crm/deals') }); }} className="text-[12px] text-red-400/60 hover:text-red-400 transition-colors">
              Delete deal
            </button>
          </div>
        </div>
      </div>
      {showLog && <LogActivityModal dealId={deal.id} onClose={() => setShowLog(false)} />}
    </CRMLayout>
  );
}
