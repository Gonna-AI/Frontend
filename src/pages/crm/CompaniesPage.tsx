import { useState } from 'react';
import { X, Globe, Building2 } from 'lucide-react';
import { useCRMCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '../../hooks/useCRM';
import type { CRMCompany } from '../../types/crm';
import CRMLayout from './CRMLayout';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Legal', 'Real Estate', 'Manufacturing', 'Retail', 'Education', 'Other'];
const SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/40">{label}</label>
      {children}
    </div>
  );
}

function CompanyLogo({ name, url }: { name: string; url?: string | null }) {
  const initials = name.slice(0, 2).toUpperCase();
  if (url) return <img src={url} alt={name} className="h-8 w-8 rounded-lg object-contain bg-white/5 p-0.5" />;
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF8A5B]/15 text-xs font-bold text-[#FF8A5B]">
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
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex h-full w-full max-w-[480px] flex-col border-l border-white/10 bg-[#0F0F0F] shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-3">
            <CompanyLogo name={company.name} url={company.logo_url} />
            <h2 className="text-sm font-semibold text-white">{company.name}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-col gap-4 p-5">
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
        <div className="mt-auto flex items-center justify-between border-t border-white/8 px-5 py-4">
          <button onClick={() => { if (confirm('Delete this company?')) remove.mutate(company.id, { onSuccess: onClose }); }} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
            <button onClick={() => update.mutate({ id: company.id, ...form }, { onSuccess: onClose })} disabled={update.isPending} className="crm-btn-primary">
              {update.isPending ? 'Saving…' : 'Save'}
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

  const save = () => create.mutate({
    name: form.name,
    domain: form.domain || undefined,
    industry: form.industry || undefined,
    size: form.size || undefined,
  }, { onSuccess: onClose });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 text-sm font-semibold text-white">New Company</h2>
        <div className="flex flex-col gap-3">
          <Field label="Company name *"><input autoFocus value={form.name} onChange={e => set('name', e.target.value)} className="crm-input" /></Field>
          <Field label="Domain"><input value={form.domain} onChange={e => set('domain', e.target.value)} placeholder="acme.com" className="crm-input" /></Field>
          <Field label="Industry">
            <select value={form.industry} onChange={e => set('industry', e.target.value)} className="crm-input">
              <option value="">— None —</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Size">
            <select value={form.size} onChange={e => set('size', e.target.value)} className="crm-input">
              <option value="">— None —</option>
              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
          <button onClick={save} disabled={create.isPending || !form.name.trim()} className="crm-btn-primary">
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
    <CRMLayout title="Companies" onAdd={() => setShowNew(true)} addLabel="New company">
      {isLoading ? (
        <div className="flex h-full items-center justify-center"><p className="text-sm text-white/30">Loading…</p></div>
      ) : (
        <div className="p-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {['Company', 'Domain', 'Industry', 'Size', 'Country', ''].map(h => (
                  <th key={h} className="py-2.5 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-white/35 first:pl-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.id} className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors" onClick={() => setSelected(company)}>
                  <td className="py-3 pr-4 pl-1">
                    <div className="flex items-center gap-2.5">
                      <CompanyLogo name={company.name} url={company.logo_url} />
                      <span className="font-medium text-white">{company.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-white/55">{company.domain && <div className="flex items-center gap-1.5"><Globe className="h-3 w-3 shrink-0" aria-hidden="true" />{company.domain}</div>}</td>
                  <td className="py-3 pr-4 text-white/55">{company.industry && <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />{company.industry}</div>}</td>
                  <td className="py-3 pr-4 text-white/45">{company.size}</td>
                  <td className="py-3 pr-4 text-white/45">{company.country}</td>
                  <td className="py-3 pr-4" />
                </tr>
              ))}
              {companies.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-white/25">No companies yet. Add your first one.</td></tr>
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
