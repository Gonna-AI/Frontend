import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Check,
  Loader2,
  RefreshCw,
  Filter
} from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  AVAILABLE_VOICES,
  VOICE_SAMPLES_BUCKET
} from '../../config/voiceConfig';

interface VoiceSelectorProps {
  isDark?: boolean;
  selectedVoiceId: string;
  onVoiceSelect: (voiceId: string) => void;
  onSave?: (voiceId: string) => void; // Kept for compatibility but unused in UI
  compact?: boolean;
}

export default function VoiceSelector({
  isDark = true,
  selectedVoiceId,
  onVoiceSelect,
  // onSave, // Removed save button from UI as per design request
  compact = false
}: VoiceSelectorProps) {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [accentFilter, setAccentFilter] = useState<'all' | 'American' | 'British'>('all');
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const getAccentFlag = (accent: 'American' | 'British') => {
    return accent === 'American' ? '🇺🇸' : '🇬🇧';
  };

  return (
    <div className={cn(
      "rounded-xl border min-h-[400px] flex flex-col",
      isDark ? "bg-black/40 border-white/10 text-white" : "bg-white border-black/10 text-black"
    )}>
      {/* Toolbar / Filters */}
      <div className={cn(
        "p-4 border-b flex flex-wrap items-center gap-4",
        isDark ? "border-white/5" : "border-black/5"
      )}>
        <div className="flex items-center gap-2">
          <Filter className={cn("w-4 h-4", isDark ? "text-white/40" : "text-black/40")} />
          <span className={cn("text-xs uppercase font-bold tracking-wider opacity-50")}>Filters</span>
        </div>

        {/* Gender Filter */}
        <div className="flex bg-white/5 rounded-lg p-1 gap-1">
          {(['all', 'male', 'female'] as const).map(gender => (
            <button
              key={gender}
              onClick={() => setGenderFilter(gender)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all capitalize",
                genderFilter === gender
                  ? isDark ? "bg-white/20 text-white shadow-sm" : "bg-black/10 text-black"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              {gender}
            </button>
          ))}
        </div>

        <div className={cn("w-px h-4", isDark ? "bg-white/10" : "bg-black/10")} />

        {/* Accent Filter */}
        <div className="flex bg-white/5 rounded-lg p-1 gap-1">
          {(['all', 'American', 'British'] as const).map(accent => (
            <button
              key={accent}
              onClick={() => setAccentFilter(accent)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                accentFilter === accent
                  ? isDark ? "bg-white/20 text-white shadow-sm" : "bg-black/10 text-black"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              {accent === 'all' ? 'All Accents' : accent}
            </button>
          ))}
        </div>

        <div className="flex-1 text-right text-xs opacity-40">
          {filteredVoices.length} voice{filteredVoices.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Voice Grid */}
      <div className={cn(
        "p-6 overflow-y-auto custom-scrollbar flex-1",
        compact ? "max-h-[300px]" : "max-h-[500px]"
      )}>
        {filteredVoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-40">
            <RefreshCw className="w-8 h-8 mb-2" />
            <p>No voices match your filters</p>
            <button onClick={() => { setGenderFilter('all'); setAccentFilter('all'); }} className="text-xs underline mt-2 hover:opacity-80">Reset Filters</button>
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
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
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={() => onVoiceSelect(voice.id)}
                    className={cn(
                      "relative group rounded-xl p-4 transition-all cursor-pointer border flex items-start gap-4",
                      isSelected
                        ? isDark
                          ? "bg-white/10 border-white text-white shadow-lg"
                          : "bg-black/5 border-black text-black"
                        : isDark
                          ? "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
                          : "bg-transparent border-black/5 hover:bg-black/5 hover:border-black/10"
                    )}
                  >
                    {/* Left: Avatar/Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg",
                      isDark ? "bg-white/10" : "bg-black/5"
                    )}>
                      {voice.gender === 'female' ? '👩' : '👨'}
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{voice.name}</h4>
                        {isSelected && <Check className="w-3.5 h-3.5 text-green-400" />}
                      </div>
                      <p className="text-xs opacity-60 line-clamp-1 mb-2">{voice.description}</p>

                      <div className="flex gap-2">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider opacity-60", isDark ? "border-white/20" : "border-black/20")}>
                          {voice.gender}
                        </span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider opacity-60", isDark ? "border-white/20" : "border-black/20")}>
                          {getAccentFlag(voice.accent)} {voice.accent}
                        </span>
                      </div>
                    </div>

                    {/* Right: Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoiceSample(voice.id);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                        isPlaying
                          ? "bg-indigo-500 text-white"
                          : isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 ml-0.5 opacity-60 group-hover:opacity-100" />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
