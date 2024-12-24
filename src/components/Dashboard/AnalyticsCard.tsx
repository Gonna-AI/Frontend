import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
}

export default function AnalyticsCard({ title, value, change, icon: Icon }: AnalyticsCardProps) {
  const isPositive = change > 0;
  const { isDark } = useTheme();

  return (
    <div className={cn(
      "relative overflow-hidden",
      "rounded-xl p-6",
      isDark 
        ? "bg-black/40 border border-white/[0.08]" 
        : "bg-white/40 border border-black/[0.08]",
      "backdrop-blur-xl",
      "transition-all duration-200",
      "hover:shadow-lg",
      isDark 
        ? "hover:bg-black/50 hover:border-white/[0.12]" 
        : "hover:bg-white/50 hover:border-black/[0.12]"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className={cn(
            "text-sm font-medium",
            isDark ? "text-white/60" : "text-black/60"
          )}>
            {title}
          </p>
          <h3 className={cn(
            "text-2xl font-semibold",
            isDark ? "text-white" : "text-black"
          )}>
            {value}
          </h3>
        </div>
        
        <div className={cn(
          "p-2 rounded-lg",
          isDark
            ? "bg-white/[0.06] text-white/70"
            : "bg-black/[0.06] text-black/70"
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn(
          "text-sm font-medium",
          isPositive ? "text-emerald-500" : "text-red-500"
        )}>
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className={cn(
          "text-sm",
          isDark ? "text-white/40" : "text-black/40"
        )}>
          vs last month
        </span>
      </div>
    </div>
  );
}