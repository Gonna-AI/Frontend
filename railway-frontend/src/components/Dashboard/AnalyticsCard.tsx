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
        ? "bg-black/20 border border-white/10" 
        : "bg-white/10 border border-black/10",
      "transition-all duration-200",
      "hover:shadow-lg",
      isDark 
        ? "hover:bg-black/30" 
        : "hover:bg-white/20"
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
            ? "bg-black/20 border border-white/10" 
            : "bg-white/10 border border-black/10"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            isDark ? "text-white/70" : "text-black/70"
          )} />
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
          isDark ? "text-white/60" : "text-black/60"
        )}>
          vs last month
        </span>
      </div>
    </div>
  );
}