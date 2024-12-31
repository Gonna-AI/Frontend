import React from 'react';
import { ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils/cn';
import { menuItems } from '../../../config/navigation';
import { ViewType } from '../../../types/navigation';
import { useNavigate } from 'react-router-dom';

// Separate SidebarItem component with enhanced animations
function SidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  isDark,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          "w-full h-12 rounded-xl flex items-center justify-center",
          "transition-all duration-300 ease-in-out",
          isActive 
            ? isDark 
              ? "bg-white/10 text-white" 
              : "bg-black/10 text-black"
            : isDark 
              ? "text-white/80 hover:bg-white/5 hover:text-white"
              : "text-black/80 hover:bg-black/5 hover:text-black"
        )}
      >
        <Icon className={cn(
          "w-6 h-6 flex-shrink-0",
          "transition-transform duration-300",
          "group-hover:scale-110",
          "stroke-[1.5]"
        )} />
      </button>
      
      {/* Custom Tooltip */}
      <div className={cn(
        "absolute left-0 transform -translate-x-full -translate-y-1/2 top-1/2",
        "px-3 py-2 mr-2",
        "rounded-lg",
        "text-sm font-medium",
        "opacity-0 group-hover:opacity-100",
        "pointer-events-none",
        "transition-all duration-200",
        "whitespace-nowrap",
        isDark
          ? "bg-black/90 text-white backdrop-blur-sm border border-white/10"
          : "bg-white/90 text-black backdrop-blur-sm border border-black/10",
      )}>
        {label}
        {/* Tooltip Arrow */}
        <div className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45",
          "w-2 h-2",
          isDark
            ? "bg-black/90 border-r border-t border-white/10"
            : "bg-white/90 border-r border-t border-black/10"
        )} />
      </div>
    </div>
  );
}

interface DesktopSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSignOut: () => void;
}

export default function DesktopSidebar({
  currentView,
  onViewChange,
  onSignOut,
}: DesktopSidebarProps) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Combine all items including theme toggle and sign out
  const allItems = [
    ...menuItems.map(item => ({
      id: item.id,
      icon: item.icon,
      label: item.label,
      onClick: () => {
        navigate(item.path);
        onViewChange(item.id);
      },
      isActive: currentView === item.id,
    })),
    {
      id: 'theme',
      icon: isDark ? Moon : Sun,
      label: isDark ? 'Dark Mode' : 'Light Mode',
      onClick: toggleTheme,
      isActive: false,
    },
    {
      id: 'signout',
      icon: ChevronRight,
      label: 'Sign Out',
      onClick: onSignOut,
      isActive: false,
    },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex fixed right-0 top-[76px] bottom-0",
        "w-20 flex-col",
        "rounded-tl-2xl",
        "transition-all duration-300 ease-in-out",
        "z-30",
        isDark
          ? "bg-black/40 backdrop-blur-xl border-l border-t border-white/10"
          : "bg-white/40 backdrop-blur-xl border-l border-t border-black/10"
      )}
    >
      {/* Navigation Items */}
      <div className="flex-1 py-4 px-3">
        <div className="space-y-2">
          {allItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={item.isActive}
              onClick={item.onClick}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}