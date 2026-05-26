import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Kanban, Users, Building2, Activity, ArrowRight, Clock } from 'lucide-react';
import { useCRMDeals, useCRMContacts, useCRMCompanies } from '../../hooks/useCRM';
import { cn } from '../../lib/utils';

interface Result {
  id: string;
  label: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  href: string;
}

const ACTIONS: Result[] = [
  { id: 'go-deals',     label: 'Go to Deals',      icon: Kanban,    color: '#FF8A5B', href: '/crm/deals' },
  { id: 'go-contacts',  label: 'Go to Contacts',   icon: Users,     color: '#6366F1', href: '/crm/contacts' },
  { id: 'go-companies', label: 'Go to Companies',  icon: Building2, color: '#10B981', href: '/crm/companies' },
  { id: 'go-activities',label: 'Go to Activities', icon: Activity,  color: '#F59E0B', href: '/crm/activities' },
];

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: deals = [] } = useCRMDeals();
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.toLowerCase();

  const results: Result[] = q.length < 1 ? [] : [
    ...deals.filter(d => d.name.toLowerCase().includes(q)).slice(0, 3).map(d => ({
      id: `deal-${d.id}`, label: d.name,
      sub: d.crm_companies?.name,
      icon: Kanban, color: '#FF8A5B', href: `/crm/deals/${d.id}`,
    })),
    ...contacts
      .filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q))
      .slice(0, 3)
      .map(c => ({
        id: `contact-${c.id}`, label: `${c.first_name} ${c.last_name}`,
        sub: c.job_title ?? c.email ?? undefined,
        icon: Users, color: '#6366F1', href: `/crm/contacts/${c.id}`,
      })),
    ...companies.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3).map(c => ({
      id: `company-${c.id}`, label: c.name,
      sub: c.industry ?? c.domain ?? undefined,
      icon: Building2, color: '#10B981', href: `/crm/companies/${c.id}`,
    })),
  ];

  const items = q ? results : ACTIONS;

  const go = (href: string) => { onClose(); navigate(href); };

  useEffect(() => { setCursor(0); }, [query]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, items.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && items[cursor]) go(items[cursor].href);
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-[3px]" onClick={onClose}>
      <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#1a1a1a] shadow-[0_32px_80px_rgba(0,0,0,0.7)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-white/30" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search deals, contacts, companies…"
            className="flex-1 bg-transparent text-[14px] text-white placeholder-white/25 outline-none"
          />
          <kbd className="rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/30">ESC</kbd>
        </div>

        <div className="max-h-[340px] overflow-y-auto py-2">
          {!q && <p className="px-4 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">Navigate</p>}
          {q && results.length === 0 && (
            <p className="px-4 py-8 text-center text-[13px] text-white/25">No results for "{query}"</p>
          )}
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => go(item.href)}
                onMouseEnter={() => setCursor(i)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  cursor === i ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${item.color}18` }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#e0e0e0] truncate">{item.label}</p>
                  {item.sub && <p className="text-[11px] text-[#555] truncate">{item.sub}</p>}
                </div>
                {cursor === i && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/20" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-white/[0.06] px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-[11px] text-white/20">
            <kbd className="rounded border border-white/[0.1] bg-white/[0.05] px-1 py-0.5 text-[9px]">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-white/20">
            <kbd className="rounded border border-white/[0.1] bg-white/[0.05] px-1 py-0.5 text-[9px]">↵</kbd> open
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-white/15">
            <Clock className="h-3 w-3" /> ClerkTree CRM
          </span>
        </div>
      </div>
    </div>
  );
}
