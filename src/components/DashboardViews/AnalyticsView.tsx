import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, CheckCircle2,
  Smile, Hash, Loader2, RefreshCw, Sparkles,
  ShieldAlert, Target, Phone, Clock, AlertTriangle,
  BarChart3, Activity,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase } from '../../config/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import DateRangePicker from './DateRangePicker';

interface AnalyticsViewProps {
  isDark: boolean;
}

interface OverviewData {
  totalCalls: number;
  voiceCalls: number;
  textCalls: number;
  avgDuration: number;
  followUps: number;
  resolutionRate: number;
  avgSentiment: number;
  sentimentDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
}

interface TrendPoint {
  date: string;
  total: number;
  voice: number;
  text: number;
  avgDuration: number;
  avgSentiment: number;
}

interface TopicItem {
  topic: string;
  count: number;
}

interface SignalLift {
  signal: string;
  lift: number;
  resolvedRate: number;
  unresolvedRate: number;
  totalOccurrences: number;
}

interface CategoryFCR {
  category: string;
  totalCalls: number;
  resolvedCalls: number;
  fcrRate: number;
  avgDuration: number;
}

interface PatternsData {
  periodDays: number;
  totalCalls: number;
  overallFCR: number;
  winningSignals: SignalLift[];
  riskSignals: SignalLift[];
  categoryFCR: CategoryFCR[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  very_positive: '#10b981', positive: '#34d399', slightly_positive: '#6ee7b7',
  neutral: '#94a3b8', mixed: '#fbbf24',
  slightly_negative: '#fb923c', negative: '#f87171', very_negative: '#ef4444',
  anxious: '#a78bfa', urgent: '#f43f5e',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e',
};

const CATEGORY_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

// ─── KPI Card (matches MonitorView / UsageView style) ──────────────
function KpiCard({ title, value, subtitle, icon, isDark, color = 'blue' }: {
  title: string; value: string | number; subtitle: string;
  icon: React.ReactNode; isDark: boolean;
  color?: 'blue' | 'emerald' | 'purple' | 'orange' | 'rose';
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'bg-emerald-500' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'bg-purple-500' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', glow: 'bg-orange-500' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'bg-rose-500' },
  };
  const c = colorMap[color];

  return (
    <div className={cn(
      "p-5 sm:p-8 rounded-2xl border flex flex-col justify-between min-h-[160px] sm:h-[220px] relative overflow-hidden transition-all duration-300",
      isDark ? `bg-[#09090B] ${c.border}` : "bg-white border-black/10"
    )}>
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[80px] opacity-20 pointer-events-none", c.glow
      )} />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className={cn(
            "p-2 rounded-lg border shrink-0",
            isDark ? `${c.bg} ${c.border} ${c.text}` : "bg-black/5 border-black/5"
          )}>
            {icon}
          </div>
        </div>
        <div>
          <div className={cn("text-3xl sm:text-4xl font-bold tracking-tight", isDark ? "text-white" : "text-gray-900")}>{value}</div>
          <div className={cn("text-sm font-medium mt-1", isDark ? "text-white/70" : "text-gray-600")}>{title}</div>
          <div className={cn("text-xs mt-0.5", isDark ? "text-white/40" : "text-gray-400")}>{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, label, isDark }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; isDark: boolean }) {
  if (!active || !payload) return null;
  return (
    <div className={cn("px-3 py-2 rounded-lg border text-xs shadow-lg backdrop-blur-md", isDark ? "bg-[#1a1a1a]/90 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900")}>
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>{entry.name}: {entry.value}</p>
      ))}
    </div>
  );
}

