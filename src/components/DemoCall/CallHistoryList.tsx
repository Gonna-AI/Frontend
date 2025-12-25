import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Bot,
  AlertTriangle,
  CheckCircle,
  Circle,
  Tag,
  FileText,
  TrendingUp,
  Filter
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDemoCall, CallHistoryItem, PriorityLevel } from '../../contexts/DemoCallContext';

interface CallHistoryListProps {
  isDark?: boolean;
  showFilters?: boolean;
}

export default function CallHistoryList({ isDark = true, showFilters = true }: CallHistoryListProps) {
  const { callHistory, knowledgeBase } = useDemoCall();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'details'>('summary');
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'voice' | 'text'>('all');

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setActiveTab('summary');
  };

  const getPriorityConfig = (priority: PriorityLevel) => {
    const configs = {
      critical: {
        label: 'Critical',
        color: 'red',
        bgClass: isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-500/10 text-red-600 border-red-500/20',
        icon: AlertTriangle
      },
      high: {
        label: 'High',
        color: 'orange',
        bgClass: isDark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-500/10 text-orange-600 border-orange-500/20',
        icon: TrendingUp
      },
      medium: {
        label: 'Medium',
        color: 'yellow',
        bgClass: isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        icon: Circle
      },
      low: {
        label: 'Low',
        color: 'green',
        bgClass: isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-500/10 text-green-600 border-green-500/20',
        icon: CheckCircle
      },
    };
    return configs[priority];
  };

  const getSentimentConfig = (sentiment: string) => {
    const configs: Record<string, { label: string; color: string; bg: string }> = {
      very_positive: { label: 'Very Positive', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
      positive: { label: 'Positive', color: 'text-green-400', bg: 'bg-green-500/20' },
      slightly_positive: { label: 'Slightly Positive', color: 'text-lime-400', bg: 'bg-lime-500/20' },
      neutral: { label: 'Neutral', color: 'text-gray-400', bg: 'bg-gray-500/20' },
      mixed: { label: 'Mixed', color: 'text-purple-400', bg: 'bg-purple-500/20' },
      slightly_negative: { label: 'Slightly Negative', color: 'text-amber-400', bg: 'bg-amber-500/20' },
      negative: { label: 'Negative', color: 'text-orange-400', bg: 'bg-orange-500/20' },
      very_negative: { label: 'Very Negative', color: 'text-red-400', bg: 'bg-red-500/20' },
      anxious: { label: 'Anxious', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      urgent: { label: 'Urgent', color: 'text-rose-400', bg: 'bg-rose-500/20' },
    };
    return configs[sentiment] || configs.neutral;
  };

  const getCategoryColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colorMap[color] || colorMap.blue;
  };

  // Filter call history
  const filteredHistory = callHistory.filter(call => {
    if (filterPriority !== 'all' && call.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && call.category?.id !== filterCategory) return false;
    if (filterType !== 'all' && call.type !== filterType) return false;
    return true;
  });

  // Count by type
  const voiceCount = callHistory.filter(c => c.type === 'voice').length;
  const textCount = callHistory.filter(c => c.type === 'text').length;

  return (
    <div className={cn(
      "rounded-xl md:rounded-2xl overflow-hidden h-full flex flex-col",
      isDark
        ? "bg-black/20 border border-white/10"
        : "bg-white/80 border border-black/10"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b",
        isDark ? "border-white/10" : "border-black/10"
      )}>
        <div className="flex items-center gap-2 md:gap-3">
          <History className={cn(
            "w-4 h-4 md:w-5 md:h-5",
            isDark ? "text-white/60" : "text-black/60"
          )} />
          <div>
            <h3 className={cn(
              "font-semibold text-sm md:text-base",
              isDark ? "text-white" : "text-black"
            )}>
              History
            </h3>
            <p className={cn(
              "text-[10px] md:text-xs",
              isDark ? "text-white/50" : "text-black/50"
            )}>
              {filteredHistory.length} of {callHistory.length} items • {voiceCount} calls, {textCount} chats
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={cn(
          "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 border-b overflow-x-auto scrollbar-hide",
          isDark ? "border-white/10" : "border-black/10"
        )}>
          <Filter className={cn(
            "w-3 h-3 md:w-4 md:h-4 flex-shrink-0",
            isDark ? "text-white/40" : "text-black/40"
          )} />

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'voice' | 'text')}
            className={cn(
              "px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg text-[10px] md:text-xs focus:outline-none flex-shrink-0",
              isDark
                ? "bg-white/5 text-white border border-white/10"
                : "bg-black/5 text-black border border-black/10"
            )}
          >
            <option value="all">All Types</option>
            <option value="voice">Calls Only</option>
            <option value="text">Chats Only</option>
          </select>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as PriorityLevel | 'all')}
            className={cn(
              "px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg text-[10px] md:text-xs focus:outline-none flex-shrink-0",
              isDark
                ? "bg-white/5 text-white border border-white/10"
                : "bg-black/5 text-black border border-black/10"
            )}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={cn(
              "px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg text-[10px] md:text-xs focus:outline-none flex-shrink-0",
              isDark
                ? "bg-white/5 text-white border border-white/10"
                : "bg-black/5 text-black border border-black/10"
            )}
          >
            <option value="all">All Categories</option>
            {knowledgeBase.categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 custom-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className={cn(
            "flex flex-col items-center justify-center h-full text-center py-12",
            isDark ? "text-white/40" : "text-black/40"
          )}>
            <History className="w-12 h-12 mb-4 opacity-40" />
            <p className="text-lg font-medium mb-1">No History Found</p>
            <p className="text-sm opacity-80">
              {callHistory.length === 0 ? 'Call and chat history will appear here' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredHistory.map((item: CallHistoryItem) => {
              const priorityConfig = getPriorityConfig(item.priority);
              const PriorityIcon = priorityConfig.icon;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-xl overflow-hidden transition-colors",
                    isDark
                      ? "bg-white/5 border border-white/5 hover:border-white/10"
                      : "bg-black/5 border border-black/5 hover:border-black/10"
                  )}
                >
                  {/* Call summary header */}
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full p-3 md:p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-2 md:gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Top row - Name and badges */}
                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap mb-1.5 md:mb-2">
                          {/* Type badge (Call or Chat) */}
                          <span className={cn(
                            "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full border flex items-center gap-0.5 md:gap-1",
                            item.type === 'voice'
                              ? isDark
                                ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
                                : "bg-teal-500/10 text-teal-600 border-teal-500/20"
                              : isDark
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          )}>
                            {item.type === 'voice' ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 md:w-3 md:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                <span className="hidden sm:inline">Call</span>
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                <span className="hidden sm:inline">Chat</span>
                              </>
                            )}
                          </span>

                          <span className={cn(
                            "font-medium text-sm md:text-base",
                            isDark ? "text-white" : "text-black"
                          )}>
                            {item.callerName}
                          </span>

                          {/* Priority badge */}
                          <span className={cn(
                            "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full border flex items-center gap-0.5 md:gap-1",
                            priorityConfig.bgClass
                          )}>
                            <PriorityIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            <span className="hidden sm:inline">{priorityConfig.label}</span>
                          </span>

                          {/* Category badge */}
                          {item.category && (
                            <span className={cn(
                              "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full border hidden sm:inline-flex",
                              getCategoryColor(item.category.color)
                            )}>
                              {item.category.name}
                            </span>
                          )}

                          {/* Follow-up badge */}
                          {item.summary.followUpRequired && (
                            <span className={cn(
                              "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full",
                              isDark
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-yellow-500/10 text-yellow-600"
                            )}>
                              <span className="hidden sm:inline">Follow-up needed</span>
                              <span className="sm:hidden">F/U</span>
                            </span>
                          )}
                        </div>

                        {/* Summary preview */}
                        {(item.summary.summaryText || item.summary.mainPoints[0]) && (
                          <p className={cn(
                            "text-xs md:text-sm truncate mb-1.5 md:mb-2",
                            isDark ? "text-white/60" : "text-black/60"
                          )}>
                            {item.summary.summaryText || item.summary.mainPoints[0]}
                          </p>
                        )}

                        {/* Meta info */}
                        <div className={cn(
                          "flex items-center gap-2 md:gap-4 text-[10px] md:text-xs",
                          isDark ? "text-white/40" : "text-black/40"
                        )}>
                          <span className="flex items-center gap-0.5 md:gap-1">
                            <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            {formatDate(item.date)}
                          </span>
                          <span className="flex items-center gap-0.5 md:gap-1">
                            <MessageSquare className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            {formatDuration(item.duration)}
                          </span>
                          {item.tags.length > 0 && (
                            <span className="flex items-center gap-0.5 md:gap-1 hidden sm:flex">
                              <Tag className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              {item.tags.length} tags
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={cn(
                        "p-1 md:p-1.5 rounded-lg transition-colors flex-shrink-0",
                        isDark ? "hover:bg-white/10" : "hover:bg-black/10"
                      )}>
                        {expandedId === item.id ? (
                          <ChevronUp className={cn(
                            "w-4 h-4 md:w-5 md:h-5",
                            isDark ? "text-white/60" : "text-black/60"
                          )} />
                        ) : (
                          <ChevronDown className={cn(
                            "w-4 h-4 md:w-5 md:h-5",
                            isDark ? "text-white/60" : "text-black/60"
                          )} />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {/* Tabs */}
                        <div className={cn(
                          "flex gap-1 px-3 md:px-4 py-1.5 md:py-2 border-t",
                          isDark ? "border-white/10" : "border-black/10"
                        )}>
                          {(['summary', 'transcript', 'details'] as const).map(tab => (
                            <button
                              key={tab}
                              onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                              className={cn(
                                "px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg text-[10px] md:text-xs font-medium capitalize transition-colors",
                                activeTab === tab
                                  ? isDark
                                    ? "bg-white/10 text-white"
                                    : "bg-black/10 text-black"
                                  : isDark
                                    ? "text-white/50 hover:text-white/80"
                                    : "text-black/50 hover:text-black/80"
                              )}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        <div className="px-3 md:px-4 pb-3 md:pb-4 pt-1.5 md:pt-2">
                          {/* Summary Tab */}
                          {activeTab === 'summary' && (
                            <div className="space-y-4">
                              {/* Summary Overview */}
                              {item.summary.summaryText && (
                                <div className={cn(
                                  "p-3 rounded-lg",
                                  isDark ? "bg-white/5" : "bg-black/5"
                                )}>
                                  <p className={cn(
                                    "text-sm leading-relaxed",
                                    isDark ? "text-white/80" : "text-black/80"
                                  )}>
                                    {item.summary.summaryText}
                                  </p>
                                </div>
                              )}

                              {/* Status Cards Row */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {/* Sentiment Card */}
                                <div className={cn(
                                  "p-2.5 rounded-lg border",
                                  isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                                )}>
                                  <span className={cn(
                                    "text-[10px] block mb-1",
                                    isDark ? "text-white/40" : "text-black/40"
                                  )}>Sentiment</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className={cn(
                                      "text-xs font-medium",
                                      getSentimentConfig(item.summary.sentiment).color
                                    )}>
                                      {getSentimentConfig(item.summary.sentiment).label}
                                    </span>
                                  </div>
                                </div>

                                {/* Urgency Card */}
                                {item.summary.estimatedPriority && (
                                  <div className={cn(
                                    "p-2.5 rounded-lg border",
                                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                                  )}>
                                    <span className={cn(
                                      "text-[10px] block mb-1",
                                      isDark ? "text-white/40" : "text-black/40"
                                    )}>Priority</span>
                                    <span className={cn(
                                      "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                                      item.summary.estimatedPriority === 'critical' ? "bg-red-500/20 text-red-400" :
                                        item.summary.estimatedPriority === 'high' ? "bg-orange-500/20 text-orange-400" :
                                          item.summary.estimatedPriority === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                                            "bg-green-500/20 text-green-400"
                                    )}>
                                      {item.summary.estimatedPriority}
                                    </span>
                                  </div>
                                )}

                                {/* Resolution Card */}
                                {item.summary.resolution && (
                                  <div className={cn(
                                    "p-2.5 rounded-lg border",
                                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                                  )}>
                                    <span className={cn(
                                      "text-[10px] block mb-1",
                                      isDark ? "text-white/40" : "text-black/40"
                                    )}>Resolution</span>
                                    <span className={cn(
                                      "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                                      item.summary.resolution === 'resolved' ? "bg-green-500/20 text-green-400" :
                                        item.summary.resolution === 'partially_resolved' ? "bg-blue-500/20 text-blue-400" :
                                          item.summary.resolution === 'escalation_needed' ? "bg-red-500/20 text-red-400" :
                                            "bg-gray-500/20 text-gray-400"
                                    )}>
                                      {item.summary.resolution.replace('_', ' ')}
                                    </span>
                                  </div>
                                )}

                                {/* Risk Level Card */}
                                {item.summary.riskLevel && (
                                  <div className={cn(
                                    "p-2.5 rounded-lg border",
                                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                                  )}>
                                    <span className={cn(
                                      "text-[10px] block mb-1",
                                      isDark ? "text-white/40" : "text-black/40"
                                    )}>Risk Level</span>
                                    <span className={cn(
                                      "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                                      item.summary.riskLevel === 'high' ? "bg-red-500/20 text-red-400" :
                                        item.summary.riskLevel === 'medium' ? "bg-orange-500/20 text-orange-400" :
                                          "bg-green-500/20 text-green-400"
                                    )}>
                                      {item.summary.riskLevel}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Caller Intent */}
                              {item.summary.callerIntent && (
                                <div className={cn(
                                  "p-3 rounded-lg border-l-4 border-l-blue-500",
                                  isDark ? "bg-blue-500/10" : "bg-blue-500/5"
                                )}>
                                  <span className={cn(
                                    "text-[10px] block mb-1 font-medium",
                                    isDark ? "text-blue-400" : "text-blue-600"
                                  )}>Caller Intent</span>
                                  <p className={cn(
                                    "text-sm",
                                    isDark ? "text-white/80" : "text-black/80"
                                  )}>
                                    {item.summary.callerIntent}
                                  </p>
                                </div>
                              )}

                              {/* Key Points */}
                              <div>
                                <h4 className={cn(
                                  "text-xs font-medium mb-2 flex items-center gap-1",
                                  isDark ? "text-white/60" : "text-black/60"
                                )}>
                                  <FileText className="w-3 h-3" />
                                  Key Points
                                </h4>
                                <ul className="space-y-1.5">
                                  {item.summary.mainPoints.filter(p => p.trim()).map((point, i) => (
                                    <li
                                      key={i}
                                      className={cn(
                                        "text-sm pl-3 border-l-2 py-0.5",
                                        isDark
                                          ? "text-white/80 border-white/20"
                                          : "text-black/80 border-black/20"
                                      )}
                                    >
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Topics */}
                              {item.summary.topics && item.summary.topics.length > 0 && (
                                <div>
                                  <h4 className={cn(
                                    "text-[10px] font-medium mb-2",
                                    isDark ? "text-white/50" : "text-black/50"
                                  )}>Topics</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.summary.topics.map((topic, i) => (
                                      <span
                                        key={i}
                                        className={cn(
                                          "text-xs px-2.5 py-1 rounded-full border",
                                          isDark
                                            ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                                            : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                        )}
                                      >
                                        {topic}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Mood Indicators */}
                              {item.summary.moodIndicators && item.summary.moodIndicators.length > 0 && (
                                <div>
                                  <h4 className={cn(
                                    "text-[10px] font-medium mb-2",
                                    isDark ? "text-white/50" : "text-black/50"
                                  )}>Mood Indicators</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.summary.moodIndicators.map((mood, i) => (
                                      <span
                                        key={i}
                                        className={cn(
                                          "text-xs px-2.5 py-1 rounded-full border capitalize",
                                          isDark
                                            ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                                            : "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
                                        )}
                                      >
                                        {mood}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* AI Suggestions */}
                              {item.summary.suggestions && item.summary.suggestions.length > 0 && (
                                <div className={cn(
                                  "p-3 rounded-lg",
                                  isDark ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                                    : "bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/15"
                                )}>
                                  <h4 className={cn(
                                    "text-xs font-medium mb-2 flex items-center gap-1.5",
                                    isDark ? "text-amber-400" : "text-amber-600"
                                  )}>
                                    AI Suggestions for Admin
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {item.summary.suggestions.map((suggestion, i) => (
                                      <li
                                        key={i}
                                        className={cn(
                                          "text-sm flex items-start gap-2",
                                          isDark ? "text-white/80" : "text-black/80"
                                        )}
                                      >
                                        <span className="text-amber-500 mt-0.5">→</span>
                                        {suggestion}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Action Items */}
                              {item.summary.actionItems.length > 0 && (
                                <div>
                                  <h4 className={cn(
                                    "text-xs font-medium mb-2",
                                    isDark ? "text-white/60" : "text-black/60"
                                  )}>
                                    Action Items
                                  </h4>
                                  <div className="space-y-1">
                                    {item.summary.actionItems.map(action => (
                                      <div
                                        key={action.id}
                                        className={cn(
                                          "flex items-center gap-2 text-sm",
                                          action.completed
                                            ? isDark ? "text-white/40" : "text-black/40"
                                            : isDark ? "text-white/80" : "text-black/80"
                                        )}
                                      >
                                        {action.completed ? (
                                          <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <Circle className="w-4 h-4" />
                                        )}
                                        <span className={action.completed ? "line-through" : ""}>
                                          {action.text}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Transcript Tab */}
                          {activeTab === 'transcript' && (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                              {item.messages.length === 0 ? (
                                <p className={cn(
                                  "text-sm text-center py-4",
                                  isDark ? "text-white/40" : "text-black/40"
                                )}>
                                  No transcript available
                                </p>
                              ) : (
                                item.messages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={cn(
                                      "flex items-start gap-2 p-2 rounded-lg",
                                      msg.speaker === 'agent'
                                        ? isDark
                                          ? "bg-blue-500/10"
                                          : "bg-blue-500/5"
                                        : isDark
                                          ? "bg-purple-500/10"
                                          : "bg-purple-500/5"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-6 h-6 rounded flex items-center justify-center flex-shrink-0",
                                      msg.speaker === 'agent'
                                        ? "bg-blue-500/20"
                                        : "bg-purple-500/20"
                                    )}>
                                      {msg.speaker === 'agent' ? (
                                        <Bot className="w-3 h-3 text-blue-400" />
                                      ) : (
                                        <User className="w-3 h-3 text-purple-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn(
                                        "text-xs",
                                        isDark ? "text-white/70" : "text-black/70"
                                      )}>
                                        {msg.text}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}

                          {/* Details Tab */}
                          {activeTab === 'details' && (
                            <div className="space-y-3 md:space-y-4">
                              {/* Extracted Fields */}
                              {item.extractedFields.length > 0 && (
                                <div>
                                  <h4 className={cn(
                                    "text-[10px] md:text-xs font-medium mb-1.5 md:mb-2",
                                    isDark ? "text-white/60" : "text-black/60"
                                  )}>
                                    Extracted Information
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2">
                                    {item.extractedFields.map(field => (
                                      <div
                                        key={field.id}
                                        className={cn(
                                          "p-1.5 md:p-2 rounded-md md:rounded-lg",
                                          isDark ? "bg-white/5" : "bg-black/5"
                                        )}
                                      >
                                        <span className={cn(
                                          "text-[10px] md:text-xs block",
                                          isDark ? "text-white/40" : "text-black/40"
                                        )}>
                                          {field.label}
                                        </span>
                                        <span className={cn(
                                          "text-xs md:text-sm font-medium",
                                          isDark ? "text-white" : "text-black"
                                        )}>
                                          {field.value}
                                        </span>
                                        <span className={cn(
                                          "text-[10px] md:text-xs ml-1",
                                          isDark ? "text-white/30" : "text-black/30"
                                        )}>
                                          ({Math.round(field.confidence * 100)}%)
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Tags */}
                              {item.tags.length > 0 && (
                                <div>
                                  <h4 className={cn(
                                    "text-[10px] md:text-xs font-medium mb-1.5 md:mb-2",
                                    isDark ? "text-white/60" : "text-black/60"
                                  )}>
                                    Tags
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {item.tags.map((tag, i) => (
                                      <span
                                        key={i}
                                        className={cn(
                                          "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full",
                                          isDark
                                            ? "bg-white/10 text-white/70"
                                            : "bg-black/10 text-black/70"
                                        )}
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Call Details */}
                              <div className="grid grid-cols-2 gap-1.5 md:gap-2 text-xs md:text-sm">
                                <div className={cn(
                                  "p-1.5 md:p-2 rounded-md md:rounded-lg",
                                  isDark ? "bg-white/5" : "bg-black/5"
                                )}>
                                  <span className={cn(
                                    "text-[10px] md:text-xs block",
                                    isDark ? "text-white/40" : "text-black/40"
                                  )}>
                                    Date & Time
                                  </span>
                                  <span className={isDark ? "text-white" : "text-black"}>
                                    <span className="hidden sm:inline">{item.date.toLocaleDateString()} {formatTime(item.date)}</span>
                                    <span className="sm:hidden">{formatDate(item.date)}</span>
                                  </span>
                                </div>
                                <div className={cn(
                                  "p-1.5 md:p-2 rounded-md md:rounded-lg",
                                  isDark ? "bg-white/5" : "bg-black/5"
                                )}>
                                  <span className={cn(
                                    "text-[10px] md:text-xs block",
                                    isDark ? "text-white/40" : "text-black/40"
                                  )}>
                                    Duration
                                  </span>
                                  <span className={isDark ? "text-white" : "text-black"}>
                                    {formatDuration(item.duration)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
