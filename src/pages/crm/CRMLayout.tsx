import { type ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2, Users, Kanban, Activity,
  ChevronLeft, Plus, Search, Settings, LogOut,
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import { cn } from '../../lib/utils';

const NAV = [
  { label: 'Deals',      icon: Kanban, path: '/crm/deals' },
  { label: 'Contacts',   icon: Users,        path: '/crm/contacts' },
  { label: 'Companies',  icon: Building2,    path: '/crm/companies' },
  { label: 'Activities', icon: Activity,     path: '/crm/activities' },
];

export default function CRMLayout({
  children,
  title,
  onAdd,
  addLabel,
}: {
  children: ReactNode;
  title: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  void search; // available for future filter prop-drilling

  return (
    <div className="flex h-screen overflow-hidden bg-[#111111] text-white">
      {/* Sidebar */}
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-white/8 bg-[#0D0D0D]">
        <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Back to site"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-sm font-semibold tracking-tight text-white">ClerkTree CRM</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="CRM navigation">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Workspace
          </p>
          {NAV.map(({ label, icon: Icon, path }) => {
            const active = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
                  active
                    ? 'bg-[#FF8A5B]/12 text-[#FF8A5B] font-medium'
                    : 'text-white/55 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FF8A5B]" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/8 p-2 space-y-0.5">
          <button
            onClick={() => navigate('/ai-settings')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-white/40 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Settings className="h-4 w-4" aria-hidden="true" /> Settings
          </button>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-white/40 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-white/8 bg-[#0D0D0D] px-5 py-3">
          <h1 className="text-sm font-semibold text-white">{title}</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search…"
                onChange={e => setSearch(e.target.value)}
                className="w-44 rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder-white/30 outline-none focus:border-[#FF8A5B]/40"
              />
            </div>
            {onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-1.5 rounded-lg bg-[#FF8A5B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#FF9E70] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                {addLabel ?? 'Add'}
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
