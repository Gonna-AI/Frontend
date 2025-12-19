import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useTheme } from '../../../hooks/useTheme';

interface AudioPlayerProps {
  duration: string;
}

export default function AudioPlayer({ duration }: AudioPlayerProps) {
  const { isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className={cn(
      "p-4 rounded-lg",
      isDark ? "bg-white/5" : "bg-black/5"
    )}>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            isDark
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-black/10 hover:bg-black/20 text-black"
          )}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span className={isDark ? "text-white/60" : "text-black/60"}>
              Call Recording
            </span>
          </div>
          <div className="relative">
            <div className={cn(
              "h-1 rounded-full",
              isDark ? "bg-white/10" : "bg-black/10"
            )}>
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span className={isDark ? "text-white/40" : "text-black/40"}>
              {duration}
            </span>
            <span className={isDark ? "text-white/40" : "text-black/40"}>
              {duration}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}