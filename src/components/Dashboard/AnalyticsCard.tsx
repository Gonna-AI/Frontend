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
      "p-6 rounded-xl relative z-10",
      isDark
        ? "bg-white/5 backdrop-blur-lg border border-white/10"
        : "bg-black/5 backdrop-blur-lg border border-black/10"
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className={isDark ? "text-sm text-white/60" : "text-sm text-black/60"}>{title}</p>
          <h3 className={cn(
            "text-2xl font-bold mt-1",
            isDark ? "text-white" : "text-black"
          )}>{value}</h3>
        </div>
        <Icon className={isDark ? "w-6 h-6 text-white/60" : "w-6 h-6 text-black/60"} />
      </div>
      <div className={cn(
        "mt-2 text-sm",
        isPositive ? "text-green-500" : "text-red-500"
      )}>
        {isPositive ? '+' : ''}{change}% from last month
      </div>
    </div>
  );
}