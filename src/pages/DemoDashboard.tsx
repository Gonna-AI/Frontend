import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Phone,
  Brain,
  History,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  MessageSquare,
  Menu
} from 'lucide-react';
import MobileSidebar from '../components/Layout/Sidebar/MobileSidebar';
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
        ? "bg-black/60 backdrop-blur-xl border border-white/10"
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
        ? "bg-black/60 backdrop-blur-xl border border-white/10"
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

function DemoDashboardContent() {
  const navigate = useNavigate();
  const [isDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'knowledge' | 'history'>('monitor');
  const { getAnalytics, currentCall, getCurrentUserId, switchSession, knowledgeBase, saveKnowledgeBase, globalActiveSessions } = useDemoCall();
  const { t } = useLanguage();

  const analytics = getAnalytics();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'monitor' as const, label: t('dashboard.tab.monitor'), fullLabel: t('dashboard.tab.monitorFull'), icon: Phone },
    { id: 'knowledge' as const, label: t('dashboard.tab.config'), fullLabel: t('dashboard.tab.configFull'), icon: Brain },
    { id: 'history' as const, label: t('dashboard.tab.history'), fullLabel: t('dashboard.tab.historyFull'), icon: History },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 pb-8 md:pb-8",
      isDark
        ? "bg-black"
        : "bg-gradient-to-br from-gray-50 to-white"
    )}>
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] md:w-[60rem] h-[40rem] md:h-[60rem] bg-gradient-to-bl from-blue-500/5 via-purple-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[40rem] md:w-[60rem] h-[40rem] md:h-[60rem] bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 py-3 px-4 md:px-6 backdrop-blur-md border-b",
        isDark
          ? "bg-[rgb(10,10,10)]/80 border-white/10"
          : "bg-white/80 border-black/10"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 464 468"
                className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity"
                aria-label="ClerkTree Logo"
              >
                <path
                  fill={isDark ? "white" : "black"}
                  d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
                />
              </svg>
              <span className={cn(
                "font-semibold text-lg tracking-tight",
                isDark ? "text-white" : "text-black"
              )}>
                ClerkTree {t('dashboard.subtitle')}
              </span>
            </button>
          </div>

          {/* Desktop Controls (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-3">
            {/* User Session Switcher */}
            <UserSessionSwitcher
              isDark={isDark}
              currentUserId={getCurrentUserId()}
              onSessionChange={switchSession}
              currentConfig={knowledgeBase as unknown as Record<string, unknown>}
              onSaveSession={saveKnowledgeBase}
            />

            {/* Call Status Indicator */}
            {(globalActiveSessions.voice > 0 || globalActiveSessions.text > 0 || currentCall?.status === 'active') && (
              <div className="flex items-center gap-2">
                {/* Voice calls indicator */}
                {(globalActiveSessions.voice > 0 || (currentCall?.status === 'active' && currentCall.type === 'voice')) && (
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                    isDark
                      ? "bg-teal-500/20 border border-teal-500/30"
                      : "bg-teal-500/10 border border-teal-500/20"
                  )}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-teal-500" />
                    <span className={cn(
                      "text-sm font-medium text-teal-400"
                    )}>
                      {Math.max(globalActiveSessions.voice, currentCall?.status === 'active' && currentCall.type === 'voice' ? 1 : 0)} Call{globalActiveSessions.voice !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                {/* Text chats indicator */}
                {(globalActiveSessions.text > 0 || (currentCall?.status === 'active' && currentCall.type === 'text')) && (
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                    isDark
                      ? "bg-blue-500/20 border border-blue-500/30"
                      : "bg-blue-500/10 border border-blue-500/20"
                  )}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-blue-500" />
                    <span className={cn(
                      "text-sm font-medium text-blue-400"
                    )}>
                      {Math.max(globalActiveSessions.text, currentCall?.status === 'active' && currentCall.type === 'text' ? 1 : 0)} Chat{globalActiveSessions.text !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate('/user')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                isDark
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                  : "bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20"
              )}
            >
              <Phone className="w-4 h-4" />
              <span>{t('dashboard.userView')}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              isDark
                ? "hover:bg-white/10 text-white/80 hover:text-white"
                : "hover:bg-black/10 text-black/80 hover:text-black"
            )}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header >

      {/* Main content */}
      < main className="relative z-10 pt-20 md:pt-24 px-3 md:px-4" >
        <div className="max-w-7xl mx-auto">
          {/* Analytics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6"
          >
            <AnalyticsCard
              title={t('dashboard.totalHistory')}
              value={analytics.totalCalls}
              subtitle={currentCall?.status === 'active' ? `+1 ${t('dashboard.active')}` : t('dashboard.allTime')}
              icon={MessageSquare}
              color="blue"
              isDark={isDark}
            />
            <AnalyticsCard
              title={t('dashboard.criticalHigh')}
              value={analytics.byPriority.critical + analytics.byPriority.high}
              subtitle={t('dashboard.needAttention')}
              icon={AlertTriangle}
              color="orange"
              isDark={isDark}
            />
            <AnalyticsCard
              title={t('dashboard.avgDuration')}
              value={formatDuration(analytics.avgDuration)}
              subtitle={t('dashboard.perCall')}
              icon={Clock}
              color="purple"
              isDark={isDark}
            />
            <AnalyticsCard
              title={t('dashboard.followUps')}
              value={analytics.followUpRequired}
              subtitle={t('dashboard.pending')}
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
            isDark ? "bg-black/60 backdrop-blur-xl border border-white/10" : "bg-black/5"
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
            className="mt-4 md:mt-6 pb-6 md:pb-0"
          >
            <VoiceCallInterface isDark={isDark} />
          </motion.div>
        </div>
      </main >


      <MobileSidebar
        currentView={'dashboard'}
        onViewChange={() => { }}
        onSignOut={() => navigate('/')}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <div className="flex flex-col gap-6">
          {/* Session Switcher */}
          <div className="flex flex-col gap-2">
            <h3 className={cn("text-xs font-semibold uppercase tracking-wider pl-1", isDark ? "text-white/40" : "text-black/40")}>
              Session
            </h3>
            <div className="w-full">
              <UserSessionSwitcher
                isDark={isDark}
                currentUserId={getCurrentUserId()}
                onSessionChange={switchSession}
                currentConfig={knowledgeBase as unknown as Record<string, unknown>}
                onSaveSession={saveKnowledgeBase}
                mobile={true}
              />
            </div>
          </div>

          {/* Status Indicators */}
          {(globalActiveSessions.voice > 0 || globalActiveSessions.text > 0 || currentCall?.status === 'active') && (
            <div className="flex flex-col gap-2">
              <h3 className={cn("text-xs font-semibold uppercase tracking-wider pl-1", isDark ? "text-white/40" : "text-black/40")}>
                Status
              </h3>
              <div className="flex flex-col gap-2 w-full">
                {/* Voice calls indicator */}
                {(globalActiveSessions.voice > 0 || (currentCall?.status === 'active' && currentCall.type === 'voice')) && (
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl w-full transition-colors",
                    isDark
                      ? "bg-teal-500/10 border border-teal-500/20"
                      : "bg-teal-500/5 border border-teal-500/10"
                  )}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                    <span className={cn(
                      "text-sm font-medium text-teal-400"
                    )}>
                      {Math.max(globalActiveSessions.voice, currentCall?.status === 'active' && currentCall.type === 'voice' ? 1 : 0)} Active Call{globalActiveSessions.voice !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                {/* Text chats indicator */}
                {(globalActiveSessions.text > 0 || (currentCall?.status === 'active' && currentCall.type === 'text')) && (
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl w-full transition-colors",
                    isDark
                      ? "bg-blue-500/10 border border-blue-500/20"
                      : "bg-blue-500/5 border border-blue-500/10"
                  )}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className={cn(
                      "text-sm font-medium text-blue-400"
                    )}>
                      {Math.max(globalActiveSessions.text, currentCall?.status === 'active' && currentCall.type === 'text' ? 1 : 0)} Active Chat{globalActiveSessions.text !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </MobileSidebar>
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
