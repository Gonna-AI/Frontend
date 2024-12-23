import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { Sparkles, Clock } from 'lucide-react';

interface ComingSoonProps {
  feature: string;
}

export default function ComingSoon({ feature }: ComingSoonProps) {
  const { isDark } = useTheme();
  
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-blue-500/20 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className={cn(
          "relative z-10",
          "p-8 md:p-12",
          "rounded-3xl",
          "bg-gradient-to-br from-white/10 via-white/5 to-transparent",
          "border border-white/20",
          "backdrop-blur-xl",
          "text-center",
          "overflow-hidden"
        )}>
          {/* Sparkle effects */}
          <div className="absolute top-0 right-0 opacity-50">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div className="absolute bottom-0 left-0 opacity-50">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>

          {/* Icon */}
          <div className="mb-6 inline-flex">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          {/* Content */}
          <h2 className={cn(
            "text-3xl font-bold mb-4",
            isDark ? "text-white" : "text-black"
          )}>
            {feature}
          </h2>
          
          <p className={cn(
            "text-lg mb-6",
            isDark ? "text-white/60" : "text-black/60"
          )}>
            We're working on something amazing
          </p>

          {/* Decorative line */}
          <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-blue-500/50 to-purple-500/50" />
        </div>
      </div>
    </div>
  );
}