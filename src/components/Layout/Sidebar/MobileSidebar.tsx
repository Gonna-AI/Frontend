import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils/cn';
import { menuItems } from '../../../config/navigation';
import ThemeToggle from '../ThemeToggle';
import { ViewType } from '../../../types/navigation';

// Sidebar Item Component
interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  className?: string;
}

function SidebarItem({
  icon: Icon,
  label,
  isActive,
  isExpanded,
  onClick,
  className
}: SidebarItemProps) {
  const { isDark } = useTheme();

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? isDark
            ? "bg-white/10 text-white"
            : "bg-black/10 text-black"
          : isDark
            ? "text-white/60 hover:bg-white/5 hover:text-white"
            : "text-black/60 hover:bg-black/5 hover:text-black",
        className
      )}
    >
      <Icon className="w-5 h-5" />
      {isExpanded && <span className="text-sm">{label}</span>}
    </button>
  );
}

// Main Mobile Sidebar Component
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
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
              "h-[60vh] max-h-screen rounded-t-2xl",
              isDark
                ? "bg-black/90 backdrop-blur-xl border-t border-white/10"
                : "bg-white/90 backdrop-blur-xl border-t border-black/10"
            )}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-white/5">
              <span className={cn(
                "text-sm font-medium",
                isDark ? "text-white" : "text-black"
              )}>
                Menu
              </span>
              <button
                onClick={onClose}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isDark
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-black/10 text-black"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 py-2 space-y-1 px-3 overflow-y-auto custom-scrollbar">
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
                  className="py-2"
                />
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 space-y-1 border-t border-white/5">
              {/* Subtle divider line */}
              <div className="flex justify-center py-1">
                <div className={cn(
                  "w-24 h-px rounded-full",
                  isDark 
                    ? "bg-white/20" 
                    : "bg-black/20"
                )}/>
              </div>
              <ThemeToggle isExpanded={true} />
              <SidebarItem
                icon={ChevronRight}
                label="Sign Out"
                isActive={false}
                isExpanded={true}
                onClick={onSignOut}
                className="py-2"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}