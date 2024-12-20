'use client'

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
        "fixed top-0 left-0 right-0 z-40",
        "h-16 md:h-20 flex items-center justify-between px-4 md:px-6",
        "transition-all duration-300",
        isDark
          ? "bg-black/60"
          : "bg-white/60",
        "border-b border-white/5",
        "backdrop-blur-[6px]",
        "shadow-sm",
        "relative",
        "after:absolute after:top-0 after:left-0 after:w-1/4 after:h-full",
        isDark 
          ? "after:bg-gradient-to-r after:from-blue-500/10 after:to-transparent"
          : "after:bg-gradient-to-r after:from-blue-200/15 after:to-transparent",
      )}>
        <div className="flex items-center justify-between w-full relative z-10">
          {/* Left: Mobile Menu Button (mobile only) and Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMobileMenuClick}
              className={cn(
                "md:hidden p-3 rounded-lg transition-colors",
                "bg-white/5 hover:bg-white/10 backdrop-blur-sm",
                "relative overflow-hidden",
                isDark ? "text-white" : "text-gray-800"
              )}
            >
              <Menu className="w-6 h-6 relative z-10" />
            </button>
            <div className="flex items-center space-x-2">
              <span className={cn(
                "text-xl md:text-2xl font-bold",
                "bg-clip-text text-transparent bg-gradient-to-r",
                "from-blue-400 to-purple-400"
              )}>
                AI
              </span>
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </div>
          </div>

          {/* Center: Clock */}
          <div
            onClick={() => setShowCalendar(!showCalendar)}
            className={cn(
              "flex items-center justify-center cursor-pointer",
              "py-2 px-3 md:py-2 md:px-4 rounded-full",
              "transition-all duration-300",
              "relative",
              "bg-white/5 hover:bg-white/10",
              "backdrop-blur-sm",
              isDark ? "text-white" : "text-gray-800"
            )}
          >
            <span className="text-base md:text-lg font-mono relative z-10">
              {currentTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>

          {/* Right: Placeholder for future elements */}
          <div className="w-10 md:w-20"></div>
        </div>
      </header>

      {showCalendar && (
        <div className="fixed inset-0 flex items-start justify-center pt-20 md:pt-24 z-[100]">
          <div
            className={cn(
              "fixed inset-0",
              "bg-black/60 backdrop-blur-sm"
            )}
            onClick={() => setShowCalendar(false)}
          />
          <div className={cn(
            "relative rounded-xl overflow-hidden w-[90%] md:w-auto",
            isDark 
              ? "bg-black/80"
              : "bg-white/80",
            "border border-white/5",
            "shadow-lg backdrop-blur-xl",
            "animate-in fade-in-0 slide-in-from-top-4"
          )}>
            <DatePicker onClose={() => setShowCalendar(false)} />
          </div>
        </div>
      )}
    </>
  );
}

