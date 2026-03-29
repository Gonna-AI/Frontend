import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Clock, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase } from '../../config/supabase';

interface LastCall {
  date: string;
  sentiment: string;
  category: string;
  summaryText: string;
  followUpRequired: boolean;
}

interface PreCallBriefData {
  isReturning: boolean;
  callerName: string;
  totalCalls: number;
  lastCalls: LastCall[];
  openActionItems: string[];
  riskFlag: 'none' | 'medium' | 'high';
}

interface PreCallBriefProps {
  isDark?: boolean;
  /** Pre-fill the name field (e.g. from caller ID). */
  initialName?: string;
  /** Callback when user wants to view a caller's full profile */
  onViewProfile?: (callerName: string) => void;
}

const SENTIMENT_LABELS: Record<string, string> = {
  very_positive: 'Very positive',
  positive: 'Positive',
  slightly_positive: 'Slightly positive',
  neutral: 'Neutral',
  mixed: 'Mixed',
  slightly_negative: 'Slightly negative',
  negative: 'Negative',
  very_negative: 'Very negative',
  anxious: 'Anxious',
  urgent: 'Urgent',
};

function sentimentColor(s: string): string {
  if (['very_positive', 'positive', 'slightly_positive'].includes(s)) return 'text-green-400';
  if (['very_negative', 'negative', 'slightly_negative', 'anxious', 'urgent'].includes(s)) return 'text-red-400';
  return 'text-yellow-400';
}

function riskBadge(flag: 'none' | 'medium' | 'high') {
  if (flag === 'high') return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">High risk</span>;
  if (flag === 'medium') return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Watch</span>;
  return null;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PreCallBrief({ isDark = true, initialName = '', onViewProfile }: PreCallBriefProps) {
  function handleViewProfile(name: string) {
    if (onViewProfile) {
      onViewProfile(name);
    } else {
      // Dispatch a custom event for the dashboard to handle
      window.dispatchEvent(new CustomEvent('navigate-user-profile', { detail: name }));
    }
  }
  const [query, setQuery] = useState(initialName);
  const [brief, setBrief] = useState<PreCallBriefData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function lookup(name: string) {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setBrief(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError('Not authenticated'); return; }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-analytics/precall-brief?name=${encodeURIComponent(trimmed)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (!res.ok) { setError('Lookup failed'); return; }
      const data: PreCallBriefData = await res.json();
      setBrief(data);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  // Update if initialName changes (e.g. auto-detection from call messages)
  useEffect(() => {
    if (initialName && initialName !== query) {
      setQuery(initialName);
      lookup(initialName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName]);

  function handleChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => lookup(val), 500);
  }

  const cardBase = isDark
    ? 'bg-white/[0.04] border-white/10 text-white'
    : 'bg-white border-gray-200 text-gray-900';
  const textMuted = isDark ? 'text-white/50' : 'text-gray-400';
  const textSecondary = isDark ? 'text-white/70' : 'text-gray-600';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-blue-500/50'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400';

  return (
    <div className={cn('rounded-xl border', cardBase)}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold">Caller Lookup</span>
          {brief?.isReturning && brief.riskFlag !== 'none' && riskBadge(brief.riskFlag)}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 opacity-40" /> : <ChevronDown className="w-4 h-4 opacity-40" />}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5', textMuted)} />
                <input
                  type="text"
                  value={query}
                  onChange={e => handleChange(e.target.value)}
                  placeholder="Type caller name…"
                  className={cn(
                    'w-full pl-8 pr-3 py-2 text-sm rounded-lg border outline-none transition-colors',
                    inputCls
                  )}
                />
                {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin" style={{ color: '#FF8A5B' }} />}
              </div>

              {/* Result */}
              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              {!loading && brief && (
                <div className="space-y-3">
                  {/* Identity */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={cn('text-sm font-semibold', brief.isReturning ? 'text-blue-400' : textSecondary)}>
                        {brief.isReturning ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewProfile(brief.callerName); }}
                            className="hover:underline cursor-pointer text-left"
                          >
                            ↩ {brief.callerName}
                          </button>
                        ) : `New caller — "${brief.callerName || query}"`}
                      </span>
                      {brief.isReturning && (
                        <span className={cn('ml-2 text-xs', textMuted)}>
                          {brief.totalCalls} call{brief.totalCalls !== 1 ? 's' : ''} on record
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {brief.isReturning && riskBadge(brief.riskFlag)}
                      {brief.isReturning && (
                        <button
                          onClick={() => handleViewProfile(brief.callerName)}
                          className={cn('text-xs font-medium transition-colors', isDark ? 'text-[#FF8A5B] hover:text-[#FF6B3D]' : 'text-orange-500 hover:text-orange-600')}
                        >
                          View Profile →
                        </button>
                      )}
                    </div>
                  </div>

                  {brief.isReturning && (
                    <>
                      {/* Last calls */}
                      {brief.lastCalls.length > 0 && (
                        <div className="space-y-1.5">
                          <p className={cn('text-xs font-medium uppercase tracking-wide', textMuted)}>Recent calls</p>
                          {brief.lastCalls.slice(0, 3).map((c, i) => (
                            <div
                              key={i}
                              className={cn('rounded-lg px-3 py-2 flex flex-col gap-0.5', isDark ? 'bg-white/[0.04]' : 'bg-gray-50')}
                            >
                              <div className="flex items-center justify-between">
                                <span className={cn('text-xs', textMuted)}>{formatDate(c.date)}</span>
                                <div className="flex items-center gap-2">
                                  <span className={cn('text-xs capitalize', sentimentColor(c.sentiment))}>
                                    {SENTIMENT_LABELS[c.sentiment] ?? c.sentiment}
                                  </span>
                                  {c.followUpRequired ? (
                                    <XCircle className="w-3 h-3 text-amber-400" title="Unresolved" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3 text-green-400" title="Resolved" />
                                  )}
                                </div>
                              </div>
                              <span className={cn('text-xs', textSecondary, 'capitalize')}>{c.category}</span>
                              {c.summaryText && (
                                <p className={cn('text-xs leading-relaxed mt-0.5', textMuted, 'line-clamp-2')}>{c.summaryText}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Open action items */}
                      {brief.openActionItems.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <p className={cn('text-xs font-medium', 'text-amber-400')}>
                              {brief.openActionItems.length} open action item{brief.openActionItems.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <ul className="space-y-1">
                            {brief.openActionItems.slice(0, 5).map((item, i) => (
                              <li key={i} className={cn('text-xs flex items-start gap-1.5', textSecondary)}>
                                <Clock className="w-3 h-3 mt-0.5 shrink-0 text-amber-400/60" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {!brief.isReturning && brief.callerName && (
                    <p className={cn('text-xs', textMuted)}>No previous calls found for this name.</p>
                  )}
                </div>
              )}

              {!loading && !brief && query.trim().length >= 2 && !error && (
                <p className={cn('text-xs', textMuted)}>Type to search…</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
