import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Phone,
  ArrowLeft,
  Brain,
  History,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { DemoCallProvider, useDemoCall, PriorityLevel } from '../contexts/DemoCallContext';
import {
  VoiceCallInterface,
  LiveCallMonitor,
  KnowledgeBase,
  CallHistoryList,
  UserSessionSwitcher,
} from '../components/DemoCall';

function AnalyticsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  isDark
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  isDark: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600',
    purple: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/10 text-purple-600',
    green: isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-500/10 text-green-600',
    orange: isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500/10 text-orange-600',
    red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-500/10 text-red-600',
  };

  return (
    <div className={cn(
      "p-3 md:p-4 rounded-xl",
      isDark
        ? "bg-white/5 border border-white/10"
        : "bg-black/5 border border-black/10"
    )}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 truncate",
            isDark ? "text-white/60" : "text-black/60"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-xl md:text-2xl font-bold",
            isDark ? "text-white" : "text-black"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-[10px] md:text-xs mt-0.5 md:mt-1 truncate",
              isDark ? "text-white/40" : "text-black/40"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ml-2",
          colorClasses[color]
        )}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>
    </div>
  );
}

function PriorityQueue({ isDark, compact = false }: { isDark: boolean; compact?: boolean }) {
  const { getCallsByPriority } = useDemoCall();

  const priorities: { level: PriorityLevel; label: string; shortLabel: string; color: string; icon: React.ElementType }[] = [
    { level: 'critical', label: 'Critical', shortLabel: 'Critical', color: 'red', icon: AlertTriangle },
    { level: 'high', label: 'High Priority', shortLabel: 'High', color: 'orange', icon: TrendingUp },
    { level: 'medium', label: 'Medium', shortLabel: 'Medium', color: 'yellow', icon: Clock },
    { level: 'low', label: 'Low Priority', shortLabel: 'Low', color: 'green', icon: CheckCircle },
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
        ? "bg-black/20 border border-white/10"
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
          Priority Queue
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
                  {followUps > 0 ? `${followUps} need follow-up` : 'No pending'}
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

function DemoDashboardContent() {
  const navigate = useNavigate();
  const [isDark] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'knowledge' | 'history'>('monitor');
  const { getAnalytics, currentCall, getCurrentUserId, switchSession, knowledgeBase, saveKnowledgeBase } = useDemoCall();

  const analytics = getAnalytics();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'monitor' as const, label: 'Monitor', fullLabel: 'Live Monitor', icon: Phone },
    { id: 'knowledge' as const, label: 'Config', fullLabel: 'Knowledge Base', icon: Brain },
    { id: 'history' as const, label: 'History', fullLabel: 'Call History', icon: History },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark
        ? "bg-[rgb(10,10,10)]"
        : "bg-gradient-to-br from-gray-50 to-white"
    )}>
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] md:w-[60rem] h-[40rem] md:h-[60rem] bg-gradient-to-bl from-blue-500/5 via-purple-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[40rem] md:w-[60rem] h-[40rem] md:h-[60rem] bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 px-3 md:px-4 py-2 md:py-3 backdrop-blur-md border-b",
        isDark
          ? "bg-[rgb(10,10,10)]/80 border-white/10"
          : "bg-white/80 border-black/10"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate('/')}
              className={cn(
                "p-1.5 md:p-2 rounded-lg transition-colors",
                isDark
                  ? "hover:bg-white/10 text-white/60 hover:text-white"
                  : "hover:bg-black/10 text-black/60 hover:text-black"
              )}
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center",
                isDark
                  ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10"
                  : "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-black/10"
              )}>
                <LayoutDashboard className={cn(
                  "w-4 h-4 md:w-5 md:h-5",
                  isDark ? "text-white" : "text-black"
                )} />
              </div>
              <div className="hidden sm:block">
                <h1 className={cn(
                  "text-base md:text-lg font-semibold",
                  isDark ? "text-white" : "text-black"
                )}>
                  Dashboard
                </h1>
                <p className={cn(
                  "text-[10px] md:text-xs hidden md:block",
                  isDark ? "text-white/50" : "text-black/50"
                )}>
                  Monitor & configure
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* User Session Switcher */}
            <div className="relative">
              <UserSessionSwitcher
                isDark={isDark}
                currentUserId={getCurrentUserId()}
                onSessionChange={switchSession}
                currentConfig={knowledgeBase as unknown as Record<string, unknown>}
                onSaveSession={saveKnowledgeBase}
              />
            </div>

            {/* Call Status Indicator */}
            {currentCall?.status === 'active' && (
              <div className={cn(
                "flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full",
                isDark
                  ? "bg-green-500/20 border border-green-500/30"
                  : "bg-green-500/10 border border-green-500/20"
              )}>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 text-xs md:text-sm font-medium hidden sm:inline">Active</span>
              </div>
            )}

            <button
              onClick={() => navigate('/user')}
              className={cn(
                "flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-colors",
                isDark
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                  : "bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20"
              )}
            >
              <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">User View</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-16 md:pt-24 pb-6 md:pb-8 px-3 md:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Analytics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6"
          >
            <AnalyticsCard
              title="Total Calls"
              value={analytics.totalCalls}
              subtitle="All time"
              icon={MessageSquare}
              color="blue"
              isDark={isDark}
            />
            <AnalyticsCard
              title="Critical/High"
              value={analytics.byPriority.critical + analytics.byPriority.high}
              subtitle="Need attention"
              icon={AlertTriangle}
              color="orange"
              isDark={isDark}
            />
            <AnalyticsCard
              title="Avg Duration"
              value={formatDuration(analytics.avgDuration)}
              subtitle="Per call"
              icon={Clock}
              color="purple"
              isDark={isDark}
            />
            <AnalyticsCard
              title="Follow-ups"
              value={analytics.followUpRequired}
              subtitle="Pending"
              icon={Users}
              color="green"
              isDark={isDark}
            />
          </motion.div>

          {/* Mobile Priority Queue */}
          <div className="mb-4 md:hidden">
            <PriorityQueue isDark={isDark} compact />
          </div>

          {/* Tab navigation */}
          <div className={cn(
            "flex items-center gap-1 md:gap-2 mb-4 md:mb-6 p-1 rounded-xl overflow-x-auto scrollbar-hide",
            isDark ? "bg-white/5" : "bg-black/5"
          )}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                  activeTab === tab.id
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-black/10 text-black"
                    : isDark
                      ? "text-white/50 hover:text-white/80"
                      : "text-black/50 hover:text-black/80"
                )}
              >
                <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="md:hidden">{tab.label}</span>
                <span className="hidden md:inline">{tab.fullLabel}</span>
              </button>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left sidebar - Call interface and Priority Queue (hidden on mobile) */}
            <div className="hidden lg:block space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <VoiceCallInterface isDark={isDark} compact />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <PriorityQueue isDark={isDark} />
              </motion.div>
            </div>

            {/* Main panel based on active tab */}
            <div className="lg:col-span-2">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="h-[400px] md:h-[500px] lg:h-[600px]"
              >
                {activeTab === 'monitor' && <LiveCallMonitor isDark={isDark} />}
                {activeTab === 'knowledge' && <KnowledgeBase isDark={isDark} />}
                {activeTab === 'history' && <CallHistoryList isDark={isDark} />}
              </motion.div>
            </div>
          </div>

          {/* Full call interface - visible on all screens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 md:mt-6"
          >
            <VoiceCallInterface isDark={isDark} />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className={cn(
        "relative z-10 py-4 md:py-6 border-t",
        isDark ? "border-white/10" : "border-black/10"
      )}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={cn(
            "text-xs md:text-sm",
            isDark ? "text-white/40" : "text-black/40"
          )}>
            ClerkTree AI Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function DemoDashboard() {
  return (
    <DemoCallProvider>
      <DemoDashboardContent />
    </DemoCallProvider>
  );
}
