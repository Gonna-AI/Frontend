import { useState } from 'react';
import { Phone, Mail, Users, StickyNote, CheckSquare, Plus, Check } from 'lucide-react';
import { useCRMActivities, useCreateActivity } from '../../hooks/useCRM';
import { useCRMSearch } from '../../contexts/CRMContext';
import type { CRMActivity } from '../../types/crm';
import CRMLayout from './CRMLayout';
import { cn } from '../../lib/utils';
import { supabase } from '../../config/supabase';
import { useQueryClient } from '@tanstack/react-query';

const TYPE_META: Record<CRMActivity['type'], { icon: React.ElementType; label: string; color: string }> = {
  call:    { icon: Phone,       label: 'Call',    color: '#6366F1' },
  email:   { icon: Mail,        label: 'Email',   color: '#FF8A5B' },
  meeting: { icon: Users,       label: 'Meeting', color: '#F59E0B' },
  note:    { icon: StickyNote,  label: 'Note',    color: '#10B981' },
  task:    { icon: CheckSquare, label: 'Task',    color: '#EC4899' },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/30">{label}</label>
      {children}
    </div>
  );
}

function ActivityRow({ activity }: { activity: CRMActivity }) {
  const qc = useQueryClient();
  const meta = TYPE_META[activity.type];
  const Icon = meta.icon;

  const toggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('crm_activities').update({ completed: !activity.completed }).eq('id', activity.id);
    qc.invalidateQueries({ queryKey: ['crm', 'activities'] });
  };

  return (
    <div className={cn('flex items-start gap-4 rounded-lg border border-white/[0.06] bg-[#1c1c1c] p-4 hover:border-white/[0.1] transition-colors', activity.completed && 'opacity-40')}>
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.color}18` }}>
        <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: meta.color }}>{meta.label}</span>
          {activity.due_date && (
            <span className="text-[11px] text-[#555]">
              {new Date(activity.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>
        {activity.title && <p className={cn('mt-0.5 text-[13px] font-medium text-[#e0e0e0]', activity.completed && 'line-through')}>{activity.title}</p>}
        {activity.body && <p className="mt-1 text-[13px] text-[#656565] leading-relaxed">{activity.body}</p>}
        <p className="mt-1.5 text-[11px] text-[#454545]">
          {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      {activity.type === 'task' && (
        <button
          onClick={toggleComplete}
          className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors', activity.completed ? 'border-[#10B981]/50 bg-[#10B981]/15 text-[#10B981]' : 'border-white/[0.12] text-white/20 hover:border-white/25')}
          aria-label={activity.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {activity.completed && <Check className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}

function NewActivityModal({ onClose }: { onClose: () => void }) {
  const create = useCreateActivity();
  const [form, setForm] = useState<{ type: CRMActivity['type']; title: string; body: string; due_date: string }>({
    type: 'note', title: '', body: '', due_date: '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-2xl border border-white/[0.1] bg-[#1c1c1c] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-5 text-[14px] font-semibold text-white">Log activity</h2>
        <div className="flex flex-col gap-4">
          <Field label="Type">
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(TYPE_META) as CRMActivity['type'][]).map(t => {
                const m = TYPE_META[t];
                const active = form.type === t;
                return (
                  <button
                    key={t}
                    onClick={() => set('type', t)}
                    className={cn('flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors', !active && 'border-white/[0.08] text-[#656565] hover:text-white/70')}
                    style={active ? { borderColor: `${m.color}60`, backgroundColor: `${m.color}15`, color: m.color } : {}}
                  >
                    <m.icon className="h-3 w-3" /> {m.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Title"><input autoFocus value={form.title} onChange={e => set('title', e.target.value)} placeholder="Quick summary…" className="crm-input" /></Field>
          <Field label="Notes"><textarea rows={3} value={form.body} onChange={e => set('body', e.target.value)} placeholder="Details…" className="crm-input resize-none" /></Field>
          {form.type === 'task' && (
            <Field label="Due date"><input type="datetime-local" value={form.due_date} onChange={e => set('due_date', e.target.value)} className="crm-input" /></Field>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
          <button
            onClick={() => create.mutate({ type: form.type, title: form.title || undefined, body: form.body || undefined, due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined }, { onSuccess: onClose })}
            disabled={create.isPending}
            className="crm-btn-primary"
          >
            {create.isPending ? 'Saving…' : 'Log activity'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const { data: activities = [], isLoading } = useCRMActivities();
  const { search } = useCRMSearch();
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<CRMActivity['type'] | 'all'>('all');

  const q = search.toLowerCase();
  const filtered = activities
    .filter(a => filter === 'all' || a.type === filter)
    .filter(a => !q || (a.title ?? '').toLowerCase().includes(q) || (a.body ?? '').toLowerCase().includes(q));

  return (
    <CRMLayout title="Activities" onAdd={() => setShowNew(true)} addLabel="+ Log activity">
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-6 py-2.5">
        <button onClick={() => setFilter('all')} className={cn('rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors', filter === 'all' ? 'bg-white/[0.08] text-white' : 'text-[#656565] hover:text-white/70')}>
          All
        </button>
        {(Object.keys(TYPE_META) as CRMActivity['type'][]).map(t => {
          const m = TYPE_META[t];
          return (
            <button key={t} onClick={() => setFilter(t)} className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors', filter === t ? 'bg-white/[0.08] text-white' : 'text-[#656565] hover:text-white/70')}>
              <m.icon className="h-3 w-3" /> {m.label}
            </button>
          );
        })}
      </div>
      {isLoading ? (
        <div className="flex h-full items-center justify-center"><p className="text-[13px] text-white/25">Loading…</p></div>
      ) : (
        <div className="flex flex-col gap-2 p-6">
          {filtered.map(a => <ActivityRow key={a.id} activity={a} />)}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-[13px] text-[#3a3a3a]">{search ? 'No activities match your search.' : 'No activities logged yet.'}</p>
              {!search && (
                <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 text-[12px] text-[#FF8A5B]/70 hover:text-[#FF8A5B] transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Log your first activity
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {showNew && <NewActivityModal onClose={() => setShowNew(false)} />}
    </CRMLayout>
  );
}
