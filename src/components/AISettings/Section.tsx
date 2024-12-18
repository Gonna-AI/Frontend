import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  const { isDark } = useTheme();

  return (
    <section className={cn(
      "rounded-xl p-6 relative overflow-hidden",
      isDark
        ? "bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl border border-white/10"
        : "bg-gradient-to-br from-black/5 via-black/20 to-black/5 backdrop-blur-xl border border-black/10"
    )}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className={cn(
          "text-xl font-semibold mb-4",
          isDark ? "text-white" : "text-black"
        )}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}