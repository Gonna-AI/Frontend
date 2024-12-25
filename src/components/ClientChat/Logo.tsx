import React from 'react';
import { GalleryVerticalEnd } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { Particles } from '../Landing/Particles';

export default function Logo() {
  const { isDark } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg",
        "backdrop-blur-sm relative overflow-hidden",
        isDark ? "bg-white/5" : "bg-black/5"
      )}>
        <div className="relative size-6">
          <Particles
            className="absolute inset-0"
            quantity={20}
            size={0.4}
            color={isDark ? "#ffffff" : "#000000"}
            ease={20}
          />
        </div>
        <span className="font-bold text-xl relative z-10">gonna.ai</span>
      </div>
    </div>
  );
}