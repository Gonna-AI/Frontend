import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Filter, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { AVAILABLE_VOICES, normalizeVoiceId } from '../../config/voiceConfig';

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
  compact = false,
}: VoiceSelectorProps) {
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedSelectedVoiceId = normalizeVoiceId(selectedVoiceId);

  const filteredVoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return AVAILABLE_VOICES.filter((voice) => {
      if (genderFilter !== 'all' && voice.gender !== genderFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        voice.name.toLowerCase().includes(query) ||
        voice.id.toLowerCase().includes(query) ||
        voice.description.toLowerCase().includes(query)
      );
    });
  }, [genderFilter, searchQuery]);

  return (
    <div
      className={cn(
        'rounded-xl border min-h-[400px] flex flex-col',
        isDark ? 'bg-[#09090B] border-white/10 text-white' : 'bg-white border-black/10 text-black',
      )}
    >
      <div
        className={cn(
          'p-4 border-b flex flex-wrap items-center gap-4',
          isDark ? 'border-white/5' : 'border-black/5',
        )}
      >
        <div className="flex items-center gap-2 mr-2">
          <Filter className={cn('w-4 h-4', isDark ? 'text-white/40' : 'text-black/40')} />
          <span className={cn('text-xs uppercase font-bold tracking-wider opacity-50')}>Groq Voices</span>
        </div>

        <div
          className={cn(
            'flex rounded-lg p-1 gap-1 border',
            isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5',
          )}
        >
          {(['all', 'female', 'male'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => setGenderFilter(gender)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-all capitalize',
                genderFilter === gender
                  ? isDark
                    ? 'bg-white/10 text-white shadow-sm border border-white/10'
                    : 'bg-white text-black shadow-sm border border-black/10'
                  : isDark
                    ? 'text-white/40 hover:text-white'
                    : 'text-black/40 hover:text-black',
              )}
            >
              {gender}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px] flex-1 max-w-xs">
          <Search className={cn('w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2', isDark ? 'text-white/40' : 'text-black/40')} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search voices..."
            className={cn(
              'w-full pl-9 pr-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-1',
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-white/30'
                : 'bg-gray-50 border-gray-200 text-black placeholder:text-black/40 focus:ring-gray-300',
            )}
          />
        </div>

        <div className="text-right text-xs opacity-40 font-mono">
          {filteredVoices.length} voice{filteredVoices.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className={cn('p-6 overflow-y-auto custom-scrollbar flex-1', compact ? 'max-h-[300px]' : 'max-h-[500px]')}>
        {filteredVoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-40">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="font-medium">No Groq voices match your filters</p>
            <button
              onClick={() => {
                setGenderFilter('all');
                setSearchQuery('');
              }}
              className="text-xs underline mt-2 hover:opacity-80"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3')}>
            <AnimatePresence mode="popLayout">
              {filteredVoices.map((voice) => {
                const isSelected = normalizedSelectedVoiceId === voice.id;

                return (
                  <motion.button
                    type="button"
                    key={voice.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={() => onVoiceSelect(voice.id)}
                    className={cn(
                      'relative group rounded-xl p-4 transition-all border text-left',
                      isSelected
                        ? isDark
                          ? 'bg-white/[0.08] border-white/20 text-white shadow-lg shadow-black/20'
                          : 'bg-black/[0.03] border-black/20 text-black'
                        : isDark
                          ? 'bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10'
                          : 'bg-transparent border-black/5 hover:bg-black/5 hover:border-black/10',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg border',
                          isDark ? 'bg-[#18181B] border-white/5' : 'bg-white border-black/5',
                        )}
                      >
                        {voice.gender === 'female' ? '👩' : '👨'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">{voice.name}</h4>
                          {isSelected && (
                            <div className="bg-emerald-500/20 rounded-full p-0.5">
                              <Check className="w-3 h-3 text-emerald-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs opacity-60 line-clamp-2 mb-2">{voice.description}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-medium opacity-70',
                              isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5',
                            )}
                          >
                            {voice.id}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-medium opacity-60',
                              isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5',
                            )}
                          >
                            {voice.gender}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
