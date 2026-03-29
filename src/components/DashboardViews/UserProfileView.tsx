import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Phone, Clock, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2,
  Calendar, BarChart3, Tag, MessageSquare, Activity, Shield
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase } from '../../config/supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

/* ─── Types ───────────────────────────────────────────────────── */
interface CallRecord {
  id: string;
  date: string;
  duration: number;
  category: string;
  type: string;
  sentiment: string;
  followUpRequired: boolean;
  summaryText: string;
  riskLevel: string;
  metrics: { wordCount: number; turnCount: number };
}

interface UserProfileData {
  callerName: string;
  totalCalls: number;
  totalDuration: number;
  avgDuration: number;
  avgSentiment: number;
  resolutionRate: number;
  firstContact: string | null;
  lastContact: string | null;
  frequentTopics: { name: string; count: number }[];
  categoryDistribution: Record<string, number>;
  sentimentDistribution: Record<string, number>;
  calls: CallRecord[];
}

interface UserProfileViewProps {
  isDark?: boolean;
  callerName: string;
  onBack: () => void;
}

/* ─── Constants ───────────────────────────────────────────────── */
const SENTIMENT_LABELS: Record<string, string> = {
  very_positive: 'Very Positive', positive: 'Positive', slightly_positive: 'Slightly Positive',
  neutral: 'Neutral', mixed: 'Mixed',
  slightly_negative: 'Slightly Negative', negative: 'Negative', very_negative: 'Very Negative',
  anxious: 'Anxious', urgent: 'Urgent',
};

const SENTIMENT_COLORS: Record<string, string> = {
  very_positive: '#22c55e', positive: '#4ade80', slightly_positive: '#86efac',
  neutral: '#facc15', mixed: '#f97316',
  slightly_negative: '#fb923c', negative: '#ef4444', very_negative: '#dc2626',
  anxious: '#a855f7', urgent: '#e11d48',
};

const CATEGORY_COLORS = [
  '#FF8A5B', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6',
  '#fbbf24', '#34d399', '#818cf8', '#fb7185', '#38bdf8',
];

/* ─── Helpers ─────────────────────────────────────────────────── */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function sentimentColor(s: string): string {
  if (['very_positive', 'positive', 'slightly_positive'].includes(s)) return 'text-green-400';
  if (['very_negative', 'negative', 'slightly_negative', 'anxious', 'urgent'].includes(s)) return 'text-red-400';
  if (s === 'mixed') return 'text-orange-400';
  return 'text-yellow-400';
}

function sentimentBg(s: string): string {
  if (['very_positive', 'positive', 'slightly_positive'].includes(s)) return 'bg-green-500/15 text-green-400';
  if (['very_negative', 'negative', 'slightly_negative', 'anxious', 'urgent'].includes(s)) return 'bg-red-500/15 text-red-400';
  if (s === 'mixed') return 'bg-orange-500/15 text-orange-400';
  return 'bg-yellow-500/15 text-yellow-400';
}

