import React from 'react';
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

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-3 p-3 rounded-lg transition-all",
        isDark
          ? "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
          : "bg-black/5 hover:bg-black/10 text-black/80 hover:text-black",
        isActive && (isDark ? "bg-white/20" : "bg-black/20")
      )}
    >
      <Icon className="w-5 h-5 min-w-[20px]" />
      {isExpanded && <span>{label}</span>}
    </button>
  );
}