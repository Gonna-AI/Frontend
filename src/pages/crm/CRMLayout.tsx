import { type ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Users, Kanban, Activity, ChevronLeft, Plus, Search, Settings, LogOut, Filter } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { CRMProvider, useCRMSearch } from '../../contexts/CRMContext';
import CommandPalette from './CommandPalette';

const NAV = [
  { label: 'Deals',      icon: Kanban,    path: '/crm/deals' },
  { label: 'Contacts',   icon: Users,     path: '/crm/contacts' },
  { label: 'Companies',  icon: Building2, path: '/crm/companies' },
  { label: 'Activities', icon: Activity,  path: '/crm/activities' },
];

function CRMLayoutInner({
  children,
  title,
  onAdd,
  addLabel,
  toolbar,
}: {
  children: ReactNode;
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  toolbar?: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { search, setSearch } = useCRMSearch();
  const [showCmd, setShowCmd] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCmd(s => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'CT';

  return (
    <div className="flex h-screen overflow-hidden bg-[#141414] text-white">
      {/* Sidebar */}
      <aside className="flex w-[212px] shrink-0 flex-col border-r border-white/[0.06] bg-[#141414]">
        <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-white/[0.06] px-4">
          <button
            onClick={() => navigate('/')}
            className="flex h-5 w-5 items-center justify-center rounded text-white/30 hover:text-white transition-colors"
            aria-label="Back to site"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[13px] font-semibold text-white/90 tracking-tight">ClerkTree CRM</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pt-3 pb-2" aria-label="CRM navigation">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">Workspace</p>
          {NAV.map(({ label, icon: Icon, path }) => {
            const active = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-[7px] text-[13px] transition-colors duration-100',
                  active ? 'bg-[#FF8A5B]/10 text-[#FF8A5B] font-medium' : 'text-white/45 hover:bg-white/[0.04] hover:text-white/80',
                )}
              >
                <Icon className="h-[15px] w-[15px] shrink-0" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] px-2 py-2 space-y-0.5">
          <button
            onClick={() => navigate('/ai-settings')}
            className="flex w-full items-center gap-2 rounded-md px-2 py-[7px] text-[13px] text-white/35 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
          >
            <Settings className="h-[15px] w-[15px] shrink-0" /> Settings
          </button>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
            className="flex w-full items-center gap-2 rounded-md px-2 py-[7px] text-[13px] text-white/35 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
          >
            <LogOut className="h-[15px] w-[15px] shrink-0" /> Sign out
          </button>
          {user && (
            <div className="flex items-center gap-2 rounded-md px-2 py-2 mt-1">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF8A5B] text-[9px] font-bold text-white">
                {initials}
              </div>
              <span className="truncate text-[11px] text-white/25">{user.email}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#141414] px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-[13px] font-semibold text-white/90">{title}</h1>
            {toolbar}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCmd(true)}
              className="flex h-8 items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] pl-2.5 pr-2 text-[13px] text-white/30 hover:border-white/[0.15] hover:text-white/50 transition-colors"
              aria-label="Open command palette (Ctrl+K)"
            >
              <Search className="h-[13px] w-[13px] shrink-0" />
              <span className="hidden sm:inline w-28 text-left">Search...</span>
              <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1 py-0.5 text-[9px]">⌘K</kbd>
            </button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-white/25" aria-hidden="true" />
              <input
                type="search"
                value={search}
                placeholder="Filter..."
                onChange={e => setSearch(e.target.value)}
                className="h-8 w-32 rounded-md border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 text-[13px] text-white/80 placeholder-white/20 outline-none focus:border-white/[0.18] transition-colors"
              />
            </div>
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-white/[0.08] px-3 text-[13px] text-white/40 hover:text-white/70 hover:border-white/[0.15] transition-colors">
              <Filter className="h-3 w-3" /> Filter
            </button>
            {onAdd && (
              <button
                onClick={onAdd}
                className="flex h-8 items-center gap-1.5 rounded-md bg-[#FF8A5B] px-3 text-[13px] font-medium text-white hover:bg-[#FF9E70] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                {addLabel ?? 'Add'}
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-[#141414]">{children}</main>
      </div>
      {showCmd && <CommandPalette onClose={() => setShowCmd(false)} />}
    </div>
  );
}

export default function CRMLayout(props: {
  children: ReactNode;
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  toolbar?: ReactNode;
}) {
  return (
    <CRMProvider>
      <CRMLayoutInner {...props} />
    </CRMProvider>
  );
}
