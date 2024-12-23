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
        "transition-[width] duration-300 ease-in-out",
        "z-30", // Lower z-index than main content
        "rounded-tl-2xl", // Curved corner
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
      {/* Content container */}
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