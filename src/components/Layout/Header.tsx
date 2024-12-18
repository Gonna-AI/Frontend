import React, { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';
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
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={cn(
      "h-16 flex items-center justify-between px-6 relative z-20",
      isDark
        ? "bg-black/40 backdrop-blur-xl border-b border-white/10"
        : "bg-white/40 backdrop-blur-xl border-b border-black/10"
    )}>
      <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        Gonna.AI
      </div>
      
      <div className="relative">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all",
            isDark
              ? "bg-white/5 hover:bg-white/10 text-white"
              : "bg-black/5 hover:bg-black/10 text-black",
            showCalendar && (isDark ? "bg-white/10" : "bg-black/10"),
            "shadow-lg"
          )}
        >
          <Clock className={isDark ? "w-5 h-5 text-white/80" : "w-5 h-5 text-black/80"} />
          <span>
            {currentTime.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </span>
          <Calendar className={isDark ? "w-5 h-5 text-white/80" : "w-5 h-5 text-black/80"} />
        </button>

        {showCalendar && (
          <div className="absolute top-full mt-2 right-0 z-50">
            <DatePicker onClose={() => setShowCalendar(false)} />
          </div>
        )}
      </div>
    </header>
  );
}