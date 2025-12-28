import React from 'react';
import { AlertTriangle, TrendingUp, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDemoCall, PriorityLevel } from '../../contexts/DemoCallContext';

export default function PriorityQueue({ isDark, compact = false }: { isDark: boolean; compact?: boolean }) {
    const { getCallsByPriority } = useDemoCall();
    const { t } = useLanguage();

    const priorities: { level: PriorityLevel; label: string; shortLabel: string; color: string; icon: React.ElementType }[] = [
        { level: 'critical', label: t('dashboard.priority.critical'), shortLabel: t('dashboard.priority.critical'), color: 'red', icon: AlertTriangle },
        { level: 'high', label: t('dashboard.priority.high'), shortLabel: t('dashboard.priority.highShort'), color: 'orange', icon: TrendingUp },
        { level: 'medium', label: t('dashboard.priority.medium'), shortLabel: t('dashboard.priority.mediumShort'), color: 'yellow', icon: Clock },
        { level: 'low', label: t('dashboard.priority.low'), shortLabel: t('dashboard.priority.lowShort'), color: 'green', icon: CheckCircle },
    ];

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            red: isDark ? 'border-red-500/30 bg-red-500/10' : 'border-red-500/20 bg-red-500/5',
            orange: isDark ? 'border-orange-500/30 bg-orange-500/10' : 'border-orange-500/20 bg-orange-500/5',
            yellow: isDark ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-yellow-500/20 bg-yellow-500/5',
            green: isDark ? 'border-green-500/30 bg-green-500/10' : 'border-green-500/20 bg-green-500/5',
        };
        return colors[color];
    };

    const getIconColor = (color: string) => {
        const colors: Record<string, string> = {
            red: 'text-red-400',
            orange: 'text-orange-400',
            yellow: 'text-yellow-400',
            green: 'text-green-400',
        };
        return colors[color];
    };

    if (compact) {
        return (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {priorities.map(({ level, shortLabel, color, icon: Icon }) => {
                    const calls = getCallsByPriority(level);
                    return (
                        <div
                            key={level}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl border flex-shrink-0",
                                getColorClass(color)
                            )}
                        >
                            <Icon className={cn("w-4 h-4", getIconColor(color))} />
                            <span className={cn(
                                "text-xs font-medium whitespace-nowrap",
                                isDark ? "text-white/80" : "text-black/80"
                            )}>
                                {shortLabel}
                            </span>
                            <span className={cn(
                                "text-xs font-bold px-1.5 py-0.5 rounded",
                                isDark ? "bg-white/10" : "bg-black/10"
                            )}>
                                {calls.length}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={cn(
            "rounded-2xl overflow-hidden",
            isDark
                ? "bg-black/40 border border-white/10" // Updated to match new styling (transparent bg)
                : "bg-white/80 border border-black/10"
        )}>
            <div className={cn(
                "flex items-center gap-3 px-4 py-3 border-b",
                isDark ? "border-white/10" : "border-black/10"
            )}>
                <BarChart3 className={cn(
                    "w-5 h-5",
                    isDark ? "text-white/60" : "text-black/60"
                )} />
                <h3 className={cn(
                    "font-semibold",
                    isDark ? "text-white" : "text-black"
                )}>
                    {t('dashboard.priorityQueue')}
                </h3>
            </div>

            <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                {priorities.map(({ level, label, color, icon: Icon }) => {
                    const calls = getCallsByPriority(level);
                    const followUps = calls.filter(c => c.summary.followUpRequired).length;

                    return (
                        <div
                            key={level}
                            className={cn(
                                "flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl border",
                                getColorClass(color)
                            )}
                        >
                            <Icon className={cn("w-4 h-4 md:w-5 md:h-5 flex-shrink-0", getIconColor(color))} />
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "font-medium text-xs md:text-sm truncate",
                                    isDark ? "text-white" : "text-black"
                                )}>
                                    {label}
                                </p>
                                <p className={cn(
                                    "text-[10px] md:text-xs truncate",
                                    isDark ? "text-white/50" : "text-black/50"
                                )}>
                                    {followUps > 0 ? `${followUps} ${t('dashboard.priority.needFollowUp')}` : t('dashboard.priority.noPending')}
                                </p>
                            </div>
                            <div className={cn(
                                "w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm flex-shrink-0",
                                isDark ? "bg-white/10" : "bg-black/10"
                            )}>
                                {calls.length}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
