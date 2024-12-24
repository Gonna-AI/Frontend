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
      "p-6 rounded-xl relative group transition-all duration-200",
      "border",
      isDark 
        ? "bg-white/5 hover:bg-white/[0.07] border-white/10" 
        : "bg-black/5 hover:bg-black/[0.07] border-black/10",
      "backdrop-blur-lg"
    )}>
      {/* Content */}
      <div className="flex justify-between items-start">
        <div>
          <p className={cn(
            "text-sm font-medium",
            isDark ? "text-white/60" : "text-black/60"
          )}>
            {title}
          </p>
          <h3 className={cn(
            "text-2xl font-bold mt-1",
            isDark ? "text-white/90" : "text-black"
          )}>
            {value}
          </h3>
        </div>
        
        <div className={cn(
          "p-2 rounded-lg transition-colors",
          isDark
            ? "bg-white/5 group-hover:bg-white/10"
            : "bg-black/5 group-hover:bg-black/10"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            isDark ? "text-white/60" : "text-black/60"
          )} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <span className={cn(
          "text-sm font-medium",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}>
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className={cn(
          "text-sm",
          isDark ? "text-white/40" : "text-black/40"
        )}>
          from last month
        </span>
      </div>
    </div>
  );
}