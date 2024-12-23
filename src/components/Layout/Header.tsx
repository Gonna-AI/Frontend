'use client'

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
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
        "shadow-sm"
      )}>
        <div className="flex items-center justify-between w-full relative z-10">
          {/* Mobile: Menu Button */}
          <div className="md:hidden">
            <button
              onClick={onMobileMenuClick}
              className={cn(
                "p-3 rounded-lg transition-colors",
                "bg-white/5 hover:bg-white/10 backdrop-blur-sm",
                "relative overflow-hidden",
                isDark ? "text-white" : "text-gray-800"
              )}
            >
              <Menu className="w-6 h-6 relative z-10" />
            </button>
          </div>

          {/* Desktop: Logo */}
          <div className="hidden md:flex items-center space-x-2">
            <span className={cn(
              "text-xl md:text-2xl font-bold",
              isDark ? "text-white" : "text-black"
            )}>
              gonna.ai
            </span>
          </div>

          {/* Mobile: Empty space */}
          <div className="flex-1 md:hidden" />

          {/* Clock (both mobile and desktop) */}
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
        </div>
      </header>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 z-[100]">
          <div
            className={cn(
              "fixed inset-0",
              "bg-black/60 backdrop-blur-sm"
            )}
            onClick={() => setShowCalendar(false)}
          />
          
          {/* Mobile Calendar */}
          <div className="md:hidden">
            <div className={cn(
              "fixed bottom-0 left-0 right-0",
              "animate-in slide-in-from-bottom duration-500"
            )}>
              <div className={cn(
                isDark 
                  ? "bg-black/80 border-t border-white/10" 
                  : "bg-white/80 border-t border-black/10",
                "backdrop-blur-xl",
                "rounded-t-2xl",
                "overflow-hidden"
              )}>
                <DatePicker onClose={() => setShowCalendar(false)} />
              </div>
            </div>
          </div>

          {/* Desktop Calendar */}
          <div className="hidden md:flex items-center justify-center h-full">
            <div className={cn(
              "animate-in fade-in-0 slide-in-from-top-4 duration-300",
              isDark 
                ? "bg-black/80 border border-white/10" 
                : "bg-white/80 border border-black/10",
              "backdrop-blur-xl",
              "rounded-2xl",
              "overflow-hidden",
              "w-[380px]"
            )}>
              <DatePicker onClose={() => setShowCalendar(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

