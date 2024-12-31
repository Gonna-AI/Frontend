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
  const { 
    selectedDates, 
    toggleDate, 
    isLoading, 
    error, 
    saveDates 
  } = useCalendar();
  const [tempSelectedDates, setTempSelectedDates] = useState<Set<string>>(new Set());

  // Handle edit toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Calculate dates to add and remove
      const datesToAdd = [...tempSelectedDates].filter(date => !selectedDates.has(date));
      const datesToRemove = [...selectedDates].filter(date => !tempSelectedDates.has(date));

      saveDates(datesToAdd, datesToRemove);
      onClose();
    } else {
      // Enter editing mode
      setTempSelectedDates(new Set(selectedDates));
    }
    setIsEditing(!isEditing);
  };

  // Handle temporary date selection during editing
  const handleDateSelect = (dateStr: string) => {
    const newTempDates = new Set(tempSelectedDates);
    if (newTempDates.has(dateStr)) {
      newTempDates.delete(dateStr);
    } else {
      newTempDates.add(dateStr);
    }
    setTempSelectedDates(newTempDates);
  };

  return (
    <div className="p-4 md:p-6">
      <CalendarHeader
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
        onClose={onClose}
        isLoading={isLoading}
      />
      <MonthNavigator
        currentDate={currentDate}
        onMonthChange={setCurrentDate}
      />
      <CalendarGrid
        currentDate={currentDate}
        selectedDates={isEditing ? tempSelectedDates : selectedDates}
        isEditing={isEditing}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
}