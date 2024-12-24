import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils/cn';
import { menuItems } from '../../../config/navigation';
import ThemeToggle from '../ThemeToggle';
import SidebarItem from './SidebarItem';

interface DesktopSidebarProps {
  onSignOut: () => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function DesktopSidebar({
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
              to={item.path}
              isExpanded={isExpanded}
            />
          ))}
        </div>

        <div className="p-4 space-y-3 border-t border-white/5">
          <ThemeToggle isExpanded={isExpanded} />
          <SidebarItem
            icon={ChevronRight}
            label="Sign Out"
            isExpanded={isExpanded}
            onClick={onSignOut}
          />
        </div>
      </div>
    </div>
  );
}