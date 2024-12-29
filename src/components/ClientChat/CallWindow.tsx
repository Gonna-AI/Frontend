import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  const [isMuted, setIsMuted] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'speaking' | 'listening'>('idle');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

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
      recognitionRef.current.continuous = false; // Changed to false to prevent continuous recording
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // Default to English

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        if (event.results[current].isFinal) {
          processUserInput(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setAgentStatus('idle');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const processUserInput = async (input: string) => {
    setIsProcessing(true);
    setAgentStatus('speaking');

    try {
      // Use the backend API for voice conversation
      const response = await api.post('/api/chat', {
        message: input,
        ticketCode: ticketCode
      });

      // Get the AI response text
      const aiResponse = response.data.response || response.data.text || '';
      setResponse(aiResponse);
      
      // Create and configure speech synthesis
      const utterance = new SpeechSynthesisUtterance(aiResponse);
      utterance.lang = recognitionRef.current?.lang || 'en-US';
      utterance.rate = 1.0;  // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      
      // Clear any existing speech
      window.speechSynthesis.cancel();
      
      utterance.onstart = () => {
        setAgentStatus('speaking');
      };
      
      utterance.onend = () => {
        setAgentStatus('listening');
        setIsProcessing(false);
        
        // Restart recognition after speech ends
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

      // Add a small delay before speaking to ensure proper state updates
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);

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

  const handleLanguageSwitch = () => {
    if (!recognitionRef.current) return;
    
    const currentLang = recognitionRef.current.lang;
    recognitionRef.current.lang = currentLang === 'hi-IN' ? 'en-US' : 'hi-IN';
    
    // Restart recognition if it's currently active
    if (!isMuted) {
      recognitionRef.current.stop();
      recognitionRef.current.start();
    }
  };

  const handleClose = () => {
    // Stop any ongoing speech synthesis
    window.speechSynthesis.cancel();
    
    // Stop speech recognition if active
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.abort();
    }
    
    // Reset states
    setIsMuted(true);
    setAgentStatus('idle');
    setIsProcessing(false);
    
    // Call the original onClose
    onClose();
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

        {/* Header with close and language buttons */}
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
          
          <button
            onClick={handleLanguageSwitch}
            className={cn(
              "p-2 px-4 rounded-xl transition-colors",
              isDark 
                ? "bg-black/20 border border-white/10 text-white hover:bg-black/30" 
                : "bg-white/10 border border-black/10 text-black hover:bg-white/20"
            )}
          >
            {recognitionRef.current?.lang === 'hi-IN' ? 'HI' : 'EN'}
          </button>
        </div>

        {/* Main content area with two columns */}
        <div className="flex-1 w-full flex gap-4 px-6 overflow-hidden">
          {/* Left column - AI Avatar and Status */}
          <div className="w-1/2 flex flex-col items-center justify-center">
            {/* AI Icon */}
            <div className={cn(
              "w-20 h-20 rounded-xl flex items-center justify-center mb-4",
              isDark 
                ? "bg-black/20 border border-white/10" 
                : "bg-white/10 border border-black/10"
            )}>
              <svg
                viewBox="0 0 500 500"
                className="w-16 h-16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  fill={isDark ? "white" : "black"}
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"
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