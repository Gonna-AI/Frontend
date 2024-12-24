import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils/cn';
import { menuItems } from '../../../config/navigation';
import ThemeToggle from '../ThemeToggle';
import { ViewType } from '../../../types/navigation';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  isDark?: boolean;
}

// Separate SidebarItem component with enhanced animations
function SidebarItem({
  icon: Icon,
  label,
  isActive,
  isExpanded,
  onClick,
  isDark,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-3 py-2 rounded-lg flex items-center gap-3",
        "transition-all duration-300 ease-in-out",
        isActive ? "bg-blue-500/20 text-blue-500" : isDark ? "text-white hover:bg-gray-500/10" : "hover:bg-gray-500/10"
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="min-w-[180px] overflow-hidden">
        <span 
          className={cn(
            "whitespace-nowrap block transition-all duration-500 ease-in-out",
            isExpanded 
              ? "opacity-100 translate-x-0" 
              : "opacity-0 -translate-x-4",
            isDark && !isActive && "text-white"
          )}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

interface DesktopSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSignOut: () => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function DesktopSidebar({
  currentView,
  onViewChange,
  onSignOut,
  isExpanded,
  setIsExpanded
}: DesktopSidebarProps) {
  const { isDark } = useTheme();

  return (
    <div
      className={cn(
        "hidden md:flex fixed right-0 top-20 bottom-0 flex-col",
        "transition-all duration-300 ease-in-out",
        "z-30",
        "rounded-tl-2xl",
        isDark
          ? "bg-black/40 backdrop-blur-2xl border-t border-white/10"
          : "bg-white/40 backdrop-blur-2xl border-t border-black/10"
      )}
      style={{
        width: isExpanded ? '280px' : '72px'
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full relative z-10">
        <div className="flex-1 py-6 space-y-2 px-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentView === item.id}
              isExpanded={isExpanded}
              onClick={() => onViewChange(item.id)}
              isDark={isDark}
            />
          ))}
        </div>

        <div className="p-4 space-y-3 border-t border-white/5">
          <ThemeToggle isExpanded={isExpanded} />
          <SidebarItem
            icon={ChevronRight}
            label="Sign Out"
            isActive={false}
            isExpanded={isExpanded}
            onClick={onSignOut}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
}