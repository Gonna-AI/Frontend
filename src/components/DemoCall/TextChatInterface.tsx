import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, ChevronDown, ChevronRight, Brain } from 'lucide-react';
import { cn } from '../../utils/cn';
import { aiService } from '../../services/aiService';
import { useDemoCall } from '../../contexts/DemoCallContext';

interface TextChatInterfaceProps {
  isDark?: boolean;
  compact?: boolean;
}

export default function TextChatInterface({
  isDark = true,
  compact = false
}: TextChatInterfaceProps) {
  const {
    currentCall,
    startCall,
    endCall,
    addMessage,
    knowledgeBase,
    updateExtractedField,
    setCallPriority,
    setCallCategory
  } = useDemoCall();

  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
  const [messageReasonings, setMessageReasonings] = useState<Map<number, { reasoning: string; thinkingTime: number }>>(new Map());
  const [expandedReasonings, setExpandedReasonings] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSendTimeRef = useRef<number>(0);
  const SEND_COOLDOWN_MS = 1500; // Minimum 1.5s between sends

  const messages = currentCall?.messages || [];
  const extractedFields = currentCall?.extractedFields || [];
  const isActive = currentCall?.status === 'active';

  // Initialize AI service with knowledge base
  useEffect(() => {
    aiService.setKnowledgeBase(knowledgeBase);
  }, [knowledgeBase]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start a new chat
  const handleStartChat = useCallback(async () => {
    startCall('text');
    setIsProcessing(false);
    setMessageReasonings(new Map());
    setExpandedReasonings(new Set());
    // Don't send automatic greeting - let user send first message and AI responds naturally
  }, [startCall]);

  // Toggle reasoning panel for a specific message
  const toggleReasoning = useCallback((messageIndex: number) => {
    setExpandedReasonings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageIndex)) {
        newSet.delete(messageIndex);
      } else {
        newSet.add(messageIndex);
      }
      return newSet;
    });
  }, []);

  // Handle user input and get AI response
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    // Debounce: prevent rapid-fire sends within cooldown window
    const now = Date.now();
    if (now - lastSendTimeRef.current < SEND_COOLDOWN_MS) {
      console.warn('⚡ Send throttled — too fast, please wait');
      return;
    }
    lastSendTimeRef.current = now;

    // Add user message
    addMessage('user', text);
    setInputMessage('');
    setIsProcessing(true);
    setProcessingStartTime(Date.now());

    try {
      // Use the same AI service as voice call
      const response = await aiService.generateResponse(
        text,
        messages,
        extractedFields
      );

      // Calculate thinking time
      const thinkingTime = processingStartTime ? Math.round((Date.now() - processingStartTime) / 1000) : 0;

      // Update extracted fields if any
      if (response.extractedFields) {
        response.extractedFields.forEach(field => {
          updateExtractedField(field);
        });
      }

      // Update priority if suggested
      if (response.suggestedPriority) {
        setCallPriority(response.suggestedPriority);
      }

      // Update category if suggested
      if (response.suggestedCategory) {
        setCallCategory(response.suggestedCategory);
      }

      // Add AI response message
      addMessage('agent', response.text);

      // Store reasoning for this message if present
      if (response.reasoning) {
        const newMessageIndex = messages.length + 1; // +1 for user message, this will be the agent message index
        setMessageReasonings(prev => {
          const newMap = new Map(prev);
          newMap.set(newMessageIndex, { reasoning: response.reasoning!, thinkingTime });
          return newMap;
        });
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage('agent', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStartTime(null);
      // Focus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, extractedFields, addMessage, updateExtractedField, setCallPriority, setCallCategory, isProcessing, processingStartTime]);

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  }, [inputMessage, handleSendMessage]);

  // End chat
  const handleEndChat = useCallback(() => {
    endCall();
    setInputMessage('');
  }, [endCall]);

  if (!isActive && messages.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl md:rounded-3xl",
        isDark
          ? "bg-black/20 border border-white/10 backdrop-blur-md"
          : "bg-white/80 border border-black/10 backdrop-blur-md"
      )}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <MessageSquare className={cn(
            "w-12 h-12 md:w-16 md:h-16 mx-auto mb-4",
            isDark ? "text-blue-400" : "text-blue-600"
          )} />
          <h3 className={cn(
            "text-xl md:text-2xl font-semibold mb-2",
            isDark ? "text-white" : "text-gray-900"
          )}>
            Start a Chat
          </h3>
          <p className={cn(
            "text-sm md:text-base mb-6",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            Chat with the AI assistant
          </p>
          <button
            onClick={handleStartChat}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              isDark
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            Start Chat
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col rounded-2xl md:rounded-3xl overflow-hidden",
      isDark
        ? "bg-black/20 border border-white/10 backdrop-blur-md"
        : "bg-white/80 border border-black/10 backdrop-blur-md",
      compact ? "h-[500px]" : "h-[600px] md:h-[700px]"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        isDark ? "border-white/10" : "border-black/10"
      )}>
        <div className="flex items-center gap-3">
          <MessageSquare className={cn(
            "w-5 h-5",
            isDark ? "text-blue-400" : "text-blue-600"
          )} />
          <h3 className={cn(
            "font-semibold",
            isDark ? "text-white" : "text-gray-900"
          )}>
            Chat
          </h3>
          {isActive && (
            <span className={cn(
              "px-2 py-1 text-xs rounded-full",
              isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"
            )}>
              Active
            </span>
          )}
        </div>
        {isActive && (
          <button
            onClick={handleEndChat}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-all",
              isDark
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                : "bg-red-100 hover:bg-red-200 text-red-600"
            )}
          >
            End Chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => {
            const reasoning = messageReasonings.get(index);
            const isExpanded = expandedReasonings.has(index);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex gap-3",
                  message.speaker === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.speaker === 'agent' && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  )}>
                    <Bot className={cn(
                      "w-4 h-4",
                      isDark ? "text-blue-400" : "text-blue-600"
                    )} />
                  </div>
                )}

                <div className="flex flex-col gap-2 max-w-[80%] md:max-w-[70%]">
                  {/* Reasoning panel - only for agent messages with reasoning */}
                  {message.speaker === 'agent' && reasoning && (
                    <div className={cn(
                      "rounded-lg overflow-hidden",
                      isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200"
                    )}>
                      <button
                        onClick={() => toggleReasoning(index)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors",
                          isDark
                            ? "text-purple-300 hover:bg-purple-500/20"
                            : "text-purple-700 hover:bg-purple-100"
                        )}
                      >
                        <Brain className="w-3 h-3" />
                        <span>Thought for {reasoning.thinkingTime}s</span>
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 ml-auto" />
                        ) : (
                          <ChevronRight className="w-3 h-3 ml-auto" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className={cn(
                              "px-3 py-2 text-xs whitespace-pre-wrap border-t max-h-48 overflow-y-auto",
                              isDark
                                ? "text-purple-200/80 border-purple-500/20"
                                : "text-purple-800/80 border-purple-200"
                            )}>
                              {reasoning.reasoning}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={cn(
                    "rounded-lg px-4 py-2",
                    message.speaker === 'user'
                      ? isDark
                        ? "bg-blue-500 text-white"
                        : "bg-blue-600 text-white"
                      : isDark
                        ? "bg-white/10 text-white border border-white/10"
                        : "bg-gray-100 text-gray-900 border border-gray-200"
                  )}>
                    <p className="text-sm md:text-base whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                  </div>
                </div>

                {message.speaker === 'user' && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    isDark ? "bg-gray-500/20" : "bg-gray-200"
                  )}>
                    <User className={cn(
                      "w-4 h-4",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )} />
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isDark ? "bg-blue-500/20" : "bg-blue-100"
            )}>
              <Bot className={cn(
                "w-4 h-4",
                isDark ? "text-blue-400" : "text-blue-600"
              )} />
            </div>
            <div className={cn(
              "px-4 py-2 rounded-lg",
              isDark
                ? "bg-white/10 text-white border border-white/10"
                : "bg-gray-100 text-gray-900 border border-gray-200"
            )}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "p-4 border-t",
          isDark ? "border-white/10" : "border-black/10"
        )}
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!isActive || isProcessing}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all",
              isDark
                ? "bg-white/5 border-white/10 text-white placeholder-white/50 focus:ring-blue-500/50"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-500",
              (!isActive || isProcessing) && "opacity-50 cursor-not-allowed"
            )}
          />
          <button
            type="submit"
            disabled={!isActive || isProcessing || !inputMessage.trim()}
            className={cn(
              "px-4 py-2 rounded-lg transition-all flex items-center justify-center",
              isDark
                ? "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-500/50 disabled:cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-600/50 disabled:cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
