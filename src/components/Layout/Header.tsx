import React, { useState, useEffect } from 'react';
import { Sparkles, Menu } from 'lucide-react';
import DatePicker from '../DatePicker';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  onMobileMenuClick: () => void;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 md:right-20",
        "h-12 md:h-16 flex items-center justify-between px-4 md:px-6",
        "transition-all duration-300",
        "z-20",
        isDark ? "bg-black border-white/10" : "bg-white border-black/10",
        "border-b"
      )}>
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuClick}
          className={cn(
            "md:hidden p-2 rounded-lg transition-colors",
            isDark
              ? "hover:bg-white/10 text-white"
              : "hover:bg-black/10 text-black"
          )}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className={cn(
            "text-lg md:text-xl font-bold",
            "bg-clip-text text-transparent bg-gradient-to-r",
            isDark 
              ? "from-white via-blue-400 to-purple-400"
              : "from-black via-blue-600 to-purple-600"
          )}>
            AI
          </span>
          <Sparkles className={cn(
            "w-3 h-3",
            isDark ? "text-blue-400" : "text-blue-600"
          )} />
        </div>

        {/* Clock */}
        <div 
          onClick={() => setShowCalendar(!showCalendar)}
          className={cn(
            "flex items-center space-x-2 cursor-pointer",
            "py-1 px-2 md:py-2 md:px-4 rounded-full",
            "transition-colors",
            isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-black/10 text-black/70"
          )}
        >
          <span className="text-sm md:text-base font-mono">
            {currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        </div>
      </header>

      <div className="h-12 md:h-16" />

      {showCalendar && (
        <div className="fixed inset-0 flex items-start justify-center pt-16 md:pt-20 z-[100]">
          <div 
            className={cn(
              "fixed inset-0",
              isDark ? "bg-black/80" : "bg-black/40"
            )}
            onClick={() => setShowCalendar(false)}
          />
          <div className={cn(
            "relative rounded-xl overflow-hidden w-[90%] md:w-auto",
            isDark ? "bg-black border-white/10" : "bg-white border-black/10",
            "border shadow-xl",
            "animate-in fade-in-0 slide-in-from-top-4"
          )}>
            <DatePicker onClose={() => setShowCalendar(false)} />
          </div>
        </div>
      )}
    </>
  );
}