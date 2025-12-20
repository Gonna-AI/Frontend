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
    User
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

// Company Logo component for AI avatar
const ClerkTreeLogo = ({ className, isDark = true }: { className?: string; isDark?: boolean }) => (
    <svg viewBox="0 0 464 468" className={className}>
        <path
            fill={isDark ? "currentColor" : "currentColor"}
            d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
        />
    </svg>
);

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
    const pendingMessageRef = useRef<string | null>(null);

    const messages = currentCall?.messages || [];
    const extractedFields = currentCall?.extractedFields || [];
    const isActive = currentCall?.status === 'active';

    // Handle pending message when call becomes active
    useEffect(() => {
        if (isActive && pendingMessageRef.current) {
            addMessage('user', pendingMessageRef.current);
            pendingMessageRef.current = null;
        }
    }, [isActive, addMessage]);

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

        // Start call if not active - store message as pending
        if (!isActive) {
            aiService.resetState();
            pendingMessageRef.current = text;
            startCall();
            // The useEffect will add the message when call becomes active
        } else {
            // Call is already active, add message directly
            addMessage('user', text);
        }

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
                                <ClerkTreeLogo className={cn("w-10 h-10", isDark ? "text-blue-400" : "text-blue-600")} isDark={isDark} />
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
                                            <ClerkTreeLogo className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} isDark={isDark} />
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

                                    {/* User Avatar - Simple */}
                                    {isUser && (
                                        <div className={cn(
                                            "w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1",
                                            "backdrop-blur-xl border",
                                            isDark
                                                ? "bg-white/[0.08] border-white/10"
                                                : "bg-gray-100 border-gray-200/50"
                                        )}>
                                            <User className={cn("w-4.5 h-4.5", isDark ? "text-white/70" : "text-gray-600")} />
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
                            <ClerkTreeLogo className={cn("w-5 h-5 animate-pulse", isDark ? "text-blue-400" : "text-blue-600")} isDark={isDark} />
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
                            "backdrop-blur-xl border",
                            isDark
                                ? "bg-white/[0.08] border-white/10"
                                : "bg-gray-100 border-gray-200/50"
                        )}>
                            <User className={cn("w-4.5 h-4.5", isDark ? "text-white/70" : "text-gray-600")} />
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area - Premium Glassmorphic */}
            <div className={cn(
                "p-4 md:p-6 pb-6 md:pb-8",
            )}>
                {/* Glassmorphic Input Container - symmetrical corners with inner input */}
                <div className={cn(
                    "p-2 rounded-3xl",
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

                        {/* Text Input - Precision Glass Effect */}
                        <div className="relative flex-1">
                            <div className="relative flex items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder={isVoiceMode ? "Or type a message..." : "Type your message..."}
                                    disabled={isProcessing}
                                    className={cn(
                                        "w-full pl-5 pr-14 py-3.5 rounded-[20px] text-[15px]",
                                        "backdrop-blur-xl",
                                        "transition-all duration-300 ease-out",
                                        "focus:outline-none",
                                        isDark
                                            ? [
                                                "bg-white/[0.04] text-white placeholder-white/30",
                                                "border border-white/[0.06]",
                                                // Inner glow border effect on focus - not a fill
                                                "focus:border-white/20",
                                                "focus:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_0_20px_rgba(59,130,246,0.1)]"
                                            ]
                                            : [
                                                "bg-black/[0.02] text-gray-900 placeholder-gray-400",
                                                "border border-black/[0.04]",
                                                "focus:border-black/10",
                                                "focus:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05),0_0_20px_rgba(59,130,246,0.05)]"
                                            ],
                                        isProcessing && "opacity-50 cursor-not-allowed"
                                    )}
                                />
                                <button
                                    type="submit"
                                    disabled={isProcessing || !inputMessage.trim()}
                                    className={cn(
                                        "absolute right-1.5 p-2.5 rounded-[14px]",
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
