import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils/cn';
import { menuItems } from '../../../config/navigation';
import ThemeToggle from '../ThemeToggle';
import { ViewType } from '../../../types/navigation';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../LanguageSwitcher';

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
  const navigate = useNavigate();

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

          {/* Card-style Sidebar */}
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
              "fixed inset-x-0 bottom-0 z-50",
              "h-[70vh] max-h-screen",
              "rounded-t-[1.25rem] shadow-2xl",
              isDark
                ? [
                  "bg-black/95",
                  "border-t border-white/10",
                  "bg-gradient-to-br from-purple-500/10 via-purple-600/10 to-purple-800/10"
                ]
                : [
                  "bg-white/60",
                  "border-t border-white/20",
                  "backdrop-blur-xl",
                  "bg-gradient-to-br from-purple-50/30 via-transparent to-purple-100/20"
                ]
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>
                Menu
              </h2>
              <button
                onClick={onClose}
                className={cn(
                  "rounded-full p-2.5 transition-colors",
                  isDark
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-black/5 text-black"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg",
                    "transition-all duration-200",
                    currentView === item.id
                      ? isDark
                        ? "bg-white/10 text-white"
                        : "bg-black/10 text-black"
                      : isDark
                        ? "text-white/70 hover:bg-white/5 hover:text-white"
                        : "text-black/70 hover:bg-black/5 hover:text-black"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 space-y-3 border-t border-white/5">
              <ThemeToggle isExpanded={true} />
              <LanguageSwitcher isExpanded={true} />
              <button
                onClick={onSignOut}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg",
                  "transition-colors",
                  isDark
                    ? "text-white/70 hover:bg-white/5 hover:text-white"
                    : "text-black/70 hover:bg-black/5 hover:text-black"
                )}
              >
                <ChevronRight className="w-5 h-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}