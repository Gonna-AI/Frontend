import React, { useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import ThemeToggle from './ThemeToggle';
import SidebarItem from './SidebarItem';
import { menuItems } from '../../config/navigation';
import { ViewType } from '../../types/navigation';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSignOut: () => void;
}

export default function Sidebar({ currentView, onViewChange, onSignOut }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();

  return (
    <div 
      className={cn(
        "fixed right-0 h-screen transition-all duration-500 ease-in-out flex flex-col z-30",
        isDark
          ? "bg-black/40 backdrop-blur-2xl border-l border-white/10"
          : "bg-white/40 backdrop-blur-2xl border-l border-black/10",
        isExpanded ? "w-72" : "w-20"
      )}
    >
      <div className="p-4 border-b border-white/5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full p-3 rounded-xl transition-all duration-300 flex items-center justify-center group",
            isDark
              ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
              : "bg-black/5 hover:bg-black/10 text-black border border-black/10"
          )}
        >
          <Menu className={cn(
            "w-5 h-5 transition-transform duration-300",
            isExpanded ? "rotate-180" : "rotate-0",
            "group-hover:scale-110"
          )} />
        </button>
      </div>

      <div className="flex-1 py-6 space-y-2 px-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => (
          <div 
            key={item.id}
            style={{ 
              transitionDelay: `${index * 50}ms`,
              opacity: isExpanded ? 1 : 0.9,
              transform: `translateX(${isExpanded ? '0' : '4px'})`
            }}
            className="transition-all duration-300"
          >
            <SidebarItem
              icon={item.icon}
              label={item.label}
              isExpanded={isExpanded}
              isActive={currentView === item.id}
              onClick={() => onViewChange(item.id)}
            />
          </div>
        ))}
      </div>
      
      <div className="p-4 space-y-3 border-t border-white/5">
        <ThemeToggle isExpanded={isExpanded} />
        <SidebarItem
          icon={LogOut}
          label="Sign Out"
          isExpanded={isExpanded}
          onClick={onSignOut}
        />
      </div>
    </div>
  );
}