import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";
import { Sparkles, Settings, ArrowRight, Wand2 } from "lucide-react";
import { useDemoCall } from "../../contexts/DemoCallContext";
import { useLanguage } from "../../contexts/LanguageContext";

interface InitialSetupDialogProps {
  isDark: boolean;
  onSelectAction: (action: "ai" | "manual" | "dismiss") => void;
}

export default function InitialSetupDialog({
  isDark,
  onSelectAction,
}: InitialSetupDialogProps) {
  const { user } = useAuth();
  const { callHistory } = useDemoCall();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show if the user is logged in
    if (!user) return;

    const HAS_SEEN_SETUP_KEY = `clerktree_has_seen_setup_${user.id}`;
    const hasSeen = localStorage.getItem(HAS_SEEN_SETUP_KEY);

    // If they haven't seen it and they have no call history (new account heuristic)
    if (!hasSeen && callHistory.length === 0) {
      // Small delay to let dashboard settle before popping up
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, callHistory.length]);

  const handleAction = (action: "ai" | "manual" | "dismiss") => {
    if (user) {
      localStorage.setItem(`clerktree_has_seen_setup_${user.id}`, "true");
    }
    setIsOpen(false);

    // Call the callback after closing animation
    setTimeout(() => {
      onSelectAction(action);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => handleAction("dismiss")}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Mac OS Style Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "relative w-full max-w-2xl overflow-hidden rounded-xl shadow-2xl flex flex-col",
            isDark
              ? "bg-[#1c1c1e] text-white border border-white/10"
              : "bg-white text-gray-900 border border-gray-200",
          )}
        >
          {/* Mac Top Bar */}
          <div
            className={cn(
              "h-10 px-4 flex items-center justify-between border-b user-select-none",
              isDark
                ? "bg-[#2c2c2e] border-white/5"
                : "bg-gray-100 border-gray-200",
            )}
          >
            {/* Traffic lights */}
            <div className="flex gap-2 w-16">
              <button
                onClick={() => handleAction("dismiss")}
                className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/10 hover:bg-[#ff5f56]/80 transition-colors"
              />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/10" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/10" />
            </div>
            {/* Window title */}
            <div
              className={cn(
                "text-xs font-medium flex-1 text-center truncate px-2",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {t("setup.windowTitle")}
            </div>
            <div className="w-16" /> {/* Spacer for centering */}
          </div>

          {/* Content Area */}
          <div className="p-8 flex flex-col items-center">
            <div
              className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border shadow-lg relative",
                isDark
                  ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 shadow-purple-500/10"
                  : "bg-gradient-to-br from-purple-100 to-blue-100 border-purple-200 shadow-purple-200/30",
              )}
            >
              <Wand2
                className={cn(
                  "w-10 h-10",
                  isDark ? "text-purple-400" : "text-purple-600",
                )}
              />
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full -z-10" />
            </div>

            <h2 className="text-2xl font-bold mb-3 text-center">
              {t("setup.welcomeTitle")}
            </h2>
            <p
              className={cn(
                "text-center mb-8 max-w-md",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              {t("setup.welcomeDesc")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* Option 1: AI Setup */}
              <button
                onClick={() => handleAction("ai")}
                className={cn(
                  "flex flex-col items-start p-5 rounded-xl border text-left transition-all duration-200 group relative overflow-hidden h-full",
                  isDark
                    ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-white/10 hover:border-purple-500/50 hover:bg-white/5"
                    : "bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-gray-200 hover:border-purple-400 hover:bg-white",
                )}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="w-16 h-16" />
                </div>

                <div
                  className={cn(
                    "p-2 rounded-lg mb-3 inline-flex",
                    isDark
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-purple-100 text-purple-600",
                  )}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {t("setup.aiTitle")}
                </h3>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  {t("setup.aiDesc")}
                </p>

                <div className="mt-auto pt-4 flex items-center gap-2 font-medium text-purple-500 text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  {t("setup.aiAction")} <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Option 2: Manual Setup */}
              <button
                onClick={() => handleAction("manual")}
                className={cn(
                  "flex flex-col items-start p-5 rounded-xl border text-left transition-all duration-200 group relative overflow-hidden h-full",
                  isDark
                    ? "bg-white/[0.03] border-white/10 hover:border-white/30 hover:bg-white/5"
                    : "bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white",
                )}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Settings className="w-16 h-16" />
                </div>

                <div
                  className={cn(
                    "p-2 rounded-lg mb-3 inline-flex",
                    isDark
                      ? "bg-white/10 text-gray-300"
                      : "bg-gray-200 text-gray-600",
                  )}
                >
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {t("setup.manualTitle")}
                </h3>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  {t("setup.manualDesc")}
                </p>

                <div
                  className={cn(
                    "mt-auto pt-4 flex items-center gap-2 font-medium text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all",
                    isDark ? "text-gray-300" : "text-gray-600",
                  )}
                >
                  {t("setup.manualAction")} <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            <button
              onClick={() => handleAction("dismiss")}
              className={cn(
                "mt-6 text-sm font-medium hover:underline",
                isDark
                  ? "text-gray-500 hover:text-gray-400"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              {t("setup.skip")}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
