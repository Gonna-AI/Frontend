import React, { useState } from 'react';
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

  const getSentimentConfig = (sentiment: 'positive' | 'neutral' | 'negative') => {
    const configs = {
      positive: { label: 'Positive', color: 'text-green-400', bg: 'bg-green-500/20' },
      neutral: { label: 'Neutral', color: 'text-gray-400', bg: 'bg-gray-500/20' },
      negative: { label: 'Negative', color: 'text-red-400', bg: 'bg-red-500/20' },
    };
    return configs[sentiment];
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
    return true;
  });

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
              Call History
            </h3>
            <p className={cn(
              "text-[10px] md:text-xs",
              isDark ? "text-white/50" : "text-black/50"
            )}>
              {filteredHistory.length} of {callHistory.length} calls
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
            <p className="text-lg font-medium mb-1">No Calls Found</p>
            <p className="text-sm opacity-80">
              {callHistory.length === 0 ? 'Call history will appear here' : 'Try adjusting your filters'}
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
                        {item.summary.mainPoints[0] && (
                          <p className={cn(
                            "text-xs md:text-sm truncate mb-1.5 md:mb-2",
                            isDark ? "text-white/60" : "text-black/60"
                          )}>
                            {item.summary.mainPoints[0]}
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
                              {/* Main Points */}
                              <div>
                                <h4 className={cn(
                                  "text-xs font-medium mb-2 flex items-center gap-1",
                                  isDark ? "text-white/60" : "text-black/60"
                                )}>
                                  <FileText className="w-3 h-3" />
                                  Key Points
                                </h4>
                                <ul className="space-y-1">
                                  {item.summary.mainPoints.map((point, i) => (
                                    <li
                                      key={i}
                                      className={cn(
                                        "text-sm pl-3 border-l-2",
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

                              {/* Sentiment */}
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-xs",
                                  isDark ? "text-white/60" : "text-black/60"
                                )}>
                                  Sentiment:
                                </span>
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  getSentimentConfig(item.summary.sentiment).bg,
                                  getSentimentConfig(item.summary.sentiment).color
                                )}>
                                  {getSentimentConfig(item.summary.sentiment).label}
                                </span>
                              </div>

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

                              {/* Notes */}
                              {item.summary.notes && (
                                <div className={cn(
                                  "p-3 rounded-lg text-sm",
                                  isDark ? "bg-white/5" : "bg-black/5"
                                )}>
                                  <span className={cn(
                                    "text-xs font-medium block mb-1",
                                    isDark ? "text-white/60" : "text-black/60"
                                  )}>
                                    Notes
                                  </span>
                                  <p className={isDark ? "text-white/80" : "text-black/80"}>
                                    {item.summary.notes}
                                  </p>
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
