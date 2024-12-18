import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

interface MonthNavigatorProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export default function MonthNavigator({ currentDate, onMonthChange }: MonthNavigatorProps) {
  const { isDark } = useTheme();

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + delta);
    onMonthChange(newDate);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <button onClick={() => changeMonth(-1)}>
        <ChevronLeft className={isDark ? "text-white/60" : "text-black/60"} />
      </button>
      <span className={isDark ? "text-white" : "text-black"}>
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </span>
      <button onClick={() => changeMonth(1)}>
        <ChevronRight className={isDark ? "text-white/60" : "text-black/60"} />
      </button>
    </div>
  );
}