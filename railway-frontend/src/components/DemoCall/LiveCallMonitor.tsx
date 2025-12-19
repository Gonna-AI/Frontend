import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Bot, Tag, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDemoCall, CallMessage, ExtractedField } from '../../contexts/DemoCallContext';

interface LiveCallMonitorProps {
  isDark?: boolean;
}

export default function LiveCallMonitor({ isDark = true }: LiveCallMonitorProps) {
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
      critical: 'text-red-400 bg-red-500/20',
      high: 'text-orange-400 bg-orange-500/20',
      medium: 'text-yellow-400 bg-yellow-500/20',
      low: 'text-green-400 bg-green-500/20',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className={cn(
      "flex flex-col h-full rounded-xl md:rounded-2xl overflow-hidden",
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
          <MessageSquare className={cn(
            "w-4 h-4 md:w-5 md:h-5",
            isDark ? "text-white/60" : "text-black/60"
          )} />
          <h3 className={cn(
            "font-semibold text-sm md:text-base",
            isDark ? "text-white" : "text-black"
          )}>
            Live Monitor
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className={cn(
            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full",
            isActive ? "bg-green-500 animate-pulse" : "bg-gray-500"
          )} />
          <span className={cn(
            "text-xs md:text-sm",
            isDark ? "text-white/60" : "text-black/60"
          )}>
            {isActive ? 'Active' : 'Idle'}
          </span>
          {currentCall?.priority && currentCall.priority !== 'medium' && (
            <span className={cn(
              "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full capitalize",
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
          "px-3 md:px-4 py-2 md:py-3 border-b",
          isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"
        )}>
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
            <Tag className={cn(
              "w-3 h-3 md:w-4 md:h-4",
              isDark ? "text-white/60" : "text-black/60"
            )} />
            <span className={cn(
              "text-[10px] md:text-xs font-medium",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              Extracted ({extractedFields.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {extractedFields.map((field: ExtractedField) => (
              <div
                key={field.id}
                className={cn(
                  "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg flex items-center gap-0.5 md:gap-1",
                  isDark 
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                    : "bg-blue-500/5 text-blue-600 border border-blue-500/10"
                )}
              >
                <span className="opacity-70">{field.label}:</span>
                <span className="font-medium truncate max-w-[60px] md:max-w-none">{field.value}</span>
                <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-60 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category display */}
      {isActive && currentCall?.category && (
        <div className={cn(
          "px-3 md:px-4 py-1.5 md:py-2 border-b flex items-center gap-1.5 md:gap-2",
          isDark ? "border-white/10" : "border-black/10"
        )}>
          <span className={cn(
            "text-[10px] md:text-xs",
            isDark ? "text-white/50" : "text-black/50"
          )}>
            Category:
          </span>
          <span className={cn(
            "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full",
            isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-500/10 text-purple-600"
          )}>
            {currentCall.category.name}
          </span>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className={cn(
            "flex flex-col items-center justify-center h-full text-center py-8 md:py-12",
            isDark ? "text-white/40" : "text-black/40"
          )}>
            <MessageSquare className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4 opacity-40" />
            <p className="text-sm md:text-lg font-medium mb-0.5 md:mb-1">No Active Conversation</p>
            <p className="text-xs md:text-sm opacity-80">
              {isActive ? 'Waiting for conversation...' : 'Start a call to see transcript'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message: CallMessage) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex gap-1.5 md:gap-3",
                  message.speaker === 'agent' ? "justify-start" : "justify-end"
                )}
              >
                {message.speaker === 'agent' && (
                  <div className={cn(
                    "w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0",
                    isDark 
                      ? "bg-blue-500/20 border border-blue-500/30" 
                      : "bg-blue-500/10 border border-blue-500/20"
                  )}>
                    <Bot className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[80%] rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3",
                  message.speaker === 'agent'
                    ? isDark 
                      ? "bg-blue-500/10 border border-blue-500/20" 
                      : "bg-blue-500/10 border border-blue-500/20"
                    : isDark
                      ? "bg-purple-500/10 border border-purple-500/20"
                      : "bg-purple-500/10 border border-purple-500/20"
                )}>
                  <p className={cn(
                    "text-xs md:text-sm",
                    isDark ? "text-white/90" : "text-black/90"
                  )}>
                    {message.text}
                  </p>
                  <p className={cn(
                    "text-[10px] md:text-xs mt-0.5 md:mt-1",
                    isDark ? "text-white/40" : "text-black/40"
                  )}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.speaker === 'user' && (
                  <div className={cn(
                    "w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0",
                    isDark 
                      ? "bg-purple-500/20 border border-purple-500/30" 
                      : "bg-purple-500/10 border border-purple-500/20"
                  )}>
                    <User className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Status bar */}
      {isActive && (
        <div className={cn(
          "px-3 md:px-4 py-1.5 md:py-2 border-t flex items-center gap-1.5 md:gap-2",
          isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"
        )}>
          <div className="flex space-x-0.5 md:space-x-1">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500"
            />
          </div>
          <span className={cn(
            "text-[10px] md:text-xs",
            isDark ? "text-white/50" : "text-black/50"
          )}>
            <span className="hidden sm:inline">Recording & analyzing conversation...</span>
            <span className="sm:hidden">Recording...</span>
          </span>
        </div>
      )}
    </div>
  );
}
