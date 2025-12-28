import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Clock,
  ChevronDown,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Circle,
  TrendingUp,
  Filter,
  Phone,
  ListTodo,
  Smile,
  Tag,
  Database
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDemoCall, PriorityLevel } from '../../contexts/DemoCallContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface CallHistoryListProps {
  isDark?: boolean;
  showFilters?: boolean;
}

export default function CallHistoryList({ isDark = true, showFilters = true }: CallHistoryListProps) {
  const { t } = useLanguage();
  const { callHistory } = useDemoCall();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'details'>('summary');
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'voice' | 'text'>('all');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
      critical: { label: 'Critical', color: 'red', icon: AlertTriangle },
      high: { label: 'High', color: 'orange', icon: TrendingUp },
      medium: { label: 'Medium', color: 'yellow', icon: Circle },
      low: { label: 'Low', color: 'green', icon: CheckCircle },
    };
    return configs[priority];
  };

  // Filter call history
  const filteredHistory = callHistory.filter(call => {
    if (filterPriority !== 'all' && call.priority !== filterPriority) return false;
    if (filterType !== 'all' && call.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>
            {t('history.title')}
          </h1>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
            {filteredHistory.length} records found
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={cn(
        "rounded-xl border overflow-hidden",
        isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"
      )}>
        {/* Toolbar / Filters */}
        {showFilters && (
          <div className={cn(
            "p-4 border-b flex flex-wrap items-center gap-4",
            isDark ? "border-white/5" : "border-black/5"
          )}>
            <div className="flex items-center gap-2">
              <Filter className={cn("w-4 h-4", isDark ? "text-white/40" : "text-black/40")} />
              <span className={cn("text-sm font-medium", isDark ? "text-white/60" : "text-black/60")}>Filters:</span>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className={cn(
                "bg-transparent text-sm focus:outline-none cursor-pointer hover:opacity-80 transition-opacity",
                isDark ? "text-white" : "text-black"
              )}
            >
              <option value="all">All Types</option>
              <option value="voice">Voice Calls</option>
              <option value="text">Chat Logs</option>
            </select>

            <div className={cn("w-px h-4", isDark ? "bg-white/10" : "bg-black/10")} />

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className={cn(
                "bg-transparent text-sm focus:outline-none cursor-pointer hover:opacity-80 transition-opacity",
                isDark ? "text-white" : "text-black"
              )}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
            </select>
          </div>
        )}

        {/* Content List */}
        <div>
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center opacity-40">
              <History className="w-12 h-12 mx-auto mb-4" />
              <p>No history records found</p>
            </div>
          ) : (
            <div>
              {filteredHistory.map((item) => {
                const priority = getPriorityConfig(item.priority);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "border-b last:border-0 transition-colors",
                      isDark ? "border-white/5 hover:bg-white/5" : "border-black/5 hover:bg-black/5"
                    )}
                  >
                    {/* Row Header */}
                    <div
                      onClick={() => toggleExpand(item.id)}
                      className="p-4 cursor-pointer grid grid-cols-12 gap-4 items-center"
                    >
                      {/* Status / Type Icon (Col 1) */}
                      <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          item.type === 'voice'
                            ? isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-500/5 text-teal-600"
                            : isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-500/5 text-blue-600"
                        )}>
                          {item.type === 'voice' ? <Phone className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className={cn("font-medium", isDark ? "text-white" : "text-black")}>
                            {item.callerName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider",
                              priority.color === 'red' ? "border-red-500/30 text-red-500" :
                                priority.color === 'orange' ? "border-orange-500/30 text-orange-500" :
                                  "border-white/10 text-white/40"
                            )}>
                              {priority.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Summary (Col 2 - Span) */}
                      <div className="col-span-12 md:col-span-5">
                        <p className={cn("text-sm truncate opacity-60", isDark ? "text-white" : "text-black")}>
                          {item.summary.summaryText || "No summary available"}
                        </p>
                        <div className={cn("flex items-center gap-3 mt-1 text-xs opacity-40", isDark ? "text-white" : "text-black")}>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(item.duration)}</span>
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </div>

                      {/* Actions (Col 3) */}
                      <div className="col-span-12 md:col-span-3 flex justify-end">
                        <div className={cn(
                          "p-2 rounded-full transition-transform duration-200",
                          expandedId === item.id && "rotate-180"
                        )}>
                          <ChevronDown className={cn("w-5 h-5 opacity-40", isDark ? "text-white" : "text-black")} />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === item.id && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className={cn(
                            "border-t p-6",
                            isDark ? "border-white/5 bg-black/20 text-white" : "border-black/5 bg-black/5 text-black"
                          )}>
                            {/* Tabs Header inside expanded */}
                            <div className={cn("flex gap-4 border-b pb-2 mb-6 text-sm font-medium", isDark ? "border-white/5" : "border-black/5")}>
                              {(['summary', 'transcript', 'details'] as const).map(tab => (
                                <button
                                  key={tab}
                                  onClick={() => setActiveTab(tab)}
                                  className={cn(
                                    "capitalize transition-colors",
                                    activeTab === tab
                                      ? isDark ? "text-white border-b-2 border-white" : "text-black border-b-2 border-black"
                                      : isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"
                                  )}
                                >
                                  {tab}
                                </button>
                              ))}
                            </div>

                            {/* Content */}
                            {activeTab === 'summary' && (
                              <div className="space-y-6">
                                {/* Summary Text */}
                                <div>
                                  <h4 className={cn("text-xs uppercase mb-2 opacity-50 font-bold tracking-wider", isDark ? "text-white" : "text-black")}>Overview</h4>
                                  <p className={cn("border-l-2 pl-4 py-1 text-sm leading-relaxed", isDark ? "border-white/20 text-white/80" : "border-black/10 text-black/80")}>
                                    {item.summary.summaryText || "No summary details generated."}
                                  </p>
                                </div>

                                {/* Main Points */}
                                {item.summary.mainPoints && item.summary.mainPoints.length > 0 && (
                                  <div>
                                    <h4 className={cn("text-xs uppercase mb-2 opacity-50 font-bold tracking-wider", isDark ? "text-white" : "text-black")}>Key Points</h4>
                                    <ul className={cn("list-disc list-inside space-y-1 text-sm ml-2", isDark ? "text-white/70" : "text-black/70")}>
                                      {item.summary.mainPoints.map((point, i) => (
                                        <li key={i}>{point}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Action Items */}
                                {item.summary.actionItems && item.summary.actionItems.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <ListTodo className="w-4 h-4 opacity-50" />
                                      <h4 className={cn("text-xs uppercase opacity-50 font-bold tracking-wider", isDark ? "text-white" : "text-black")}>Action Items</h4>
                                    </div>
                                    <div className="grid gap-2">
                                      {item.summary.actionItems.map((action, i) => (
                                        <div key={i} className={cn("flex items-start gap-2 p-3 rounded-lg text-sm", isDark ? "bg-white/5 text-white/90" : "bg-black/5 text-black/90")}>
                                          <div className={cn("w-4 h-4 rounded border mt-0.5 flex items-center justify-center flex-shrink-0", action.completed ? "bg-green-500/20 border-green-500/50" : "border-white/20")}>
                                            {action.completed && <CheckCircle className="w-3 h-3 text-green-500" />}
                                          </div>
                                          <span className={action.completed ? "line-through opacity-50" : ""}>{action.text}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Sentiment & Topics */}
                                <div className={cn("grid grid-cols-2 gap-4 pt-4 border-t", isDark ? "border-white/5" : "border-black/5")}>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1 opacity-50">
                                      <Smile className="w-3 h-3" />
                                      <span className="text-xs uppercase font-bold tracking-wider">Sentiment</span>
                                    </div>
                                    <span className={cn(
                                      "capitalize text-sm font-medium px-2 py-0.5 rounded",
                                      item.summary.sentiment.includes('positive') ? "bg-green-500/20 text-green-400" :
                                        item.summary.sentiment.includes('negative') ? "bg-red-500/20 text-red-400" :
                                          isDark ? "bg-white/10 text-white/70" : "bg-black/10 text-black/70"
                                    )}>
                                      {item.summary.sentiment.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1 opacity-50">
                                      <Tag className="w-3 h-3" />
                                      <span className="text-xs uppercase font-bold tracking-wider">Tags</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {item.summary.topics?.map(topic => (
                                        <span key={topic} className={cn("px-2 py-0.5 rounded text-xs opacity-60", isDark ? "bg-white/5 text-white" : "bg-black/5 text-black")}>#{topic}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeTab === 'transcript' && (
                              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {item.messages.length === 0 ? (
                                  <p className="opacity-40 italic text-sm text-center py-4">No transcript available</p>
                                ) : item.messages.map((msg, idx) => (
                                  <div key={idx} className="flex gap-4 text-sm group">
                                    <span className={cn(
                                      "uppercase text-[10px] font-bold w-12 pt-1 opacity-50 group-hover:opacity-100 transition-opacity",
                                      msg.speaker === 'agent' ? "text-blue-400" : "text-purple-400"
                                    )}>
                                      {msg.speaker}
                                    </span>
                                    <div className={cn("px-3 py-2 rounded-lg flex-1", msg.speaker === 'agent' ? (isDark ? "bg-white/5" : "bg-black/5") : "bg-transparent")}>
                                      <p className="opacity-80 leading-relaxed">{msg.text}</p>
                                      <span className="text-[10px] opacity-20 mt-1 block">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {activeTab === 'details' && (
                              <div className="space-y-6">
                                {/* Extracted Fields */}
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Database className="w-4 h-4 opacity-50" />
                                    <h4 className={cn("text-xs uppercase opacity-50 font-bold tracking-wider", isDark ? "text-white" : "text-black")}>Extracted Data</h4>
                                  </div>

                                  {item.extractedFields.length > 0 ? (
                                    <div className="grid gap-1">
                                      {item.extractedFields.map(field => (
                                        <div key={field.id} className={cn("grid grid-cols-12 gap-4 text-sm p-2 rounded transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-black/5")}>
                                          <span className={cn("col-span-4 opacity-60 font-medium truncate", isDark ? "text-white" : "text-black")}>{field.label}</span>
                                          <span className={cn("col-span-6", isDark ? "text-white" : "text-black")}>{field.value}</span>
                                          <span className="col-span-2 text-right opacity-40 text-xs font-mono">{Math.round(field.confidence * 100)}%</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="opacity-40 text-sm italic">No data fields extracted.</p>
                                  )}
                                </div>

                                {/* Metadata */}
                                <div className={cn("pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4", isDark ? "border-white/5" : "border-black/5")}>
                                  <div>
                                    <span className="text-xs opacity-40 block mb-1">Duration</span>
                                    <span className="font-mono">{formatDuration(item.duration)}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs opacity-40 block mb-1">Priority</span>
                                    <span className="capitalize">{item.priority}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs opacity-40 block mb-1">Processing ID</span>
                                    <span className="font-mono text-xs opacity-60 truncate block">{item.id}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs opacity-40 block mb-1">Category</span>
                                    <span className="capitalize">{item.category?.name || 'Uncategorized'}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
