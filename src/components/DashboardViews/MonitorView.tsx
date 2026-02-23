import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Phone, Clock, Activity, AlertCircle, Radio } from 'lucide-react';
import { cn } from '../../utils/cn';
import { LiveCallMonitor } from '../DemoCall';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// --- Constants ---


// --- Types ---
interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    subtitle: string;
    icon?: React.ReactNode;
    isDark: boolean;
    progress?: number;
    color?: 'emerald' | 'blue' | 'purple' | 'orange';
}

// Chart data is now computed from real callHistory inside the component

// --- Components ---

function StatsCard({ title, value, change, trend, subtitle, icon, isDark, progress, color = 'emerald' }: StatsCardProps) {
    return (
        <div className={cn(
            "p-8 rounded-2xl border flex flex-col justify-between h-[220px] relative overflow-hidden transition-all duration-300 hover:border-opacity-50",
            isDark
                ? cn("bg-[#09090B]",
                    color === 'emerald' ? "border-emerald-500/20" :
                        color === 'blue' ? "border-blue-500/20" :
                            color === 'purple' ? "border-purple-500/20" :
                                color === 'orange' ? "border-orange-500/20" : "border-white/10"
                )
                : "bg-white border-black/10"
        )}>
            {/* Ambient Background Glow - Centered like Billing View */}
            <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[80px] opacity-20 pointer-events-none",
                color === 'emerald' && "bg-emerald-500",
                color === 'blue' && "bg-blue-500",
                color === 'purple' && "bg-purple-500",
                color === 'orange' && "bg-orange-500"
            )} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                            "p-2 rounded-lg border shrink-0",
                            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5",
                            color === 'emerald' && isDark && "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                            color === 'blue' && isDark && "text-blue-400 bg-blue-500/10 border-blue-500/20",
                            color === 'purple' && isDark && "text-purple-400 bg-purple-500/10 border-purple-500/20",
                            color === 'orange' && isDark && "text-orange-400 bg-orange-500/10 border-orange-500/20"
                        )}>
                            {icon}
                        </div>
                        <h3 className={cn("text-sm font-medium truncate",
                            isDark
                                ? (color === 'emerald' ? "text-emerald-400" :
                                    color === 'blue' ? "text-blue-400" :
                                        color === 'purple' ? "text-purple-400" :
                                            color === 'orange' ? "text-orange-400" : "text-gray-400")
                                : (color === 'emerald' ? "text-emerald-600" :
                                    color === 'blue' ? "text-blue-600" :
                                        color === 'purple' ? "text-purple-600" :
                                            color === 'orange' ? "text-orange-600" : "text-gray-600")
                        )}>
                            {title}
                        </h3>
                    </div>
                    {change && (
                        <div className={cn(
                            "shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                            trend === 'up'
                                ? (isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-100 text-emerald-700 border-emerald-200")
                                : trend === 'down'
                                    ? (isDark ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-rose-100 text-rose-700 border-rose-200")
                                    : (isDark ? "bg-gray-500/10 text-gray-400 border-gray-500/20" : "bg-gray-100 text-gray-700 border-gray-200")
                        )}>
                            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {change}
                        </div>
                    )}
                </div>

                <div className="z-10 mt-auto">
                    <div className={cn(
                        "text-5xl font-bold tracking-tight mb-4",
                        isDark ? "text-white" : "text-gray-900"
                    )}>
                        {value}
                    </div>

                    {/* Progress Bar */}
                    {progress !== undefined && (
                        <div className={cn("w-full h-1.5 rounded-full mb-3 overflow-hidden", isDark ? "bg-white/10" : "bg-gray-100")}>
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    color === 'emerald' && "bg-emerald-500",
                                    color === 'blue' && "bg-blue-500",
                                    color === 'purple' && "bg-purple-500",
                                    color === 'orange' && "bg-orange-500"
                                )}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    )}

                    <p className={cn(
                        "text-xs flex items-center gap-1",
                        isDark ? "text-gray-500" : "text-gray-500"
                    )}>
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    );
}

