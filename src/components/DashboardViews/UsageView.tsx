import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, MessageSquare, Mic, Coins } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../config/supabase';
import DateRangePicker from './DateRangePicker';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    subtitle: string;
    isDark: boolean;
    progress?: number;
}

const TOTAL_CREDITS = 50;
const VOICE_CREDITS_PER_MINUTE = 1;
const TEXT_CREDITS_PER_10_REQUESTS = 1;

function StatsCard({ title, value, change, trend, subtitle, isDark, progress }: StatsCardProps) {
    return (
        <div className={cn(
            "p-6 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300",
            isDark
                ? "bg-[#09090B] border-white/10"
                : "bg-white border-black/10"
        )}>
            <div className="flex justify-between items-start z-10 mb-4">
                <h3 className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                    {title}
                </h3>
                {change && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                        trend === 'up'
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                    )}>
                        {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : null}
                        {change}
                    </div>
                )}
            </div>

            <div className="z-10 mt-auto">
                <div className={cn(
                    "text-3xl font-bold tracking-tight mb-1",
                    isDark ? "text-white" : "text-gray-900"
                )}>
                    {value}
                </div>

                {progress !== undefined && (
                    <div className={cn("w-full h-1 rounded-full mt-3 mb-2", isDark ? "bg-white/10" : "bg-gray-100")}>
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                progress > 100 ? "bg-rose-500" : progress > 80 ? "bg-orange-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                )}

                <p className={cn(
                    "text-xs",
                    isDark ? "text-gray-500" : "text-gray-500"
                )}>
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

export default function UsageView({ isDark = true }: { isDark?: boolean }) {
    const { t, language } = useLanguage();
    const { callHistory, getAnalytics } = useDemoCall();
    const analytics = getAnalytics();

    const [liveCredits, setLiveCredits] = useState<number | null>(null);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchLiveBalance = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`https://xlzwfkgurrrspcdyqele.supabase.co/functions/v1/api-billing/balance`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLiveCredits(Number(data.balance));
            }
        } catch (e) {
            console.error('Failed to fetch live balance', e);
        }
    };

    const handleRedeem = async () => {
        if (!redeemCode) return;
        setIsRedeeming(true);
        setRedeemMessage(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`https://xlzwfkgurrrspcdyqele.supabase.co/functions/v1/api-billing/redeem`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: redeemCode })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t('usage.redeemError'));
            setRedeemMessage({ type: 'success', text: t('usage.redeemSuccess').replace('{count}', data.added_amount.toString()) });
            setRedeemCode('');
            fetchLiveBalance();
        } catch (e: any) {
            setRedeemMessage({ type: 'error', text: e.message || t('usage.redeemError') });
        } finally {
            setIsRedeeming(false);
        }
    };

    useMemo(() => {
        fetchLiveBalance();
    }, []);

    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
    });

    // Calculate actual usage from call history
    const usageStats = useMemo(() => {
        const voiceCalls = callHistory.filter(c => c.type === 'voice');
        const textChats = callHistory.filter(c => c.type === 'text');

        // Calculate voice minutes (duration is in seconds)
        const totalVoiceSeconds = voiceCalls.reduce((acc, call) => acc + (call.duration || 0), 0);
        const totalVoiceMinutes = Math.ceil(totalVoiceSeconds / 60);

        // Calculate text requests
        const totalTextRequests = textChats.reduce((acc, call) => acc + call.messages.filter(m => m.speaker === 'user').length, 0);

        // Calculate credits used locally purely for visualization (not enforced, rely on backend liveCredits)
        const voiceCreditsUsed = totalVoiceMinutes * VOICE_CREDITS_PER_MINUTE;
        const textCreditsUsed = Math.ceil(totalTextRequests / 10) * TEXT_CREDITS_PER_10_REQUESTS;
        const totalCreditsUsed = voiceCreditsUsed + textCreditsUsed;
        const fallbackCreditsRemaining = Math.max(0, TOTAL_CREDITS - totalCreditsUsed);

        const creditsRemaining = liveCredits !== null ? liveCredits : fallbackCreditsRemaining;

        return {
            voiceCalls: voiceCalls.length,
            textChats: textChats.length,
            totalVoiceMinutes,
            totalTextRequests,
            voiceCreditsUsed,
            textCreditsUsed,
            totalCreditsUsed,
            creditsRemaining,
            creditsUsedPercent: liveCredits !== null ? 100 : (totalCreditsUsed / TOTAL_CREDITS) * 100
        };
    }, [callHistory, liveCredits]);

    // Use actual activity data for the chart, aggregated by day
    const chartData = useMemo(() => {
        const data: { name: string; voice: number; text: number }[] = [];
        const locale = language === 'de' ? 'de-DE' : 'en-US';
        const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

        // Show last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const voiceCount = callHistory.filter(c =>
                c.type === 'voice' &&
                new Date(c.date) >= dayStart &&
                new Date(c.date) <= dayEnd
            ).length;

            const textCount = callHistory.filter(c =>
                c.type === 'text' &&
                new Date(c.date) >= dayStart &&
                new Date(c.date) <= dayEnd
            ).length;

            data.push({
                name: dayFormatter.format(dayStart),
                voice: voiceCount * 5, // Scale for visibility if needed, or keeping real
                text: textCount
            });
        }
        return data;
    }, [callHistory]);

    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={cn(
                    "p-3 rounded-lg border shadow-lg backdrop-blur-md",
                    isDark ? "bg-black/80 border-white/10" : "bg-white/80 border-black/10"
                )}>
                    <p className={cn("text-xs font-semibold mb-2", isDark ? "text-white" : "text-black")}>{label}</p>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className={isDark ? "text-gray-300" : "text-gray-600"}>{t('usage.voice')}: {payload[0].value}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className={isDark ? "text-gray-300" : "text-gray-600"}>{t('usage.text')}: {payload[1].value}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>
                        {t('usage.title')}
                    </h1>
                    <p className={cn("text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>
                        {t('usage.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onChange={(start, end) => setDateRange({ start, end })}
                        isDark={isDark}
                    />
                </div>
            </div>

            {/* Credits Banner */}
            <div className={cn(
                "p-6 rounded-xl border relative overflow-hidden",
                isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
            )}>
                {/* Background Glow */}
                <div className={cn(
                    "absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none",
                    usageStats.creditsRemaining > 10 ? "bg-emerald-500" : "bg-rose-500"
                )} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center border",
                            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                        )}>
                            <Coins className={cn(
                                "w-6 h-6",
                                usageStats.creditsRemaining > 10 ? "text-emerald-500" : "text-rose-500"
                            )} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>
                                    {t('usage.freePlanStatus')}
                                </h2>
                                <span className={cn(
                                    "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border",
                                    usageStats.creditsRemaining > 10
                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                )}>
                                    {usageStats.creditsRemaining > 0 ? t('usage.active') : t('usage.limitReached')}
                                </span>
                            </div>
                            <p className={cn("text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>
                                {t('usage.creditsRemaining').replace('{count}', String(usageStats.creditsRemaining))}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-[300px]">

                        <div className="relative w-full">
                            <div className="flex bg-transparent rounded-lg border focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden w-full transition-all border-black/10 dark:border-white/10">
                                <input
                                    type="text"
                                    placeholder={t('usage.redeemPlaceholder')}
                                    value={redeemCode}
                                    onChange={e => setRedeemCode(e.target.value)}
                                    className="px-3 py-1.5 bg-transparent border-none text-sm w-full outline-none dark:text-white"
                                />
                                <button
                                    onClick={handleRedeem}
                                    disabled={isRedeeming}
                                    className="bg-emerald-500 text-white px-3 text-xs font-bold whitespace-nowrap"
                                >
                                    {isRedeeming ? '...' : t('usage.redeemAction')}
                                </button>
                            </div>
                            {redeemMessage && (
                                <p className={cn("text-xs mt-1 absolute", redeemMessage.type === 'error' ? 'text-rose-500' : 'text-emerald-500')}>
                                    {redeemMessage.text}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                    title={t('usage.voiceMinutes')}
                    value={usageStats.totalVoiceMinutes}
                    subtitle={t('usage.creditPerMin')}
                    progress={(usageStats.totalVoiceMinutes / TOTAL_CREDITS) * 100}
                    isDark={isDark}
                />
                <StatsCard
                    title={t('usage.textRequests')}
                    value={usageStats.totalTextRequests}
                    subtitle={t('usage.creditPerReqs')}
                    progress={(usageStats.totalTextRequests / (TOTAL_CREDITS * 10)) * 100}
                    isDark={isDark}
                />
                <StatsCard
                    title={t('usage.totalSessions')}
                    value={analytics.totalCalls}
                    subtitle={t('usage.lifetimeCalls')}
                    change={analytics.followUpRequired > 0 ? t('usage.followUps').replace('{count}', String(analytics.followUpRequired)) : undefined}
                    trend="neutral"
                    isDark={isDark}
                />
                <StatsCard
                    title={t('usage.avgDuration')}
                    value={analytics.avgDuration > 0 ? `${Math.floor(analytics.avgDuration / 60)}m ${Math.round(analytics.avgDuration % 60)}s` : '0m 0s'}
                    subtitle={t('usage.perSession')}
                    isDark={isDark}
                />
            </div>

            {/* Main Graph */}
            <div className={cn(
                "p-6 rounded-xl border h-[400px] flex flex-col",
                isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
            )}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>{t('usage.usageTrends')}</h2>
                        <p className={cn("text-sm", isDark ? "text-white/40" : "text-black/40")}>{t('usage.last7Days')}</p>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className={isDark ? "text-white/60" : "text-black/60"}>{t('usage.voice')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className={isDark ? "text-white/60" : "text-black/60"}>{t('usage.text')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVoice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorText" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: isDark ? '#666' : '#999', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: isDark ? '#666' : '#999', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="voice"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorVoice)"
                            />
                            <Area
                                type="monotone"
                                dataKey="text"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorText)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Usage Breakdown */}
            <div className={cn(
                "rounded-xl border overflow-hidden",
                isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
            )}>
                <div className="p-6 border-b border-inherit">
                    <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>{t('usage.usageBreakdown')}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className={cn(
                            "text-xs uppercase font-semibold",
                            isDark ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-600"
                        )}>
                            <tr>
                                <th className="px-6 py-4">{t('usage.table.service')}</th>
                                <th className="px-6 py-4">{t('usage.table.consumption')}</th>
                                <th className="px-6 py-4">{t('usage.table.creditsUsed')}</th>
                                <th className="px-6 py-4 text-right">{t('usage.table.limit')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                            <tr className={cn(isDark ? "hover:bg-white/5" : "hover:bg-gray-50")}>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", isDark ? "bg-emerald-500/10" : "bg-emerald-50")}>
                                        <Mic className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span className={isDark ? "text-white" : "text-black"}>{t('usage.voiceCallsLabel')}</span>
                                </td>
                                <td className={cn("px-6 py-4", isDark ? "text-gray-400" : "text-gray-600")}>
                                    {t('usage.mins').replace('{count}', String(usageStats.totalVoiceMinutes))}
                                </td>
                                <td className={cn("px-6 py-4 font-medium", isDark ? "text-white" : "text-black")}>
                                    {usageStats.voiceCreditsUsed}
                                </td>
                                <td className={cn("px-6 py-4 text-right", isDark ? "text-gray-400" : "text-gray-600")}>{t('usage.credits').replace('{count}', '50')}</td>
                            </tr>
                            <tr className={cn(isDark ? "hover:bg-white/5" : "hover:bg-gray-50")}>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", isDark ? "bg-blue-500/10" : "bg-blue-50")}>
                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className={isDark ? "text-white" : "text-black"}>{t('usage.textChatLabel')}</span>
                                </td>
                                <td className={cn("px-6 py-4", isDark ? "text-gray-400" : "text-gray-600")}>
                                    {t('usage.reqs').replace('{count}', String(usageStats.totalTextRequests))}
                                </td>
                                <td className={cn("px-6 py-4 font-medium", isDark ? "text-white" : "text-black")}>
                                    {usageStats.textCreditsUsed}
                                </td>
                                <td className={cn("px-6 py-4 text-right", isDark ? "text-gray-400" : "text-gray-600")}>{t('usage.sharedPool')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
