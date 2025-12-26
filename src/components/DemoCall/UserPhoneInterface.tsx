import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { aiService } from '../../services/aiService';
import { ttsService, KokoroVoiceId } from '../../services/ttsService';

interface UserPhoneInterfaceProps {
    isDark?: boolean;
    onTranscript?: (text: string, speaker: 'user' | 'agent') => void;
    compact?: boolean;
    mode?: 'standalone' | 'overlay';
}

// Speech Recognition types - use any to avoid conflicts with other declarations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

interface SpeechRecognitionEvent {
    resultIndex: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results: any;
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

export default function UserPhoneInterface({
    isDark = true,
    onTranscript,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    compact = false,
    mode = 'standalone'
}: UserPhoneInterfaceProps) {
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

    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [lastAgentMessage, setLastAgentMessage] = useState('');
    const [agentStatus, setAgentStatus] = useState<'idle' | 'speaking' | 'listening' | 'processing'>('idle');
    const [language, setLanguage] = useState<'en-US' | 'hi-IN'>('en-US');
    const [isMinimized, setIsMinimized] = useState(false);

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const messages = currentCall?.messages || [];
    const extractedFields = currentCall?.extractedFields || [];

    // Initialize AI service with knowledge base
    useEffect(() => {
        aiService.setKnowledgeBase(knowledgeBase);
    }, [knowledgeBase]);

    // Timer for call duration
    useEffect(() => {
        if (currentCall?.status === 'active') {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setCallDuration(0);
            setLastAgentMessage('');
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [currentCall?.status]);

    // Initialize speech recognition
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = language;

            recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setCurrentTranscript(transcriptText);

                if (event.results[current].isFinal) {
                    handleUserInput(transcriptText);
                }
            };

            recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error);
                if (event.error !== 'aborted') {
                    setAgentStatus('idle');
                }
            };

            recognitionRef.current.onend = () => {
                // Restart if still in call and not muted
                if (currentCall?.status === 'active' && !isMuted && agentStatus === 'listening') {
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
    }, [language]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const speakText = useCallback((text: string) => {
        if (!isSpeakerOn) return Promise.resolve();

        // Get the selected voice from knowledge base
        const selectedVoice = (knowledgeBase.selectedVoiceId || 'af_nova') as KokoroVoiceId;

        return ttsService.speak(text, {
            voice: selectedVoice,
            speed: 1.0,
            onStart: () => setAgentStatus('speaking'),
            onEnd: () => {
                setAgentStatus('listening');
                // Start listening after speaking
                if (!isMuted && recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        console.error('Error starting recognition after speech:', e);
                    }
                }
            },
            onError: (error) => {
                console.error('TTS error:', error);
                setAgentStatus('listening');
            }
        });
    }, [knowledgeBase.selectedVoiceId, isSpeakerOn, isMuted]);

    const handleUserInput = useCallback(async (text: string) => {
        if (!text.trim()) return;

        addMessage('user', text);
        onTranscript?.(text, 'user');
        setCurrentTranscript('');
        setAgentStatus('processing');

        // Stop recognition while processing
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error('Error stopping recognition:', e);
            }
        }

        // Use AI service to generate response
        const response = await aiService.generateResponse(
            text,
            messages,
            extractedFields
        );

        // Update extracted fields
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

