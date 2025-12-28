import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Check,
  Loader2,
  RefreshCw,
  Filter,
  Search
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
      isDark ? "bg-[#09090B] border-white/10 text-white" : "bg-white border-black/10 text-black"
    )}>
      {/* Toolbar / Filters */}
      <div className={cn(
        "p-4 border-b flex flex-wrap items-center gap-4",
        isDark ? "border-white/5" : "border-black/5"
      )}>
        <div className="flex items-center gap-2 mr-2">
          <Filter className={cn("w-4 h-4", isDark ? "text-white/40" : "text-black/40")} />
          <span className={cn("text-xs uppercase font-bold tracking-wider opacity-50")}>Filters</span>
        </div>

        {/* Gender Filter */}
        <div className={cn("flex rounded-lg p-1 gap-1 border", isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5")}>
          {(['all', 'male', 'female'] as const).map(gender => (
            <button
              key={gender}
              onClick={() => setGenderFilter(gender)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all capitalize",
                genderFilter === gender
                  ? (isDark ? "bg-white/10 text-white shadow-sm border border-white/10" : "bg-white text-black shadow-sm border border-black/10")
                  : (isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black")
              )}
            >
              {gender}
            </button>
          ))}
        </div>

        <div className={cn("w-px h-6", isDark ? "bg-white/10" : "bg-black/10")} />

        {/* Accent Filter */}
        <div className={cn("flex rounded-lg p-1 gap-1 border", isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5")}>
          {(['all', 'American', 'British'] as const).map(accent => (
            <button
              key={accent}
              onClick={() => setAccentFilter(accent)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                accentFilter === accent
                  ? (isDark ? "bg-white/10 text-white shadow-sm border border-white/10" : "bg-white text-black shadow-sm border border-black/10")
                  : (isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black")
              )}
            >
              {accent === 'all' ? 'All Accents' : accent}
            </button>
          ))}
        </div>

        <div className="flex-1 text-right text-xs opacity-40 font-mono">
          {filteredVoices.length} voice{filteredVoices.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Voice Grid */}
      <div className={cn(
        "p-6 overflow-y-auto custom-scrollbar flex-1",
        compact ? "max-h-[300px]" : "max-h-[500px]"
      )}>
        {filteredVoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-40">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="font-medium">No voices match your filters</p>
            <button onClick={() => { setGenderFilter('all'); setAccentFilter('all'); }} className="text-xs underline mt-2 hover:opacity-80">Reset All Filters</button>
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
                      "relative group rounded-xl p-4 transition-all cursor-pointer border flex items-start gap-4 hover:shadow-md",
                      isSelected
                        ? (isDark
                          ? "bg-white/[0.08] border-white/20 text-white shadow-lg shadow-black/20"
                          : "bg-black/[0.03] border-black/20 text-black")
                        : (isDark
                          ? "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
                          : "bg-transparent border-black/5 hover:bg-black/5 hover:border-black/10")
                    )}
                  >
                    {/* Left: Avatar/Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm border",
                      isDark ? "bg-[#18181B] border-white/5" : "bg-white border-black/5"
                    )}>
                      {voice.gender === 'female' ? '👩' : '👨'}
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{voice.name}</h4>
                        {isSelected && (
                          <div className="bg-emerald-500/20 rounded-full p-0.5">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs opacity-60 line-clamp-1 mb-2.5">{voice.description}</p>

                      <div className="flex gap-2">
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-medium opacity-60",
                          isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"
                        )}>
                          {voice.gender}
                        </span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-medium opacity-60",
                          isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"
                        )}>
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
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-sm border",
                        isPlaying
                          ? "bg-indigo-500 border-indigo-600 text-white scale-105"
                          : (isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white/80" : "bg-white border-gray-100 hover:bg-gray-50 text-gray-700")
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5 fill-current opacity-80" />
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
