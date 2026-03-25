import { useState, useEffect, useCallback } from 'react';
import {
  Activity, Search, Filter, Loader2, RefreshCw, ChevronDown,
  LogIn, CreditCard, Users, Key, Settings, FileText, Link2, Shield,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase } from '../../config/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface ActivityLogViewProps {
  isDark: boolean;
}

interface ActivityEntry {
  id: string;
  event_type: string;
  action: string;
  description: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const EVENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  auth: { icon: <LogIn className="w-3.5 h-3.5" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Auth' },
  billing: { icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Billing' },
  team: { icon: <Users className="w-3.5 h-3.5" />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', label: 'Team' },
  api_keys: { icon: <Key className="w-3.5 h-3.5" />, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', label: 'API Keys' },
  config: { icon: <Settings className="w-3.5 h-3.5" />, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', label: 'Config' },
  documents: { icon: <FileText className="w-3.5 h-3.5" />, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', label: 'Documents' },
  integrations: { icon: <Link2 className="w-3.5 h-3.5" />, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', label: 'Integrations' },
  security: { icon: <Shield className="w-3.5 h-3.5" />, color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Security' },
  system: { icon: <Activity className="w-3.5 h-3.5" />, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', label: 'System' },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function ActivityLogView({ isDark }: ActivityLogViewProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 30;

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;

      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(page * pageSize),
      });
      if (filterType) params.set('type', filterType);
      if (search) params.set('search', search);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-activity-log?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        setTotalCount(data.count || 0);
      }
    } catch (err) {
      console.error('[ActivityLogView] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, search]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  // Group activities by date
  const grouped: Record<string, ActivityEntry[]> = {};
  for (const a of activities) {
    const day = new Date(a.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(a);
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={cn("text-2xl font-bold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
            {t('activityLog.title') || 'Activity Log'}
          </h2>
          <p className={cn("text-sm mt-1", isDark ? "text-white/50" : "text-gray-500")}>
            {t('activityLog.subtitle') || 'Track all account actions and events'}
          </p>
        </div>
        <button
          onClick={fetchActivities}
          className={cn("p-2 rounded-lg border transition-colors", isDark ? "border-white/10 hover:bg-white/5 text-white/60" : "border-gray-200 hover:bg-gray-50 text-gray-500")}
        >
          <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className={cn("flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-lg border", isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200")}>
          <Search className={cn("w-4 h-4 shrink-0", isDark ? "text-white/40" : "text-gray-400")} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search activities..."
            className={cn("flex-1 bg-transparent text-sm outline-none", isDark ? "text-white placeholder:text-white/30" : "text-gray-900 placeholder:text-gray-400")}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors",
              filterType
                ? isDark ? "border-purple-500/30 bg-purple-500/10 text-purple-400" : "border-purple-500/30 bg-purple-50 text-purple-600"
                : isDark ? "border-white/10 hover:bg-white/5 text-white/60" : "border-gray-200 hover:bg-gray-50 text-gray-500"
            )}
          >
            <Filter className="w-4 h-4" />
            {filterType ? EVENT_TYPE_CONFIG[filterType]?.label || filterType : 'Filter'}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showFilter && (
            <div className={cn(
              "absolute top-full mt-1 right-0 z-50 w-48 rounded-lg border shadow-lg overflow-hidden",
              isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gray-200"
            )}>
              <button
                onClick={() => { setFilterType(''); setShowFilter(false); setPage(0); }}
                className={cn("w-full text-left px-3 py-2 text-sm transition-colors", isDark ? "hover:bg-white/5 text-white/70" : "hover:bg-gray-50 text-gray-700")}
              >
                All Events
              </button>
              {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { setFilterType(key); setShowFilter(false); setPage(0); }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2",
                    isDark ? "hover:bg-white/5 text-white/70" : "hover:bg-gray-50 text-gray-700",
                    filterType === key && (isDark ? "bg-white/5" : "bg-gray-50")
                  )}
                >
                  {config.icon}
                  {config.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className={cn("w-6 h-6 animate-spin", isDark ? "text-purple-400" : "text-purple-600")} />
        </div>
      ) : activities.length === 0 ? (
        <div className={cn("text-center py-20 rounded-2xl border", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
          <Activity className={cn("w-10 h-10 mx-auto mb-3", isDark ? "text-white/20" : "text-gray-300")} />
          <p className={cn("text-sm font-medium", isDark ? "text-white/50" : "text-gray-500")}>No activity yet</p>
          <p className={cn("text-xs mt-1", isDark ? "text-white/30" : "text-gray-400")}>Account actions will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <h3 className={cn("text-xs font-semibold uppercase tracking-wider mb-3", isDark ? "text-white/30" : "text-gray-400")}>{date}</h3>
              <div className={cn("rounded-2xl border overflow-hidden divide-y", isDark ? "bg-[#09090B] border-white/10 divide-white/5" : "bg-white border-black/10 divide-gray-100")}>
                {entries.map((entry) => {
                  const config = EVENT_TYPE_CONFIG[entry.event_type] || EVENT_TYPE_CONFIG.system;
                  return (
                    <div key={entry.id} className={cn("px-4 py-3 flex items-start gap-3 transition-colors", isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50/50")}>
                      <div className={cn("p-1.5 rounded-lg border shrink-0 mt-0.5", config.color)}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>{entry.action.replace(/_/g, ' ')}</span>
                          <span className={cn("text-xs px-1.5 py-0.5 rounded-md", isDark ? "bg-white/5 text-white/40" : "bg-gray-100 text-gray-500")}>{config.label}</span>
                        </div>
                        {entry.description && (
                          <p className={cn("text-xs truncate", isDark ? "text-white/40" : "text-gray-500")}>{entry.description}</p>
                        )}
                      </div>
                      <span className={cn("text-xs shrink-0", isDark ? "text-white/30" : "text-gray-400")}>{timeAgo(entry.created_at)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className={cn("px-3 py-1.5 rounded-lg text-sm border transition-colors", isDark ? "border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-30" : "border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30")}
              >
                Previous
              </button>
              <span className={cn("text-xs", isDark ? "text-white/40" : "text-gray-400")}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className={cn("px-3 py-1.5 rounded-lg text-sm border transition-colors", isDark ? "border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-30" : "border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30")}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
