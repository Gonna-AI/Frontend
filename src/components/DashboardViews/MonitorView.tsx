import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { Phone, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';
import { LiveCallMonitor } from '../DemoCall';
import PriorityQueue from '../DemoCall/PriorityQueue';

function StatsCard({
    title,
    value,
    subtitle,
    isDark
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    isDark: boolean;
}) {
    return (
        <div className={cn(
            "p-6 rounded-xl border flex flex-col justify-between h-40",
            isDark
                ? "bg-black/40 border-white/10"
                : "bg-white border-black/10"
        )}>
            <div>
                <h3 className={cn("text-sm font-medium", isDark ? "text-white/60" : "text-black/60")}>
                    {title}
                </h3>
                <div className={cn(
                    "text-4xl font-semibold mt-2",
                    isDark ? "text-white" : "text-black"
                )}>
                    {value}
                </div>
            </div>
            {subtitle && (
                <p className={cn(
                    "text-xs font-medium",
                    isDark ? "text-white/40" : "text-black/40"
                )}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}

export default function MonitorView({ isDark = true }: { isDark?: boolean }) {
    const { getAnalytics, currentCall, globalActiveSessions } = useDemoCall();
    const { t } = useLanguage();
    const analytics = getAnalytics();

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div>
                <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>Platform Monitor</h1>
                <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>Real-time activity and analytics</p>
            </div>

            {/* Stats Grid - MATCHING USAGE VIEW STYLE */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <StatsCard
                    title={t('dashboard.totalHistory')}
                    value={analytics.totalCalls}
                    subtitle={currentCall?.status === 'active' ? `Active Call In Progress` : "Total processed calls"}
                    isDark={isDark}
                />
                <StatsCard
                    title="Critical Issues"
                    value={analytics.byPriority.critical + analytics.byPriority.high}
                    subtitle="Requires immediate attention"
                    isDark={isDark}
                />
                <StatsCard
                    title="Avg Duration"
                    value={formatDuration(analytics.avgDuration)}
                    subtitle="Average handle time"
                    isDark={isDark}
                />
                <StatsCard
                    title="Pending Follow-ups"
                    value={analytics.followUpRequired}
                    subtitle="Action items remaining"
                    isDark={isDark}
                />
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Active Sessions - Minimal Design */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn(
                            "p-6 rounded-xl border h-fit",
                            isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"
                        )}
                    >
                        <h3 className={cn("text-lg font-semibold mb-6", isDark ? "text-white" : "text-black")}>
                            {t('dashboard.activeSessions')}
                        </h3>

                        <div className="space-y-6">
                            {/* Voice Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center",
                                        globalActiveSessions.voice > 0
                                            ? "bg-teal-500/20 text-teal-400"
                                            : isDark ? "bg-white/5 text-white/20" : "bg-black/5 text-black/20"
                                    )}>
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className={cn("font-medium", isDark ? "text-white" : "text-black")}>Voice Calls</p>
                                        <p className={cn("text-xs", isDark ? "text-white/40" : "text-black/40")}>
                                            {globalActiveSessions.voice > 0 ? "Live now" : "No active calls"}
                                        </p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-2xl font-bold",
                                    globalActiveSessions.voice > 0 ? "text-teal-400" : isDark ? "text-white/20" : "text-black/20"
                                )}>
                                    {globalActiveSessions.voice}
                                </span>
                            </div>

                            {/* Divider if needed, or just space */}

                            {/* Text Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center",
                                        globalActiveSessions.text > 0
                                            ? "bg-blue-500/20 text-blue-400"
                                            : isDark ? "bg-white/5 text-white/20" : "bg-black/5 text-black/20"
                                    )}>
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className={cn("font-medium", isDark ? "text-white" : "text-black")}>Text Chats</p>
                                        <p className={cn("text-xs", isDark ? "text-white/40" : "text-black/40")}>
                                            {globalActiveSessions.text > 0 ? "Live now" : "No active chats"}
                                        </p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-2xl font-bold",
                                    globalActiveSessions.text > 0 ? "text-blue-400" : isDark ? "text-white/20" : "text-black/20"
                                )}>
                                    {globalActiveSessions.text}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <PriorityQueue isDark={isDark} />
                    </motion.div>
                </div>

                {/* Right Column - Live Monitor */}
                <div className="xl:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "h-[600px] border rounded-xl overflow-hidden",
                            isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"
                        )}
                    >
                        {/* Header for the panel inside LiveCallMonitor or simplified here? 
                             LiveCallMonitor has its own header. I'll trust it matches if I updated it? 
                             Actually LiveCallMonitor is complex. I'll just wrap it nicely.
                         */}
                        <LiveCallMonitor isDark={isDark} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
