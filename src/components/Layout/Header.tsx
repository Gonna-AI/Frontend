import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import DatePicker from '../DatePicker';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

export default function Header() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isDark } = useTheme();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={cn(
      "h-16 flex items-center justify-between px-6 relative z-20",
      isDark
        ? "bg-gradient-to-r from-black/40 via-black/20 to-black/40 backdrop-blur-xl border-b border-white/10"
        : "bg-gradient-to-r from-white/40 via-white/20 to-white/40 backdrop-blur-xl border-b border-black/10"
    )}>
      <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        Gonna.AI
      </div>
      
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all",
          isDark
            ? "bg-white/5 hover:bg-white/10 text-white"
            : "bg-black/5 hover:bg-black/10 text-black"
        )}
      >
        <Clock className="w-4 h-4" />
        <span>
          {currentTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </button>

      {showCalendar && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2">
          <DatePicker onClose={() => setShowCalendar(false)} />
        </div>
      )}
    </header>
  );
}