import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";
import { cn } from "../../../utils/cn";
import { menuItems } from "../../../config/navigation";
import { ViewType } from "../../../types/navigation";
import { useNavigate } from "react-router-dom";

// Main Mobile Sidebar Component
interface MobileSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function MobileSidebar({
  currentView,
  onViewChange,
  onSignOut,
  isOpen,
  onClose,
  children,
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
              damping: 30,
            }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50",
              "h-auto max-h-[85vh] overflow-y-auto", // Increased height and added scroll
              "rounded-t-[1.25rem] shadow-2xl",
              isDark
                ? [
                    "bg-black/90", // Increased opacity for better visibility of content
                    "backdrop-blur-xl",
                    "border-t border-white/10",
                  ]
                : [
                    "bg-white/90",
                    "backdrop-blur-xl",
                    "border-t border-white/20",
                  ],
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2
                className={cn(
                  "text-lg font-semibold",
                  isDark ? "text-white" : "text-black",
                )}
              >
                Menu
              </h2>
              <button
                onClick={onClose}
                className={cn(
                  "rounded-full p-2.5 transition-colors",
                  isDark
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-black/5 text-black",
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Content (e.g. Session Switcher) */}
            {children && (
              <div className="p-6 pb-0 space-y-4">
                {children}
                <div
                  className={cn(
                    "h-px w-full",
                    isDark ? "bg-white/10" : "bg-black/10",
                  )}
                />
              </div>
            )}

            {/* Menu Items */}
            <div className="p-6 space-y-2">
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
                        : "text-black/70 hover:bg-black/5 hover:text-black",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
