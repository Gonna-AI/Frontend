import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

interface CalendarHeaderProps {
  isEditing: boolean;
  onEditToggle: () => void;
  onClose: () => void;
}

export default function CalendarHeader({ isEditing, onEditToggle, onClose }: CalendarHeaderProps) {
  const { isDark } = useTheme();

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className={cn(
        "text-lg font-semibold",
        isDark ? "text-white" : "text-black"
      )}>
        Calendar
      </h2>
      <div className="flex items-center space-x-2">
        <button
          onClick={onEditToggle}
          className={cn(
            "px-3 py-1 rounded-lg text-sm transition-all",
            isDark
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-black/10 hover:bg-black/20 text-black"
          )}
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
        <button onClick={onClose}>
          <X className={cn("w-5 h-5", isDark ? "text-white/60" : "text-black/60")} />
        </button>
      </div>
    </div>
  );
}