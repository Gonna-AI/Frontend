import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Mic, MicOff } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../config/api';

interface CallWindowProps {
  isDark: boolean;
  onClose: () => void;
  onStopAI: () => void;
  onFileUpload?: (file: File) => void;
  ticketCode: string;
}

// Speech recognition interface
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export default function CallWindow({ isDark, onClose, onStopAI, onFileUpload, ticketCode }: CallWindowProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'speaking' | 'listening'>('idle');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [language, setLanguage] = useState<'en-US' | 'hi-IN'>('en-US');

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Initialize timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        console.log('Transcript received:', transcriptText);
        setTranscript(transcriptText);
        
        if (event.results[current].isFinal) {
          processUserInput(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setAgentStatus('idle');
        handleMicToggle();
      };

      // Start recognition immediately since we're unmuted by default
      try {
        recognitionRef.current.start();
        setAgentStatus('listening');
      } catch (error) {
        console.error('Error starting initial recognition:', error);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    
    // Some browsers need this event to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const processUserInput = async (input: string) => {
    console.log('Processing user input:', input);
    setIsProcessing(true);
    setAgentStatus('speaking');

    try {
      const response = await api.post('/api/chat', {
        message: input,
        ticketCode: ticketCode
      });

      const aiResponse = response.data.response || response.data.text || '';
      console.log('AI response:', aiResponse);
      setResponse(aiResponse);
      
      const utterance = new SpeechSynthesisUtterance(aiResponse);
      utterance.lang = language;
      
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(voice => 
        voice.lang.includes('hi-IN') || 
        voice.lang.includes('hi') ||
        voice.name.toLowerCase().includes('hindi')
      );
      
      if (language === 'hi-IN' && hindiVoice) {
        utterance.voice = hindiVoice;
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      window.speechSynthesis.cancel();
      
      utterance.onstart = () => {
        console.log('Speech synthesis started');
        setAgentStatus('speaking');
      };
      
      utterance.onend = () => {
        console.log('Speech synthesis ended');
        setAgentStatus('listening');
        setIsProcessing(false);
        
        if (!isMuted && recognitionRef.current) {
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 100);
        }
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setAgentStatus('idle');
        setIsProcessing(false);
      };

      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('Error processing input:', error);
      setAgentStatus('idle');
      setIsProcessing(false);
      setResponse('Sorry, I encountered an error. Please try again.');
    }
  };

  const handleMicToggle = () => {
    if (!recognitionRef.current) return;

    if (isMuted) {
      try {
        recognitionRef.current.start();
        setAgentStatus('listening');
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    } else {
      try {
        recognitionRef.current.stop();
        setAgentStatus('idle');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsMuted(!isMuted);
  };

  const handleClose = () => {
    window.speechSynthesis.cancel();
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.abort();
    }
    
    setIsMuted(true);
    setAgentStatus('idle');
    setIsProcessing(false);
    
    onClose();
  };

  const handleLanguageToggle = () => {
    setLanguage((prev) => (prev === 'en-US' ? 'hi-IN' : 'en-US'));
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          "fixed bottom-0 inset-x-0 z-50 flex flex-col items-center h-[80vh] relative overflow-hidden rounded-t-3xl",
          isDark 
            ? "bg-black/20 border-t border-white/10 backdrop-blur-md" 
            : "bg-white/10 border-t border-black/10 backdrop-blur-md"
        )}
      >
        {/* Gradient backgrounds */}
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between w-full relative z-10 p-4">
          <button
            onClick={handleClose}
            className={cn(
              "p-2 rounded-xl transition-colors",
              isDark 
                ? "bg-black/20 border border-white/10 text-white hover:bg-black/30" 
                : "bg-white/10 border border-black/10 text-black hover:bg-white/20"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main content area with two columns */}
        <div className="flex-1 w-full flex gap-4 px-6 overflow-hidden">
          {/* Left column - AI Avatar and Status */}
          <div className="w-1/2 flex flex-col items-center justify-center">
            {/* AI Logo */}
            <div className={cn(
              "w-20 h-20 rounded-xl flex items-center justify-center mb-4",
              isDark 
                ? "bg-black/20 border border-white/10" 
                : "bg-white/10 border border-black/10"
            )}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 464 468"
                className="w-16 h-16"
                aria-label="ClerkTree Logo"
              >
                <path 
                  fill={isDark ? "white" : "black"}
                  d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
                />
              </svg>
            </div>

            {/* Title and Status */}
            <h2 className={cn(
              "text-xl font-semibold mb-2",
              isDark ? "text-white" : "text-black"
            )}>
              AI Assistant
            </h2>
            
            <p className={cn(
              "text-base",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              {formatDuration(callDuration)}
            </p>
            <p className={cn(
              "text-sm",
              isDark ? "text-white/40" : "text-black/40"
            )}>
              Status: {agentStatus}
            </p>
          </div>

          {/* Right column - Transcripts */}
          <div className="w-1/2 flex flex-col gap-4 overflow-y-auto py-4">
            <h3 className={cn(
              "text-sm font-medium",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              Transcription
            </h3>
            
            {transcript && (
              <div className={cn(
                "p-3 rounded-lg text-sm",
                isDark ? "bg-black/20 text-white/60" : "bg-white/10 text-black/60"
              )}>
                <span className="font-medium">You:</span> {transcript}
              </div>
            )}
            
            {response && (
              <div className={cn(
                "p-3 rounded-lg text-sm",
                isDark ? "bg-black/20 text-white/60" : "bg-white/10 text-black/60"
              )}>
                <span className="font-medium">Assistant:</span> {response}
              </div>
            )}
          </div>
        </div>

        {/* Control buttons */}
        <div className="relative z-10 p-4 w-full flex justify-center gap-4">
          <button
            onClick={handleMicToggle}
            disabled={isProcessing}
            className={cn(
              "p-4 rounded-xl transition-colors",
              isDark
                ? "bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                : "bg-blue-500/10 border border-blue-500/20 text-blue-600 hover:bg-blue-500/20",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleLanguageToggle}
            className={cn(
              "p-4 rounded-xl transition-colors",
              isDark
                ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30"
                : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 hover:bg-yellow-500/20"
            )}
          >
            {language === 'en-US' ? 'Switch to Hindi' : 'Switch to English'}
          </button>

          <button
            onClick={handleClose}
            className={cn(
              "p-4 rounded-xl transition-colors",
              isDark
                ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                : "bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20"
            )}
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </>
  );
}