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
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();

  const handleSignOut = () => {
    console.log('Signing out...');
  };

  return (
    <div 
      className={cn(
        "fixed right-0 h-screen transition-all duration-300 flex flex-col z-30",
        isDark
          ? "bg-black/40 backdrop-blur-xl border-l border-white/10"
          : "bg-white/40 backdrop-blur-xl border-l border-black/10",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "p-3 m-2 rounded-lg transition-all",
          isDark
            ? "bg-white/5 hover:bg-white/10 text-white"
            : "bg-black/5 hover:bg-black/10 text-black"
        )}
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 mt-6 space-y-2 px-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isExpanded={isExpanded}
            isActive={currentView === item.id}
            onClick={() => onViewChange(item.id)}
          />
        ))}
      </div>
      
      <div className="p-2 space-y-2">
        <ThemeToggle isExpanded={isExpanded} />
        <SidebarItem
          icon={LogOut}
          label="Sign Out"
          isExpanded={isExpanded}
          onClick={handleSignOut}
        />
      </div>
    </div>
  );
}