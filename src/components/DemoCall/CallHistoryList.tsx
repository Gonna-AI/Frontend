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
  Database,
  Search,
  Download
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
  const [searchQuery, setSearchQuery] = useState('');

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
      medium: { label: 'Medium', color: 'blue', icon: Circle },
      low: { label: 'Low', color: 'emerald', icon: CheckCircle },
    };
    return configs[priority] || configs.medium;
  };

  const filteredHistory = callHistory.filter(call => {
    if (filterPriority !== 'all' && call.priority !== filterPriority) return false;
    if (filterType !== 'all' && call.type !== filterType) return false;
    if (searchQuery && !call.callerName.toLowerCase().includes(searchQuery.toLowerCase()) && !call.summary.summaryText?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return;

    const headers = ['Date', 'Caller Name', 'Type', 'Duration (s)', 'Priority', 'Category', 'Sentiment', 'Summary'];

    const rows = filteredHistory.map(call => {
      return [
        formatDate(call.date).replace(/,/g, ''),
        `"${call.callerName}"`,
        call.type || 'text',
        call.duration || 0,
        call.priority,
        call.category?.name || 'N/A',
        call.summary.sentiment || 'neutral',
        `"${(call.summary.summaryText || call.summary.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clerktree_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>
            {t('history.title')}
          </h1>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
            Review and analyze past interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredHistory.length === 0}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors",
              filteredHistory.length === 0 ? "opacity-50 cursor-not-allowed" : "",
              isDark ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-black/10 hover:bg-gray-50 text-gray-700"
            )}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={cn(
        "rounded-xl border overflow-hidden",
        isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
      )}>
        {/* Toolbar / Filters */}
        {showFilters && (
          <div className={cn(
            "p-4 border-b flex flex-wrap items-center gap-4",
            isDark ? "border-white/10" : "border-black/5"
          )}>
            <div className={cn("relative flex-1 min-w-[200px]")}>
              <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDark ? "text-white/40" : "text-black/40")} />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-transparent focus:outline-none focus:ring-1",
                  isDark
                    ? "border-white/10 focus:border-white/20 focus:ring-white/10 text-white placeholder-white/20"
                    : "border-black/10 focus:border-black/20 focus:ring-black/5 text-black placeholder-black/40"
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className={cn("w-4 h-4", isDark ? "text-white/40" : "text-black/40")} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className={cn(
                  "bg-transparent text-sm focus:outline-none cursor-pointer border rounded-lg px-2 py-1.5",
                  isDark ? "border-white/10 text-white hover:bg-white/5" : "border-black/10 text-black hover:bg-black/5"
                )}
              >
                <option value="all">All Types</option>
                <option value="voice">Voice Calls</option>
                <option value="text">Chat Logs</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className={cn(
                  "bg-transparent text-sm focus:outline-none cursor-pointer border rounded-lg px-2 py-1.5",
                  isDark ? "border-white/10 text-white hover:bg-white/5" : "border-black/10 text-black hover:bg-black/5"
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
        )}

        {/* Content List */}
        <div>
          {/* Table Header */}
          <div className={cn(
            "hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-semibold uppercase tracking-wider",
            isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-gray-50 border-black/5 text-gray-500"
          )}>
            <div className="col-span-4">Caller / Type</div>
            <div className="col-span-5">Summary</div>
            <div className="col-span-3 text-right">Date / Action</div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="p-16 text-center opacity-40">
              <History className="w-12 h-12 mx-auto mb-4" />
              <p>No records found matching your filters</p>
            </div>
          ) : (
            <div>
              {filteredHistory.map((item) => {
                const priority = getPriorityConfig(item.priority);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "border-b last:border-0 transition-colors group",
                      isDark ? "border-white/5 hover:bg-white/5" : "border-black/5 hover:bg-black/5"
                    )}
                  >
                    {/* Row Header */}
                    <div
                      onClick={() => toggleExpand(item.id)}
                      className="p-4 md:px-6 cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                    >
                      {/* Status / Type Icon (Col 1) */}
                      <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border",
                          item.type === 'voice'
                            ? (isDark ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-teal-50 text-teal-600 border-teal-200")
                            : (isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200")
                        )}>
                          {item.type === 'voice' ? <Phone className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                            {item.callerName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium border",
                              priority.color === 'red' ? (isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-200") :
                                priority.color === 'orange' ? (isDark ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-orange-50 text-orange-600 border-orange-200") :
                                  priority.color === 'blue' ? (isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200") :
                                    (isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200")
                            )}>
                              {priority.label}
                            </span>
                            <span className={cn("text-xs", isDark ? "text-white/40" : "text-gray-400")}>{item.category?.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary (Col 2 - Span) */}
                      <div className="col-span-1 md:col-span-5">
                        <p className={cn("text-sm truncate pr-4", isDark ? "text-white/80" : "text-gray-700")}>
                          {item.summary.summaryText || "No summary available"}
                        </p>
                        <div className={cn("flex items-center gap-3 mt-1 text-xs", isDark ? "text-white/40" : "text-gray-400")}>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(item.duration)}</span>
                        </div>
                      </div>

                      {/* Actions (Col 3) */}
                      <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center gap-4">
                        <span className={cn("text-xs md:text-right", isDark ? "text-white/40" : "text-gray-400")}>
                          {formatDate(item.date)}
                        </span>
                        <div className={cn(
                          "p-1.5 rounded-md transition-all duration-200",
                          expandedId === item.id
                            ? (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black")
                            : (isDark ? "text-white/40 group-hover:text-white" : "text-gray-400 group-hover:text-black")
                        )}>
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            expandedId === item.id && "rotate-180"
                          )} />
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
                            "border-t px-6 py-6",
                            isDark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-black/[0.02]"
                          )}>
                            {/* Tabs Header inside expanded */}
                            <div className="flex gap-2 mb-6 p-1 rounded-lg border w-fit mx-auto md:mx-0 backdrop-blur-sm relative z-10" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                              {(['summary', 'transcript', 'details'] as const).map(tab => (
                                <button
                                  key={tab}
                                  onClick={() => setActiveTab(tab)}
                                  className={cn(
                                    "px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all",
                                    activeTab === tab
                                      ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm")
                                      : (isDark ? "text-white/50 hover:text-white hover:bg-white/5" : "text-black/50 hover:text-black hover:bg-black/5")
                                  )}
                                >
                                  {tab}
                                </button>
                              ))}
                            </div>

                            {/* Content */}
                            {activeTab === 'summary' && (
                              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* Summary Text */}
                                <div>
                                  <h4 className={cn("text-xs uppercase mb-2 font-semibold tracking-wider flex items-center gap-2", isDark ? "text-white/40" : "text-black/40")}>
                                    <Database className="w-3 h-3" /> Overview
                                  </h4>
                                  <div className={cn(
                                    "p-4 rounded-xl border relative overflow-hidden",
                                    isDark ? "bg-black/20 border-white/10" : "bg-white border-black/5"
                                  )}>
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
                                    <p className={cn("text-sm leading-relaxed relative z-10", isDark ? "text-white/80" : "text-gray-700")}>
                                      {item.summary.summaryText || "No summary details generated."}
                                    </p>
                                  </div>
                                </div>

                                {/* Key Points & AI Suggestions Grid */}
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                  {/* Key Points - Restored */}
                                  {item.summary.mainPoints && item.summary.mainPoints.length > 0 && (
                                    <div>
                                      <h4 className={cn("text-xs uppercase mb-2 font-semibold tracking-wider flex items-center gap-2", isDark ? "text-white/40" : "text-black/40")}>
                                        <ListTodo className="w-3 h-3" /> Key Points
                                      </h4>
                                      <div className={cn(
                                        "p-4 rounded-xl border relative overflow-hidden",
                                        isDark ? "bg-black/20 border-white/10" : "bg-white border-black/5"
                                      )}>
                                        <ul className={cn("space-y-3 text-sm relative z-10", isDark ? "text-white/70" : "text-gray-600")}>
                                          {item.summary.mainPoints.map((point, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                              <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", isDark ? "bg-white/40" : "bg-black/40")} />
                                              {point}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {/* AI Suggestions */}
                                  <div>
                                    <h4 className={cn("text-xs uppercase mb-2 font-semibold tracking-wider flex items-center gap-2", isDark ? "text-white/40" : "text-black/40")}>
                                      <TrendingUp className="w-3 h-3" /> AI Suggestions
                                    </h4>
                                    <div className={cn(
                                      "p-4 rounded-xl border relative overflow-hidden",
                                      isDark ? "bg-black/20 border-white/10" : "bg-white border-black/5"
                                    )}>
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none" />
                                      <div className="relative z-10 space-y-4"> {/* Increased spacing */}
                                        <div className={cn("flex items-start gap-3 text-sm min-w-0", isDark ? "text-white/70" : "text-gray-600")}>
                                          <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-400">
                                            <Smile className="w-3 h-3" />
                                          </div>
                                          <p className="flex-1 break-words">Consider offering a follow-up consultation to address the client's specific concerns mentioned.</p>
                                        </div>
                                        <div className={cn("flex items-start gap-3 text-sm min-w-0", isDark ? "text-white/70" : "text-gray-600")}>
                                          <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                                            <ListTodo className="w-3 h-3" />
                                          </div>
                                          <p className="flex-1 break-words">Update the user's profile with the new contact preferences.</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Items - Moved to full width or separate grid if needed, keeping here for flow */}
                                {item.summary.actionItems && item.summary.actionItems.length > 0 && (
                                  <div>
                                    <h4 className={cn("text-xs uppercase mb-2 font-semibold tracking-wider flex items-center gap-2", isDark ? "text-white/40" : "text-black/40")}>
                                      <CheckCircle className="w-3 h-3" /> Action Items
                                    </h4>
                                    <div className={cn(
                                      "p-4 rounded-xl border relative overflow-hidden",
                                      isDark ? "bg-black/20 border-white/10" : "bg-white border-black/5"
                                    )}>
                                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
                                      <div className="space-y-2 relative z-10">
                                        {item.summary.actionItems.map((action, i) => (
                                          <div key={i} className={cn(
                                            "flex items-start gap-2 p-2 rounded-lg text-sm transition-colors",
                                            isDark ? "hover:bg-white/5 text-white/90" : "hover:bg-black/5 text-gray-800"
                                          )}>
                                            <div className={cn(
                                              "w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0",
                                              action.completed
                                                ? "bg-emerald-500 text-white border-emerald-500"
                                                : (isDark ? "border-white/20" : "border-black/20")
                                            )}>
                                              {action.completed && <CheckCircle className="w-3 h-3" />}
                                            </div>
                                            <span className={action.completed ? "line-through opacity-50" : ""}>{action.text}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Sentiment & Topics */}
                                <div className="grid md:grid-cols-2 gap-6">
                                  {/* Sentiment Box */}
                                  <div className={cn(
                                    "p-4 rounded-xl border relative overflow-hidden",
                                    isDark ? "bg-black/20 border-white/10" : "bg-white border-black/5"
                                  )}>
                                    <div className={cn(
                                      "absolute -top-10 -right-10 w-24 h-24 blur-[40px] rounded-full pointer-events-none",
                                      item.summary.sentiment.includes('positive') ? "bg-emerald-500/20" :
                                        item.summary.sentiment.includes('negative') ? "bg-rose-500/20" : "bg-blue-500/20"
                                    )} />
                                    <div className="relative z-10">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className={cn(
                                          "p-1.5 rounded-md",
                                          isDark ? "bg-white/5" : "bg-black/5"
                                        )}>
                                          <Smile className={cn("w-3.5 h-3.5", isDark ? "text-white/60" : "text-black/60")} />
                                        </div>
                                        <span className={cn("text-xs uppercase font-semibold tracking-wider", isDark ? "text-white/60" : "text-black/60")}>Sentiment Analysis</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className={cn(
                                          "capitalize text-sm font-medium px-3 py-1.5 rounded-full border shadow-sm",
                                          item.summary.sentiment.includes('positive') ? (isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200") :
                                            item.summary.sentiment.includes('negative') ? (isDark ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-rose-50 text-rose-700 border-rose-200") :
                                              (isDark ? "bg-gray-500/10 text-gray-400 border-white/10" : "bg-gray-100 text-gray-600 border-gray-200")
                                        )}>
                                          {item.summary.sentiment.replace('_', ' ')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tags Box */}
                                  <div className={cn(
                                    "p-4 rounded-xl border relative overflow-hidden",
                                    isDark ? "bg-black/20 border-white/10" : "bg-white border-black/5"
                                  )}>
                                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/20 blur-[40px] rounded-full pointer-events-none" />
                                    <div className="relative z-10">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className={cn(
                                          "p-1.5 rounded-md",
                                          isDark ? "bg-white/5" : "bg-black/5"
                                        )}>
                                          <Tag className={cn("w-3.5 h-3.5", isDark ? "text-white/60" : "text-black/60")} />
                                        </div>
                                        <span className={cn("text-xs uppercase font-semibold tracking-wider", isDark ? "text-white/60" : "text-black/60")}>Conversation Tags</span>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {item.summary.topics?.map(topic => (
                                          <span key={topic} className={cn(
                                            "px-2.5 py-1 rounded-full text-xs border font-medium transition-colors",
                                            isDark ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" : "bg-gray-50 border-black/5 text-gray-600"
                                          )}>
                                            {topic}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeTab === 'transcript' && (
                              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
                                {item.messages.length === 0 ? (
                                  <p className="opacity-40 italic text-sm text-center py-8">No transcript available</p>
                                ) : item.messages.map((msg, idx) => (
                                  <div key={idx} className={cn(
                                    "flex gap-4 text-sm group p-3 rounded-lg transition-colors",
                                    isDark ? "hover:bg-white/[0.02]" : "hover:bg-black/[0.02]"
                                  )}>
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase",
                                      msg.speaker === 'agent'
                                        ? "bg-purple-500/10 text-purple-400"
                                        : "bg-blue-500/10 text-blue-400"
                                    )}>
                                      {msg.speaker === 'agent' ? 'AI' : 'US'}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className={cn("text-xs font-semibold uppercase", isDark ? "text-white/40" : "text-black/40")}>
                                          {msg.speaker === 'agent' ? 'AI Agent' : 'User'}
                                        </span>
                                        <span className={cn("text-[10px]", isDark ? "text-white/20" : "text-black/20")}>
                                          {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                      </div>
                                      <p className={cn("leading-relaxed", isDark ? "text-white/90" : "text-gray-800")}>{msg.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {activeTab === 'details' && (
                              <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* Extracted Fields */}
                                <div>
                                  <div className="flex items-center gap-2 mb-4">
                                    <Database className={cn("w-4 h-4", isDark ? "text-white/40" : "text-black/40")} />
                                    <h4 className={cn("text-xs uppercase font-semibold tracking-wider", isDark ? "text-white/40" : "text-black/40")}>Extracted Data</h4>
                                  </div>

                                  {item.extractedFields.length > 0 ? (
                                    <div className={cn(
                                      "rounded-lg border overflow-hidden",
                                      isDark ? "border-white/10" : "border-black/5"
                                    )}>
                                      <table className="w-full text-sm">
                                        <thead className={cn(
                                          "text-xs uppercase font-semibold text-left",
                                          isDark ? "bg-white/5 text-white/50" : "bg-gray-50 text-gray-500"
                                        )}>
                                          <tr>
                                            <th className="px-4 py-2">Field</th>
                                            <th className="px-4 py-2">Value</th>
                                            <th className="px-4 py-2 text-right">Confidence</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                          {item.extractedFields.map(field => (
                                            <tr key={field.id} className={cn(isDark ? "hover:bg-white/5" : "hover:bg-gray-50")}>
                                              <td className={cn("px-4 py-3 font-medium opacity-70", isDark ? "text-white" : "text-gray-900")}>{field.label}</td>
                                              <td className={cn("px-4 py-3", isDark ? "text-white" : "text-gray-900")}>{field.value}</td>
                                              <td className={cn("px-4 py-3 text-right font-mono text-xs opacity-50", isDark ? "text-white" : "text-black")}>
                                                {Math.round(field.confidence * 100)}%
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className={cn("p-8 text-center border rounded-lg border-dashed", isDark ? "border-white/10 text-white/30" : "border-black/10 text-black/30")}>
                                      <p className="text-sm italic">No data fields were extracted from this conversation.</p>
                                    </div>
                                  )}
                                </div>

                                {/* Metadata */}
                                <div className={cn("pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-6", isDark ? "border-white/5" : "border-black/5")}>
                                  <div>
                                    <span className={cn("text-xs uppercase font-semibold tracking-wider block mb-1", isDark ? "text-white" : "text-black/40")}>Duration</span>
                                    <span className={cn("font-mono text-lg", isDark ? "text-white" : "text-black")}>{formatDuration(item.duration)}</span>
                                  </div>
                                  <div>
                                    <span className={cn("text-xs uppercase font-semibold tracking-wider block mb-1", isDark ? "text-white" : "text-black/40")}>Priority</span>
                                    <span className={cn("capitalize", isDark ? "text-white" : "text-black")}>{item.priority}</span>
                                  </div>
                                  <div>
                                    <span className={cn("text-xs uppercase font-semibold tracking-wider block mb-1", isDark ? "text-white" : "text-black/40")}>Ref ID</span>
                                    <span className={cn("font-mono text-xs block truncate opacity-60", isDark ? "text-white" : "text-black")}>{item.id}</span>
                                  </div>
                                  <div>
                                    <span className={cn("text-xs uppercase font-semibold tracking-wider block mb-1", isDark ? "text-white" : "text-black/40")}>Category</span>
                                    <span className={cn("capitalize", isDark ? "text-white" : "text-black")}>{item.category?.name || 'Uncategorized'}</span>
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
