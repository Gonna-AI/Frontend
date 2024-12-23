import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils/cn';
import { menuItems } from '../../../config/navigation';
import ThemeToggle from '../ThemeToggle';
import SidebarItem from './SidebarItem';
import { ViewType } from '../../../types/navigation';

interface MobileSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({
  currentView,
  onViewChange,
  onSignOut,
  isOpen,
  onClose
}: MobileSidebarProps) {
  const { isDark } = useTheme();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={cn(
                "fixed inset-x-0 bottom-0 z-50 flex flex-col",
                "h-[80vh] rounded-t-2xl",
                isDark
                  ? "bg-black/90 backdrop-blur-xl border-t border-white/10"
                  : "bg-white/90 backdrop-blur-xl border-t border-black/10"
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
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentView === item.id}
                    isExpanded={true}
                    onClick={() => {
                      onViewChange(item.id);
                      onClose();
                    }}
                  />
                ))}
              </div>

              <div className="p-4 space-y-2 border-t border-white/5">
                <ThemeToggle isExpanded={true} />
                <SidebarItem
                  icon={ChevronRight}
                  label="Sign Out"
                  isActive={false}
                  isExpanded={true}
                  onClick={onSignOut}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}