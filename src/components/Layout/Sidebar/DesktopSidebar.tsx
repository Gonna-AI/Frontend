import React from 'react';
import { motion } from 'framer-motion';
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
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setTimeout(() => {
      if (isHovered) {
        setIsExpanded(true);
      }
    }, 200); // Delay before expanding
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsExpanded(false);
  };

  return (
    <motion.div
      className={cn(
        "hidden md:flex fixed right-0 top-20 bottom-0 flex-col",
        "z-40 overflow-hidden",
        isDark
          ? "bg-black/40 backdrop-blur-2xl border-l border-white/10"
          : "bg-white/40 backdrop-blur-2xl border-l border-black/10"
      )}
      initial={false}
      animate={{
        width: isExpanded ? 280 : 72,
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div 
        className="flex flex-col h-full"
        animate={{
          x: isExpanded ? 0 : 4,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <div className="flex-1 py-6 space-y-2 px-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={false}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <SidebarItem
                icon={item.icon}
                label={item.label}
                isActive={currentView === item.id}
                isExpanded={isExpanded}
                onClick={() => onViewChange(item.id)}
              />
            </motion.div>
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
      </motion.div>
    </motion.div>
  );
}