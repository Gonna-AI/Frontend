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

    return (
        <div className={cn(
            "flex flex-col h-full w-full",
            isDark
                ? "bg-transparent"
                : "bg-white"
        )}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className={cn(
                            "w-20 h-20 rounded-3xl flex items-center justify-center mb-6",
                            isDark
                                ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg shadow-blue-500/5"
                                : "bg-gradient-to-br from-blue-500/10 to-purple-500/10"
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
                                    {/* AI Avatar */}
                                    {!isUser && (
                                        <div className={cn(
                                            "w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1",
                                            isDark ? "bg-blue-500/20" : "bg-blue-100"
                                        )}>
                                            <Sparkles className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                                        </div>
                                    )}

                                    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start", "max-w-[85%]")}>
                                        {/* Reasoning Panel */}
                                        {!isUser && reasoning && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className={cn(
                                                    "w-full rounded-2xl overflow-hidden mb-1",
                                                    isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200"
                                                )}
                                            >
                                                <button
                                                    onClick={() => toggleReasoning(index)}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors",
                                                        isDark ? "text-purple-300 hover:bg-purple-500/20" : "text-purple-700 hover:bg-purple-100"
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
                                                                isDark ? "text-purple-200/70 border-purple-500/20" : "text-purple-700/70 border-purple-200"
                                                            )}>
                                                                {reasoning.reasoning}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}

                                        {/* Message Bubble */}
                                        <div className={cn(
                                            "rounded-[20px] px-5 py-3 shadow-sm",
                                            isUser
                                                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none"
                                                : isDark
                                                    ? "bg-[#1E1E2E] text-white/90 border border-white/5 rounded-bl-none"
                                                    : "bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-none"
                                        )}>
                                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                        </div>
                                    </div>

                                    {/* User Avatar */}
                                    {isUser && (
                                        <div className={cn(
                                            "w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1",
                                            "bg-gradient-to-br from-blue-500 to-purple-500"
                                        )}>
                                            <span className="text-white text-[10px] font-bold tracking-wider">YOU</span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                    >
                        <div className={cn(
                            "w-9 h-9 rounded-2xl flex items-center justify-center mt-1",
                            isDark ? "bg-blue-500/20" : "bg-blue-100"
                        )}>
                            <Sparkles className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                        </div>
                        <div className={cn(
                            "px-5 py-4 rounded-[20px] rounded-bl-none",
                            isDark ? "bg-[#1E1E2E] border border-white/5" : "bg-white shadow-sm border border-gray-100"
                        )}>
                            <div className="flex gap-1.5">
                                <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-white/60" : "bg-gray-400")} style={{ animationDelay: '0ms' }} />
                                <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-white/60" : "bg-gray-400")} style={{ animationDelay: '150ms' }} />
                                <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-white/60" : "bg-gray-400")} style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Current Voice Transcript */}
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
                            isDark ? "bg-blue-500/10 text-blue-200 border border-blue-500/20" : "bg-blue-50 text-blue-700 border border-blue-200"
                        )}>
                            <p className="text-xs opacity-60 mb-1 uppercase tracking-wider font-semibold">Listening...</p>
                            <p className="text-[15px]">{currentTranscript}</p>
                        </div>
                        <div className={cn(
                            "w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1",
                            "bg-gradient-to-br from-blue-500 to-purple-500"
                        )}>
                            <span className="text-white text-[10px] font-bold tracking-wider">YOU</span>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className={cn(
                "p-4 md:p-6 pb-6 md:pb-8", // Removed border-t
            )}>
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    {/* Voice Controls (shown when in voice mode) */}
                    {isVoiceMode && (
                        <>
                            <button
                                type="button"
                                onClick={toggleMute}
                                className={cn(
                                    "p-4 rounded-full transition-all hover:scale-105 active:scale-95",
                                    isMuted
                                        ? isDark
                                            ? "bg-red-500/20 text-red-400 shadow-lg shadow-red-500/10"
                                            : "bg-red-100 text-red-600 shadow-sm"
                                        : isDark
                                            ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10"
                                            : "bg-blue-100 text-blue-600 shadow-sm"
                                )}
                            >
                                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                                className={cn(
                                    "p-4 rounded-full transition-all hover:scale-105 active:scale-95",
                                    isSpeakerOn
                                        ? isDark
                                            ? "bg-green-500/20 text-green-400 shadow-lg shadow-green-500/10"
                                            : "bg-green-100 text-green-600 shadow-sm"
                                        : isDark
                                            ? "bg-gray-500/20 text-gray-400"
                                            : "bg-gray-200 text-gray-600"
                                )}
                            >
                                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                            </button>
                        </>
                    )}

                    {/* Text Input */}
                    <div className="relative flex-1 group">
                        <div className={cn(
                            "absolute -inset-0.5 rounded-full opacity-0 group-focus-within:opacity-100 transition duration-500 blur-md",
                            isDark ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30" : "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                        )} />
                        <div className="relative flex items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={isVoiceMode ? "Or type a message to respond..." : "Type your message..."}
                                disabled={isProcessing}
                                className={cn(
                                    "w-full pl-6 pr-14 py-4 rounded-full border-none focus:outline-none focus:ring-0 transition-all shadow-lg text-[15px]",
                                    isDark
                                        ? "bg-[#1E1E2E] text-white placeholder-white/40"
                                        : "bg-white text-gray-900 placeholder-gray-400 shadow-gray-200/50",
                                    isProcessing && "opacity-50 cursor-not-allowed"
                                )}
                            />
                            <button
                                type="submit"
                                disabled={isProcessing || !inputMessage.trim()}
                                className={cn(
                                    "absolute right-2 p-2.5 rounded-full transition-all hover:scale-105 active:scale-95",
                                    inputMessage.trim() && !isProcessing
                                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                        : isDark
                                            ? "bg-white/5 text-white/20"
                                            : "bg-gray-100 text-gray-300"
                                )}
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </button>
                        </div>
                    </div>

                    {/* Call Button */}
                    <button
                        type="button"
                        onClick={isVoiceMode ? endVoiceCall : startVoiceCall}
                        className={cn(
                            "p-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg",
                            isVoiceMode
                                ? isDark
                                    ? "bg-red-500 text-white shadow-red-500/20"
                                    : "bg-red-500 text-white shadow-red-500/30"
                                : isDark
                                    ? "bg-green-500 text-white shadow-green-500/20"
                                    : "bg-green-600 text-white shadow-green-600/30"
                        )}
                    >
                        {isVoiceMode ? (
                            <PhoneOff className="w-6 h-6" />
                        ) : (
                            <Phone className="w-6 h-6" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
