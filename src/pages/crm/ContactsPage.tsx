import { useState } from 'react';
import { X, Mail, Phone, Building2, Linkedin } from 'lucide-react';
import { useCRMContacts, useCreateContact, useUpdateContact, useDeleteContact, useCRMCompanies } from '../../hooks/useCRM';
import type { CRMContact } from '../../types/crm';
import CRMLayout from './CRMLayout';

function Avatar({ name, url }: { name: string; url?: string | null }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (url) return <img src={url} alt={name} className="h-8 w-8 rounded-full object-cover" />;
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF8A5B]/20 text-xs font-semibold text-[#FF8A5B]">
      {initials}
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

function ContactPanel({ contact, onClose }: { contact: CRMContact; onClose: () => void }) {
  const update = useUpdateContact();
  const remove = useDeleteContact();
  const { data: companies = [] } = useCRMCompanies();
  const [form, setForm] = useState<Partial<CRMContact>>({ ...contact });
  const set = (k: keyof CRMContact, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex h-full w-full max-w-[480px] flex-col border-l border-white/10 bg-[#0F0F0F] shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={`${contact.first_name} ${contact.last_name}`} url={contact.avatar_url} />
            <h2 className="text-sm font-semibold text-white">{contact.first_name} {contact.last_name}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name"><input value={form.first_name ?? ''} onChange={e => set('first_name', e.target.value)} className="crm-input" /></Field>
            <Field label="Last name"><input value={form.last_name ?? ''} onChange={e => set('last_name', e.target.value)} className="crm-input" /></Field>
          </div>
          <Field label="Email"><input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value || null)} className="crm-input" /></Field>
          <Field label="Phone"><input type="tel" value={form.phone ?? ''} onChange={e => set('phone', e.target.value || null)} className="crm-input" /></Field>
          <Field label="Job title"><input value={form.job_title ?? ''} onChange={e => set('job_title', e.target.value || null)} className="crm-input" /></Field>
          <Field label="Company">
            <select value={form.company_id ?? ''} onChange={e => set('company_id', e.target.value || null)} className="crm-input">
              <option value="">— None —</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="LinkedIn"><input value={form.linkedin_url ?? ''} onChange={e => set('linkedin_url', e.target.value || null)} className="crm-input" /></Field>
          <Field label="Notes"><textarea rows={4} value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)} className="crm-input resize-none" /></Field>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-white/8 px-5 py-4">
          <button onClick={() => { if (confirm('Delete this contact?')) remove.mutate(contact.id, { onSuccess: onClose }); }} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
            <button onClick={() => update.mutate({ id: contact.id, ...form }, { onSuccess: onClose })} disabled={update.isPending} className="crm-btn-primary">
              {update.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewContactModal({ onClose }: { onClose: () => void }) {
  const create = useCreateContact();
  const { data: companies = [] } = useCRMCompanies();
  const [form, setForm] = useState<{ first_name: string; last_name: string; email: string; job_title: string; company_id: string }>({
    first_name: '', last_name: '', email: '', job_title: '', company_id: '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name || undefined,
      email: form.email || undefined,
      job_title: form.job_title || undefined,
      company_id: form.company_id || undefined,
    };
    create.mutate(payload, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 text-sm font-semibold text-white">New Contact</h2>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name *"><input autoFocus value={form.first_name} onChange={e => set('first_name', e.target.value)} className="crm-input" /></Field>
            <Field label="Last name"><input value={form.last_name} onChange={e => set('last_name', e.target.value)} className="crm-input" /></Field>
          </div>
          <Field label="Email"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="crm-input" /></Field>
          <Field label="Job title"><input value={form.job_title} onChange={e => set('job_title', e.target.value)} className="crm-input" /></Field>
          <Field label="Company">
            <select value={form.company_id} onChange={e => set('company_id', e.target.value)} className="crm-input">
              <option value="">— None —</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
          <button onClick={save} disabled={create.isPending || !form.first_name.trim()} className="crm-btn-primary">
            {create.isPending ? 'Creating…' : 'Create contact'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const { data: contacts = [], isLoading } = useCRMContacts();
  const [selected, setSelected] = useState<CRMContact | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <CRMLayout title="Contacts" onAdd={() => setShowNew(true)} addLabel="New contact">
      {isLoading ? (
        <div className="flex h-full items-center justify-center"><p className="text-sm text-white/30">Loading…</p></div>
      ) : (
        <div className="p-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {['Name', 'Email', 'Phone', 'Company', 'Title', ''].map(h => (
                  <th key={h} className="py-2.5 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-white/35 first:pl-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id} className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors" onClick={() => setSelected(contact)}>
                  <td className="py-3 pr-4 pl-1">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${contact.first_name} ${contact.last_name}`} url={contact.avatar_url} />
                      <span className="font-medium text-white">{contact.first_name} {contact.last_name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-white/55">{contact.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 shrink-0" aria-hidden="true" />{contact.email}</div>}</td>
                  <td className="py-3 pr-4 text-white/55">{contact.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0" aria-hidden="true" />{contact.phone}</div>}</td>
                  <td className="py-3 pr-4 text-white/55">{contact.crm_companies && <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />{contact.crm_companies.name}</div>}</td>
                  <td className="py-3 pr-4 text-white/45">{contact.job_title}</td>
                  <td className="py-3 pr-4">{contact.linkedin_url && <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-white/30 hover:text-[#FF8A5B] transition-colors"><Linkedin className="h-3.5 w-3.5" aria-hidden="true" /></a>}</td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-white/25">No contacts yet. Add your first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {selected && <ContactPanel contact={selected} onClose={() => setSelected(null)} />}
      {showNew && <NewContactModal onClose={() => setShowNew(false)} />}
    </CRMLayout>
  );
}
