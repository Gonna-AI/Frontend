import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils/cn';
import { menuItems } from '../../../config/navigation';
import ThemeToggle from '../ThemeToggle';
import SidebarItem from './SidebarItem';
import { ViewType } from '../../../types/navigation';

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
        "z-40",
        isDark
          ? "bg-black/40 backdrop-blur-2xl border-l border-white/10"
          : "bg-white/40 backdrop-blur-2xl border-l border-black/10"
      )}
      style={{
        width: isExpanded ? '280px' : '72px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full w-[280px]">
        {/* Logo Section */}
        <div className={cn(
          "p-4 border-b transition-opacity duration-300",
          isDark ? "border-white/10" : "border-black/10",
          isExpanded ? "opacity-100" : "opacity-0"
        )}>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
            gonna.ai
          </h1>
        </div>

        <div className="flex-1 py-6 space-y-2 px-4 overflow-hidden">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentView === item.id}
              isExpanded={isExpanded}
              onClick={() => onViewChange(item.id)}
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
          />
        </div>
      </div>
    </div>
  );
}