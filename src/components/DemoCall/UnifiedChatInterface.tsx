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
    const [callDuration, setCallDuration] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Call timer
    useEffect(() => {
        if (isVoiceMode && isActive) {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            if (!isVoiceMode) setCallDuration(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isVoiceMode, isActive]);

    // Initialize speech recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setCurrentTranscript(transcriptText);

                if (event.results[current].isFinal) {
                    handleVoiceInput(transcriptText);
                }
            };

            recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
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

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
        setCallDuration(0);
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
            "flex flex-col h-[600px] md:h-[700px] rounded-2xl overflow-hidden",
            isDark
                ? "bg-gradient-to-b from-[#1a1a2e] to-[#16162a] border border-white/10"
                : "bg-white border border-gray-200 shadow-xl"
        )}>
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between px-4 py-3 border-b",
                isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isDark
                            ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30"
                            : "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                    )}>
                        <Sparkles className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                    </div>
                    <div>
                        <h2 className={cn(
                            "font-semibold",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            ClerkTree AI
                        </h2>
                        <p className={cn(
                            "text-xs",
                            isDark ? "text-white/50" : "text-gray-500"
                        )}>
                            {isVoiceMode
                                ? `Voice call • ${formatDuration(callDuration)}`
                                : isActive ? 'Active conversation' : 'Ready to help'}
                        </p>
                    </div>
                </div>

                {/* Voice Call Active Indicator */}
                {isVoiceMode && (
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5",
                            agentStatus === 'speaking' && "bg-blue-500/20 text-blue-400",
                            agentStatus === 'listening' && "bg-green-500/20 text-green-400",
                            agentStatus === 'processing' && "bg-yellow-500/20 text-yellow-400",
                            agentStatus === 'idle' && (isDark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-600"),
                        )}>
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                agentStatus === 'speaking' && "bg-blue-400 animate-pulse",
                                agentStatus === 'listening' && "bg-green-400 animate-pulse",
                                agentStatus === 'processing' && "bg-yellow-400 animate-pulse",
                            )} />
                            {agentStatus}
                        </span>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                            isDark
                                ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                                : "bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                        )}>
                            <Sparkles className={cn("w-8 h-8", isDark ? "text-blue-400" : "text-blue-600")} />
                        </div>
                        <h3 className={cn(
                            "text-lg font-semibold mb-2",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            How can I help you today?
                        </h3>
                        <p className={cn(
                            "text-sm max-w-sm",
                            isDark ? "text-white/50" : "text-gray-500"
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
                                    className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
                                >
                                    {/* AI Avatar */}
                                    {!isUser && (
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                            isDark ? "bg-blue-500/20" : "bg-blue-100"
                                        )}>
                                            <Sparkles className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-600")} />
                                        </div>
                                    )}

                                    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start", "max-w-[80%]")}>
                                        {/* Reasoning Panel */}
                                        {!isUser && reasoning && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className={cn(
                                                    "w-full rounded-lg overflow-hidden",
                                                    isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200"
                                                )}
                                            >
                                                <button
                                                    onClick={() => toggleReasoning(index)}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors",
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
                                                                "px-3 py-2 text-xs whitespace-pre-wrap border-t max-h-40 overflow-y-auto",
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
                                            "rounded-2xl px-4 py-2.5",
                                            isUser
                                                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                                                : isDark
                                                    ? "bg-white/10 text-white border border-white/10"
                                                    : "bg-gray-100 text-gray-900"
                                        )}>
                                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                        </div>
                                    </div>

                                    {/* User Avatar */}
                                    {isUser && (
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                            "bg-gradient-to-br from-blue-500 to-purple-500"
                                        )}>
                                            <span className="text-white text-xs font-medium">You</span>
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
                        className="flex gap-3"
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            isDark ? "bg-blue-500/20" : "bg-blue-100"
                        )}>
                            <Sparkles className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-600")} />
                        </div>
                        <div className={cn(
                            "px-4 py-2.5 rounded-2xl",
                            isDark ? "bg-white/10 border border-white/10" : "bg-gray-100"
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
                            "flex gap-3 justify-end"
                        )}
                    >
                        <div className={cn(
                            "rounded-2xl px-4 py-2.5 max-w-[80%]",
                            isDark ? "bg-blue-500/20 text-blue-200 border border-blue-500/30" : "bg-blue-50 text-blue-700 border border-blue-200"
                        )}>
                            <p className="text-xs opacity-60 mb-1">Listening...</p>
                            <p className="text-sm">{currentTranscript}</p>
                        </div>
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            "bg-gradient-to-br from-blue-500 to-purple-500"
                        )}>
                            <span className="text-white text-xs font-medium">You</span>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={cn(
                "p-4 border-t",
                isDark ? "border-white/10 bg-black/20" : "border-gray-100 bg-gray-50"
            )}>
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    {/* Voice Controls (shown when in voice mode) */}
                    {isVoiceMode && (
                        <>
                            <button
                                type="button"
                                onClick={toggleMute}
                                className={cn(
                                    "p-3 rounded-xl transition-all",
                                    isMuted
                                        ? isDark
                                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                            : "bg-red-100 text-red-600 hover:bg-red-200"
                                        : isDark
                                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                )}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                                className={cn(
                                    "p-3 rounded-xl transition-all",
                                    isSpeakerOn
                                        ? isDark
                                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                            : "bg-green-100 text-green-600 hover:bg-green-200"
                                        : isDark
                                            ? "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                )}
                            >
                                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </button>
                        </>
                    )}

                    {/* Text Input */}
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={isVoiceMode ? "Or type a message..." : "Type your message..."}
                            disabled={isProcessing}
                            className={cn(
                                "w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 transition-all",
                                isDark
                                    ? "bg-white/5 border-white/10 text-white placeholder-white/40 focus:ring-blue-500/50 focus:border-blue-500/50"
                                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500",
                                isProcessing && "opacity-50 cursor-not-allowed"
                            )}
                        />
                        <button
                            type="submit"
                            disabled={isProcessing || !inputMessage.trim()}
                            className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all",
                                inputMessage.trim() && !isProcessing
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : isDark
                                        ? "bg-white/10 text-white/30"
                                        : "bg-gray-100 text-gray-400"
                            )}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Call Button */}
                    <button
                        type="button"
                        onClick={isVoiceMode ? endVoiceCall : startVoiceCall}
                        className={cn(
                            "p-3 rounded-xl transition-all flex items-center gap-2",
                            isVoiceMode
                                ? isDark
                                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                                    : "bg-red-100 text-red-600 hover:bg-red-200 border border-red-200"
                                : isDark
                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                                    : "bg-green-100 text-green-600 hover:bg-green-200 border border-green-200"
                        )}
                    >
                        {isVoiceMode ? (
                            <>
                                <PhoneOff className="w-5 h-5" />
                                <span className="hidden sm:inline text-sm font-medium">End Call</span>
                            </>
                        ) : (
                            <>
                                <Phone className="w-5 h-5" />
                                <span className="hidden sm:inline text-sm font-medium">Call</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
