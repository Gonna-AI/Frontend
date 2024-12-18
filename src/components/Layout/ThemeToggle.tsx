import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  isExpanded: boolean;
}

export default function ThemeToggle({ isExpanded }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-full flex items-center space-x-3 p-3 rounded-lg transition-all",
        isDark
          ? "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
          : "bg-black/5 hover:bg-black/10 text-black/80 hover:text-black"
      )}
    >
      {isDark ? (
        <>
          <Sun className="w-5 h-5 min-w-[20px]" />
          {isExpanded && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="w-5 h-5 min-w-[20px]" />
          {isExpanded && <span>Dark Mode</span>}
        </>
      )}
    </button>
  );
}