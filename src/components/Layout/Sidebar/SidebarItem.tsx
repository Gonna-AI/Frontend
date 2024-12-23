import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils/cn';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

export default function SidebarItem({
  icon: Icon,
  label,
  isActive,
  isExpanded,
  onClick
}: SidebarItemProps) {
  const { isDark } = useTheme();

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center p-3 rounded-xl",
        "transition-colors duration-300",
        isDark
          ? "hover:bg-white/5 text-white/80 hover:text-white"
          : "hover:bg-black/5 text-black/80 hover:text-black",
        isActive && (isDark ? "bg-white/10" : "bg-black/10")
      )}
    >
      <div className="flex items-center">
        <Icon className="w-5 h-5" />
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "w-[180px] ml-3" : "w-0 ml-0"
        )}>
          <span className={cn(
            "inline-block whitespace-nowrap transition-opacity duration-200",
            isExpanded ? "opacity-100" : "opacity-0"
          )}>
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}