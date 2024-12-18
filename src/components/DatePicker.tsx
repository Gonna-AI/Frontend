import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export default function DatePicker({ onClose }: { onClose: () => void }) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());

  const addOrRemoveDate = (dateStr: string) => {
    const newDates = new Set(selectedDates);
    if (newDates.has(dateStr)) {
      newDates.delete(dateStr);
    } else {
      newDates.add(dateStr);
    }
    setSelectedDates(newDates);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay };
  };

  const { daysInMonth, firstDay } = getDaysInMonth(currentDate);
  const days = [...Array(daysInMonth)].map((_, i) => i + 1);
  const padding = [...Array(firstDay)].map((_, i) => null);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Select a date to view your schedule.
        </h2>
        <ExternalLink 
          className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer"
          onClick={onClose}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
          <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm text-gray-500 dark:text-gray-400 py-1">
            {day}
          </div>
        ))}
        
        {[...padding, ...days].map((day, i) => (
          <div key={i} className="aspect-square">
            {day && (
              <button
                onClick={() => addOrRemoveDate(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`)}
                className={`w-full h-full flex items-center justify-center rounded-full text-sm
                  ${selectedDates.has(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`)
                    ? 'bg-red-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}