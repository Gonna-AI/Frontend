import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  User, 
  Bot,
  Tag,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { aiService } from '../services/aiService';
import { ttsService, KokoroVoiceId } from '../services/ttsService';
import { 
  DemoCallProvider, 
  useDemoCall, 
  CallMessage, 
  ExtractedField,
  PriorityLevel 
} from '../contexts/DemoCallContext';

// Speech recognition interface
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

function UserCallContent() {
  const navigate = useNavigate();
  const { 
    knowledgeBase, 
    currentCall, 
    startCall, 
    endCall, 
    addMessage, 
    updateExtractedField,
    setCallPriority,
    setCallCategory
  } = useDemoCall();
  
  const [isDark] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [agentStatus, setAgentStatus] = useState<'idle' | 'speaking' | 'listening' | 'processing'>('idle');
  const [language, setLanguage] = useState<'en-US' | 'hi-IN'>('en-US');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isInCall = currentCall?.status === 'active';
  const messages = currentCall?.messages || [];
  const extractedFields = currentCall?.extractedFields || [];

  // Initialize AI service with knowledge base
  useEffect(() => {
    aiService.setKnowledgeBase(knowledgeBase);
  }, [knowledgeBase]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer for call duration
  useEffect(() => {
    if (isInCall) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInCall]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
        if (isInCall && !isMuted && agentStatus === 'listening') {
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
  }, [language, isInCall, isMuted, agentStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speakText = useCallback((text: string): Promise<void> => {
    if (!isSpeakerOn) return Promise.resolve();
    
    // Get the selected voice from knowledge base
    const selectedVoice = (knowledgeBase.selectedVoiceId || 'af_nova') as KokoroVoiceId;
    
    return ttsService.speak(text, {
      voice: selectedVoice,
      speed: 1.0,
      onStart: () => setAgentStatus('speaking'),
      onEnd: () => {
        setAgentStatus('listening');
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
    setCurrentTranscript('');
    setAgentStatus('processing');

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
    await speakText(response.text);
  }, [messages, extractedFields, addMessage, updateExtractedField, setCallPriority, setCallCategory, speakText]);

  const handleStartCall = useCallback(async () => {
    // Reset AI conversation state for new call
    aiService.resetState();
    
    startCall();
    setAgentStatus('speaking');
    
    const greeting = knowledgeBase.greeting;
    addMessage('agent', greeting);
    await speakText(greeting);
  }, [startCall, knowledgeBase.greeting, addMessage, speakText]);

  const handleEndCall = useCallback(async () => {
    ttsService.stop();
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setAgentStatus('idle');
    setCurrentTranscript('');
    // Wait for AI summary to be generated before ending
    await endCall();
  }, [endCall]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      if (recognitionRef.current && isInCall) {
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
  }, [isMuted, isInCall]);

  const getPriorityColor = (priority: PriorityLevel) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return colors[priority];
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 flex flex-col",
      isDark 
        ? "bg-[rgb(10,10,10)]" 
        : "bg-gradient-to-br from-gray-50 to-white"
    )}>
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80rem] h-[80rem] bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className={cn(
        "relative z-50 px-3 md:px-4 py-2 md:py-3 backdrop-blur-md border-b",
        isDark 
          ? "bg-[rgb(10,10,10)]/80 border-white/10" 
          : "bg-white/80 border-black/10"
      )}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate('/')}
              className={cn(
                "p-1.5 md:p-2 rounded-lg transition-colors",
                isDark 
                  ? "hover:bg-white/10 text-white/60 hover:text-white" 
                  : "hover:bg-black/10 text-black/60 hover:text-black"
              )}
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <svg viewBox="0 0 464 468" className="w-6 h-6 md:w-8 md:h-8">
                <path 
                  fill={isDark ? "white" : "black"} 
                  d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
                />
              </svg>
              <span className={cn(
                "text-base md:text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>
                ClerkTree
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/demo-dashboard')}
            className={cn(
              "px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-colors",
              isDark 
                ? "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10" 
                : "bg-black/10 text-black/80 hover:bg-black/20 border border-black/10"
            )}
          >
            <span className="hidden sm:inline">View Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-3 md:px-4 py-4 md:py-8">
        <div className="w-full max-w-2xl">
          {/* Call interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl md:rounded-3xl overflow-hidden",
              isDark 
                ? "bg-black/20 border border-white/10 backdrop-blur-md" 
                : "bg-white/80 border border-black/10 backdrop-blur-md"
            )}
          >
            {/* Avatar section */}
            <div className="flex flex-col items-center pt-6 md:pt-10 pb-4 md:pb-6">
              <motion.div
                animate={{
                  scale: isInCall ? [1, 1.05, 1] : 1,
                  boxShadow: isInCall && agentStatus === 'speaking'
                    ? ['0 0 0 0 rgba(59, 130, 246, 0)', '0 0 0 20px rgba(59, 130, 246, 0.1)', '0 0 0 0 rgba(59, 130, 246, 0)']
                    : 'none'
                }}
                transition={{ duration: 2, repeat: isInCall ? Infinity : 0 }}
                className={cn(
                  "w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-6",
                  isDark 
                    ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20" 
                    : "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-black/10"
                )}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 464 468"
                  className="w-14 h-14 md:w-20 md:h-20"
                >
                  <path 
                    fill={isDark ? "white" : "black"}
                    d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
                  />
                </svg>
              </motion.div>

              <h2 className={cn(
                "text-xl md:text-2xl font-semibold mb-1 md:mb-2",
                isDark ? "text-white" : "text-black"
              )}>
                AI Call Agent
              </h2>

              <AnimatePresence mode="wait">
                {isInCall ? (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center"
                  >
                    <p className={cn(
                      "text-3xl md:text-4xl font-mono mb-1 md:mb-2",
                      isDark ? "text-white" : "text-black"
                    )}>
                      {formatDuration(callDuration)}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 md:gap-2 flex-wrap px-2">
                      <span className={cn(
                        "text-xs md:text-sm capitalize px-3 md:px-4 py-1 md:py-1.5 rounded-full",
                        agentStatus === 'speaking' && "bg-blue-500/20 text-blue-400",
                        agentStatus === 'listening' && "bg-green-500/20 text-green-400",
                        agentStatus === 'processing' && "bg-yellow-500/20 text-yellow-400",
                        agentStatus === 'idle' && (isDark ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"),
                      )}>
                        {agentStatus}
                      </span>
                      {currentCall?.priority && currentCall.priority !== 'medium' && (
                        <span className={cn(
                          "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full border capitalize",
                          getPriorityColor(currentCall.priority)
                        )}>
                          {currentCall.priority}
                        </span>
                      )}
                      {currentCall?.category && (
                        <span className={cn(
                          "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full",
                          isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-500/10 text-purple-600"
                        )}>
                          {currentCall.category.name}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "text-base md:text-lg",
                      isDark ? "text-white/60" : "text-black/60"
                    )}
                  >
                    Ready to assist you
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Extracted fields panel */}
            {isInCall && extractedFields.length > 0 && (
              <div className={cn(
                "mx-3 md:mx-4 mb-3 md:mb-4 p-2 md:p-3 rounded-lg md:rounded-xl",
                isDark ? "bg-white/5" : "bg-black/5"
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
                    Extracted Information
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {extractedFields.map(field => (
                    <div
                      key={field.id}
                      className={cn(
                        "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg flex items-center gap-1",
                        isDark 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                          : "bg-blue-500/5 text-blue-600 border border-blue-500/10"
                      )}
                    >
                      <span className="opacity-60">{field.label}:</span>
                      <span className="font-medium truncate max-w-[80px] md:max-w-none">{field.value}</span>
                      <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-60 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages area */}
            {isInCall && messages.length > 0 && (
              <div className={cn(
                "mx-3 md:mx-4 mb-3 md:mb-4 rounded-xl md:rounded-2xl overflow-hidden max-h-[200px] md:max-h-[300px] overflow-y-auto custom-scrollbar",
                isDark ? "bg-black/20" : "bg-black/5"
              )}>
                <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message: CallMessage) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn(
                          "flex gap-1.5 md:gap-2",
                          message.speaker === 'agent' ? "justify-start" : "justify-end"
                        )}
                      >
                        {message.speaker === 'agent' && (
                          <div className={cn(
                            "w-6 h-6 md:w-7 md:h-7 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0",
                            "bg-blue-500/20"
                          )}>
                            <Bot className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                          </div>
                        )}
                        
                        <div className={cn(
                          "max-w-[80%] rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-2.5",
                          message.speaker === 'agent'
                            ? "bg-blue-500/10 border border-blue-500/20"
                            : "bg-purple-500/10 border border-purple-500/20"
                        )}>
                          <p className={cn(
                            "text-xs md:text-sm",
                            isDark ? "text-white/90" : "text-black/90"
                          )}>
                            {message.text}
                          </p>
                        </div>

                        {message.speaker === 'user' && (
                          <div className={cn(
                            "w-6 h-6 md:w-7 md:h-7 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0",
                            "bg-purple-500/20"
                          )}>
                            <User className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            {/* Current transcript */}
            {currentTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mx-3 md:mx-4 mb-3 md:mb-4 p-2 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm",
                  isDark ? "bg-white/5 text-white/80" : "bg-black/5 text-black/80"
                )}
              >
                <span className="text-[10px] md:text-xs opacity-60 block mb-0.5 md:mb-1">Listening...</span>
                {currentTranscript}
              </motion.div>
            )}

            {/* Controls */}
            <div className={cn(
              "flex items-center justify-center gap-2 md:gap-4 p-4 md:p-6 border-t",
              isDark ? "border-white/10" : "border-black/10"
            )}>
              {isInCall && (
                <>
                  <button
                    onClick={toggleMute}
                    className={cn(
                      "p-3 md:p-4 rounded-lg md:rounded-xl transition-all",
                      isDark
                        ? isMuted 
                          ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                          : "bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                        : isMuted
                          ? "bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20"
                          : "bg-blue-500/10 border border-blue-500/20 text-blue-600 hover:bg-blue-500/20"
                    )}
                  >
                    {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                  </button>

                  <button
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className={cn(
                      "p-3 md:p-4 rounded-lg md:rounded-xl transition-all",
                      isDark
                        ? isSpeakerOn 
                          ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
                          : "bg-gray-500/20 border border-gray-500/30 text-gray-400 hover:bg-gray-500/30"
                        : isSpeakerOn
                          ? "bg-green-500/10 border border-green-500/20 text-green-600 hover:bg-green-500/20"
                          : "bg-gray-500/10 border border-gray-500/20 text-gray-600 hover:bg-gray-500/20"
                    )}
                  >
                    {isSpeakerOn ? <Volume2 className="w-5 h-5 md:w-6 md:h-6" /> : <VolumeX className="w-5 h-5 md:w-6 md:h-6" />}
                  </button>
                </>
              )}

              <button
                onClick={isInCall ? handleEndCall : handleStartCall}
                className={cn(
                  "p-4 md:p-5 rounded-xl md:rounded-2xl transition-all",
                  isInCall
                    ? isDark
                      ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                      : "bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20"
                    : isDark
                      ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
                      : "bg-green-500/10 border border-green-500/20 text-green-600 hover:bg-green-500/20"
                )}
              >
                {isInCall ? <PhoneOff className="w-6 h-6 md:w-8 md:h-8" /> : <Phone className="w-6 h-6 md:w-8 md:h-8" />}
              </button>

              {isInCall && (
                <button
                  onClick={() => setLanguage(prev => prev === 'en-US' ? 'hi-IN' : 'en-US')}
                  className={cn(
                    "px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all",
                    isDark
                      ? "bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
                      : "bg-purple-500/10 border border-purple-500/20 text-purple-600 hover:bg-purple-500/20"
                  )}
                >
                  {language === 'en-US' ? 'हिंदी' : 'EN'}
                </button>
              )}
            </div>
          </motion.div>

          {/* Help text */}
          {!isInCall && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "text-center mt-4 md:mt-6 text-xs md:text-sm px-4",
                isDark ? "text-white/40" : "text-black/40"
              )}
            >
              Press the call button to start a conversation
            </motion.p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={cn(
        "relative z-10 py-3 md:py-4 text-center",
        isDark ? "text-white/30" : "text-black/30"
      )}>
        <p className="text-[10px] md:text-xs">
          Powered by ClerkTree AI
        </p>
      </footer>
    </div>
  );
}

export default function UserCall() {
  return (
    <DemoCallProvider>
      <UserCallContent />
    </DemoCallProvider>
  );
}
