import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Users, StickyNote, CheckSquare, Plus, Check, Edit2, X, Linkedin, Building2 } from 'lucide-react';
import { useCRMContacts, useUpdateContact, useDeleteContact, useCRMActivities, useCreateActivity, useCRMCompanies } from '../../hooks/useCRM';
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

function Avatar({ name, url }: { name: string; url?: string | null }) {
  const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (url) return <img src={url} alt={name} className="h-10 w-10 rounded-full object-cover" />;
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6366F1]/20 text-[13px] font-semibold text-[#6366F1]">
      {initials}
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

function LogActivityModal({ contactId, onClose }: { contactId: string; onClose: () => void }) {
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
            onClick={() => create.mutate({ type: form.type, title: form.title || undefined, body: form.body || undefined, contact_id: contactId, due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined }, { onSuccess: onClose })}
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

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const { data: activities = [] } = useCRMActivities({ contact_id: id });
  const update = useUpdateContact();
  const remove = useDeleteContact();

  const contact = contacts.find(c => c.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [showLog, setShowLog] = useState(false);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  if (!contact) {
    return (
      <CRMLayout title="Contacts">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-[14px] text-white/30 mb-4">Contact not found or still loading.</p>
            <button onClick={() => navigate('/crm/contacts')} className="crm-btn-ghost">← Back to Contacts</button>
          </div>
        </div>
      </CRMLayout>
    );
  }

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const saveEdits = () => update.mutate({ id: contact.id, ...form }, { onSuccess: () => setEditing(false) });

  return (
    <CRMLayout title="Contacts">
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto p-6 min-w-0">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => navigate('/crm/contacts')} className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Contacts
            </button>
            <span className="text-white/15">/</span>
            <span className="text-[12px] text-white/50 truncate">{fullName}</span>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar name={fullName} url={contact.avatar_url} />
              <div>
                <h1 className="text-[18px] font-semibold text-white leading-tight">{fullName}</h1>
                {contact.job_title && <p className="mt-0.5 text-[13px] text-white/40">{contact.job_title}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {contact.linkedin_url && (
                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex h-8 items-center gap-1.5 rounded-md border border-white/[0.08] px-3 text-[13px] text-white/40 hover:text-white/70 hover:border-white/[0.15] transition-colors">
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
              )}
              {editing ? (
                <>
                  <button onClick={() => { setEditing(false); setForm({}); }} className="crm-btn-ghost flex items-center gap-1"><X className="h-3 w-3" /> Cancel</button>
                  <button onClick={saveEdits} disabled={update.isPending} className="crm-btn-primary">{update.isPending ? 'Saving…' : 'Save'}</button>
                </>
              ) : (
                <button onClick={() => { setEditing(true); setForm({ ...contact }); }} className="crm-btn-ghost flex items-center gap-1.5"><Edit2 className="h-3 w-3" /> Edit</button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap mb-6">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#1c1c1c] px-3 py-2 text-[12px] text-[#c0c0c0] hover:border-white/[0.12] transition-colors">
                <Mail className="h-3.5 w-3.5 text-[#FF8A5B]" /> {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#1c1c1c] px-3 py-2 text-[12px] text-[#c0c0c0] hover:border-white/[0.12] transition-colors">
                <Phone className="h-3.5 w-3.5 text-[#6366F1]" /> {contact.phone}
              </a>
            )}
            {contact.crm_companies && (
              <button onClick={() => navigate(`/crm/companies/${contact.crm_companies!.id}`)} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#1c1c1c] px-3 py-2 text-[12px] text-[#c0c0c0] hover:border-white/[0.12] transition-colors">
                <Building2 className="h-3.5 w-3.5 text-[#10B981]" /> {contact.crm_companies.name}
              </button>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#1c1c1c] p-4 mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-2">Notes</p>
            {editing ? (
              <textarea rows={4} value={(form.notes as string) ?? ''} onChange={e => set('notes', e.target.value || null)} className="crm-input resize-none w-full" placeholder="Add notes…" />
            ) : (
              <p className="text-[13px] text-[#808080] leading-relaxed whitespace-pre-wrap">{contact.notes || 'No notes yet.'}</p>
            )}
          </div>

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

        <div className="w-[240px] shrink-0 border-l border-white/[0.06] overflow-y-auto p-5 flex flex-col gap-5">
          <Field label="First name">
            {editing ? <input value={(form.first_name as string) ?? ''} onChange={e => set('first_name', e.target.value)} className="crm-input" />
              : <p className="text-[13px] text-[#c0c0c0]">{contact.first_name}</p>}
          </Field>
          <Field label="Last name">
            {editing ? <input value={(form.last_name as string) ?? ''} onChange={e => set('last_name', e.target.value)} className="crm-input" />
              : <p className="text-[13px] text-[#c0c0c0]">{contact.last_name}</p>}
          </Field>
          <Field label="Email">
            {editing ? <input type="email" value={(form.email as string) ?? ''} onChange={e => set('email', e.target.value || null)} className="crm-input" />
              : <p className="text-[13px] text-[#c0c0c0]">{contact.email ?? '—'}</p>}
          </Field>
          <Field label="Phone">
            {editing ? <input type="tel" value={(form.phone as string) ?? ''} onChange={e => set('phone', e.target.value || null)} className="crm-input" />
              : <p className="text-[13px] text-[#c0c0c0]">{contact.phone ?? '—'}</p>}
          </Field>
          <Field label="Job title">
            {editing ? <input value={(form.job_title as string) ?? ''} onChange={e => set('job_title', e.target.value || null)} className="crm-input" />
              : <p className="text-[13px] text-[#c0c0c0]">{contact.job_title ?? '—'}</p>}
          </Field>
          <Field label="Company">
            {editing ? (
              <select value={(form.company_id as string) ?? ''} onChange={e => set('company_id', e.target.value || null)} className="crm-input">
                <option value="">— None —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              contact.crm_companies
                ? <button onClick={() => navigate(`/crm/companies/${contact.crm_companies!.id}`)} className="text-[13px] text-[#FF8A5B] hover:underline text-left">{contact.crm_companies.name}</button>
                : <p className="text-[13px] text-[#c0c0c0]">—</p>
            )}
          </Field>
          <Field label="LinkedIn">
            {editing
              ? <input value={(form.linkedin_url as string) ?? ''} onChange={e => set('linkedin_url', e.target.value || null)} className="crm-input" />
              : contact.linkedin_url
                ? <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#FF8A5B] hover:underline truncate">View profile</a>
                : <p className="text-[13px] text-[#c0c0c0]">—</p>
            }
          </Field>
          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <button onClick={() => { if (confirm('Delete this contact?')) remove.mutate(contact.id, { onSuccess: () => navigate('/crm/contacts') }); }} className="text-[12px] text-red-400/60 hover:text-red-400 transition-colors">
              Delete contact
            </button>
          </div>
        </div>
      </div>
      {showLog && <LogActivityModal contactId={contact.id} onClose={() => setShowLog(false)} />}
    </CRMLayout>
  );
}
