import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useTheme } from '../hooks/useTheme';
import { useCalendar } from '../hooks/useCalendar';
import CalendarHeader from './Calendar/CalendarHeader';
import MonthNavigator from './Calendar/MonthNavigator';
import CalendarGrid from './Calendar/CalendarGrid';

interface DatePickerProps {
  onClose: () => void;
}

export default function DatePicker({ onClose }: DatePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const { isDark } = useTheme();
  const { selectedDates, toggleDate } = useCalendar();

  return (
    <div className="p-4 md:p-6">
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
        onDateSelect={toggleDate}
      />
    </div>
  );
}