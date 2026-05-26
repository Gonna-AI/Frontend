import { useState } from 'react';
import { X, DollarSign, Calendar, Building2, User, Plus, LayoutList, Kanban } from 'lucide-react';
import {
  useCRMPipeline, useCRMStages, useCRMDeals,
  useCreateDeal, useUpdateDeal, useDeleteDeal,
  useInitPipeline, useCRMCompanies, useCRMContacts,
} from '../../hooks/useCRM';
import { useAuth } from '../../hooks/useAuth';
import { useCRMSearch } from '../../contexts/CRMContext';
import type { CRMDeal, CRMPipelineStage } from '../../types/crm';
import CRMLayout from './CRMLayout';
import { cn } from '../../lib/utils';

function fmtCurrency(amount: number | null, currency = 'USD') {
  if (amount == null) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function fmtCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return fmtCurrency(n, 'USD') ?? '$0';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/30">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-white/[0.06] bg-[#1a1a1a] px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/30">{label}</p>
      <p className="text-[18px] font-semibold text-white">{value}</p>
      {sub && <p className="text-[11px] text-[#656565]">{sub}</p>}
    </div>
  );
}

function DealCard({ deal, onOpen }: { deal: CRMDeal; onOpen: (d: CRMDeal) => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={e => e.dataTransfer.setData('dealId', deal.id)}
      onClick={() => onOpen(deal)}
      onKeyDown={e => e.key === 'Enter' && onOpen(deal)}
      className="rounded-lg border border-white/[0.08] bg-[#1c1c1c] p-3 hover:border-white/[0.16] hover:bg-[#222] cursor-pointer transition-all duration-100 focus:outline-none focus:border-[#FF8A5B]/40"
    >
      <p className="text-[13px] font-medium text-[#e8e8e8] leading-snug">{deal.name}</p>
      {deal.crm_companies && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#656565]">
          <Building2 className="h-3 w-3 shrink-0" />
          {deal.crm_companies.name}
        </div>
      )}
      {(deal.amount != null || deal.close_date) && (
        <div className="mt-3 flex items-center justify-between gap-2">
          {deal.amount != null ? (
            <span className="text-[12px] font-semibold text-[#FF8A5B]">{fmtCurrency(deal.amount, deal.currency)}</span>
          ) : <span />}
          {deal.close_date && (
            <span className="flex items-center gap-1 text-[11px] text-[#656565]">
              <Calendar className="h-3 w-3" />
              {new Date(deal.close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Column({ stage, deals, onOpen, onMoveDeal }: {
  stage: CRMPipelineStage;
  deals: CRMDeal[];
  onOpen: (d: CRMDeal) => void;
  onMoveDeal: (dealId: string, stageId: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const total = deals.reduce((s, d) => s + (d.amount ?? 0), 0);
  return (
    <div
      className={cn('flex w-[272px] shrink-0 flex-col rounded-xl transition-colors duration-100', dragOver && 'bg-white/[0.03]')}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); const id = e.dataTransfer.getData('dealId'); if (id) onMoveDeal(id, stage.id); }}
    >
      <div className="flex items-center justify-between px-2 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-[7px] w-[7px] rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
          <span className="text-[13px] font-medium text-[#9a9a9a]">{stage.name}</span>
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-medium text-[#656565]">
            {deals.length}
          </span>
        </div>
        {total > 0 && <span className="text-[11px] text-[#555]">{fmtCompact(total)}</span>}
      </div>
      <div className="flex flex-col gap-1.5 px-1 pb-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        {deals.map(deal => <DealCard key={deal.id} deal={deal} onOpen={onOpen} />)}
        {deals.length === 0 && <p className="py-10 text-center text-[12px] text-[#3a3a3a]">No opportunities</p>}
      </div>
    </div>
  );
}

function TableView({ deals, stages, onOpen }: { deals: CRMDeal[]; stages: CRMPipelineStage[]; onOpen: (d: CRMDeal) => void }) {
  const [sortKey, setSortKey] = useState<'name' | 'amount' | 'close_date' | 'created_at'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...deals].sort((a, b) => {
    const av = a[sortKey] ?? null;
    const bv = b[sortKey] ?? null;
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggle = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const stageMap = Object.fromEntries(stages.map(s => [s.id, s]));

  return (
    <div className="px-6 py-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {([['name', 'Deal'], ['amount', 'Amount'], ['close_date', 'Close date'], ['created_at', 'Created']] as const).map(([k, h]) => (
              <th
                key={k}
                onClick={() => toggle(k)}
                className="cursor-pointer py-2.5 pr-6 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25 hover:text-white/50 transition-colors first:pl-0 select-none"
              >
                {h}{sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
            ))}
            <th className="py-2.5 pr-6 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25">Stage</th>
            <th className="py-2.5 pr-6 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25">Company</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(deal => {
            const stage = deal.stage_id ? stageMap[deal.stage_id] : null;
            return (
              <tr key={deal.id} onClick={() => onOpen(deal)} className="border-b border-white/[0.04] hover:bg-white/[0.025] cursor-pointer transition-colors">
                <td className="py-3 pr-6 text-[13px] font-medium text-[#e0e0e0]">{deal.name}</td>
                <td className="py-3 pr-6 text-[13px] font-semibold text-[#FF8A5B]">{deal.amount != null ? fmtCurrency(deal.amount, deal.currency) : '—'}</td>
                <td className="py-3 pr-6 text-[13px] text-[#656565]">
                  {deal.close_date ? new Date(deal.close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td className="py-3 pr-6 text-[13px] text-[#656565]">
                  {new Date(deal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="py-3 pr-6">
                  {stage && (
                    <span className="flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${stage.color}18`, color: stage.color }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      {stage.name}
                    </span>
                  )}
                </td>
                <td className="py-3 pr-6 text-[13px] text-[#656565]">{deal.crm_companies?.name ?? '—'}</td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr><td colSpan={6} className="py-20 text-center text-[13px] text-[#3a3a3a]">No deals found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function NewDealModal({ stages, onClose }: { stages: CRMPipelineStage[]; onClose: () => void }) {
  const create = useCreateDeal();
  const { data: companies = [] } = useCRMCompanies();
  const [form, setForm] = useState<{ name: string; stage_id?: string; amount?: number; company_id?: string; close_date?: string }>({ name: '' });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-2xl border border-white/[0.1] bg-[#1c1c1c] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-5 text-[14px] font-semibold text-white">New deal</h2>
        <div className="flex flex-col gap-4">
          <Field label="Name *">
            <input autoFocus value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Acme Enterprise Plan" className="crm-input" />
          </Field>
          <Field label="Stage">
            <select value={form.stage_id ?? ''} onChange={e => set('stage_id', e.target.value || undefined)} className="crm-input">
              <option value="">Select stage…</option>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount">
              <input type="number" value={form.amount ?? ''} onChange={e => set('amount', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" className="crm-input" />
            </Field>
            <Field label="Close date">
              <input type="date" value={form.close_date ?? ''} onChange={e => set('close_date', e.target.value || undefined)} className="crm-input" />
            </Field>
          </div>
          <Field label="Company">
            <select value={form.company_id ?? ''} onChange={e => set('company_id', e.target.value || undefined)} className="crm-input">
              <option value="">Select company…</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
          <button onClick={() => create.mutate(form as Parameters<typeof create.mutate>[0], { onSuccess: onClose })} disabled={create.isPending || !form.name.trim()} className="crm-btn-primary">
            {create.isPending ? 'Creating…' : 'Create deal'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DealPanel({ deal, stages, onClose }: { deal: CRMDeal; stages: CRMPipelineStage[]; onClose: () => void }) {
  const update = useUpdateDeal();
  const remove = useDeleteDeal();
  const { data: companies = [] } = useCRMCompanies();
  const { data: contacts = [] } = useCRMContacts();
  const [form, setForm] = useState<Partial<CRMDeal>>({ ...deal });
  const set = (k: keyof CRMDeal, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="relative flex h-full w-full max-w-[460px] flex-col border-l border-white/[0.08] bg-[#1a1a1a] shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <p className="text-[11px] text-white/30 uppercase tracking-widest mb-0.5">Deal</p>
            <h2 className="text-[14px] font-semibold text-white">{deal.name}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-col gap-5 p-6">
          <Field label="Name"><input value={form.name ?? ''} onChange={e => set('name', e.target.value)} className="crm-input" /></Field>
          <Field label="Stage">
            <select value={form.stage_id ?? ''} onChange={e => set('stage_id', e.target.value || null)} className="crm-input">
              <option value="">— None —</option>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
                <input type="number" value={form.amount ?? ''} onChange={e => set('amount', e.target.value ? Number(e.target.value) : null)} className="crm-input pl-8" />
              </div>
            </Field>
            <Field label="Probability (%)">
              <input type="number" min="0" max="100" value={form.probability ?? ''} onChange={e => set('probability', e.target.value ? Number(e.target.value) : null)} placeholder="50" className="crm-input" />
            </Field>
          </div>
          <Field label="Close date">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
              <input type="date" value={form.close_date ?? ''} onChange={e => set('close_date', e.target.value || null)} className="crm-input pl-8" />
            </div>
          </Field>
          <Field label="Company">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
              <select value={form.company_id ?? ''} onChange={e => set('company_id', e.target.value || null)} className="crm-input pl-8">
                <option value="">— None —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Contact">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
              <select value={form.contact_id ?? ''} onChange={e => set('contact_id', e.target.value || null)} className="crm-input pl-8">
                <option value="">— None —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Notes"><textarea rows={4} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} className="crm-input resize-none" /></Field>
          {form.amount != null && form.probability != null && (
            <div className="rounded-lg border border-[#FF8A5B]/20 bg-[#FF8A5B]/5 px-4 py-3">
              <p className="text-[11px] text-white/40 uppercase tracking-widest mb-1">Weighted value</p>
              <p className="text-[16px] font-semibold text-[#FF8A5B]">
                {fmtCurrency((form.amount * (form.probability ?? 0)) / 100, deal.currency)}
              </p>
            </div>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
          <button onClick={() => { if (confirm('Delete this deal?')) remove.mutate(deal.id, { onSuccess: onClose }); }} className="text-[12px] text-red-400/70 hover:text-red-400 transition-colors">Delete</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="crm-btn-ghost">Cancel</button>
            <button onClick={() => update.mutate({ id: deal.id, ...form }, { onSuccess: onClose })} disabled={update.isPending} className="crm-btn-primary">
              {update.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const { user } = useAuth();
  const { search } = useCRMSearch();
  const { data: pipeline, isLoading: pipelineLoading } = useCRMPipeline();
  const { data: stages = [] } = useCRMStages(pipeline?.id);
  const { data: allDeals = [], isLoading: dealsLoading } = useCRMDeals();
  const initPipeline = useInitPipeline();
  const updateDeal = useUpdateDeal();
  const [selectedDeal, setSelectedDeal] = useState<CRMDeal | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [view, setView] = useState<'board' | 'table'>('board');
  const isLoading = pipelineLoading || dealsLoading;

  const q = search.toLowerCase();
  const deals = q
    ? allDeals.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.crm_companies?.name ?? '').toLowerCase().includes(q) ||
        (d.crm_contacts?.first_name ?? '').toLowerCase().includes(q) ||
        (d.crm_contacts?.last_name ?? '').toLowerCase().includes(q)
      )
    : allDeals;

  const totalPipeline = deals.reduce((s, d) => s + (d.amount ?? 0), 0);
  const wonDeals = deals.filter(d => stages.find(s => s.id === d.stage_id)?.is_closed_won);
  const avgDeal = deals.length ? totalPipeline / deals.length : 0;
  const closingSoon = deals.filter(d => {
    if (!d.close_date) return false;
    const days = (new Date(d.close_date).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 14;
  }).length;

  const viewToggle = (
    <div className="flex items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.03] p-0.5">
      <button
        onClick={() => setView('board')}
        className={cn('flex h-6 w-6 items-center justify-center rounded transition-colors', view === 'board' ? 'bg-white/[0.1] text-white' : 'text-white/30 hover:text-white/60')}
        aria-label="Board view"
      >
        <Kanban className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setView('table')}
        className={cn('flex h-6 w-6 items-center justify-center rounded transition-colors', view === 'table' ? 'bg-white/[0.1] text-white' : 'text-white/30 hover:text-white/60')}
        aria-label="Table view"
      >
        <LayoutList className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  if (!pipeline && !isLoading) {
    return (
      <CRMLayout title="Deals">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-[13px] text-white/40">No pipeline set up yet.</p>
            <button onClick={() => user && initPipeline.mutate(user.id)} disabled={initPipeline.isPending} className="crm-btn-primary">
              {initPipeline.isPending ? 'Setting up…' : 'Set up pipeline'}
            </button>
          </div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Deals" onAdd={() => setShowNew(true)} addLabel="+ New deal" toolbar={viewToggle}>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-[13px] text-white/25">Loading…</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 border-b border-white/[0.06] px-6 py-3">
            <StatCard label="Total pipeline" value={fmtCompact(totalPipeline)} sub={`${deals.length} deal${deals.length !== 1 ? 's' : ''}`} />
            <StatCard label="Avg deal size" value={fmtCompact(avgDeal)} />
            <StatCard label="Closed won" value={String(wonDeals.length)} sub={wonDeals.length ? (fmtCompact(wonDeals.reduce((s, d) => s + (d.amount ?? 0), 0)) ?? '') : undefined} />
            <StatCard label="Closing in 14d" value={String(closingSoon)} sub={closingSoon > 0 ? 'requires attention' : 'none upcoming'} />
          </div>
          {view === 'board' ? (
            <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-6">
              {stages.map(stage => (
                <Column
                  key={stage.id}
                  stage={stage}
                  deals={deals.filter(d => d.stage_id === stage.id)}
                  onOpen={setSelectedDeal}
                  onMoveDeal={(id, stageId) => updateDeal.mutate({ id, stage_id: stageId })}
                />
              ))}
            </div>
          ) : (
            <TableView deals={deals} stages={stages} onOpen={setSelectedDeal} />
          )}
        </>
      )}
      {selectedDeal && <DealPanel deal={selectedDeal} stages={stages} onClose={() => setSelectedDeal(null)} />}
      {showNew && <NewDealModal stages={stages} onClose={() => setShowNew(false)} />}
    </CRMLayout>
  );
}
