import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { menuItems } from '../../config/navigation';
import ThemeToggle from './ThemeToggle';
import { ViewType } from '../../types/navigation';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  onSignOut,
  isOpen,
  onClose
}: SidebarProps) {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Desktop sidebar
  const DesktopSidebar = () => (
    <motion.div
      className={cn(
        "hidden md:flex fixed right-0 top-20 bottom-0 flex-col",
        "transition-all duration-500 ease-in-out z-40",
        isDark
          ? "bg-black/40 backdrop-blur-2xl border-l border-white/10"
          : "bg-white/40 backdrop-blur-2xl border-l border-black/10"
      )}
      animate={{
        width: isExpanded ? "300px" : "60px",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 py-6 space-y-2 px-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              style={{
                opacity: isExpanded ? 1 : 0.9,
                transform: `translateX(${isExpanded ? '0' : '4px'})`,
                transition: `all 0.3s ease ${index * 50}ms`
              }}
            >
              <button
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isDark
                    ? "hover:bg-white/5 text-white/80 hover:text-white"
                    : "hover:bg-black/5 text-black/80 hover:text-black",
                  currentView === item.id && (isDark ? "bg-white/10" : "bg-black/10")
                )}
              >
                <div className="flex items-center space-x-3 w-full">
                  <item.icon className="w-5 h-5 min-w-[20px]" />
                  {isExpanded && (
                    <span className="transition-all duration-300">
                      {item.label}
                    </span>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        <div className="p-4 space-y-3 border-t border-white/5">
          <ThemeToggle isExpanded={isExpanded} />
          <button
            onClick={onSignOut}
            className={cn(
              "w-full flex items-center p-3 rounded-xl transition-all duration-300",
              isDark
                ? "hover:bg-white/5 text-white/80 hover:text-white"
                : "hover:bg-black/5 text-black/80 hover:text-black"
            )}
          >
            <ChevronRight className="w-5 h-5 min-w-[20px]" />
            {isExpanded && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Mobile sidebar
  const MobileSidebar = () => (
    <>
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className={cn(
              "fixed inset-y-0 right-0 w-[80%] max-w-sm z-50 flex flex-col",
              isDark
                ? "bg-black/90 backdrop-blur-xl border-l border-white/10"
                : "bg-white/90 backdrop-blur-xl border-l border-black/10"
            )}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/5">
              <span className={isDark ? "text-white" : "text-black"}>Menu</span>
              <button
                onClick={onClose}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isDark
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-black/10 text-black"
                )}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 py-4 space-y-2 px-4 overflow-y-auto custom-scrollbar">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center p-3 rounded-xl transition-all",
                    isDark
                      ? "hover:bg-white/5 text-white/80 hover:text-white"
                      : "hover:bg-black/5 text-black/80 hover:text-black",
                    currentView === item.id && (isDark ? "bg-white/10" : "bg-black/10")
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="ml-3">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="p-4 space-y-2 border-t border-white/5">
              <ThemeToggle isExpanded={true} />
              <button
                onClick={onSignOut}
                className={cn(
                  "w-full flex items-center p-3 rounded-xl transition-all",
                  isDark
                    ? "hover:bg-white/5 text-white/80 hover:text-white"
                    : "hover:bg-black/5 text-black/80 hover:text-black"
                )}
              >
                <ChevronRight className="w-5 h-5" />
                <span className="ml-3">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}