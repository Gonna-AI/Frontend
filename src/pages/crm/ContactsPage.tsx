import { useState } from 'react';
import { X, Mail, Phone, Building2, Linkedin } from 'lucide-react';
import { useCRMContacts, useCreateContact, useUpdateContact, useDeleteContact, useCRMCompanies } from '../../hooks/useCRM';
import { useCRMSearch } from '../../contexts/CRMContext';
import type { CRMContact } from '../../types/crm';
import CRMLayout from './CRMLayout';

function Avatar({ name, url }: { name: string; url?: string | null }) {
  const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (url) return <img src={url} alt={name} className="h-6 w-6 rounded-full object-cover" />;
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF8A5B]/20 text-[10px] font-semibold text-[#FF8A5B]">
      {initials}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/30">{label}</label>
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
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="relative flex h-full w-full max-w-[460px] flex-col border-l border-white/[0.08] bg-[#1a1a1a] shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={`${contact.first_name} ${contact.last_name}`} url={contact.avatar_url} />
            <div>
              <p className="text-[11px] text-white/30 uppercase tracking-widest mb-0.5">Contact</p>
              <h2 className="text-[14px] font-semibold text-white">{contact.first_name} {contact.last_name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-col gap-5 p-6">
          <div className="grid grid-cols-2 gap-4">
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
        <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
          <button onClick={() => { if (confirm('Delete this contact?')) remove.mutate(contact.id, { onSuccess: onClose }); }} className="text-[12px] text-red-400/70 hover:text-red-400 transition-colors">Delete</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
            <button onClick={() => update.mutate({ id: contact.id, ...form }, { onSuccess: onClose })} disabled={update.isPending} className="crm-btn-primary">
              {update.isPending ? 'Saving…' : 'Save changes'}
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
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', job_title: '', company_id: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-2xl border border-white/[0.1] bg-[#1c1c1c] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-5 text-[14px] font-semibold text-white">New contact</h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name *"><input autoFocus value={form.first_name} onChange={e => set('first_name', e.target.value)} className="crm-input" /></Field>
            <Field label="Last name"><input value={form.last_name} onChange={e => set('last_name', e.target.value)} className="crm-input" /></Field>
          </div>
          <Field label="Email"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="crm-input" /></Field>
          <Field label="Job title"><input value={form.job_title} onChange={e => set('job_title', e.target.value)} className="crm-input" /></Field>
          <Field label="Company">
            <select value={form.company_id} onChange={e => set('company_id', e.target.value)} className="crm-input">
              <option value="">Select company…</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
          <button
            onClick={() => create.mutate({ first_name: form.first_name, last_name: form.last_name || undefined, email: form.email || undefined, job_title: form.job_title || undefined, company_id: form.company_id || undefined }, { onSuccess: onClose })}
            disabled={create.isPending || !form.first_name.trim()}
            className="crm-btn-primary"
          >
            {create.isPending ? 'Creating…' : 'Create contact'}
          </button>
        </div>
      </div>
    </div>
  );
}

type SortKey = 'first_name' | 'job_title' | 'email' | 'created_at';

export default function ContactsPage() {
  const { data: allContacts = [], isLoading } = useCRMContacts();
  const { search } = useCRMSearch();
  const [selected, setSelected] = useState<CRMContact | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const q = search.toLowerCase();
  const filtered = q
    ? allContacts.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.crm_companies?.name ?? '').toLowerCase().includes(q) ||
        (c.job_title ?? '').toLowerCase().includes(q)
      )
    : allContacts;

  const contacts = [...filtered].sort((a, b) => {
    const av = (a[sortKey] ?? '') as string;
    const bv = (b[sortKey] ?? '') as string;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggle = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const ColH = ({ k, label }: { k: SortKey; label: string }) => (
    <th onClick={() => toggle(k)} className="cursor-pointer py-2.5 pr-6 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25 hover:text-white/50 transition-colors select-none">
      {label}{sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
    </th>
  );

  return (
    <CRMLayout title="Contacts" onAdd={() => setShowNew(true)} addLabel="+ New contact">
      {isLoading ? (
        <div className="flex h-full items-center justify-center"><p className="text-[13px] text-white/25">Loading…</p></div>
      ) : (
        <div className="px-6 py-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <ColH k="first_name" label="Name" />
                <ColH k="email" label="Email" />
                <th className="py-2.5 pr-6 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25">Phone</th>
                <th className="py-2.5 pr-6 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25">Company</th>
                <ColH k="job_title" label="Job title" />
                <th className="py-2.5 pr-2"></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id} className="group border-b border-white/[0.04] hover:bg-white/[0.025] cursor-pointer transition-colors" onClick={() => setSelected(contact)}>
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${contact.first_name} ${contact.last_name}`} url={contact.avatar_url} />
                      <span className="text-[13px] font-medium text-[#e0e0e0]">{contact.first_name} {contact.last_name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-6 text-[13px] text-[#656565]">
                    {contact.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 shrink-0 text-[#454545]" />{contact.email}</div>}
                  </td>
                  <td className="py-3 pr-6 text-[13px] text-[#656565]">
                    {contact.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0 text-[#454545]" />{contact.phone}</div>}
                  </td>
                  <td className="py-3 pr-6 text-[13px] text-[#656565]">
                    {contact.crm_companies && <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 shrink-0 text-[#454545]" />{contact.crm_companies.name}</div>}
                  </td>
                  <td className="py-3 pr-6 text-[13px] text-[#656565]">{contact.job_title}</td>
                  <td className="py-3 pr-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    {contact.linkedin_url && (
                      <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[#454545] hover:text-[#FF8A5B] transition-colors">
                        <Linkedin className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr><td colSpan={6} className="py-20 text-center text-[13px] text-[#3a3a3a]">{search ? 'No contacts match your search.' : 'No contacts yet. Add your first one.'}</td></tr>
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
