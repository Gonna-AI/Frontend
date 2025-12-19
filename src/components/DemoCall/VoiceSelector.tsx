import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  User, 
  Check, 
  Loader2,
  Mic,
  Save,
  RefreshCw,
  Filter
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { 
  AVAILABLE_VOICES, 
  VoiceConfig, 
  DEFAULT_VOICE_ID,
  VOICE_SAMPLES_BUCKET 
} from '../../config/voiceConfig';
import { supabase } from '../../config/supabase';

interface VoiceSelectorProps {
  isDark?: boolean;
  selectedVoiceId: string;
  onVoiceSelect: (voiceId: string) => void;
  onSave?: (voiceId: string) => void;
  compact?: boolean;
}

export default function VoiceSelector({ 
  isDark = true, 
  selectedVoiceId, 
  onVoiceSelect,
  onSave,
  compact = false
}: VoiceSelectorProps) {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [accentFilter, setAccentFilter] = useState<'all' | 'American' | 'British'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter voices
  const filteredVoices = AVAILABLE_VOICES.filter(voice => {
    if (genderFilter !== 'all' && voice.gender !== genderFilter) return false;
    if (accentFilter !== 'all' && voice.accent !== accentFilter) return false;
    return true;
  });

  // Get sample URL from Supabase Storage
  const getAudioUrl = (voiceId: string): string => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${VOICE_SAMPLES_BUCKET}/voice_${voiceId}.wav`;
  };

  // Play voice sample
  const playVoiceSample = async (voiceId: string) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking same voice, just stop
    if (playingVoiceId === voiceId) {
      setPlayingVoiceId(null);
      return;
    }

    setLoadingVoiceId(voiceId);

    try {
      const audioUrl = getAudioUrl(voiceId);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        setLoadingVoiceId(null);
        setPlayingVoiceId(voiceId);
        audio.play();
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
      };

      audio.onerror = () => {
        setLoadingVoiceId(null);
        setPlayingVoiceId(null);
        console.error('Error loading audio for voice:', voiceId);
      };

      audio.load();
    } catch (error) {
      setLoadingVoiceId(null);
      console.error('Error playing voice sample:', error);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(selectedVoiceId);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving voice selection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const getGenderIcon = (gender: 'male' | 'female') => {
    return gender === 'female' ? '👩' : '👨';
  };

  const getAccentFlag = (accent: 'American' | 'British') => {
    return accent === 'American' ? '🇺🇸' : '🇬🇧';
  };

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden",
      isDark 
        ? "bg-black/20 border border-white/10" 
        : "bg-white/80 border border-black/10"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b",
        isDark ? "border-white/10" : "border-black/10"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isDark 
              ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10" 
              : "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-black/10"
          )}>
            <Mic className={cn(
              "w-5 h-5",
              isDark ? "text-indigo-400" : "text-indigo-600"
            )} />
          </div>
          <div>
            <h3 className={cn(
              "font-semibold",
              isDark ? "text-white" : "text-black"
            )}>
              AI Voice Selection
            </h3>
            <p className={cn(
              "text-xs",
              isDark ? "text-white/50" : "text-black/50"
            )}>
              Choose the voice for your AI agent
            </p>
          </div>
        </div>

        {onSave && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              saveSuccess
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : isDark 
                  ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30" 
                  : "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-500/20"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? 'Saved!' : 'Save Selection'}
          </button>
        )}
      </div>

      {/* Filters */}
      {!compact && (
        <div className={cn(
          "flex flex-wrap items-center gap-3 px-4 py-3 border-b",
          isDark ? "border-white/10" : "border-black/10"
        )}>
          <div className="flex items-center gap-2">
            <Filter className={cn(
              "w-4 h-4",
              isDark ? "text-white/40" : "text-black/40"
            )} />
            <span className={cn(
              "text-xs",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              Filter:
            </span>
          </div>

          {/* Gender filter */}
          <div className="flex gap-1">
            {(['all', 'female', 'male'] as const).map(gender => (
              <button
                key={gender}
                onClick={() => setGenderFilter(gender)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                  genderFilter === gender
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-black/10 text-black"
                    : isDark
                      ? "text-white/50 hover:text-white/80 hover:bg-white/5"
                      : "text-black/50 hover:text-black/80 hover:bg-black/5"
                )}
              >
                {gender === 'all' ? 'All' : gender === 'female' ? '👩 Female' : '👨 Male'}
              </button>
            ))}
          </div>

          <div className={cn(
            "w-px h-4",
            isDark ? "bg-white/10" : "bg-black/10"
          )} />

          {/* Accent filter */}
          <div className="flex gap-1">
            {(['all', 'American', 'British'] as const).map(accent => (
              <button
                key={accent}
                onClick={() => setAccentFilter(accent)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                  accentFilter === accent
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-black/10 text-black"
                    : isDark
                      ? "text-white/50 hover:text-white/80 hover:bg-white/5"
                      : "text-black/50 hover:text-black/80 hover:bg-black/5"
                )}
              >
                {accent === 'all' ? 'All Accents' : accent === 'American' ? '🇺🇸 US' : '🇬🇧 UK'}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <span className={cn(
            "text-xs",
            isDark ? "text-white/40" : "text-black/40"
          )}>
            {filteredVoices.length} voice{filteredVoices.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Voice Grid */}
      <div className={cn(
        "p-4 overflow-y-auto custom-scrollbar",
        compact ? "max-h-[300px]" : "max-h-[400px]"
      )}>
        <div className={cn(
          "grid gap-3",
          compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}>
          <AnimatePresence mode="popLayout">
            {filteredVoices.map((voice) => {
              const isSelected = selectedVoiceId === voice.id;
              const isPlaying = playingVoiceId === voice.id;
              const isLoading = loadingVoiceId === voice.id;

              return (
                <motion.div
                  key={voice.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "relative group rounded-xl p-4 transition-all cursor-pointer",
                    isSelected
                      ? isDark
                        ? "bg-indigo-500/20 border-2 border-indigo-500/50"
                        : "bg-indigo-500/10 border-2 border-indigo-500/40"
                      : isDark
                        ? "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                        : "bg-black/5 border border-black/10 hover:bg-black/10 hover:border-black/20"
                  )}
                  onClick={() => onVoiceSelect(voice.id)}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
                      voice.gender === 'female'
                        ? isDark 
                          ? "bg-pink-500/20 border border-pink-500/30" 
                          : "bg-pink-500/10 border border-pink-500/20"
                        : isDark
                          ? "bg-blue-500/20 border border-blue-500/30"
                          : "bg-blue-500/10 border border-blue-500/20"
                    )}>
                      {getGenderIcon(voice.gender)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          "font-semibold",
                          isDark ? "text-white" : "text-black"
                        )}>
                          {voice.name}
                        </h4>
                        <span className="text-sm">{getAccentFlag(voice.accent)}</span>
                      </div>
                      
                      <p className={cn(
                        "text-xs mt-0.5 line-clamp-2",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>
                        {voice.description}
                      </p>

                      {/* Tags */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          voice.gender === 'female'
                            ? isDark
                              ? "bg-pink-500/20 text-pink-400"
                              : "bg-pink-500/10 text-pink-600"
                            : isDark
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-blue-500/10 text-blue-600"
                        )}>
                          {voice.gender}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          isDark
                            ? "bg-white/10 text-white/70"
                            : "bg-black/10 text-black/70"
                        )}>
                          {voice.accent}
                        </span>
                      </div>
                    </div>

                    {/* Play button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoiceSample(voice.id);
                      }}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                        isPlaying
                          ? "bg-indigo-500 text-white"
                          : isDark
                            ? "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                            : "bg-black/10 text-black/70 hover:bg-black/20 hover:text-black"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Playing indicator */}
                  {isPlaying && (
                    <div className="absolute bottom-2 left-4 right-4">
                      <div className="flex items-center gap-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={cn(
                              "w-1 rounded-full",
                              isDark ? "bg-indigo-400" : "bg-indigo-500"
                            )}
                            animate={{
                              height: [4, 16, 4],
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredVoices.length === 0 && (
          <div className={cn(
            "text-center py-12",
            isDark ? "text-white/40" : "text-black/40"
          )}>
            <VolumeX className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No voices match your filters</p>
            <button
              onClick={() => {
                setGenderFilter('all');
                setAccentFilter('all');
              }}
              className={cn(
                "mt-3 flex items-center gap-2 mx-auto px-3 py-1.5 rounded-lg text-sm transition-colors",
                isDark
                  ? "text-white/60 hover:text-white hover:bg-white/10"
                  : "text-black/60 hover:text-black hover:bg-black/10"
              )}
            >
              <RefreshCw className="w-4 h-4" />
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        "px-4 py-3 border-t",
        isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className={cn(
              "w-4 h-4",
              isDark ? "text-white/40" : "text-black/40"
            )} />
            <span className={cn(
              "text-xs",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              Selected: <span className={cn(
                "font-medium",
                isDark ? "text-white" : "text-black"
              )}>
                {AVAILABLE_VOICES.find(v => v.id === selectedVoiceId)?.name || 'None'}
              </span>
            </span>
          </div>
          
          <span className={cn(
            "text-xs",
            isDark ? "text-white/40" : "text-black/40"
          )}>
            Click to preview • Double-click to select
          </span>
        </div>
      </div>
    </div>
  );
}

