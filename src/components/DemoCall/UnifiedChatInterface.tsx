import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    ChevronDown,
    ChevronRight,
    Brain,
    Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { aiService } from '../../services/aiService';
import { ttsService, KokoroVoiceId } from '../../services/ttsService';
import { useDemoCall } from '../../contexts/DemoCallContext';

// Speech Recognition types - use any to avoid conflicts with other declarations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

interface UnifiedChatInterfaceProps {
    isDark?: boolean;
}

export default function UnifiedChatInterface({ isDark = true }: UnifiedChatInterfaceProps) {
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

    // Voice call state
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [agentStatus, setAgentStatus] = useState<'idle' | 'speaking' | 'listening' | 'processing'>('idle');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    // Removed unused timerRef

    const messages = currentCall?.messages || [];
    const extractedFields = currentCall?.extractedFields || [];
    const isActive = currentCall?.status === 'active';

    // Initialize AI service
    useEffect(() => {
        aiService.setKnowledgeBase(knowledgeBase);
    }, [knowledgeBase]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize speech recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setCurrentTranscript(transcriptText);

                if (event.results[current].isFinal) {
                    handleVoiceInput(transcriptText);
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (event.error !== 'aborted') {
                    setAgentStatus('idle');
                }
            };

            recognitionRef.current.onend = () => {
                if (isActive && isVoiceMode && !isMuted && agentStatus === 'listening') {
                    try {
                        recognitionRef.current?.start();
                    } catch (e) {
                        console.error('Error restarting recognition:', e);
                    }
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [isActive, isVoiceMode, isMuted, agentStatus]);

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

    const speakText = useCallback((text: string): Promise<void> => {
        if (!isSpeakerOn || !isVoiceMode) return Promise.resolve();

        const selectedVoice = (knowledgeBase.selectedVoiceId || 'af_nova') as KokoroVoiceId;

        return ttsService.speak(text, {
            voice: selectedVoice,
            speed: 1.0,
            onStart: () => setAgentStatus('speaking'),
            onEnd: () => {
                setAgentStatus('listening');
                if (!isMuted && recognitionRef.current && isVoiceMode) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        console.error('Error starting recognition:', e);
                    }
                }
            },
            onError: (error) => {
                console.error('TTS error:', error);
                setAgentStatus('listening');
            }
        });
    }, [knowledgeBase.selectedVoiceId, isSpeakerOn, isMuted, isVoiceMode]);

    const handleSendMessage = useCallback(async (text: string, fromVoice = false) => {
        if (!text.trim() || isProcessing) return;

        // Start call if not active
        if (!isActive) {
            aiService.resetState();
            startCall();
        }

        addMessage('user', text);
        setInputMessage('');
        setCurrentTranscript('');
        setIsProcessing(true);
        setProcessingStartTime(Date.now());
        if (fromVoice) setAgentStatus('processing');

        try {
            const response = await aiService.generateResponse(
                text,
                messages,
                extractedFields
            );

            const thinkingTime = processingStartTime ? Math.round((Date.now() - processingStartTime) / 1000) : 0;

            if (response.extractedFields) {
                response.extractedFields.forEach(field => {
                    updateExtractedField(field);
                });
            }

            if (response.suggestedPriority) {
                setCallPriority(response.suggestedPriority);
            }

            if (response.suggestedCategory) {
                setCallCategory(response.suggestedCategory);
            }

            addMessage('agent', response.text);

            // Store reasoning
            if (response.reasoning) {
                const newMessageIndex = messages.length + 1;
                setMessageReasonings(prev => {
                    const newMap = new Map(prev);
                    newMap.set(newMessageIndex, { reasoning: response.reasoning!, thinkingTime });
                    return newMap;
                });
            }

            // Speak in voice mode
            if (isVoiceMode) {
                await speakText(response.text);
            }

        } catch (error) {
            console.error('Error getting AI response:', error);
            addMessage('agent', 'Sorry, I encountered an error. Please try again.');
        } finally {
            setIsProcessing(false);
            setProcessingStartTime(null);
            if (!fromVoice) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    }, [messages, extractedFields, addMessage, updateExtractedField, setCallPriority, setCallCategory, isProcessing, processingStartTime, isActive, startCall, isVoiceMode, speakText]);

    const handleVoiceInput = useCallback((text: string) => {
        handleSendMessage(text, true);
    }, [handleSendMessage]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputMessage);
    }, [inputMessage, handleSendMessage]);

    const startVoiceCall = useCallback(() => {
        if (!isActive) {
            aiService.resetState();
            startCall();
        }
        setIsVoiceMode(true);
        setAgentStatus('listening');
        setMessageReasonings(new Map());
        setExpandedReasonings(new Set());

        if (recognitionRef.current && !isMuted) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error('Error starting recognition:', e);
            }
        }
    }, [isActive, startCall, isMuted]);

    const endVoiceCall = useCallback(async () => {
        ttsService.stop();
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
        setIsVoiceMode(false);
        setAgentStatus('idle');
        setCurrentTranscript('');
        await endCall();
    }, [endCall]);

    const toggleMute = useCallback(() => {
        if (isMuted) {
            if (recognitionRef.current && isVoiceMode) {
                try {
                    recognitionRef.current.start();
                    setAgentStatus('listening');
                } catch (e) {
                    console.error('Error starting recognition:', e);
                }
            }
        } else {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    console.error('Error stopping recognition:', e);
                }
            }
        }
        setIsMuted(!isMuted);
    }, [isMuted, isVoiceMode]);

    // Glassmorphic button base styles
    const glassButtonBase = cn(
        "relative overflow-hidden",
        "backdrop-blur-xl",
        "border border-white/10",
        "transition-all duration-300 ease-out",
        "hover:border-white/20",
        "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent",
        "active:scale-[0.97]"
    );

    return (
        <div className={cn(
            "flex flex-col h-full w-full",
            isDark
                ? "bg-transparent"
                : "bg-white/50 backdrop-blur-sm"
        )}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        {/* Glassmorphic Welcome Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={cn(
                                "relative p-8 rounded-3xl",
                                "backdrop-blur-2xl",
                                isDark
                                    ? "bg-white/[0.03] border border-white/[0.08]"
                                    : "bg-black/[0.02] border border-black/[0.05]",
                                "shadow-2xl"
                            )}
                        >
                            {/* Subtle glow effect */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                            <div className={cn(
                                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto",
                                "backdrop-blur-xl",
                                isDark
                                    ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 shadow-xl shadow-blue-500/10"
                                    : "bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-black/5"
                            )}>
                                <Sparkles className={cn("w-10 h-10", isDark ? "text-blue-400" : "text-blue-600")} />
                            </div>
                            <h3 className={cn(
                                "text-2xl font-semibold mb-3 tracking-tight",
                                isDark ? "text-white" : "text-gray-900"
                            )}>
                                How can I help you today?
                            </h3>
                            <p className={cn(
                                "text-base max-w-sm leading-relaxed",
                                isDark ? "text-white/40" : "text-gray-500"
                            )}>
                                Type a message or start a voice call to begin your conversation
                            </p>
                        </motion.div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((message, index) => {
                            const reasoning = messageReasonings.get(index);
                            const isExpanded = expandedReasonings.has(index);
                            const isUser = message.speaker === 'user';

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn("flex gap-4", isUser ? "justify-end" : "justify-start")}
                                >
                                    {/* AI Avatar - Glassmorphic */}
                                    {!isUser && (
                                        <div className={cn(
                                            "w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1",
                                            "backdrop-blur-xl border",
                                            isDark
                                                ? "bg-blue-500/10 border-blue-500/20 shadow-lg shadow-blue-500/5"
                                                : "bg-blue-100/80 border-blue-200/50"
                                        )}>
                                            <Sparkles className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                                        </div>
                                    )}

                                    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start", "max-w-[85%]")}>
                                        {/* Reasoning Panel - Glassmorphic */}
                                        {!isUser && reasoning && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className={cn(
                                                    "w-full rounded-2xl overflow-hidden mb-1",
                                                    "backdrop-blur-xl",
                                                    isDark
                                                        ? "bg-purple-500/[0.08] border border-purple-500/20"
                                                        : "bg-purple-50/80 border border-purple-200/50"
                                                )}
                                            >
                                                <button
                                                    onClick={() => toggleReasoning(index)}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium",
                                                        "transition-all duration-200",
                                                        isDark
                                                            ? "text-purple-300 hover:bg-purple-500/10"
                                                            : "text-purple-700 hover:bg-purple-100/50"
                                                    )}
                                                >
                                                    <Brain className="w-3.5 h-3.5" />
                                                    <span>Thought for {reasoning.thinkingTime}s</span>
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-3.5 h-3.5 ml-auto" />
                                                    ) : (
                                                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
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
                                                                "px-4 py-3 text-xs whitespace-pre-wrap border-t max-h-60 overflow-y-auto leading-relaxed",
                                                                isDark ? "text-purple-200/70 border-purple-500/20" : "text-purple-700/70 border-purple-200/50"
                                                            )}>
                                                                {reasoning.reasoning}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}

                                        {/* Message Bubble - Glassmorphic */}
                                        <div className={cn(
                                            "rounded-[20px] px-5 py-3",
                                            "backdrop-blur-xl",
                                            isUser
                                                ? "bg-gradient-to-r from-blue-600/90 to-blue-500/90 text-white rounded-br-none border border-blue-400/20 shadow-lg shadow-blue-500/20"
                                                : isDark
                                                    ? "bg-white/[0.05] text-white/90 border border-white/[0.08] rounded-bl-none shadow-xl"
                                                    : "bg-white/80 text-gray-900 shadow-lg border border-gray-100/50 rounded-bl-none"
                                        )}>
                                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                        </div>
                                    </div>

                                    {/* User Avatar - Glassmorphic */}
                                    {isUser && (
                                        <div className={cn(
                                            "w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1",
                                            "bg-gradient-to-br from-blue-500/90 to-purple-500/90",
                                            "border border-white/20 shadow-lg shadow-purple-500/20"
                                        )}>
                                            <span className="text-white text-[10px] font-bold tracking-wider">YOU</span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}

                {/* Processing Indicator - Glassmorphic */}
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                    >
                        <div className={cn(
                            "w-9 h-9 rounded-2xl flex items-center justify-center mt-1",
                            "backdrop-blur-xl border",
                            isDark
                                ? "bg-blue-500/10 border-blue-500/20 shadow-lg shadow-blue-500/5"
                                : "bg-blue-100/80 border-blue-200/50"
                        )}>
                            <Sparkles className={cn("w-5 h-5 animate-pulse", isDark ? "text-blue-400" : "text-blue-600")} />
                        </div>
                        <div className={cn(
                            "px-5 py-4 rounded-[20px] rounded-bl-none",
                            "backdrop-blur-xl",
                            isDark
                                ? "bg-white/[0.05] border border-white/[0.08] shadow-xl"
                                : "bg-white/80 shadow-lg border border-gray-100/50"
                        )}>
                            <div className="flex gap-1.5">
                                <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-white/60" : "bg-gray-400")} style={{ animationDelay: '0ms' }} />
                                <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-white/60" : "bg-gray-400")} style={{ animationDelay: '150ms' }} />
                                <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-white/60" : "bg-gray-400")} style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Current Voice Transcript - Glassmorphic */}
                {currentTranscript && isVoiceMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex gap-4 justify-end"
                        )}
                    >
                        <div className={cn(
                            "rounded-[20px] rounded-br-none px-5 py-3 max-w-[85%]",
                            "backdrop-blur-xl",
                            isDark
                                ? "bg-blue-500/[0.08] text-blue-200 border border-blue-500/20 shadow-lg"
                                : "bg-blue-50/80 text-blue-700 border border-blue-200/50"
                        )}>
                            <p className="text-xs opacity-60 mb-1 uppercase tracking-wider font-semibold">Listening...</p>
                            <p className="text-[15px]">{currentTranscript}</p>
                        </div>
                        <div className={cn(
                            "w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1",
                            "bg-gradient-to-br from-blue-500/90 to-purple-500/90",
                            "border border-white/20 shadow-lg shadow-purple-500/20"
                        )}>
                            <span className="text-white text-[10px] font-bold tracking-wider">YOU</span>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area - Premium Glassmorphic */}
            <div className={cn(
                "p-4 md:p-6 pb-6 md:pb-8",
            )}>
                {/* Glassmorphic Input Container */}
                <div className={cn(
                    "p-2 rounded-[28px]",
                    "backdrop-blur-2xl",
                    isDark
                        ? "bg-white/[0.03] border border-white/[0.08] shadow-2xl"
                        : "bg-black/[0.02] border border-black/[0.05] shadow-xl"
                )}>
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        {/* Voice Controls (shown when in voice mode) - Glassmorphic */}
                        {isVoiceMode && (
                            <>
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    type="button"
                                    onClick={toggleMute}
                                    className={cn(
                                        glassButtonBase,
                                        "p-3.5 rounded-full",
                                        isMuted
                                            ? isDark
                                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 shadow-lg shadow-rose-500/10"
                                                : "bg-rose-100/80 text-rose-600 border-rose-200/50 hover:bg-rose-200/80"
                                            : isDark
                                                ? "bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20 shadow-lg shadow-sky-500/10"
                                                : "bg-sky-100/80 text-sky-600 border-sky-200/50 hover:bg-sky-200/80"
                                    )}
                                >
                                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </motion.button>

                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.05 }}
                                    type="button"
                                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                                    className={cn(
                                        glassButtonBase,
                                        "p-3.5 rounded-full",
                                        isSpeakerOn
                                            ? isDark
                                                ? "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20 shadow-lg shadow-teal-500/10"
                                                : "bg-teal-100/80 text-teal-600 border-teal-200/50 hover:bg-teal-200/80"
                                            : isDark
                                                ? "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20"
                                                : "bg-gray-200/80 text-gray-600 border-gray-300/50 hover:bg-gray-300/80"
                                    )}
                                >
                                    {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                </motion.button>
                            </>
                        )}

                        {/* Text Input - Premium Glass Effect */}
                        <div className="relative flex-1 group">
                            {/* Focus glow effect */}
                            <div className={cn(
                                "absolute -inset-1 rounded-full opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-xl",
                                isDark
                                    ? "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20"
                                    : "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"
                            )} />
                            <div className="relative flex items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder={isVoiceMode ? "Or type a message..." : "Type your message..."}
                                    disabled={isProcessing}
                                    className={cn(
                                        "w-full pl-5 pr-14 py-3.5 rounded-full text-[15px]",
                                        "backdrop-blur-xl",
                                        "border border-transparent",
                                        "transition-all duration-300",
                                        "focus:outline-none focus:ring-0",
                                        isDark
                                            ? "bg-white/[0.05] text-white placeholder-white/30 focus:bg-white/[0.08] focus:border-white/10"
                                            : "bg-black/[0.03] text-gray-900 placeholder-gray-400 focus:bg-black/[0.05] focus:border-black/5",
                                        isProcessing && "opacity-50 cursor-not-allowed"
                                    )}
                                />
                                <button
                                    type="submit"
                                    disabled={isProcessing || !inputMessage.trim()}
                                    className={cn(
                                        "absolute right-1.5 p-2.5 rounded-full",
                                        "transition-all duration-300",
                                        "focus:outline-none focus:ring-2 focus:ring-offset-2",
                                        inputMessage.trim() && !isProcessing
                                            ? cn(
                                                "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
                                                "hover:from-blue-400 hover:to-blue-500",
                                                "shadow-lg shadow-blue-500/30",
                                                "hover:shadow-xl hover:shadow-blue-500/40",
                                                "hover:scale-105 active:scale-95",
                                                "focus:ring-blue-500/50"
                                            )
                                            : isDark
                                                ? "bg-white/[0.05] text-white/20 cursor-not-allowed"
                                                : "bg-black/[0.05] text-gray-300 cursor-not-allowed"
                                    )}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Call Button - Premium Glassmorphic (Dark Teal instead of Green) */}
                        <motion.button
                            type="button"
                            onClick={isVoiceMode ? endVoiceCall : startVoiceCall}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "relative p-3.5 rounded-full overflow-hidden",
                                "transition-all duration-300",
                                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
                                isVoiceMode
                                    ? cn(
                                        "bg-gradient-to-br from-rose-500/90 to-red-600/90",
                                        "border border-rose-400/30",
                                        "shadow-lg shadow-rose-500/30",
                                        "hover:shadow-xl hover:shadow-rose-500/40",
                                        "focus:ring-rose-500/50",
                                        "text-white"
                                    )
                                    : isDark
                                        ? cn(
                                            // Dark emerald/teal gradient - sophisticated, not cartoonish
                                            "bg-gradient-to-br from-emerald-600/90 to-teal-700/90",
                                            "border border-emerald-400/20",
                                            "shadow-lg shadow-emerald-500/20",
                                            "hover:shadow-xl hover:shadow-emerald-500/30",
                                            "hover:from-emerald-500/90 hover:to-teal-600/90",
                                            "focus:ring-emerald-500/50",
                                            "text-white"
                                        )
                                        : cn(
                                            "bg-gradient-to-br from-emerald-500/90 to-teal-600/90",
                                            "border border-emerald-400/30",
                                            "shadow-lg shadow-emerald-500/30",
                                            "hover:shadow-xl hover:shadow-emerald-500/40",
                                            "focus:ring-emerald-500/50",
                                            "text-white"
                                        )
                            )}
                        >
                            {/* Subtle inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
                            {isVoiceMode ? (
                                <PhoneOff className="w-5 h-5 relative z-10" />
                            ) : (
                                <Phone className="w-5 h-5 relative z-10" />
                            )}
                        </motion.button>
                    </form>
                </div>
            </div>
        </div>
    );
}