function SectionTab({ active, onClick, children, isDark }: { active: boolean, onClick: () => void, children: React.ReactNode, isDark: boolean }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                active
                    ? (isDark ? "text-white" : "text-black")
                    : (isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black")
            )}
        >
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className={cn(
                        "absolute inset-0 rounded-full shadow-sm",
                        isDark ? "bg-white/10" : "bg-white shadow"
                    )}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </button>
    );
}

export default function MonitorView({ isDark = true }: { isDark?: boolean }) {
    const { t } = useLanguage();
    const { getAnalytics, callHistory, currentCall } = useDemoCall();
    const analytics = getAnalytics();
    const [activeSection, setActiveSection] = useState<'history' | 'live'>('live');
    const [chartRange, setChartRange] = useState<'week' | 'month' | 'all'>('month');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    const filteredHistory = useMemo(() => {
        return callHistory.filter(call => filterPriority === 'all' || call.priority === filterPriority);
    }, [callHistory, filterPriority]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Compute chart data from real callHistory aggregated by day
    const chartData = useMemo(() => {
        const data: { name: string; calls: number }[] = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (chartRange === 'week' || chartRange === 'month') {
            const daysCount = chartRange === 'week' ? 7 : 30;
            for (let i = daysCount - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));

                const callCount = callHistory.filter(c =>
                    new Date(c.date) >= dayStart &&
                    new Date(c.date) <= dayEnd
                ).length;

                const name = chartRange === 'week'
                    ? dayNames[dayStart.getDay()]
                    : `${dayStart.getDate()} ${monthNames[dayStart.getMonth()]}`;

                data.push({
                    name,
                    calls: callCount
                });
            }
        } else {
            // 'all' -> Last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

                const callCount = callHistory.filter(c =>
                    new Date(c.date) >= monthStart &&
                    new Date(c.date) <= monthEnd
                ).length;

                data.push({
                    name: monthNames[monthStart.getMonth()],
                    calls: callCount
                });
            }
        }

        return data;
    }, [callHistory, chartRange]);



    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={cn(
                    "px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl",
                    isDark ? "bg-[#18181B]/95 border-white/10" : "bg-white/95 border-black/10"
                )}>
                    <p className={cn("text-[13px] font-medium mb-1.5", isDark ? "text-zinc-400" : "text-zinc-500")}>{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <span className={cn("text-base font-semibold", isDark ? "text-white" : "text-gray-900")}>
                            {payload[0].value} <span className="text-sm font-normal text-gray-500 ml-1">{t('monitor.stats.totalCalls')}</span>
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>
                        {t('monitor.title')}
                    </h1>
                    <p className={cn("text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>
                        {t('monitor.appSubtitle')}
                    </p>
                </div>

            </div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatsCard
                    title={t('monitor.stats.totalCalls')}
                    value={analytics.totalCalls}
                    subtitle={t('monitor.stats.last7Days')}
                    icon={<Phone className="w-5 h-5" />}
                    color="blue"
                    progress={Math.min((analytics.totalCalls / 50) * 100, 100)}
                    isDark={isDark}
                />
                <StatsCard
                    title={t('monitor.stats.avgDuration')}
                    value={formatDuration(analytics.avgDuration)}
                    subtitle={t('monitor.stats.target')}
                    icon={<Clock className="w-5 h-5" />}
                    color="purple"
                    progress={Math.min((analytics.avgDuration / 300) * 100, 100)}
                    isDark={isDark}
                />
                <StatsCard
                    title={t('monitor.stats.activeSessions')}
                    value={currentCall?.status === 'active' ? 1 : 0}
                    change={currentCall?.status === 'active' ? 'LIVE' : undefined}
                    trend={currentCall?.status === 'active' ? 'up' : undefined}
                    subtitle={t('monitor.stats.realTimeConn')}
                    icon={<Activity className="w-5 h-5" />}
                    color="emerald"
                    progress={currentCall?.status === 'active' ? 100 : 0}
                    isDark={isDark}
                />

                {/* Follow-ups Required Card - Real Data, No Pending Pill */}
                <StatsCard
                    title={t('monitor.stats.followUps')}
                    value={analytics.followUpRequired}
                    subtitle={t('monitor.stats.needsAction')}
                    icon={<AlertCircle className="w-5 h-5" />}
                    color="orange"
                    progress={analytics.totalCalls > 0 ? (analytics.followUpRequired / analytics.totalCalls) * 100 : 0}
                    isDark={isDark}
                />            </motion.div>

            {/* Main Chart Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                    "p-8 rounded-2xl border min-h-[400px] flex flex-col relative overflow-hidden",
                    isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
                )}
            >
                {/* Background Glow */}
                <div className={cn(
                    "absolute -top-[200px] left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none",
                    isDark ? "bg-blue-500" : "bg-blue-300"
                )} />

                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
                    <div>
                        <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>{t('monitor.chart.title')}</h2>
                        <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{t('monitor.chart.subtitle')}</p>
                    </div>

                    <div className={cn(
                        "flex items-center p-1 rounded-lg border",
                        isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                    )}>
                        {(['week', 'month', 'all'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setChartRange(range)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                                    chartRange === range
                                        ? isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-sm"
                                        : isDark ? "text-white/50 hover:text-white/80 hover:bg-white/5" : "text-black/50 hover:text-black/80 hover:bg-black/5"
                                )}
                            >
                                {range === 'week' ? (t('monitor.filter.week') || 'Week') : range === 'month' ? (t('monitor.filter.month') || 'Month') : (t('monitor.filter.allTime') || 'All Time')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 w-full h-[300px] min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 20 }}>
                            <defs>
                                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: isDark ? '#71717A' : '#A1A1AA', fontSize: 12, fontWeight: 500 }}
                                dy={15}
                                minTickGap={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: isDark ? '#71717A' : '#A1A1AA', fontSize: 12 }}
                                allowDecimals={false}
                                dx={-10}
                                domain={[0, (dataMax: number) => Math.max(5, dataMax)]}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area
                                type="monotone"
                                dataKey="calls"
                                stroke="url(#lineGradient)"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorCalls)"
                                animationDuration={1000}
                                activeDot={{ r: 6, fill: "#3b82f6", stroke: isDark ? "#18181B" : "#ffffff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Bottom Section: Tabs & Table/Monitor */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className={cn(
                        "flex items-center p-1.5 rounded-full border shadow-sm",
                        isDark ? "bg-black/40 border-white/10 backdrop-blur-md" : "bg-gray-50 border-gray-200"
                    )}>
                        <SectionTab isDark={isDark} active={activeSection === 'live'} onClick={() => setActiveSection('live')}>
                            <Radio className={cn("w-4 h-4", activeSection === 'live' && "text-rose-500 animate-pulse")} />
                            {t('monitor.tab.live')}
                        </SectionTab>
                        <SectionTab isDark={isDark} active={activeSection === 'history'} onClick={() => setActiveSection('history')}>
                            <Clock className="w-4 h-4" />
                            {t('monitor.tab.history')}
                        </SectionTab>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className={cn(
                                "bg-transparent flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-colors cursor-pointer focus:outline-none appearance-none",
                                isDark ? "border-white/10 hover:bg-white/5 text-white/80" : "border-black/10 hover:bg-gray-50 text-gray-700"
                            )}
                        >
                            <option value="all">All Priorities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>

                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeSection === 'live' ? (
                        <div className={cn(
                            "rounded-2xl border overflow-hidden relative",
                            isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
                        )}>
                            <div className="p-1">
                                <LiveCallMonitor isDark={isDark} />
                            </div>
                        </div>
                    ) : (
                        <div className={cn(
                            "rounded-2xl border overflow-hidden",
                            isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
                        )}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className={cn(
                                        "text-xs uppercase font-semibold tracking-wider",
                                        isDark ? "bg-white/5 text-white/50" : "bg-gray-50 text-gray-500"
                                    )}>
                                        <tr>
                                            <th className="px-8 py-5">{t('monitor.table.caller')}</th>
                                            <th className="px-6 py-5">{t('monitor.table.category')}</th>
                                            <th className="px-6 py-5">{t('monitor.table.status')}</th>
                                            <th className="px-6 py-5">{t('monitor.table.duration')}</th>
                                            <th className="px-6 py-5">{t('monitor.table.date')}</th>
                                            <th className="px-6 py-5 text-right">{t('monitor.table.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-gray-200")}>
                                        {filteredHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className={cn("px-6 py-12 text-center", isDark ? "text-white/40" : "text-gray-500")}>
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className={cn("p-4 rounded-full", isDark ? "bg-white/5" : "bg-gray-100")}>
                                                            <Clock className="w-6 h-6 opacity-50" />
                                                        </div>
                                                        <p>{t('monitor.table.noHistory')}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredHistory.slice(0, 8).map((call) => (
                                                <React.Fragment key={call.id}>
                                                    <tr className={cn("transition-colors group", isDark ? "hover:bg-white/5" : "hover:bg-gray-50")}>
                                                        <td className={cn("px-8 py-5 font-medium", isDark ? "text-white" : "text-gray-900")}>
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                                    isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"
                                                                )}>
                                                                    {call.callerName.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                {call.callerName}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm",
                                                                call.category
                                                                    ? `bg-${call.category.color}-500/10 text-${call.category.color}-500 border-${call.category.color}-500/20`
                                                                    : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                                            )}>
                                                                {call.category?.name || t('monitor.category.uncategorized')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={cn(
                                                                "flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm",
                                                                call.priority === 'critical' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                                    call.priority === 'high' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                            )}>
                                                                <div className={cn("w-1.5 h-1.5 rounded-full",
                                                                    call.priority === 'critical' ? "bg-red-400 font-bold animate-pulse" :
                                                                        call.priority === 'high' ? "bg-orange-400" : "bg-emerald-400"
                                                                )} />
                                                                {call.priority === 'critical' ? t('monitor.status.critical') : call.priority === 'high' ? t('monitor.status.high') : t('monitor.status.resolved')}
                                                            </span>
                                                        </td>
                                                        <td className={cn("px-6 py-5 font-mono text-xs", isDark ? "text-white/60" : "text-gray-600")}>
                                                            {formatDuration(call.duration)}
                                                        </td>
                                                        <td className={cn("px-6 py-5 text-xs", isDark ? "text-white/60" : "text-gray-600")}>
                                                            {new Date(call.date).toLocaleDateString()} <span className="opacity-50 ml-1">{new Date(call.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <button
                                                                onClick={() => setExpandedLogId(expandedLogId === call.id ? null : call.id)}
                                                                className={cn(
                                                                    "p-2 rounded-lg transition-all",
                                                                    expandedLogId === call.id
                                                                        ? (isDark ? "bg-white/10 text-white" : "bg-gray-200 text-gray-900")
                                                                        : (isDark ? "opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/40 hover:text-white" : "opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 hover:text-gray-900")
                                                                )}>
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedLogId === call.id && (
                                                        <tr>
                                                            <td colSpan={6} className={cn("px-8 py-6", isDark ? "bg-white/[0.02]" : "bg-black/[0.02]")}>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                    <div>
                                                                        <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5", isDark ? "text-white/40" : "text-black/40")}>
                                                                            Summary
                                                                        </h4>
                                                                        <div className={cn("p-4 rounded-xl border", isDark ? "border-white/10 bg-black/20" : "border-black/5 bg-white")}>
                                                                            <p className={cn("text-sm leading-relaxed", isDark ? "text-white/80" : "text-gray-700")}>
                                                                                {call.summary.summaryText || "No summary available."}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {call.extractedFields.length > 0 && (
                                                                        <div>
                                                                            <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", isDark ? "text-white/40" : "text-black/40")}>Extracted Data</h4>
                                                                            <div className={cn("rounded-xl border border-white/10", isDark ? "bg-black/20" : "bg-white")}>
                                                                                <div className="space-y-1 p-3">
                                                                                    {call.extractedFields.map(field => (
                                                                                        <div key={field.id} className={cn("flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors")}>
                                                                                            <span className={cn("opacity-70", isDark ? "text-white" : "text-gray-900")}>{field.label}</span>
                                                                                            <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{field.value}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
