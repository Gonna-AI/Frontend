import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useTheme } from '../hooks/useTheme';
import CalendarHeader from './Calendar/CalendarHeader';
import MonthNavigator from './Calendar/MonthNavigator';
import CalendarGrid from './Calendar/CalendarGrid';

interface DatePickerProps {
  onClose: () => void;
}

export default function DatePicker({ onClose }: DatePickerProps) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const { isDark } = useTheme();

  const handleDateSelect = (dateStr: string) => {
    const newDates = new Set(selectedDates);
    if (newDates.has(dateStr)) {
      newDates.delete(dateStr);
    } else {
      newDates.add(dateStr);
    }
    setSelectedDates(newDates);
  };

  return (
    <div className={cn(
      "p-6 rounded-xl shadow-xl w-80",
      isDark
        ? "bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-lg border border-white/10"
        : "bg-gradient-to-br from-black/5 via-black/10 to-black/5 backdrop-blur-lg border border-black/10"
    )}>
      <CalendarHeader
        isEditing={isEditing}
        onEditToggle={() => setIsEditing(!isEditing)}
        onClose={onClose}
      />
      <MonthNavigator
        currentDate={currentDate}
        onMonthChange={setCurrentDate}
      />
      <CalendarGrid
        currentDate={currentDate}
        selectedDates={selectedDates}
        isEditing={isEditing}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
}