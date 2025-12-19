import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { getDaysInMonth } from '../../utils/date';

interface CalendarGridProps {
  currentDate: Date;
  selectedDates: Set<string>;
  isEditing: boolean;
  onDateSelect: (dateStr: string) => void;
}

export default function CalendarGrid({ 
  currentDate, 
  selectedDates, 
  isEditing, 
  onDateSelect 
}: CalendarGridProps) {
  const { isDark } = useTheme();
  const { daysInMonth, firstDay } = getDaysInMonth(currentDate);
  const days = [...Array(daysInMonth)].map((_, i) => i + 1);
  const padding = [...Array(firstDay)].map((_, i) => null);

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
        <div key={day} className={cn(
          "text-center text-sm py-1",
          isDark ? "text-white/60" : "text-black/60"
        )}>
          {day}
        </div>
      ))}
      
      {[...padding, ...days].map((day, i) => (
        <div key={i} className="aspect-square">
          {day && (
            <button
              onClick={() => isEditing && onDateSelect(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`)}
              className={cn(
                "w-full h-full flex items-center justify-center rounded-lg text-sm transition-all relative",
                selectedDates.has(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`)
                  ? isDark
                    ? "bg-red-500/20 text-white"
                    : "bg-red-500/20 text-black"
                  : isDark
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-black/10 text-black"
              )}
            >
              {day}
              {selectedDates.has(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[1px] bg-red-500 rotate-45 transform origin-center"></div>
                </div>
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}