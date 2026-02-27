import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "../../utils/cn";
import { useDemoCall } from "../../contexts/DemoCallContext";
import { aiService } from "../../services/aiService";
import { ttsService, KokoroVoiceId } from "../../services/ttsService";

interface VoiceCallInterfaceProps {
  isDark?: boolean;
  onTranscript?: (text: string, speaker: "user" | "agent") => void;
  compact?: boolean;
}

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

export default function VoiceCallInterface({
  isDark = true,
  onTranscript,
  compact = false,
}: VoiceCallInterfaceProps) {
  const {
    currentCall,
    startCall,
    endCall,
    addMessage,
    knowledgeBase,
    updateExtractedField,
    setCallPriority,
    setCallCategory,
    globalActiveSessions,
  } = useDemoCall();

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [agentStatus, setAgentStatus] = useState<
    "idle" | "speaking" | "listening" | "processing"
  >("idle");
  const [language, setLanguage] = useState<"en-US" | "de-DE">("en-US");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecognitionRunningRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTranscriptRef = useRef<string>("");
  const lastFinalResultTimeRef = useRef<number>(0);

  // Refs to avoid stale closures in speech recognition callbacks
  const currentCallRef = useRef(currentCall);
  const agentStatusRef = useRef(agentStatus);

  const handleUserInputRef = useRef<((text: string) => Promise<void>) | null>(
    null,
  );

  // Keep refs in sync with state
  useEffect(() => {
    currentCallRef.current = currentCall;
  }, [currentCall]);
  useEffect(() => {
    agentStatusRef.current = agentStatus;
  }, [agentStatus]);

  const messages = currentCall?.messages || [];
  const extractedFields = currentCall?.extractedFields || [];

  // Initialize AI service with knowledge base
  useEffect(() => {
    aiService.setKnowledgeBase(knowledgeBase);
  }, [knowledgeBase]);

  // Timer for call duration
  useEffect(() => {
    if (currentCall?.status === "active") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
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
  }, [currentCall?.status]);

  // Helper functions for starting/stopping recognition safely
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || isRecognitionRunningRef.current) {
      console.log("🎤 Recognition already running or not available");
      return;
    }
    try {
      console.log("🎤 Starting speech recognition...");
      recognitionRef.current.start();
      isRecognitionRunningRef.current = true;
    } catch (e) {
      console.error("Error starting recognition:", e);
      isRecognitionRunningRef.current = false;
    }
  }, []);

  const stopRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      isRecognitionRunningRef.current = false;
    } catch (e) {
      console.error("Error stopping recognition:", e);
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition: SpeechRecognitionInstance = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognitionRef.current = recognition;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setCurrentTranscript(transcriptText);

        if (event.results[current].isFinal) {
          // Store the final transcript
          pendingTranscriptRef.current = transcriptText.trim();
          lastFinalResultTimeRef.current = Date.now();

          // Clear any existing silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Wait for silence period (800ms) to ensure user has finished speaking
          // This prevents the AI from responding too quickly
          silenceTimerRef.current = setTimeout(() => {
            const transcript = pendingTranscriptRef.current;
            const timeSinceLastResult =
              Date.now() - lastFinalResultTimeRef.current;

            // Only process if we have text and enough time has passed
            if (transcript && timeSinceLastResult >= 800) {
              console.log("🎤 User finished speaking, processing:", transcript);
              handleUserInputRef.current?.(transcript);
              pendingTranscriptRef.current = "";
            }
          }, 800); // Wait 800ms of silence before processing
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        isRecognitionRunningRef.current = false;
        if (event.error !== "aborted") {
          setAgentStatus("idle");
        }
      };

      recognition.onend = () => {
        isRecognitionRunningRef.current = false;
        // Restart if still in call and listening - use refs for latest values
        const isActive = currentCallRef.current?.status === "active";
        const status = agentStatusRef.current;

        console.log("🎤 Speech recognition ended, checking restart:", {
          isActive,
          status,
        });

        if (isActive && status === "listening") {
          // Small delay to prevent rapid restart issues
          setTimeout(() => {
            if (
              currentCallRef.current?.status === "active" &&
              agentStatusRef.current === "listening"
            ) {
              try {
                console.log("🎤 Restarting speech recognition...");
                recognitionRef.current?.start();
                isRecognitionRunningRef.current = true;
              } catch (e) {
                console.error("Error restarting recognition:", e);
                isRecognitionRunningRef.current = false;
              }
            }
          }, 100);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        isRecognitionRunningRef.current = false;
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [language]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const speakText = useCallback(
    async (text: string) => {
      if (!text || !text.trim()) {
        console.warn("⚠️ Empty text provided to speakText");
        setAgentStatus("listening");
        startRecognition();
        return;
      }

      console.log(
        "🔊 Speaking text:",
        text.substring(0, 50) + "...",
        "Speaker on:",
        isSpeakerOn,
      );

      // Check if speaker is on - if not, log warning but still try to speak
      if (!isSpeakerOn) {
        console.warn("⚠️ Speaker is off, but attempting to speak anyway");
      }

      // Get the selected voice from knowledge base
      const selectedVoice = (knowledgeBase.selectedVoiceId ||
        "af_nova") as KokoroVoiceId;

      // Stop recognition before speaking to avoid conflicts
      stopRecognition();

      // Clear any pending silence timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      try {
        // Always try to speak - the TTS service will handle speaker state
        await ttsService.speak(text, {
          voice: selectedVoice,
          speed: 1.0,
          onStart: () => {
            console.log("✅ TTS started speaking");
            setAgentStatus("speaking");
          },
          onEnd: () => {
            console.log("✅ TTS finished speaking");
            setAgentStatus("listening");
            // Start listening after speaking with a small delay
            setTimeout(() => {
              if (currentCallRef.current?.status === "active" && !isMuted) {
                console.log("🎤 Restarting recognition after TTS ended");
                startRecognition();
              }
            }, 300);
          },
          onError: (error) => {
            console.error("❌ TTS error:", error);
            setAgentStatus("listening");
            // Try to restart listening even on error
            setTimeout(() => {
              if (currentCallRef.current?.status === "active" && !isMuted) {
                console.log("🎤 Restarting recognition after TTS error");
                startRecognition();
              }
            }, 300);
          },
        });
      } catch (error) {
        console.error("❌ Failed to speak text:", error);
        setAgentStatus("listening");
        // Restart listening on error
        setTimeout(() => {
          if (currentCallRef.current?.status === "active" && !isMuted) {
            console.log("🎤 Restarting recognition after speak error");
            startRecognition();
          }
        }, 300);
      }
    },
    [
      knowledgeBase.selectedVoiceId,
      isSpeakerOn,
      startRecognition,
      stopRecognition,
      isMuted,
    ],
  );

  const handleUserInput = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        console.warn("⚠️ Empty text in handleUserInput");
        return;
      }

      console.log("💬 Processing user input:", text);

      // Clear pending transcript
      pendingTranscriptRef.current = "";
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      addMessage("user", text);
      onTranscript?.(text, "user");
      setCurrentTranscript("");
      setAgentStatus("processing");

      // Stop recognition while processing
      stopRecognition();

      try {
        // Use AI service to generate response
        console.log("🤖 Generating AI response...");
        const response = await aiService.generateResponse(
          text,
          messages,
          extractedFields,
        );

        console.log(
          "✅ AI response received:",
          response.text?.substring(0, 50) + "...",
        );

        // Update extracted fields
        if (response.extractedFields) {
          response.extractedFields.forEach((field) => {
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

        addMessage("agent", response.text);
        onTranscript?.(response.text, "agent");

        // Always try to speak the response
        console.log("🔊 Speaking AI response...");
        await speakText(response.text);
      } catch (error) {
        console.error("❌ Error processing user input:", error);
        setAgentStatus("listening");
        // Restart listening on error
        setTimeout(() => {
          if (currentCallRef.current?.status === "active" && !isMuted) {
            startRecognition();
          }
        }, 500);
      }
    },
    [
      addMessage,
      onTranscript,
      messages,
      extractedFields,
      updateExtractedField,
      setCallPriority,
      setCallCategory,
      speakText,
      stopRecognition,
      startRecognition,
      isMuted,
    ],
  );

  // Keep handleUserInputRef in sync (must be after handleUserInput is defined)
  useEffect(() => {
    handleUserInputRef.current = handleUserInput;
  }, [handleUserInput]);

  const handleStartCall = useCallback(async () => {
    try {
      console.log("🟢 Start call button clicked");

      // CRITICAL: Unlock audio playback FIRST (required by browser autoplay policies)
      // This MUST happen during the user gesture (click/tap) - especially important for mobile
      console.log("🔓 Unlocking audio (critical for mobile)...");
      try {
        await ttsService.unlockAudio();
        console.log("✅ Audio unlocked successfully");
      } catch (unlockError) {
        console.error("⚠️ Audio unlock warning (may still work):", unlockError);
        // Continue anyway - some browsers may still allow playback
      }

      // Reset AI conversation state for new call
      aiService.resetState();

      // Clear any pending transcripts
      pendingTranscriptRef.current = "";
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Start the call
      console.log("📞 Starting call...");
      startCall("voice");
      setAgentStatus("listening");

      // Start speech recognition immediately when call begins
      // Small delay to ensure state is updated
      setTimeout(() => {
        console.log("🎤 Starting speech recognition after call start...");
        startRecognition();
      }, 200);
    } catch (error) {
      console.error("❌ Error starting call:", error);
      setAgentStatus("idle");
    }
  }, [startCall, startRecognition]);

  const handleEndCall = useCallback(async () => {
    console.log("🔴 End call button pressed");

    // Clear any pending silence timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    pendingTranscriptRef.current = "";

    // Stop all TTS immediately
    ttsService.stop();

    // Directly cancel browser speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Stop speech recognition
    stopRecognition();
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      isRecognitionRunningRef.current = false;
    }

    setAgentStatus("idle");

    // Wait for AI summary to be generated before ending
    await endCall();

    setCurrentTranscript("");

    // Final TTS cleanup after a short delay
    setTimeout(() => {
      ttsService.stop();
      window.speechSynthesis?.cancel();
    }, 100);
  }, [endCall, stopRecognition]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      // Unmute - start listening
      if (currentCall?.status === "active") {
        setAgentStatus("listening");
        startRecognition();
      }
    } else {
      // Mute - stop listening
      stopRecognition();
    }
    setIsMuted(!isMuted);
  }, [isMuted, currentCall?.status, startRecognition, stopRecognition]);

  const isActive = currentCall?.status === "active";

  // Return the original Card-like UI
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-4 md:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden",
        isDark
          ? "bg-black/20 border border-white/10 backdrop-blur-md"
          : "bg-white/80 border border-black/10 backdrop-blur-md",
      )}
    >
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-40 md:w-64 h-40 md:h-64 bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 md:w-64 h-40 md:h-64 bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Logo/Avatar */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
          boxShadow: isActive
            ? [
                "0 0 0 0 rgba(59, 130, 246, 0)",
                "0 0 0 15px rgba(59, 130, 246, 0.1)",
                "0 0 0 0 rgba(59, 130, 246, 0)",
              ]
            : "none",
        }}
        transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        className={cn(
          "w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6",
          isDark
            ? "bg-black/30 border border-white/20"
            : "bg-white border border-black/10",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 464 468"
          className="w-10 h-10 md:w-16 md:h-16"
        >
          <path
            fill={isDark ? "white" : "black"}
            d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
          />
        </svg>
      </motion.div>

      {/* Title and Status */}
      <h2
        className={cn(
          "text-lg md:text-2xl font-semibold mb-1 md:mb-2",
          isDark ? "text-white" : "text-black",
        )}
      >
        AI Call Agent
      </h2>

      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p
              className={cn(
                "text-2xl md:text-3xl font-mono mb-1 md:mb-2",
                isDark ? "text-white" : "text-black",
              )}
            >
              {formatDuration(callDuration)}
            </p>
            <p
              className={cn(
                "text-xs md:text-sm capitalize px-2 md:px-3 py-0.5 md:py-1 rounded-full inline-block",
                agentStatus === "speaking" && "bg-blue-500/20 text-blue-400",
                agentStatus === "listening" && "bg-green-500/20 text-green-400",
                agentStatus === "processing" &&
                  "bg-yellow-500/20 text-yellow-400",
                agentStatus === "idle" &&
                  (isDark
                    ? "bg-white/10 text-white/60"
                    : "bg-black/10 text-black/60"),
              )}
            >
              {agentStatus}
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "text-sm md:text-base",
              isDark ? "text-white/60" : "text-black/60",
            )}
          >
            Ready to start a call
          </motion.p>
        )}
      </AnimatePresence>

      {/* Current transcript */}
      {currentTranscript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-3 md:mt-4 p-2 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm max-w-md text-center",
            isDark ? "bg-white/5 text-white/80" : "bg-black/5 text-black/80",
          )}
        >
          <span className="text-[10px] md:text-xs opacity-60 block mb-0.5 md:mb-1">
            Listening...
          </span>
          {currentTranscript}
        </motion.div>
      )}

      {/* Control buttons */}
      <div className="flex items-center gap-2 md:gap-4 mt-6 md:mt-8">
        {isActive && (
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
                    : "bg-blue-500/10 border border-blue-500/20 text-blue-600 hover:bg-blue-500/20",
              )}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Mic className="w-5 h-5 md:w-6 md:h-6" />
              )}
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
                    : "bg-gray-500/10 border border-gray-500/20 text-gray-600 hover:bg-gray-500/20",
              )}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          </>
        )}

        <button
          onClick={isActive ? handleEndCall : handleStartCall}
          className={cn(
            "p-4 md:p-5 rounded-xl md:rounded-2xl transition-all",
            isActive
              ? isDark
                ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                : "bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20"
              : isDark
                ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
                : "bg-green-500/10 border border-green-500/20 text-green-600 hover:bg-green-500/20",
          )}
        >
          {isActive ? (
            <PhoneOff className="w-6 h-6 md:w-8 md:h-8" />
          ) : (
            <Phone className="w-6 h-6 md:w-8 md:h-8" />
          )}
        </button>

        {isActive && (
          <button
            onClick={() =>
              setLanguage((prev) => (prev === "en-US" ? "de-DE" : "en-US"))
            }
            className={cn(
              "px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all",
              isDark
                ? "bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
                : "bg-purple-500/10 border border-purple-500/20 text-purple-600 hover:bg-purple-500/20",
            )}
          >
            {language === "en-US" ? "DE" : "EN"}
          </button>
        )}
      </div>
    </div>
  );
}
