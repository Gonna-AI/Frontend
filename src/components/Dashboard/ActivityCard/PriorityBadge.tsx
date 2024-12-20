import React from 'react';
import { cn } from '../../../utils/cn';
import { useTheme } from '../../../hooks/useTheme';

const priorityConfig = {
  high: {
    color: 'text-red-400',
    bg: 'bg-red-500/20'
  },
  medium: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20'
  },
  low: {
    color: 'text-green-400',
    bg: 'bg-green-500/20'
  }
} as const;

interface PriorityBadgeProps {
  priority: keyof typeof priorityConfig;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { isDark } = useTheme();
  const config = priorityConfig[priority];

  return (
    <div className={cn(
      "px-3 py-1 rounded-full text-xs font-medium",
      config.bg,
      config.color
    )}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </div>
  );
}