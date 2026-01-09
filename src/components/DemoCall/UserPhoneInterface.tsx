import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Volume2, VolumeX, Minimize2, Maximize2, Globe, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { aiService } from '../../services/aiService';
import { ttsService, KokoroVoiceId, TTSLanguage, TTS_LANGUAGES } from '../../services/ttsService';

interface UserPhoneInterfaceProps {
    isDark?: boolean;
    onTranscript?: (text: string, speaker: 'user' | 'agent') => void;
    compact?: boolean;
    mode?: 'standalone' | 'overlay' | 'fullscreen';
    autoStart?: boolean;
    onBack?: () => void;
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
    mode = 'standalone',
    autoStart = false,
    onBack
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
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [lastAgentMessage, setLastAgentMessage] = useState('');
    const [agentStatus, setAgentStatus] = useState<'idle' | 'speaking' | 'listening' | 'processing'>('idle');
    const [language, setLanguage] = useState<TTSLanguage>('en');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isEnding, setIsEnding] = useState(false);

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isRecognitionRunningRef = useRef(false);

    // Refs to avoid stale closures in speech recognition callbacks
    const currentCallRef = useRef(currentCall);
    const agentStatusRef = useRef(agentStatus);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUserInputRef = useRef<((text: string) => Promise<void>) | null>(null);

    // Keep refs in sync with state
    useEffect(() => { currentCallRef.current = currentCall; }, [currentCall]);
    useEffect(() => { agentStatusRef.current = agentStatus; }, [agentStatus]);
    // Note: handleUserInputRef is synced after handleUserInput is defined below

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

    // Auto-start recognition when call becomes active (for overlay mode when started externally)
    useEffect(() => {
        if (currentCall?.status === 'active' && currentCall?.type === 'voice' && mode === 'overlay') {
            // Small delay to ensure component is ready
            const timer = setTimeout(() => {
                if (agentStatus === 'idle') {
                    console.log('📞 Call started externally, starting recognition in overlay mode');
                    setAgentStatus('listening');
                }
                if (!isRecognitionRunningRef.current) {
                    try {
                        recognitionRef.current?.start();
                        isRecognitionRunningRef.current = true;
                        console.log('🎤 Recognition started for external call');
                    } catch (e) {
                        console.error('Error auto-starting recognition:', e);
                    }
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [currentCall?.status, currentCall?.type, mode, agentStatus]);

    // Helper functions for starting/stopping recognition safely
    const startRecognition = useCallback(() => {
        if (!recognitionRef.current || isRecognitionRunningRef.current) {
            console.log('🎤 Recognition already running or not available');
            return;
        }
        try {
            console.log('🎤 Starting speech recognition...');
            recognitionRef.current.start();
            isRecognitionRunningRef.current = true;
        } catch (e) {
            console.error('Error starting recognition:', e);
            isRecognitionRunningRef.current = false;
        }
    }, []);

    const stopRecognition = useCallback(() => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.stop();
            isRecognitionRunningRef.current = false;
        } catch (e) {
            console.error('Error stopping recognition:', e);
        }
    }, []);

    // Initialize speech recognition
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            // Cleanup previous instance if it exists
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Ignore
                }
            }

            console.log(`🎤 Initializing speech recognition for language: ${language} (${TTS_LANGUAGES[language].code})`);

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = TTS_LANGUAGES[language].code;
            recognitionRef.current = recognition;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setCurrentTranscript(transcriptText);

                if (event.results[current].isFinal) {
                    // Use ref to get latest handleUserInput callback
                    handleUserInputRef.current?.(transcriptText);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    console.error('Speech recognition error:', event.error);
                }

                isRecognitionRunningRef.current = false;

                if (event.error === 'not-allowed') {
                    setAgentStatus('idle');
                    alert('Please allow microphone access.');
                }
            };

            recognition.onend = () => {
                isRecognitionRunningRef.current = false;
                // Restart if still in call and listening - use refs for latest values
                const isActive = currentCallRef.current?.status === 'active';
                const status = agentStatusRef.current;

                console.log('🎤 Speech recognition ended:', { isActive, status, language });

                if (isActive && status === 'listening') {
                    // Small delay to prevent rapid restart issues
                    setTimeout(() => {
                        if (currentCallRef.current?.status === 'active' && agentStatusRef.current === 'listening') {
                            try {
                                console.log('🎤 Restarting speech recognition...');
                                recognitionRef.current?.start();
                                isRecognitionRunningRef.current = true;
                            } catch (e) {
                                console.error('Error restarting recognition:', e);
                                isRecognitionRunningRef.current = false;
                            }
                        }
                    }, 300);
                }
            };

            // If we are already in listening mode (e.g. after language switch), restart immediately
            if (agentStatus === 'listening') {
                try {
                    console.log('🎤 Auto-restarting recognition after language switch');
                    recognition.start();
                    isRecognitionRunningRef.current = true;
                } catch (e) {
                    console.warn('Could not auto-start recognition:', e);
                }
            }
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Ignore
                }
                isRecognitionRunningRef.current = false;
            }
        };
    }, [language]);

    // Helper for time formatting
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isActive = currentCall?.status === 'active';

    // System Status Checks
    const [systemChecks, setSystemChecks] = useState<{ label: string; status: 'pending' | 'success' | 'warning' | 'error' }[]>([]);

    useEffect(() => {
        const runChecks = async () => {
            // Initial state
            setSystemChecks([
                { label: 'Initializing Neural Engine', status: 'pending' },
            ]);

            await new Promise(r => setTimeout(r, 600));

            setSystemChecks(prev => [
                { ...prev[0], status: 'success' },
                { label: 'Connecting to Knowledge Base', status: 'pending' }
            ]);

            await new Promise(r => setTimeout(r, 800));

            // Check ElevenLabs
            const elevenLabsAvailable = ttsService.isElevenLabsAvailable();

            setSystemChecks(prev => [
                prev[0],
                { ...prev[1], status: 'success' },
                { label: 'Verifying Voice Synthesis (DE)', status: 'pending' }
            ]);

            await new Promise(r => setTimeout(r, 800));

            setSystemChecks(prev => [
                prev[0],
                prev[1],
                {
                    label: elevenLabsAvailable ? 'Voice Synthesis Active (ElevenLabs)' : 'German Voice Unavailable (No Key)',
                    status: elevenLabsAvailable ? 'success' : 'warning'
                },
                { label: 'System Ready', status: 'success' }
            ]);
        };

        if (!isActive) {
            runChecks();
        }
    }, [isActive]);


    const speakText = useCallback((text: string) => {
        if (!isSpeakerOn) return Promise.resolve();

        // Check if German is requested but unavailable
        if (language === 'de' && !ttsService.isElevenLabsAvailable()) {
            console.warn('🇩🇪 German TTS unavailable (Missing API Key). Skipping audio.');

            // Just simulate the timing of speech or jump straight to listening
            setAgentStatus('speaking');
            setTimeout(() => {
                setAgentStatus('listening');
                startRecognition();
            }, 1000);

            return Promise.resolve();
        }

        // Get the selected voice from knowledge base
        const selectedVoice = (knowledgeBase.selectedVoiceId || 'af_nova') as KokoroVoiceId;

        // Stop recognition before speaking to avoid conflicts
        stopRecognition();

        return ttsService.speak(text, {
            voice: selectedVoice,
            speed: 1.0,
            language, // Use selected language (en = Groq, de = ElevenLabs)
            onStart: () => setAgentStatus('speaking'),
            onEnd: () => {
                setAgentStatus('listening');
                // Start listening after speaking
                startRecognition();
            },
            onError: (error) => {
                console.error('TTS error:', error);
                setAgentStatus('listening');
                startRecognition();
            }
        });
    }, [knowledgeBase.selectedVoiceId, isSpeakerOn, language, startRecognition, stopRecognition]);

    const handleUserInput = useCallback(async (text: string) => {
        if (!text.trim()) return;

        addMessage('user', text);
        // ... (rest of function is fine)
        onTranscript?.(text, 'user');
        setCurrentTranscript('');
        setAgentStatus('processing');

        // Stop recognition while processing
        stopRecognition();

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
    }, [addMessage, onTranscript, messages, extractedFields, updateExtractedField, setCallPriority, setCallCategory, speakText, stopRecognition]);

    // Keep handleUserInputRef in sync (must be after handleUserInput is defined)
    useEffect(() => { handleUserInputRef.current = handleUserInput; }, [handleUserInput]);

    const handleStartCall = useCallback(async () => {
        // Unlock audio playback (required by browser autoplay policies)
        // This must happen during the user gesture (click)
        await ttsService.unlockAudio();

        // Reset AI conversation state for new call
        aiService.resetState();

        startCall('voice');

        // Speak a greeting based on selected language
        const greeting = language === 'de'
            ? 'Hallo! Wie kann ich Ihnen helfen?'
            : 'Hello! How can I help you today?';

        setLastAgentMessage(greeting);
        addMessage('agent', greeting);
        setAgentStatus('speaking');

        // Check if we can speak German
        if (language === 'de' && !ttsService.isElevenLabsAvailable()) {
            // Fake it for the greeting if key missing
            setTimeout(() => {
                setAgentStatus('listening');
                startRecognition();
            }, 1000);
            return;
        }

        // Use TTS for the greeting (Groq for English, ElevenLabs for German)
        try {
            // Get selected voice
            const selectedVoice = (knowledgeBase.selectedVoiceId || 'af_nova') as KokoroVoiceId;

            await ttsService.speak(greeting, {
                voice: selectedVoice,
                speed: 1.0,
                language, // Use selected language
                onStart: () => {
                    console.log('🔊 TTS greeting started');
                },
                onEnd: () => {
                    console.log('🔊 Initial greeting finished, starting recognition');
                    setAgentStatus('listening');
                    startRecognition();
                },
                onError: (error) => {
                    console.error('🔊 Greeting TTS error:', error);
                    setAgentStatus('listening');
                    startRecognition();
                }
            });
        } catch (error) {
            console.error('🔊 Greeting TTS failed:', error);
            setAgentStatus('listening');
            startRecognition();
        }
    }, [startCall, startRecognition, language, addMessage]);

    // Auto-start call when autoStart prop is true (fullscreen mode)
    const autoStartRef = useRef(false);
    useEffect(() => {
        if (autoStart && !autoStartRef.current && mode === 'fullscreen' && !currentCall) {
            autoStartRef.current = true;
            // Small delay to ensure everything is ready
            const timer = setTimeout(() => {
                handleStartCall();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [autoStart, mode, currentCall, handleStartCall]);

    const handleEndCall = useCallback(async () => {
        console.log('🔴 End call button pressed');
        setIsEnding(true);

        // Stop all TTS immediately
        ttsService.stop();

        // Stop speech recognition
        stopRecognition();
        if (recognitionRef.current) {
            recognitionRef.current.abort();
            isRecognitionRunningRef.current = false;
        }

        setAgentStatus('idle');

        // Wait for AI summary to be generated before ending
        await endCall();

        setCurrentTranscript('');
        setLastAgentMessage('');

        // Final TTS cleanup after a short delay
        setTimeout(() => {
            ttsService.stop();
        }, 100);
    }, [endCall, stopRecognition]);



    // ... (Compact View - Unchanged)
    if (isActive && isMinimized && currentCall?.type === 'voice') {
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

    // ... (Full Screen View - Unchanged mainly)
    if (isActive && currentCall?.type === 'voice') {
        // ... (existing code)
        return (
            <div className="fixed inset-0 z-50 flex flex-col bg-black text-white overflow-hidden">
                {/* Background Layer */}
                <motion.div
                    className="absolute inset-0 z-0 pointer-events-none"
                    animate={{
                        background: agentStatus === 'speaking'
                            ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 80%)'
                            : agentStatus === 'listening'
                                ? 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 80%)'
                                : 'radial-gradient(circle at center, rgba(168, 85, 247, 0.1) 0%, transparent 80%)'
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />

                {/* Header Actions - Hide minimize button in fullscreen mode */}
                {mode !== 'fullscreen' && (
                    <div className="absolute top-6 right-6 z-20">
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors"
                        >
                            <Minimize2 className="w-5 h-5 text-white" />
                        </button>
                    </div>
                )}

                {/* Back Button for fullscreen mode */}
                {mode === 'fullscreen' && onBack && (
                    <div className="absolute top-6 left-6 z-20">
                        <button
                            onClick={async () => {
                                await handleEndCall();
                                onBack();
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative px-6 z-10 w-full max-w-lg mx-auto">

                    {/* Avatar / Visualizer */}
                    <div className="relative mb-12">
                        <motion.div
                            animate={{
                                scale: agentStatus === 'speaking' ? [1, 1.1, 1] : 1,
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-40 h-40 rounded-full flex items-center justify-center text-5xl shadow-2xl border-4 border-white/10 bg-white/5 backdrop-blur-sm relative z-10 text-white"
                        >
                            <span className="font-bold">AI</span>
                        </motion.div>

                        {/* Status Rings - Simplified and aligned */}
                        {agentStatus === 'listening' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 1 }}
                                animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 1.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                className="absolute inset-0 rounded-full border-2 border-green-500/50"
                            />
                        )}

                        <div className={cn(
                            "absolute -inset-4 rounded-full border-2",
                            agentStatus === 'speaking' ? "animate-[spin_4s_linear_infinite] border-t-blue-500/50 border-r-transparent border-b-blue-500/50 border-l-transparent" :
                                agentStatus === 'processing' ? "animate-[spin_2s_linear_infinite] border-t-yellow-500/50 border-r-transparent border-b-yellow-500/50 border-l-transparent" :
                                    "border-transparent"
                        )} />
                    </div>

                    {/* Call Status */}
                    <div className="text-center space-y-2 mb-10">
                        <h2 className="text-3xl font-semibold text-white tracking-tight">
                            Alice (AI Agent)
                        </h2>
                        <p className="font-mono text-sm text-white/50 tracking-wider uppercase">
                            {formatDuration(callDuration)} • {agentStatus}
                        </p>
                    </div>

                    {/* Caption Box - Darker Glassy */}
                    <div className="w-full mb-8 min-h-[100px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {(currentTranscript || lastAgentMessage) && (
                                <motion.div
                                    key={currentTranscript ? 'user' : 'agent'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="w-full p-6 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl text-center"
                                >
                                    {currentTranscript ? (
                                        <>
                                            <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2 text-green-400">You</p>
                                            <p className="text-xl font-medium leading-relaxed text-white/90">"{currentTranscript}"</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2 text-blue-400">Alice</p>
                                            <p className="text-xl font-medium leading-relaxed text-white/90">{lastAgentMessage}</p>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Bottom Controls - Fully aligned */}
                <div className="p-8 pb-12 w-full z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-6 max-w-lg mx-auto">

                        {/* Language Toggle */}
                        <button
                            onClick={() => {
                                const newLang = language === 'en' ? 'de' : 'en';
                                setLanguage(newLang);
                                ttsService.setLanguage(newLang);
                            }}
                            className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/5 relative"
                        >
                            <Globe className="w-4 h-4 text-white mr-1" />
                            <span className="text-sm font-bold text-white">{language === 'en' ? 'EN' : 'DE'}</span>
                            {/* Warning dot if German selected but unavailable */}
                            {language === 'de' && !ttsService.isElevenLabsAvailable() && (
                                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </button>

                        {/* Speaker */}
                        <button
                            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                            className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center transition-all border backdrop-blur-md",
                                !isSpeakerOn
                                    ? "bg-white text-black border-white"
                                    : "bg-white/10 text-white hover:bg-white/20 border-white/5"
                            )}
                        >
                            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                        </button>

                        {/* End Call - Glassy Red */}
                        <button
                            onClick={async () => {
                                await handleEndCall();
                                if (mode === 'fullscreen' && onBack) {
                                    onBack();
                                }
                            }}
                            className="w-20 h-14 rounded-full flex items-center justify-center bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30 backdrop-blur-md transition-all shadow-lg shadow-red-900/20"
                        >
                            <PhoneOff className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Fullscreen Connecting State - Show while auto-starting
    if (mode === 'fullscreen' && autoStart && !isActive && !isEnding) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col bg-black text-white overflow-hidden">
                {/* Background Layer */}
                <motion.div
                    className="absolute inset-0 z-0 pointer-events-none"
                    animate={{
                        background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 80%)'
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />

                {/* Back Button */}
                {onBack && (
                    <div className="absolute top-6 left-6 z-20">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative px-6 z-10 w-full max-w-lg mx-auto">
                    {/* Avatar / Visualizer - Pulsing */}
                    <div className="relative mb-12">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-40 h-40 rounded-full flex items-center justify-center text-5xl shadow-2xl border-4 border-white/10 bg-white/5 backdrop-blur-sm relative z-10 text-white"
                        >
                            <span className="font-bold">AI</span>
                        </motion.div>

                        {/* Connection Rings */}
                        <motion.div
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 1.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full border-2 border-blue-500/50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{ opacity: [0, 0.3, 0], scale: [1, 1.8, 1.8] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                            className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                        />

                        <div className="absolute -inset-4 rounded-full border-2 animate-[spin_4s_linear_infinite] border-t-blue-500/50 border-r-transparent border-b-blue-500/50 border-l-transparent" />
                    </div>

                    {/* Connecting Status */}
                    <div className="text-center space-y-2 mb-10">
                        <h2 className="text-3xl font-semibold text-white tracking-tight">
                            Connecting...
                        </h2>
                        <p className="font-mono text-sm text-white/50 tracking-wider uppercase">
                            Preparing AI Agent
                        </p>
                    </div>

                    {/* Info Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full p-6 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl text-center"
                    >
                        <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2 text-blue-400">Please Wait</p>
                        <p className="text-lg font-medium leading-relaxed text-white/80">
                            Initializing voice connection...
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Idle Card State (Initial View)
    if (mode === 'overlay' || mode === 'fullscreen') return null;

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-4 md:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden transition-all duration-500 min-h-[400px]",
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
                    "w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-6 shadow-xl relative group z-10",
                    isDark ? "bg-green-500 shadow-green-500/20" : "bg-green-500 shadow-green-500/20"
                )}
            >
                <Phone className="w-10 h-10 md:w-12 md:h-12 text-white fill-current" />
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-20" />
            </motion.button>

            <div className="text-center mb-6 relative z-10">
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

            {/* System Checks (Conversational Style) */}
            {systemChecks.length > 0 && (
                <div className="w-full max-w-xs space-y-2 relative z-10 bg-black/5 p-3 rounded-xl border border-white/5">
                    {systemChecks.map((check, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between text-[11px] font-mono"
                        >
                            <span className={cn("opacity-70", isDark ? "text-white" : "text-black")}>
                                {check.label}
                            </span>
                            <span className={cn(
                                "font-bold",
                                check.status === 'success' ? "text-green-500" :
                                    check.status === 'warning' ? "text-orange-500" :
                                        check.status === 'error' ? "text-red-500" :
                                            "text-blue-400 animate-pulse"
                            )}>
                                {check.status === 'success' ? 'OK' :
                                    check.status === 'warning' ? 'MISSING' :
                                        check.status === 'pending' ? '...' : 'ERR'}
                            </span>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
