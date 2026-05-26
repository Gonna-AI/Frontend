import { useState } from 'react';
import { Phone, Mail, Users, StickyNote, CheckSquare, Plus, Check } from 'lucide-react';
import { useCRMActivities, useCreateActivity } from '../../hooks/useCRM';
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
    <div className={cn('flex items-start gap-4 rounded-xl border border-white/6 bg-[#131313] p-4 transition-colors', activity.completed && 'opacity-50')}>
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.color}20` }}>
        <Icon className="h-4 w-4" style={{ color: meta.color }} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: meta.color }}>{meta.label}</span>
          {activity.due_date && (
            <span className="text-[11px] text-white/35">
              {new Date(activity.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>
        {activity.title && <p className={cn('mt-0.5 text-sm font-medium text-white', activity.completed && 'line-through')}>{activity.title}</p>}
        {activity.body && <p className="mt-1 text-sm text-white/50 leading-relaxed">{activity.body}</p>}
        <p className="mt-1.5 text-[11px] text-white/25">
          {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      {activity.type === 'task' && (
        <button
          onClick={toggleComplete}
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors',
            activity.completed ? 'border-[#10B981]/40 bg-[#10B981]/15 text-[#10B981]' : 'border-white/15 text-white/20 hover:border-white/30',
          )}
          aria-label={activity.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {activity.completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/40">{label}</label>
      {children}
    </div>
  );
}

function NewActivityModal({ onClose }: { onClose: () => void }) {
  const create = useCreateActivity();
  const [form, setForm] = useState<{ type: CRMActivity['type']; title: string; body: string; due_date: string }>({
    type: 'note', title: '', body: '', due_date: '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = () => create.mutate({
    type: form.type,
    title: form.title || undefined,
    body: form.body || undefined,
    due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
  }, { onSuccess: onClose });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 text-sm font-semibold text-white">Log Activity</h2>
        <div className="flex flex-col gap-3">
          <Field label="Type">
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(TYPE_META) as CRMActivity['type'][]).map(t => {
                const m = TYPE_META[t];
                const active = form.type === t;
                return (
                  <button
                    key={t}
                    onClick={() => set('type', t)}
                    className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors', !active && 'border-white/10 text-white/40 hover:text-white')}
                    style={active ? { borderColor: m.color, backgroundColor: `${m.color}20`, color: m.color } : {}}
                  >
                    <m.icon className="h-3 w-3" aria-hidden="true" /> {m.label}
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
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
          <button onClick={save} disabled={create.isPending} className="crm-btn-primary">
            {create.isPending ? 'Saving…' : 'Log activity'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const { data: activities = [], isLoading } = useCRMActivities();
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<CRMActivity['type'] | 'all'>('all');

  const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  return (
    <CRMLayout title="Activities" onAdd={() => setShowNew(true)} addLabel="Log activity">
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5 bg-[#0D0D0D]">
        <button onClick={() => setFilter('all')} className={cn('rounded-lg px-3 py-1 text-xs font-medium transition-colors', filter === 'all' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white')}>All</button>
        {(Object.keys(TYPE_META) as CRMActivity['type'][]).map(t => {
          const m = TYPE_META[t];
          return (
            <button key={t} onClick={() => setFilter(t)} className={cn('flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-colors', filter === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white')}>
              <m.icon className="h-3 w-3" aria-hidden="true" /> {m.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex h-full items-center justify-center"><p className="text-sm text-white/30">Loading…</p></div>
      ) : (
        <div className="flex flex-col gap-2.5 p-4">
          {filtered.map(a => <ActivityRow key={a.id} activity={a} />)}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-sm text-white/25">No activities logged yet.</p>
              <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 text-xs text-[#FF8A5B] hover:text-[#FFB286] transition-colors">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Log your first activity
              </button>
            </div>
          )}
        </div>
      )}
      {showNew && <NewActivityModal onClose={() => setShowNew(false)} />}
    </CRMLayout>
  );
}
