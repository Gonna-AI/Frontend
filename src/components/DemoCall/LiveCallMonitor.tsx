import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Bot, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDemoCall, CallMessage, ExtractedField } from '../../contexts/DemoCallContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface LiveCallMonitorProps {
  isDark?: boolean;
}

export default function LiveCallMonitor({ isDark = true }: LiveCallMonitorProps) {
  const { t } = useLanguage();
  const { currentCall } = useDemoCall();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = currentCall?.messages || [];
  const extractedFields = currentCall?.extractedFields || [];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const isActive = currentCall?.status === 'active';

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className={cn(
      "flex flex-col h-[600px] rounded-xl overflow-hidden border shadow-sm",
      isDark
        ? "bg-[#09090B] border-white/10"
        : "bg-white border-black/10"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b backdrop-blur-sm",
        isDark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-gray-50/50"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isDark ? "bg-white/5" : "bg-black/5"
          )}>
            <Activity className={cn(
              "w-4 h-4",
              isDark ? "text-white" : "text-black"
            )} />
          </div>
          <div>
            <h3 className={cn(
              "font-semibold text-sm leading-none",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {t('monitor.title')}
            </h3>
            <p className={cn("text-xs mt-1", isDark ? "text-white/40" : "text-gray-500")}>
              Real-time conversation stream
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isActive ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Live</span>
            </div>
          ) : (
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full border",
              isDark ? "bg-white/5 border-white/10 text-white/40" : "bg-black/5 border-black/5 text-black/40"
            )}>
              <div className="w-2 h-2 rounded-full bg-current opacity-50" />
              <span className="text-xs font-medium uppercase tracking-wider">Idle</span>
            </div>
          )}

          {currentCall?.priority && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full capitalize font-medium border",
              getPriorityColor(currentCall.priority)
            )}>
              {currentCall.priority}
            </span>
          )}
        </div>
      </div>

      {/* Extracted fields panel */}
      {isActive && extractedFields.length > 0 && (
        <div className={cn(
          "px-4 py-3 border-b overflow-x-auto",
          isDark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-gray-50/50"
        )}>
          <div className="flex gap-4 min-w-max">
            {extractedFields.map((field: ExtractedField) => (
              <div key={field.id} className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs",
                isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"
              )}>
                <span className={cn("opacity-50 font-medium", isDark ? "text-white" : "text-black")}>
                  {field.label}:
                </span>
                <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category display (Sticky if active) */}
      {isActive && currentCall?.category && (
        <div className={cn(
          "px-4 py-2 border-b flex items-center justify-between text-xs",
          isDark ? "border-white/10 bg-purple-500/5 text-purple-200" : "border-black/5 bg-purple-50 text-purple-700"
        )}>
          <span className="opacity-70">Detected Intent</span>
          <span className="font-semibold">{currentCall.category.name}</span>
        </div>
      )}

      {/* Messages area */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth",
        isDark ? "bg-[#09090B]" : "bg-gray-50/30"
      )}>
        {messages.length === 0 ? (
          <div className={cn(
            "flex flex-col items-center justify-center h-full text-center py-12",
            isDark ? "text-white/20" : "text-black/20"
          )}>
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
              isDark ? "bg-white/5" : "bg-black/5"
            )}>
              <MessageSquare className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">{t('monitor.noActive')}</p>
            <p className="text-xs opacity-60 mt-1">
              {isActive ? t('monitor.waiting') : t('monitor.startCall')}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {messages.map((message: CallMessage) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  message.speaker === 'agent' ? "mr-auto" : "ml-auto flex-row-reverse"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mt-1",
                  message.speaker === 'agent'
                    ? (isDark ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border border-indigo-100")
                    : (isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-100")
                )}>
                  {message.speaker === 'agent' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={cn(
                  "flex flex-col",
                  message.speaker === 'agent' ? "items-start" : "items-end"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed relative group",
                    message.speaker === 'agent'
                      ? (isDark
                        ? "bg-white/10 text-white rounded-tl-none border border-white/5"
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100")
                      : (isDark
                        ? "bg-emerald-600 text-white rounded-tr-none"
                        : "bg-emerald-600 text-white rounded-tr-none shadow-md")
                  )}>
                    {message.text}
                  </div>
                  <span className={cn(
                    "text-[10px] mt-1 opacity-40 px-1",
                    isDark ? "text-white" : "text-black"
                  )}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
