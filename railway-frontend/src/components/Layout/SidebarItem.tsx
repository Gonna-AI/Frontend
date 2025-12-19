import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isExpanded: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  icon: Icon,
  label,
  isExpanded,
  isActive,
  onClick
}: SidebarItemProps) {
  const { isDark } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    onClick?.();
  };

  // Get icon name to determine animation
  const iconName = Icon.displayName || '';

  const getIconAnimation = () => {
    switch(iconName) {
      case 'Settings':
        return isAnimating ? 'animate-spin-slow' : '';
      case 'Home':
        return isAnimating ? 'animate-bounce' : '';
      case 'Users':
        return isAnimating ? 'animate-pulse' : '';
      case 'MessageSquare':
        return isAnimating ? 'animate-bounce-side' : '';
      case 'FileText':
        return isAnimating ? 'animate-slide-up' : '';
      case 'Bell':
        return isAnimating ? 'animate-shake' : '';
      case 'LogOut':
        return isAnimating ? 'animate-slide-right' : '';
      case 'Sun':
      case 'Moon':
        return isAnimating ? 'animate-spin-glow' : '';
      default:
        return isAnimating ? 'animate-pop' : '';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
        isDark
          ? "hover:bg-white/5 text-white/80 hover:text-white"
          : "hover:bg-black/5 text-black/80 hover:text-black",
        isActive && (isDark ? "bg-white/10" : "bg-black/10")
      )}
    >
      <div className="flex items-center space-x-3 w-full">
        <div className="relative">
          <Icon 
            className={cn(
              "w-5 h-5 min-w-[20px] transform transition-all duration-300",
              getIconAnimation()
            )} 
          />
          {isActive && (
            <div className="absolute -inset-1 bg-current opacity-20 rounded-full blur-sm" />
          )}
        </div>
        {isExpanded && (
          <span className={cn(
            "transition-all duration-300",
            isAnimating && "translate-x-1 opacity-80"
          )}>
            {label}
          </span>
        )}
      </div>
    </button>
  );
}