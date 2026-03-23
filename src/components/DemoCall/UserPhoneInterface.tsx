import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Volume2, VolumeX, Minimize2, Maximize2, ArrowLeft } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { cn } from '../../utils/cn';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { fetchElevenLabsSignedUrl } from '../../services/elevenlabsSignedUrl';

interface UserPhoneInterfaceProps {
    isDark?: boolean;
    onTranscript?: (text: string, speaker: 'user' | 'agent') => void;
    compact?: boolean;
    mode?: 'standalone' | 'overlay' | 'fullscreen';
    autoStart?: boolean;
    onBack?: () => void;
}

export default function UserPhoneInterface({
    isDark = true,
    onTranscript,
    mode = 'standalone',
    autoStart = false,
    onBack
}: UserPhoneInterfaceProps) {
    const {
        currentCall,
        startCall,
        endCall,
        addMessage,
    } = useDemoCall();

    const [callDuration, setCallDuration] = useState(0);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [lastAgentMessage, setLastAgentMessage] = useState('');
    const [agentStatus, setAgentStatus] = useState<'idle' | 'speaking' | 'listening' | 'processing'>('idle');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Memoized callbacks — stable references prevent useConversation from
    // re-initialising on every render, which can reset the active WebSocket.
    const onConnect = useCallback(() => {
        console.log('📞 ElevenLabs Conversational AI connected');
        setConnectionError(null);
        setAgentStatus('listening');
    }, []);

    const onDisconnect = useCallback(() => {
        console.log('📞 ElevenLabs Conversational AI disconnected');
        setAgentStatus('idle');
    }, []);

    const onMessage = useCallback((message: { source: string; message: string }) => {
        console.log(`📞 [${message.source}]: ${message.message}`);
        if (message.source === 'user') {
            setCurrentTranscript(message.message);
            addMessage('user', message.message);
            onTranscript?.(message.message, 'user');
        } else if (message.source === 'ai') {
            setCurrentTranscript('');
            setLastAgentMessage(message.message);
            addMessage('agent', message.message);
            onTranscript?.(message.message, 'agent');
        }
    }, [addMessage, onTranscript]);

    const onError = useCallback((error: string) => {
        console.error('📞 ElevenLabs error:', error);
        setConnectionError(typeof error === 'string' ? error : 'Connection error');
    }, []);

    const onModeChange = useCallback((modeEvent: { mode: string }) => {
        console.log('📞 Mode:', modeEvent.mode);
        if (modeEvent.mode === 'speaking') {
            setAgentStatus('speaking');
            setCurrentTranscript('');
        } else if (modeEvent.mode === 'listening') {
            setAgentStatus('listening');
        }
    }, []);

    // ElevenLabs Conversational AI — handles STT + LLM + TTS in one WebSocket
    const conversation = useConversation({
        onConnect,
        onDisconnect,
        onMessage,
        onError,
        onModeChange,
    });

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

    // Sync volume with speaker toggle
    useEffect(() => {
        if (conversation.status === 'connected') {
            conversation.setVolume({ volume: isSpeakerOn ? 1 : 0 });
        }
    }, [isSpeakerOn, conversation.status]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isActive = currentCall?.status === 'active';

    // Fetch signed URL from our Netlify function (keeps API key server-side)
    const getSignedUrl = useCallback(async (): Promise<string> => {
        return fetchElevenLabsSignedUrl();
    }, []);

    const handleStartCall = useCallback(async () => {
        setConnectionError(null);
        setIsEnding(false);
        setAgentStatus('processing');

        // 1. Pre-request mic access while still inside the user-gesture context.
        //    This warms the browser audio pipeline BEFORE the network round-trips,
        //    so the ElevenLabs AudioWorklet is ready to send audio the instant the
        //    WebSocket opens — preventing the server's silence/inactivity timeout
        //    from closing the connection before the conversation can begin.
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(t => t.stop()); // release; SDK acquires its own
        } catch {
            setConnectionError('Microphone access denied. Please allow microphone access and try again.');
            setAgentStatus('idle');
            return;
        }

        startCall('voice');

        try {
            const signedUrl = await getSignedUrl();
            await conversation.startSession({ signedUrl });
        } catch (error) {
            console.error('📞 Failed to start ElevenLabs session:', error);
            setConnectionError(error instanceof Error ? error.message : 'Failed to connect');
            setAgentStatus('idle');
        }
    }, [startCall, getSignedUrl, conversation]);

    const handleEndCall = useCallback(async () => {
        console.log('🔴 End call button pressed');
        setIsEnding(true);

        // End ElevenLabs session
        await conversation.endSession();

        setAgentStatus('idle');
        await endCall();

        setCurrentTranscript('');
        setLastAgentMessage('');
    }, [endCall, conversation]);

    // Keep a ref so the unmount cleanup always calls endSession on the latest instance.
    // Without this, the closure would capture the stale initial conversation object
    // (status = 'disconnected') and never actually end the session.
    const conversationRef = useRef(conversation);
    conversationRef.current = conversation;

    // Cleanup on unmount — end any active ElevenLabs session
    useEffect(() => {
        return () => {
            conversationRef.current.endSession();
        };
    }, []);

    // Compact minimized view
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

    // Full screen active call view
    if (isActive && currentCall?.type === 'voice') {
        return (
            <div className="fixed inset-0 h-[100dvh] z-50 flex flex-col bg-black text-white overflow-hidden">
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
                <div className="flex-1 flex flex-col items-center justify-center relative px-6 z-10 w-full max-w-[92vw] sm:max-w-lg mx-auto">

                    {/* Avatar / Visualizer */}
                    <div className="relative mb-8 sm:mb-12">
                        <motion.div
                            animate={{
                                scale: agentStatus === 'speaking' ? [1, 1.1, 1] : 1,
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border-4 border-white/10 bg-white/5 backdrop-blur-sm relative z-10 text-white"
                        >
                            <span className="font-bold">AI</span>
                        </motion.div>

                        {/* Status Rings */}
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
                    <div className="text-center space-y-2 mb-8 sm:mb-10">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                            Alice (AI Agent)
                        </h2>
                        <p className="font-mono text-sm text-white/50 tracking-wider uppercase">
                            {formatDuration(callDuration)} • {agentStatus}
                        </p>
                    </div>

                    {/* Caption Box */}
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
                                    <p className="text-base sm:text-xl font-medium leading-relaxed text-white/90">"{currentTranscript}"</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2 text-blue-400">Alice</p>
                                    <p className="text-base sm:text-xl font-medium leading-relaxed text-white/90">{lastAgentMessage}</p>
                                </>
                            )}
                        </motion.div>
                    )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className="p-8 pb-[max(2rem,env(safe-area-inset-bottom))] w-full z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-6 max-w-lg mx-auto">

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

                        {/* End Call */}
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

    // Fullscreen "Start Call" state
    if (mode === 'fullscreen' && autoStart && !isActive && !isEnding) {
        return (
            <div className="fixed inset-0 h-[100dvh] z-50 flex flex-col bg-black text-white overflow-hidden">
                {/* Background Layer */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,138,91,0.18),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,210,184,0.10),transparent_55%)]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black" />
                    <div className="absolute inset-0 opacity-[0.08] bg-[url('/noise.webp')] bg-[length:30%]" />
                </div>

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
                <div className="flex-1 flex flex-col items-center justify-center relative px-6 z-10 w-full max-w-[92vw] sm:max-w-lg mx-auto">
                    {/* Avatar */}
                    <div className="relative mb-8 sm:mb-12">
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,209,184,0.35),rgba(255,138,91,0.18)_45%,rgba(12,10,9,0.9)_100%)] backdrop-blur-sm relative z-10 text-white"
                        >
                            <span className="font-bold">AI</span>
                        </motion.div>

                        {/* Ambient ring */}
                        <div className="absolute -inset-4 rounded-full border-2 animate-[spin_6s_linear_infinite] border-t-[#FF8A5B]/40 border-r-transparent border-b-[#FF8A5B]/30 border-l-transparent" />
                    </div>

                    {/* Ready Status */}
                    <div className="text-center space-y-2 mb-8 sm:mb-10">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                            AI Ready to Connect
                        </h2>
                        <p className="font-mono text-xs text-white/55 tracking-[0.35em] uppercase">
                            Standing By
                        </p>
                    </div>

                    {/* Start Call Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        onClick={handleStartCall}
                        className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-6 sm:mb-8 border border-emerald-300/40 shadow-[0_0_45px_rgba(34,197,94,0.45)] hover:shadow-[0_0_70px_rgba(34,197,94,0.65)] transition-shadow duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#C7F9D8_0%,#22C55E_55%,#0B3D1D_100%)]" />
                        <div className="absolute inset-0 rounded-full bg-[linear-gradient(155deg,rgba(255,255,255,0.25),transparent_55%)]" />
                        <div className="absolute inset-0 rounded-full bg-[url('/noise.webp')] opacity-[0.12]" />
                        <Phone className="relative w-7 h-7 sm:w-8 sm:h-8 text-[#0B1A0F] group-hover:scale-110 transition-transform" />
                        {/* Pulse ring */}
                        <motion.div
                            animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full border-2 border-emerald-300/70"
                        />
                    </motion.button>

                    <p className="text-sm text-white/45">
                        Tap to start your voice call
                    </p>

                    {/* Connection Error */}
                    {connectionError && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center"
                        >
                            <p className="text-sm text-red-400">{connectionError}</p>
                            <p className="text-xs text-white/40 mt-1">Check your ElevenLabs configuration</p>
                        </motion.div>
                    )}

                    {/* Info Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="w-full mt-8 p-5 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl text-center"
                    >
                        <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2 text-[#FFB286]">Voice Call</p>
                        <p className="text-sm sm:text-base font-medium leading-relaxed text-white/70">
                            Speak naturally with our AI agent. Your microphone will be activated when the call starts.
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

            {/* Connection Error */}
            {connectionError && (
                <div className="w-full max-w-xs p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center relative z-10">
                    <p className="text-xs text-red-400">{connectionError}</p>
                </div>
            )}

            {/* Status indicator */}
            <div className="w-full max-w-xs space-y-2 relative z-10 bg-black/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={cn("opacity-70", isDark ? "text-white" : "text-black")}>
                        ElevenLabs Conversational AI
                    </span>
                    <span className="font-bold text-green-500">
                        READY
                    </span>
                </div>
            </div>
        </div>
    );
}