/* ─── Stat Card ───────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, isDark }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; isDark: boolean }) {
  return (
    <div className={cn(
      'rounded-xl border p-4 flex flex-col gap-2 min-w-0',
      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200'
    )}>
      <div className="flex items-center gap-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', isDark ? 'bg-white/[0.06]' : 'bg-gray-100')}>
          {icon}
        </div>
        <span className={cn('text-xs font-medium', isDark ? 'text-white/50' : 'text-gray-400')}>{label}</span>
      </div>
      <p className={cn('text-xl font-bold tracking-tight', isDark ? 'text-white' : 'text-gray-900')}>{value}</p>
      {sub && <p className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-400')}>{sub}</p>}
    </div>
  );
}

/* ─── Component ───────────────────────────────────────────────── */
export default function UserProfileView({ isDark = true, callerName, onBack }: UserProfileViewProps) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [callFilter, setCallFilter] = useState<'all' | 'followup' | 'resolved'>('all');

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) { setError('Not authenticated'); setLoading(false); return; }
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-analytics/user-profile?name=${encodeURIComponent(callerName)}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data: UserProfileData = await res.json();
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProfile();
    return () => { cancelled = true; };
  }, [callerName]);

  const filteredCalls = useMemo(() => {
    if (!profile) return [];
    if (callFilter === 'followup') return profile.calls.filter(c => c.followUpRequired);
    if (callFilter === 'resolved') return profile.calls.filter(c => !c.followUpRequired);
    return profile.calls;
  }, [profile, callFilter]);

  const categoryChartData = useMemo(() => {
    if (!profile) return [];
    return Object.entries(profile.categoryDistribution).map(([name, value]) => ({ name, value }));
  }, [profile]);

  const sentimentChartData = useMemo(() => {
    if (!profile) return [];
    return Object.entries(profile.sentimentDistribution).map(([name, value]) => ({
      name: SENTIMENT_LABELS[name] || name,
      value,
      fill: SENTIMENT_COLORS[name] || '#666',
    }));
  }, [profile]);

  // Timeline data: calls per day
  const timelineData = useMemo(() => {
    if (!profile || profile.calls.length === 0) return [];
    const dayMap: Record<string, number> = {};
    for (const c of profile.calls) {
      const day = c.date ? new Date(c.date).toISOString().slice(0, 10) : 'unknown';
      dayMap[day] = (dayMap[day] || 0) + 1;
    }
    return Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), count }));
  }, [profile]);

  const cardCls = cn('rounded-xl border', isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200');
  const textMuted = isDark ? 'text-white/50' : 'text-gray-400';

  // ─── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF8A5B' }} />
          <p className={cn('text-sm', textMuted)}>Loading profile for "{callerName}"…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={onBack} className="text-sm underline text-white/60 hover:text-white">← Go back</button>
      </div>
    );
  }

  if (!profile || profile.totalCalls === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <User className="w-10 h-10 text-white/20" />
        <p className={cn('text-sm', textMuted)}>No records found for "{callerName}"</p>
        <button onClick={onBack} className="text-sm underline text-white/60 hover:text-white">← Go back</button>
      </div>
    );
  }

  const sentimentLevel =
    profile.avgSentiment >= 70 ? 'Positive' :
    profile.avgSentiment >= 45 ? 'Neutral' :
    'Negative';
  const sentimentLevelColor =
    profile.avgSentiment >= 70 ? 'text-green-400' :
    profile.avgSentiment >= 45 ? 'text-yellow-400' :
    'text-red-400';

  return (
    <div className="space-y-6">
      {/* ─── Back + Header ───────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className={cn(
            'h-9 w-9 rounded-lg border flex items-center justify-center transition-colors',
            isDark ? 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
              isDark ? 'bg-gradient-to-br from-[#FF8A5B] to-[#FF6B3D] text-white' : 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
            )}>
              {profile.callerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>{profile.callerName}</h2>
              <p className={cn('text-xs', textMuted)}>
                {profile.totalCalls} call{profile.totalCalls !== 1 ? 's' : ''} •
                First contact {profile.firstContact ? formatRelative(profile.firstContact) : '—'} •
                Last contact {profile.lastContact ? formatRelative(profile.lastContact) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard isDark={isDark} icon={<Phone className="w-4 h-4 text-[#FF8A5B]" />} label="Total Calls" value={profile.totalCalls} sub={`${formatDuration(profile.totalDuration)} total`} />
        <StatCard isDark={isDark} icon={<Clock className="w-4 h-4 text-blue-400" />} label="Avg Duration" value={formatDuration(profile.avgDuration)} sub="per call" />
        <StatCard isDark={isDark} icon={<Activity className="w-4 h-4 text-purple-400" />} label="Sentiment" value={`${profile.avgSentiment}%`} sub={<span className={sentimentLevelColor}>{sentimentLevel}</span> as unknown as string} />
        <StatCard isDark={isDark} icon={<Shield className="w-4 h-4 text-green-400" />} label="Resolution" value={`${profile.resolutionRate}%`} sub="resolved on first contact" />
      </div>

      {/* ─── Analytics Row ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline */}
        {timelineData.length > 1 && (
          <div className={cn(cardCls, 'p-4 lg:col-span-2')}>
            <p className={cn('text-xs font-semibold uppercase tracking-wide mb-3', textMuted)}>Call Timeline</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="profileArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8A5B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF8A5B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: isDark ? '#1a1a1a' : '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="#FF8A5B" fill="url(#profileArea)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Breakdown */}
        <div className={cn(cardCls, 'p-4', timelineData.length <= 1 ? 'lg:col-span-3' : '')}>
          <p className={cn('text-xs font-semibold uppercase tracking-wide mb-3', textMuted)}>Categories</p>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryChartData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                  {categoryChartData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: isDark ? '#1a1a1a' : '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={cn('text-xs', textMuted)}>No category data</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryChartData.map((c, i) => (
              <span key={c.name} className="flex items-center gap-1.5 text-xs" style={{ color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}>
                <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                {c.name} ({c.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Topics + Sentiment Row ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Frequent Topics */}
        <div className={cn(cardCls, 'p-4')}>
          <p className={cn('text-xs font-semibold uppercase tracking-wide mb-3', textMuted)}>
            <Tag className="w-3.5 h-3.5 inline mr-1.5" />Frequent Topics
          </p>
          {profile.frequentTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.frequentTopics.map(t => (
                <span
                  key={t.name}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border',
                    isDark ? 'bg-white/[0.04] border-white/10 text-white/70' : 'bg-gray-50 border-gray-200 text-gray-600'
                  )}
                >
                  {t.name} <span className={textMuted}>×{t.count}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className={cn('text-xs', textMuted)}>No topics found</p>
          )}
        </div>

        {/* Sentiment Breakdown */}
        <div className={cn(cardCls, 'p-4')}>
          <p className={cn('text-xs font-semibold uppercase tracking-wide mb-3', textMuted)}>
            <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />Sentiment Breakdown
          </p>
          {sentimentChartData.length > 0 ? (
            <div className="space-y-2">
              {sentimentChartData.map(s => {
                const pct = profile.totalCalls > 0 ? Math.round((s.value / profile.totalCalls) * 100) : 0;
                return (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className={cn('text-xs w-28 truncate', isDark ? 'text-white/60' : 'text-gray-500')}>{s.name}</span>
                    <div className={cn('flex-1 h-2 rounded-full overflow-hidden', isDark ? 'bg-white/[0.06]' : 'bg-gray-100')}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: s.fill }} />
                    </div>
                    <span className={cn('text-xs font-mono w-10 text-right', isDark ? 'text-white/40' : 'text-gray-400')}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={cn('text-xs', textMuted)}>No sentiment data</p>
          )}
        </div>
      </div>

      {/* ─── Call History ─────────────────────────────────── */}
      <div className={cn(cardCls, 'overflow-hidden')}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          <p className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
            <MessageSquare className="w-4 h-4 inline mr-1.5 opacity-40" />
            Call History ({filteredCalls.length})
          </p>
          <div className="flex gap-1">
            {(['all', 'followup', 'resolved'] as const).map(f => (
              <button
                key={f}
                onClick={() => setCallFilter(f)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md transition-colors',
                  callFilter === f
                    ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-900 text-white')
                    : (isDark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600')
                )}
              >
                {f === 'all' ? 'All' : f === 'followup' ? 'Open' : 'Resolved'}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
          {filteredCalls.length === 0 && (
            <p className={cn('text-xs text-center py-8', textMuted)}>No calls match this filter</p>
          )}
          {filteredCalls.map(call => (
            <div key={call.id}>
              <button
                onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'
                )}
              >
                {/* Status indicator */}
                <div className="shrink-0">
                  {call.followUpRequired ? (
                    <XCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  )}
                </div>
                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium truncate', isDark ? 'text-white' : 'text-gray-900')}>
                      {call.category}
                    </span>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded', sentimentBg(call.sentiment))}>
                      {SENTIMENT_LABELS[call.sentiment] || call.sentiment}
                    </span>
                  </div>
                  <div className={cn('flex items-center gap-3 text-xs mt-0.5', textMuted)}>
                    <span>{formatDate(call.date)}</span>
                    <span>{formatDuration(call.duration)}</span>
                    {call.type && <span className="capitalize">{call.type}</span>}
                  </div>
                </div>
                {/* Expand */}
                {expandedCall === call.id ? <ChevronUp className="w-4 h-4 opacity-30" /> : <ChevronDown className="w-4 h-4 opacity-30" />}
              </button>

              <AnimatePresence>
                {expandedCall === call.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={cn('px-4 pb-4 pt-1 ml-7 space-y-2', isDark ? 'text-white/60' : 'text-gray-500')}>
                      {call.summaryText && (
                        <p className="text-xs leading-relaxed">{call.summaryText}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs">
                        {call.riskLevel && call.riskLevel !== 'none' && (
                          <span className="flex items-center gap-1 text-red-400">
                            <AlertTriangle className="w-3 h-3" /> Risk: {call.riskLevel}
                          </span>
                        )}
                        <span className={textMuted}>{call.metrics.turnCount} turns</span>
                        <span className={textMuted}>{call.metrics.wordCount} words</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
