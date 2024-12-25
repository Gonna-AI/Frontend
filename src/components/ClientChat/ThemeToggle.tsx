import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "p-2 rounded-lg transition-colors",
        "absolute top-4 right-4 z-50",
        isDark
          ? "bg-white/10 hover:bg-white/20 text-white"
          : "bg-black/5 hover:bg-black/10 text-black",
        "border",
        isDark ? "border-white/10" : "border-black/10"
      )}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}