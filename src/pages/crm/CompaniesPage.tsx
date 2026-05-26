import { useState } from 'react';
import { X, Globe, Building2 } from 'lucide-react';
import { useCRMCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '../../hooks/useCRM';
import type { CRMCompany } from '../../types/crm';
import CRMLayout from './CRMLayout';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Legal', 'Real Estate', 'Manufacturing', 'Retail', 'Education', 'Other'];
const SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/30">{label}</label>
      {children}
    </div>
  );
}

function CompanyLogo({ name, url }: { name: string; url?: string | null }) {
  const initials = name.slice(0, 2).toUpperCase();
  if (url) return <img src={url} alt={name} className="h-6 w-6 rounded-md object-contain bg-white/5 p-0.5" />;
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FF8A5B]/15 text-[10px] font-bold text-[#FF8A5B]">
      {initials}
    </div>
  );
}

function CompanyPanel({ company, onClose }: { company: CRMCompany; onClose: () => void }) {
  const update = useUpdateCompany();
  const remove = useDeleteCompany();
  const [form, setForm] = useState<Partial<CRMCompany>>({ ...company });
  const set = (k: keyof CRMCompany, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="relative flex h-full w-full max-w-[460px] flex-col border-l border-white/[0.08] bg-[#1a1a1a] shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-3">
            <CompanyLogo name={company.name} url={company.logo_url} />
            <div>
              <p className="text-[11px] text-white/30 uppercase tracking-widest mb-0.5">Company</p>
              <h2 className="text-[14px] font-semibold text-white">{company.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-col gap-5 p-6">
          <Field label="Company name"><input value={form.name ?? ''} onChange={e => set('name', e.target.value)} className="crm-input" /></Field>
          <Field label="Domain"><input value={form.domain ?? ''} onChange={e => set('domain', e.target.value || null)} placeholder="acme.com" className="crm-input" /></Field>
          <Field label="Website"><input value={form.website_url ?? ''} onChange={e => set('website_url', e.target.value || null)} className="crm-input" /></Field>
          <Field label="Industry">
            <select value={form.industry ?? ''} onChange={e => set('industry', e.target.value || null)} className="crm-input">
              <option value="">— None —</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Size">
            <select value={form.size ?? ''} onChange={e => set('size', e.target.value || null)} className="crm-input">
              <option value="">— None —</option>
              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Country"><input value={form.country ?? ''} onChange={e => set('country', e.target.value || null)} className="crm-input" /></Field>
          <Field label="Notes"><textarea rows={4} value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)} className="crm-input resize-none" /></Field>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
          <button onClick={() => { if (confirm('Delete this company?')) remove.mutate(company.id, { onSuccess: onClose }); }} className="text-[12px] text-red-400/70 hover:text-red-400 transition-colors">Delete</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
            <button onClick={() => update.mutate({ id: company.id, ...form }, { onSuccess: onClose })} disabled={update.isPending} className="crm-btn-primary">
              {update.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewCompanyModal({ onClose }: { onClose: () => void }) {
  const create = useCreateCompany();
  const [form, setForm] = useState({ name: '', domain: '', industry: '', size: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-2xl border border-white/[0.1] bg-[#1c1c1c] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-5 text-[14px] font-semibold text-white">New company</h2>
        <div className="flex flex-col gap-4">
          <Field label="Company name *"><input autoFocus value={form.name} onChange={e => set('name', e.target.value)} className="crm-input" /></Field>
          <Field label="Domain"><input value={form.domain} onChange={e => set('domain', e.target.value)} placeholder="acme.com" className="crm-input" /></Field>
          <Field label="Industry">
            <select value={form.industry} onChange={e => set('industry', e.target.value)} className="crm-input">
              <option value="">Select industry…</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Size">
            <select value={form.size} onChange={e => set('size', e.target.value)} className="crm-input">
              <option value="">Select size…</option>
              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
          <button onClick={() => create.mutate({ name: form.name, domain: form.domain || undefined, industry: form.industry || undefined, size: form.size || undefined }, { onSuccess: onClose })} disabled={create.isPending || !form.name.trim()} className="crm-btn-primary">
            {create.isPending ? 'Creating…' : 'Create company'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const { data: companies = [], isLoading } = useCRMCompanies();
  const [selected, setSelected] = useState<CRMCompany | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <CRMLayout title="Companies" onAdd={() => setShowNew(true)} addLabel="+ New company">
      {isLoading ? (
        <div className="flex h-full items-center justify-center"><p className="text-[13px] text-white/25">Loading…</p></div>
      ) : (
        <div className="px-6 py-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Company', 'Domain', 'Industry', 'Size', 'Country'].map(h => (
                  <th key={h} className="py-2.5 pr-6 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25 first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.id} className="border-b border-white/[0.04] hover:bg-white/[0.025] cursor-pointer transition-colors" onClick={() => setSelected(company)}>
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-2.5">
                      <CompanyLogo name={company.name} url={company.logo_url} />
                      <span className="text-[13px] font-medium text-[#e0e0e0]">{company.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-6 text-[13px] text-[#656565]">
                    {company.domain && <div className="flex items-center gap-1.5"><Globe className="h-3 w-3 text-[#454545]" />{company.domain}</div>}
                  </td>
                  <td className="py-3 pr-6 text-[13px] text-[#656565]">
                    {company.industry && <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 text-[#454545]" />{company.industry}</div>}
                  </td>
                  <td className="py-3 pr-6 text-[13px] text-[#656565]">{company.size}</td>
                  <td className="py-3 pr-6 text-[13px] text-[#656565]">{company.country}</td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr><td colSpan={5} className="py-20 text-center text-[13px] text-[#3a3a3a]">No companies yet. Add your first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {selected && <CompanyPanel company={selected} onClose={() => setSelected(null)} />}
      {showNew && <NewCompanyModal onClose={() => setShowNew(false)} />}
    </CRMLayout>
  );
}