        addMessage('agent', response.text);
        setLastAgentMessage(response.text);
        onTranscript?.(response.text, 'agent');
        await speakText(response.text);
    }, [addMessage, onTranscript, messages, extractedFields, updateExtractedField, setCallPriority, setCallCategory, speakText]);

    const handleStartCall = useCallback(async () => {
        // Reset AI conversation state for new call
        aiService.resetState();

        startCall('voice');
        setAgentStatus('listening');
        // Don't send automatic greeting - wait for user to speak first, then AI responds
    }, [startCall]);

    const handleEndCall = useCallback(async () => {
        ttsService.stop();
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
        setAgentStatus('idle');
        // Wait for AI summary to be generated before ending
        await endCall();
        setCurrentTranscript('');
        setLastAgentMessage('');
    }, [endCall]);

    const toggleMute = useCallback(() => {
        if (isMuted) {
            // Unmute - start listening
            if (recognitionRef.current && currentCall?.status === 'active') {
                try {
                    recognitionRef.current.start();
                    setAgentStatus('listening');
                } catch (e) {
                    console.error('Error starting recognition:', e);
                }
            }
        } else {
            // Mute - stop listening
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    console.error('Error stopping recognition:', e);
                }
            }
        }
        setIsMuted(!isMuted);
    }, [isMuted, currentCall?.status]);

    const isActive = currentCall?.status === 'active';

    // If call is active but minimized, show compact bar
    if (isActive && isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl shadow-lg backdrop-blur-md border",
                        isDark
                            ? "bg-black/80 border-white/10"
                            : "bg-white/80 border-black/10"
                    )}
                >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                        <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>
                            Call in Progress
                        </p>
                        <p className={cn("text-xs opacity-60", isDark ? "text-white" : "text-black")}>
                            {formatDuration(callDuration)}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsMinimized(false)}
                        className={cn(
                            "p-2 rounded-full transition-colors",
                            isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                        )}
                    >
                        <Maximize2 className={cn("w-5 h-5", isDark ? "text-white" : "text-black")} />
                    </button>
                    <button
                        onClick={handleEndCall}
                        className="p-2 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                    >
                        <PhoneOff className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        );
    }

    // Full Screen Phone UI
    if (isActive) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-lg"
                />

                {/* Phone Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={cn(
                        "relative w-full max-w-sm aspect-[9/16] max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border",
                        isDark
                            ? "bg-gradient-to-br from-gray-900 to-black border-white/10"
                            : "bg-gradient-to-br from-white to-gray-100 border-black/10"
                    )}
                >
                    {/* Header Actions */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <button
                            onClick={() => setIsMinimized(true)}
                            className={cn(
                                "p-2 rounded-full transition-colors backdrop-blur-md",
                                isDark ? "bg-black/20 text-white hover:bg-black/40" : "bg-white/20 text-black hover:bg-white/40"
                            )}
                        >
                            <Minimize2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col items-center justify-center relative p-6">
                        {/* Animated Glow Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className={cn(
                                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] transition-all duration-1000",
                                agentStatus === 'speaking' ? "bg-blue-500/30 scale-150" :
                                    agentStatus === 'listening' ? "bg-green-500/20 scale-110" :
                                        "bg-purple-500/10 scale-100"
                            )} />
                        </div>

                        {/* Avatar / Visualizer */}
                        <div className="relative mb-8">
                            <motion.div
                                animate={{
                                    scale: agentStatus === 'speaking' ? [1, 1.1, 1] : 1,
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className={cn(
                                    "w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 relative z-10",
                                    isDark
                                        ? "bg-gray-800 border-gray-700 text-white"
                                        : "bg-white border-gray-100 text-gray-800"
                                )}
                            >
                                <span className="font-bold">AI</span>
                            </motion.div>

                            {/* Status Ring */}
                            {/* Status Ring / Ripple Animation for Listening */}
                            {agentStatus === 'listening' && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 1 }}
                                        animate={{ opacity: [0, 0.5, 0], scale: [1, 1.4, 1.4] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                        className="absolute inset-0 rounded-full border-2 border-green-500/50"
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 1 }}
                                        animate={{ opacity: [0, 0.5, 0], scale: [1, 1.4, 1.4] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
                                        className="absolute inset-0 rounded-full border-2 border-green-500/30"
                                    />
                                </>
                            )}

                            {/* Spinning Ring for Speaking/Processing */}
                            <div className={cn(
                                "absolute -inset-4 rounded-full border-2",
                                agentStatus === 'speaking' ? "animate-[spin_4s_linear_infinite] border-t-blue-500/50 border-r-transparent border-b-blue-500/50 border-l-transparent" :
                                    agentStatus === 'processing' ? "animate-[spin_2s_linear_infinite] border-t-yellow-500/50 border-r-transparent border-b-yellow-500/50 border-l-transparent" :
                                        agentStatus === 'listening' ? "border-green-500/20" : // Static base ring for listening
                                            "border-transparent"
                            )} />
                        </div>

                        {/* Call Status & Duration */}
                        <div className="text-center space-y-2 mb-8 relative z-10">
                            <h2 className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-black")}>
                                Alice (AI Agent)
                            </h2>
                            <p className={cn("font-mono text-sm opacity-60", isDark ? "text-white" : "text-black")}>
                                {formatDuration(callDuration)} • {agentStatus}
                            </p>
                        </div>

                        {/* Unified Caption Box */}
                        <div className="w-full px-4 mb-4 relative z-10">
                            <AnimatePresence mode="wait">
                                {(currentTranscript || lastAgentMessage) && (
                                    <motion.div
                                        key={currentTranscript ? 'user' : 'agent'}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className={cn(
                                            "p-4 rounded-2xl backdrop-blur-xl border shadow-lg min-h-[80px] flex items-center justify-center text-center",
                                            isDark
                                                ? "bg-white/10 border-white/10 text-white"
                                                : "bg-black/5 border-black/5 text-black"
                                        )}
                                    >
                                        <div>
                                            {currentTranscript ? (
                                                <>
                                                    <p className="text-xs uppercase tracking-wider font-bold opacity-50 mb-1 text-green-400">You</p>
                                                    <p className="text-lg font-medium leading-relaxed">"{currentTranscript}"</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-xs uppercase tracking-wider font-bold opacity-50 mb-1 text-blue-400">Alice</p>
                                                    <p className="text-lg font-medium leading-relaxed">{lastAgentMessage}</p>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className={cn(
                        "p-8 pb-12 flex justify-between items-center relative z-20",
                        isDark ? "bg-black/20" : "bg-white/50"
                    )}>
                        {/* Language Toggle or Keypad (Secondary) */}
                        <button
                            onClick={() => setLanguage(prev => prev === 'en-US' ? 'hi-IN' : 'en-US')}
                            className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                                isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-black shadow-sm hover:bg-gray-50"
                            )}
                        >
                            <span className="text-sm font-bold">{language === 'en-US' ? 'EN' : 'HI'}</span>
                        </button>

                        {/* Mute Toggle */}
                        <button
                            onClick={toggleMute}
                            className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                                isMuted
                                    ? "bg-white text-black shadow-lg"
                                    : isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-black shadow-sm hover:bg-gray-50"
                            )}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>

                        {/* Speaker Toggle */}
                        <button
                            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                            className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                                !isSpeakerOn
                                    ? "bg-white text-black shadow-lg"
                                    : isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-black shadow-sm hover:bg-gray-50"
                            )}
                        >
                            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                        </button>

                    </div>

                    {/* End Call Button - Floating above controls or integrated */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                        <button
                            onClick={handleEndCall}
                            className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-red-500/30 shadow-xl hover:scale-105 transition-transform"
                        >
                            <PhoneOff className="w-8 h-8" />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Idle Card State (Initial View)
    if (mode === 'overlay') return null;

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-4 md:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden transition-all duration-500",
            isDark
                ? "bg-black/20 border border-white/10 backdrop-blur-md"
                : "bg-white/80 border border-black/10 backdrop-blur-md"
        )}>
            {/* Background gradients */}
            <div className="absolute top-0 right-0 w-40 md:w-64 h-40 md:h-64 bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 md:w-64 h-40 md:h-64 bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

            {/* Start Call Button (Large) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartCall}
                className={cn(
                    "w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-6 shadow-xl relative group",
                    isDark ? "bg-green-500 shadow-green-500/20" : "bg-green-500 shadow-green-500/20"
                )}
            >
                <Phone className="w-10 h-10 md:w-12 md:h-12 text-white fill-current" />
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-20" />
            </motion.button>

            <div className="text-center">
                <h2 className={cn(
                    "text-xl md:text-2xl font-semibold mb-2",
                    isDark ? "text-white" : "text-black"
                )}>
                    Start AI Voice Call
                </h2>
                <p className={cn(
                    "text-sm max-w-xs mx-auto",
                    isDark ? "text-white/60" : "text-black/60"
                )}>
                    Experience real-time conversation with our advanced AI agent.
                </p>
            </div>
        </div>
    );
}