// ─── Section Card wrapper ─────────────────────────────────────
function SectionCard({ children, isDark, className = '' }: { children: React.ReactNode; isDark: boolean; className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border p-6 relative overflow-hidden transition-all duration-300",
      isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10",
      className
    )}>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function AnalyticsView({ isDark }: AnalyticsViewProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [topTopics, setTopTopics] = useState<TopicItem[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [patterns, setPatterns] = useState<PatternsData | null>(null);
  const [patternsLoading, setPatternsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) { setLoading(false); return; }

      const params = new URLSearchParams();
      params.set('start', dateRange.start.toISOString());
      params.set('end', dateRange.end.toISOString());

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-analytics?${params}`,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (res.ok) {
        const data = await res.json();
        setOverview(data.overview);
        setTrends(data.trends || []);
        setTopTopics(data.topTopics || []);
      }
    } catch (err) {
      console.error('[AnalyticsView] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Fetch pattern intelligence separately
  useEffect(() => {
    let cancelled = false;
    async function fetchPatterns() {
      setPatternsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) { setPatternsLoading(false); return; }
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-analytics/patterns?days=90&min_occ=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          setPatterns(data);
        }
      } catch { /* non-critical */ }
      finally { if (!cancelled) setPatternsLoading(false); }
    }
    fetchPatterns();
    return () => { cancelled = true; };
  }, []);

  // Safely extract category data — filter out any non-string keys
  const categoryData = overview
    ? Object.entries(overview.categoryDistribution)
        .filter(([name]) => typeof name === 'string' && name !== '[object Object]')
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: typeof value === 'number' ? value : 0 }))
    : [];

  const sentimentData = overview
    ? Object.entries(overview.sentimentDistribution)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  const priorityData = overview
    ? Object.entries(overview.priorityDistribution)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  const sentimentLabel = (score: number) => {
    if (score >= 75) return 'Positive';
    if (score >= 55) return 'Neutral';
    if (score >= 35) return 'Mixed';
    return 'Negative';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={cn("w-8 h-8 animate-spin", isDark ? "text-[#FF8A5B]" : "text-[#FF8A5B]")} />
          <p className={cn("text-sm", isDark ? "text-white/50" : "text-gray-500")}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={cn("text-2xl font-bold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
            {t('analytics.title') || 'Analytics'}
          </h2>
          <p className={cn("text-sm mt-1", isDark ? "text-white/50" : "text-gray-500")}>
            {t('analytics.subtitle') || 'Deep insights into your AI agent performance'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            isDark={isDark}
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={(start, end) => setDateRange({ start, end })}
          />
          <button
            onClick={fetchAnalytics}
            className={cn(
              "p-2.5 rounded-xl border transition-all duration-200 hover:scale-105",
              isDark ? "border-white/10 hover:bg-white/5 text-white/60 hover:text-white" : "border-gray-200 hover:bg-gray-50 text-gray-500"
            )}
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* KPI Cards — 4 cards matching MonitorView style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard isDark={isDark} title="Total Calls" value={overview?.totalCalls ?? 0} subtitle={`${overview?.voiceCalls ?? 0} voice · ${overview?.textCalls ?? 0} text`} icon={<Phone className="w-5 h-5" />} color="blue" />
        <KpiCard isDark={isDark} title="Resolution Rate" value={`${overview?.resolutionRate ?? 0}%`} subtitle="Resolved without follow-up" icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <KpiCard isDark={isDark} title="Avg Sentiment" value={`${overview?.avgSentiment ?? 50}/100`} subtitle={sentimentLabel(overview?.avgSentiment ?? 50)} icon={<Smile className="w-5 h-5" />} color="orange" />
        <KpiCard isDark={isDark} title="Avg Duration" value={`${overview?.avgDuration ?? 0}s`} subtitle={`${overview?.followUps ?? 0} need follow-up`} icon={<Clock className="w-5 h-5" />} color="purple" />
      </div>

      {/* Sentiment Trend + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sentiment Trend */}
        <SectionCard isDark={isDark}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className={cn("w-4 h-4", isDark ? "text-amber-400" : "text-amber-500")} />
            <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
              {t('analytics.sentimentTrend') || 'Sentiment Trend'}
            </h3>
          </div>
          <div className="h-[220px] sm:h-[260px]">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} />
                  <Tooltip content={(props: any) => <ChartTooltip {...props} isDark={isDark} />} />
                  <Area type="monotone" dataKey="avgSentiment" name="Sentiment" stroke="#f59e0b" fill="url(#sentGradient)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className={cn("text-sm", isDark ? "text-white/30" : "text-gray-400")}>No trend data yet</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Category Distribution */}
        <SectionCard isDark={isDark}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className={cn("w-4 h-4", isDark ? "text-purple-400" : "text-purple-500")} />
            <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
              {t('analytics.categoryDist') || 'Category Distribution'}
            </h3>
          </div>
          <div className="h-[220px] sm:h-[260px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1a1a1a' : '#fff',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: isDark ? '#fff' : '#111',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className={cn("text-sm", isDark ? "text-white/30" : "text-gray-400")}>No category data yet</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Priority Distribution + Top Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Priority Breakdown */}
        <SectionCard isDark={isDark}>
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className={cn("w-4 h-4", isDark ? "text-amber-400" : "text-amber-500")} />
            <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
              {t('analytics.priorityDist') || 'Priority Breakdown'}
            </h3>
          </div>
          <div className="space-y-4">
            {priorityData.length > 0 ? priorityData.map((item) => {
              const total = priorityData.reduce((s, i) => s + i.value, 0);
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn("text-sm font-medium capitalize", isDark ? "text-white/80" : "text-gray-700")}>{item.name}</span>
                    <span className={cn("text-xs font-mono", isDark ? "text-white/50" : "text-gray-500")}>{item.value} ({pct}%)</span>
                  </div>
                  <div className={cn("w-full h-2 rounded-full", isDark ? "bg-white/5" : "bg-gray-100")}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: PRIORITY_COLORS[item.name] || '#6366f1' }}
                    />
                  </div>
                </div>
              );
            }) : (
              <p className={cn("text-sm", isDark ? "text-white/30" : "text-gray-400")}>No data yet</p>
            )}
          </div>
        </SectionCard>

        {/* Top Topics */}
        <SectionCard isDark={isDark}>
          <div className="flex items-center gap-2 mb-5">
            <Hash className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-500")} />
            <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
              {t('analytics.topTopics') || 'Top Topics'}
            </h3>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
            {topTopics.length > 0 ? topTopics.map((item, i) => {
              const maxCount = topTopics[0]?.count || 1;
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.topic} className="flex items-center gap-3">
                  <span className={cn("text-xs font-mono w-5 text-right", isDark ? "text-white/30" : "text-gray-400")}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-sm truncate capitalize", isDark ? "text-white/80" : "text-gray-700")}>{item.topic}</span>
                      <span className={cn("text-xs ml-2 shrink-0 font-mono", isDark ? "text-white/40" : "text-gray-400")}>{item.count}</span>
                    </div>
                    <div className={cn("w-full h-1.5 rounded-full", isDark ? "bg-white/5" : "bg-gray-100")}>
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className={cn("text-sm", isDark ? "text-white/30" : "text-gray-400")}>No topics detected yet</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Sentiment Distribution */}
      <SectionCard isDark={isDark}>
        <div className="flex items-center gap-2 mb-5">
          <Smile className={cn("w-4 h-4", isDark ? "text-emerald-400" : "text-emerald-500")} />
          <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
            {t('analytics.sentimentDist') || 'Sentiment Distribution'}
          </h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {sentimentData.length > 0 ? sentimentData.map((item) => (
            <div
              key={item.name}
              className={cn(
                "px-4 py-3 rounded-xl border text-center min-w-[110px] transition-all duration-200",
                isDark ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.04]" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              )}
            >
              <div className="w-3 h-3 rounded-full mx-auto mb-2 ring-2 ring-offset-1" style={{ backgroundColor: SENTIMENT_COLORS[item.name] || '#94a3b8', ringColor: SENTIMENT_COLORS[item.name] || '#94a3b8', ['--tw-ring-offset-color' as string]: isDark ? '#09090B' : '#fff' }} />
              <div className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>{item.value}</div>
              <div className={cn("text-xs capitalize", isDark ? "text-white/40" : "text-gray-500")}>{item.name.replace(/_/g, ' ')}</div>
            </div>
          )) : (
            <p className={cn("text-sm", isDark ? "text-white/30" : "text-gray-400")}>No sentiment data yet</p>
          )}
        </div>
      </SectionCard>

      {/* ── Pattern Intelligence ─────────────────────────────────── */}
      <div className={cn("rounded-2xl border overflow-hidden", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          isDark ? "border-white/5" : "border-gray-100"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", isDark ? "bg-[#FF8A5B]/10" : "bg-orange-50")}>
              <Sparkles className="w-4 h-4 text-[#FF8A5B]" />
            </div>
            <div>
              <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>Pattern Intelligence</h3>
              <p className={cn("text-xs mt-0.5", isDark ? "text-white/40" : "text-gray-500")}>
                Which topics drive resolutions — and which predict escalations
              </p>
            </div>
          </div>
          {patterns && (
            <div className="flex items-center gap-3 text-xs">
              <div className={cn("flex items-center gap-2", isDark ? "text-white/40" : "text-gray-400")}>
                <span>Overall FCR</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                  {Math.round((patterns.overallFCR ?? 0) * 100)}%
                </span>
              </div>
              <div className={cn("flex items-center gap-2", isDark ? "text-white/40" : "text-gray-400")}>
                <span>Calls analyzed</span>
                <span className={cn("font-mono font-bold", isDark ? "text-white/70" : "text-gray-600")}>
                  {patterns.totalCalls}
                </span>
              </div>
            </div>
          )}
        </div>

        {patternsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-[#FF8A5B]" />
              <p className={cn("text-xs", isDark ? "text-white/30" : "text-gray-400")}>Analyzing patterns...</p>
            </div>
          </div>
        ) : !patterns || (patterns.winningSignals.length === 0 && patterns.riskSignals.length === 0 && patterns.categoryFCR.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Hash className={cn("w-8 h-8", isDark ? "text-white/10" : "text-gray-200")} />
            <p className={cn("text-sm", isDark ? "text-white/30" : "text-gray-400")}>
              Need more call history to detect patterns
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Winning + Risk signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Winning signals */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-md bg-emerald-500/10">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className={cn("text-sm font-semibold", isDark ? "text-white/80" : "text-gray-700")}>
                    Winning Signals
                  </span>
                  <span className={cn("text-[11px]", isDark ? "text-white/30" : "text-gray-400")}>
                    — higher in resolved calls
                  </span>
                </div>
                <div className="space-y-2.5">
                  {patterns.winningSignals.length > 0 ? patterns.winningSignals.slice(0, 8).map((s) => {
                    const liftPct = Math.min(Math.round(((s.lift - 1) / Math.max(s.lift, 1)) * 100), 100);
                    return (
                      <div key={s.signal} className="flex items-center gap-3 group">
                        <span className={cn(
                          "text-xs truncate w-28 shrink-0 capitalize transition-colors",
                          isDark ? "text-white/60 group-hover:text-white/90" : "text-gray-500 group-hover:text-gray-700"
                        )}>
                          {s.signal}
                        </span>
                        <div className={cn("flex-1 h-2 rounded-full", isDark ? "bg-white/5" : "bg-gray-100")}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                            style={{ width: `${Math.max(liftPct, 8)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-emerald-400 font-mono w-12 text-right shrink-0 font-bold">
                          {s.lift.toFixed(2)}×
                        </span>
                        <span className={cn("text-[10px] w-8 text-right shrink-0", isDark ? "text-white/25" : "text-gray-300")}>
                          {s.totalOccurrences}
                        </span>
                      </div>
                    );
                  }) : (
                    <p className={cn("text-xs", isDark ? "text-white/30" : "text-gray-400")}>No winning signals yet</p>
                  )}
                </div>
              </div>

              {/* Risk signals */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-md bg-rose-500/10">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <span className={cn("text-sm font-semibold", isDark ? "text-white/80" : "text-gray-700")}>
                    Risk Signals
                  </span>
                  <span className={cn("text-[11px]", isDark ? "text-white/30" : "text-gray-400")}>
                    — higher in unresolved calls
                  </span>
                </div>
                <div className="space-y-2.5">
                  {patterns.riskSignals.length > 0 ? patterns.riskSignals.slice(0, 8).map((s) => {
                    const riskPct = Math.min(Math.round(((1 - s.lift) / 1) * 100), 100);
                    return (
                      <div key={s.signal} className="flex items-center gap-3 group">
                        <span className={cn(
                          "text-xs truncate w-28 shrink-0 capitalize transition-colors",
                          isDark ? "text-white/60 group-hover:text-white/90" : "text-gray-500 group-hover:text-gray-700"
                        )}>
                          {s.signal}
                        </span>
                        <div className={cn("flex-1 h-2 rounded-full", isDark ? "bg-white/5" : "bg-gray-100")}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-700"
                            style={{ width: `${Math.max(riskPct, 8)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-rose-400 font-mono w-12 text-right shrink-0 font-bold">
                          {s.lift === 0 ? '∞' : `${s.lift.toFixed(2)}×`}
                        </span>
                        <span className={cn("text-[10px] w-8 text-right shrink-0", isDark ? "text-white/25" : "text-gray-300")}>
                          {s.totalOccurrences}
                        </span>
                      </div>
                    );
                  }) : (
                    <p className={cn("text-xs", isDark ? "text-white/30" : "text-gray-400")}>No risk signals yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Category FCR bars */}
            {patterns.categoryFCR.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-md bg-blue-500/10">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className={cn("text-sm font-semibold", isDark ? "text-white/80" : "text-gray-700")}>
                    First Call Resolution by Category
                  </span>
                </div>
                <div className="space-y-3">
                  {patterns.categoryFCR.slice(0, 8).map((c) => {
                    const pct = Math.round(c.fcrRate * 100);
                    const color = pct >= 70 ? 'from-emerald-500 to-emerald-400' : pct >= 40 ? 'from-amber-500 to-amber-400' : 'from-rose-500 to-rose-400';
                    return (
                      <div key={c.category} className="flex items-center gap-3">
                        <span className={cn("text-xs capitalize w-28 shrink-0 truncate", isDark ? "text-white/70" : "text-gray-600")}>
                          {c.category}
                        </span>
                        <div className={cn("flex-1 h-2.5 rounded-full", isDark ? "bg-white/5" : "bg-gray-100")}>
                          <div
                            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", color)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={cn("text-[11px] font-mono w-10 text-right shrink-0 font-bold", isDark ? "text-white/60" : "text-gray-600")}>
                          {pct}%
                        </span>
                        <span className={cn("text-[10px] w-16 shrink-0 text-right", isDark ? "text-white/30" : "text-gray-400")}>
                          {c.totalCalls} calls
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
