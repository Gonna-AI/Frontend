import React from 'react';
import { Menu } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils/cn';
import Logo from './Logo';

interface HeaderProps {
  onMobileMenuClick: () => void;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const { isDark } = useTheme();
  
  return (
    <header className={cn(
      "w-full h-16 md:h-20 px-4 flex items-center justify-between",
      "border-b backdrop-blur-xl",
      isDark 
        ? "border-white/10 bg-black/20" 
        : "border-black/5 bg-white/20"
    )}>
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuClick}
          className={cn(
            "md:hidden p-2 rounded-lg transition-colors",
            isDark 
              ? "hover:bg-white/10" 
              : "hover:bg-black/10"
          )}
        >
          <Menu className={isDark ? "text-white" : "text-black"} />
        </button>
        <Logo />
      </div>
    </header>
  );
} 