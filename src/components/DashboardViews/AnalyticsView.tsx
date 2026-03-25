import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Phone, MessageSquare, Clock, CheckCircle2,
  Smile, AlertTriangle, Hash, Loader2, RefreshCw, Calendar,
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

// ─── KPI Card ─────────────────────────────────────────────────
function KpiCard({ title, value, subtitle, icon, trend, trendValue, isDark, color = 'blue' }: {
  title: string; value: string | number; subtitle: string;
  icon: React.ReactNode; trend?: 'up' | 'down' | 'neutral'; trendValue?: string;
  isDark: boolean; color?: 'blue' | 'emerald' | 'purple' | 'orange' | 'rose';
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
      "p-6 rounded-2xl border relative overflow-hidden transition-all duration-300",
      isDark ? `bg-[#09090B] ${c.border}` : "bg-white border-black/10"
    )}>
      <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full blur-[80px] opacity-15 pointer-events-none", c.glow)} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-lg border", isDark ? `${c.bg} ${c.border} ${c.text}` : "bg-black/5 border-black/5")}>
            {icon}
          </div>
          {trend && trendValue && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : trend === 'down' ? "bg-rose-500/10 text-rose-500" : "bg-gray-500/10 text-gray-500"
            )}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
              {trendValue}
            </div>
          )}
        </div>
        <div className={cn("text-3xl font-bold tracking-tight mb-1", isDark ? "text-white" : "text-gray-900")}>{value}</div>
        <div className={cn("text-sm font-medium mb-0.5", isDark ? c.text : "text-gray-600")}>{title}</div>
        <div className={cn("text-xs", isDark ? "text-white/40" : "text-gray-400")}>{subtitle}</div>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, label, isDark }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; isDark: boolean }) {
  if (!active || !payload) return null;
  return (
    <div className={cn("px-3 py-2 rounded-lg border text-xs shadow-lg", isDark ? "bg-[#1a1a1a] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900")}>
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>{entry.name}: {entry.value}</p>
      ))}
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

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;

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

  const categoryData = overview ? Object.entries(overview.categoryDistribution).map(([name, value]) => ({ name, value })) : [];
  const sentimentData = overview ? Object.entries(overview.sentimentDistribution).map(([name, value]) => ({ name, value })) : [];
  const priorityData = overview ? Object.entries(overview.priorityDistribution).map(([name, value]) => ({ name, value })) : [];

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
          <Loader2 className={cn("w-8 h-8 animate-spin", isDark ? "text-purple-400" : "text-purple-600")} />
          <p className={cn("text-sm", isDark ? "text-white/50" : "text-gray-500")}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
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
              "p-2 rounded-lg border transition-colors",
              isDark ? "border-white/10 hover:bg-white/5 text-white/60" : "border-gray-200 hover:bg-gray-50 text-gray-500"
            )}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard isDark={isDark} title="Total Calls" value={overview?.totalCalls ?? 0} subtitle={`${overview?.voiceCalls ?? 0} voice · ${overview?.textCalls ?? 0} text`} icon={<Phone className="w-4 h-4" />} color="blue" />
        <KpiCard isDark={isDark} title="Avg Duration" value={`${overview?.avgDuration ?? 0}s`} subtitle="Per interaction" icon={<Clock className="w-4 h-4" />} color="purple" />
        <KpiCard isDark={isDark} title="Resolution Rate" value={`${overview?.resolutionRate ?? 0}%`} subtitle="Resolved without follow-up" icon={<CheckCircle2 className="w-4 h-4" />} color="emerald" />
        <KpiCard isDark={isDark} title="Avg Sentiment" value={`${overview?.avgSentiment ?? 50}/100`} subtitle={sentimentLabel(overview?.avgSentiment ?? 50)} icon={<Smile className="w-4 h-4" />} color="orange" />
        <KpiCard isDark={isDark} title="Follow-ups" value={overview?.followUps ?? 0} subtitle="Requiring attention" icon={<AlertTriangle className="w-4 h-4" />} color="rose" />
      </div>

      {/* Call Volume Trend Chart */}
      <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
        <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
          {t('analytics.callVolume') || 'Call Volume Trend'}
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#999' : '#666' }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#999' : '#666' }} />
              <Tooltip content={(props: any) => <ChartTooltip {...props} isDark={isDark} />} />
              <Legend />
              <Bar dataKey="voice" name="Voice" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="text" name="Text" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment Trend + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
          <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
            {t('analytics.sentimentTrend') || 'Sentiment Trend'}
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#999' : '#666' }} tickFormatter={(d) => d.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: isDark ? '#999' : '#666' }} />
                <Tooltip content={(props: any) => <ChartTooltip {...props} isDark={isDark} />} />
                <Area type="monotone" dataKey="avgSentiment" name="Sentiment" stroke="#f59e0b" fill="url(#sentGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
          <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
            {t('analytics.categoryDist') || 'Category Distribution'}
          </h3>
          <div className="h-[260px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className={cn("text-sm", isDark ? "text-white/30" : "text-gray-400")}>No data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Priority Distribution + Top Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
          <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
            {t('analytics.priorityDist') || 'Priority Breakdown'}
          </h3>
          <div className="space-y-3">
            {priorityData.length > 0 ? priorityData.map((item) => {
              const total = priorityData.reduce((s, i) => s + i.value, 0);
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("text-sm font-medium capitalize", isDark ? "text-white/80" : "text-gray-700")}>{item.name}</span>
                    <span className={cn("text-xs", isDark ? "text-white/50" : "text-gray-500")}>{item.value} ({pct}%)</span>
                  </div>
                  <div className={cn("w-full h-2 rounded-full", isDark ? "bg-white/5" : "bg-gray-100")}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: PRIORITY_COLORS[item.name] || '#6366f1' }}
                    />
                  </div>
                </div>
              );
            }) : (
              <p className={cn("text-sm", isDark ? "text-white/30" : "text-gray-400")}>No data yet</p>
            )}
          </div>
        </div>

        {/* Top Topics */}
        <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
          <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
            {t('analytics.topTopics') || 'Top Topics'}
          </h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-hide">
            {topTopics.length > 0 ? topTopics.map((item, i) => {
              const maxCount = topTopics[0]?.count || 1;
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.topic} className="flex items-center gap-3">
                  <span className={cn("text-xs font-mono w-5 text-right", isDark ? "text-white/30" : "text-gray-400")}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn("text-sm truncate", isDark ? "text-white/80" : "text-gray-700")}>{item.topic}</span>
                      <span className={cn("text-xs ml-2 shrink-0", isDark ? "text-white/40" : "text-gray-400")}>{item.count}</span>
                    </div>
                    <div className={cn("w-full h-1 rounded-full", isDark ? "bg-white/5" : "bg-gray-100")}>
                      <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className={cn("text-sm", isDark ? "text-white/30" : "text-gray-400")}>No topics detected yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
        <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
          {t('analytics.sentimentDist') || 'Sentiment Distribution'}
        </h3>
        <div className="flex flex-wrap gap-3">
          {sentimentData.length > 0 ? sentimentData.map((item) => (
            <div
              key={item.name}
              className={cn("px-4 py-3 rounded-xl border text-center min-w-[120px]", isDark ? "bg-white/[0.02] border-white/10" : "bg-gray-50 border-gray-200")}
            >
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: SENTIMENT_COLORS[item.name] || '#94a3b8' }} />
              <div className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>{item.value}</div>
              <div className={cn("text-xs capitalize", isDark ? "text-white/40" : "text-gray-500")}>{item.name.replace(/_/g, ' ')}</div>
            </div>
          )) : (
            <p className={cn("text-sm", isDark ? "text-white/30" : "text-gray-400")}>No sentiment data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
