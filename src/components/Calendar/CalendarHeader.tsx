import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { useCalendar } from '../../hooks/useCalendar';

interface CalendarHeaderProps {
  isEditing: boolean;
  onEditToggle: () => void;
  onClose: () => void;
}

export default function CalendarHeader({ isEditing, onEditToggle, onClose }: CalendarHeaderProps) {
  const { isDark } = useTheme();
  const { selectedDates, clearAllDates } = useCalendar();
  const [showWarning, setShowWarning] = useState(false);

  // Function to handle clear all action
  const handleClearAll = () => {
    setShowWarning(true);
  };

  // Function to confirm and clear all dates
  const confirmClearAll = () => {
    clearAllDates();
    setShowWarning(false);

    // API call to clear dates (commented out for future use)
    /*
    try {
      await api.post('/api/calendar/clear', {
        // Add any necessary payload
      });
    } catch (error) {
      console.error('Failed to clear dates:', error);
      // Handle error appropriately
    }
    */
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className={cn(
          "text-lg font-semibold",
          isDark ? "text-white" : "text-black"
        )}>
          Calendar
        </h2>
        <div className="flex items-center space-x-2">
          {selectedDates.size > 0 && (
            <button
              onClick={handleClearAll}
              className={cn(
                "px-3 py-1 rounded-lg text-sm transition-all flex items-center gap-2",
                isDark
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
              )}
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
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
            <X className={cn(
              "w-5 h-5",
              isDark ? "text-white/60" : "text-black/60"
            )} />
          </button>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={cn(
            "p-6 rounded-xl max-w-sm w-full mx-4",
            isDark 
              ? "bg-black/90 border border-white/10" 
              : "bg-white/90 border border-black/10",
            "backdrop-blur-xl"
          )}>
            <h3 className={cn(
              "text-lg font-semibold mb-4",
              isDark ? "text-white" : "text-black"
            )}>
              Clear All Dates?
            </h3>
            <p className={cn(
              "mb-6",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              This action cannot be undone. Are you sure you want to clear all selected dates?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  isDark
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-black/10 hover:bg-black/20 text-black"
                )}
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  isDark
                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                )}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}