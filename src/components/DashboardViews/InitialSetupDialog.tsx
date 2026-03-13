import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";
import { Sparkles, Settings, ArrowRight, Wand2, X } from "lucide-react";
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
      <div className="fixed inset-0 z-[999] flex items-start justify-center p-4 sm:items-center sm:p-6">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => handleAction("dismiss")}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Setup Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-[0_40px_120px_rgba(0,0,0,0.65)] flex flex-col border border-white/10",
            "bg-[linear-gradient(145deg,#141414_0%,#0C0C0C_100%)] text-white max-h-[90vh]"
          )}
        >
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '35%' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />
          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40 backdrop-blur-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#FF8A5B]">Setup</p>
              <p className="text-sm font-semibold text-white">{t('setup.windowTitle')}</p>
            </div>
            <button
              onClick={() => handleAction("dismiss")}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white"
              aria-label="Close setup dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="relative z-10 p-6 sm:p-8 flex-1 overflow-y-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border border-[#FF8A5B]/30 bg-[linear-gradient(135deg,rgba(255,138,91,0.25),rgba(255,255,255,0.08))] shadow-[0_20px_40px_rgba(0,0,0,0.35)] relative">
                <Wand2 className="w-10 h-10 text-[#FFB286]" />
                <div className="absolute inset-0 bg-[#FF8A5B]/20 blur-xl rounded-full -z-10" />
              </div>

              <h2 className="text-2xl font-bold mb-3 text-center">
                {t('setup.welcomeTitle')}
              </h2>
              <p className="text-center mb-8 max-w-md text-white/60">
                {t('setup.welcomeDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* Option 1: AI Setup */}
              <button
                onClick={() => handleAction("ai")}
                className={cn(
                  "flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-200 group relative overflow-hidden h-full",
                  "bg-[linear-gradient(135deg,rgba(255,138,91,0.18),rgba(255,255,255,0.04))] border-[#FF8A5B]/30 hover:border-[#FF8A5B]/60 hover:bg-white/5",
                )}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity">
                  <Sparkles className="w-16 h-16" />
                </div>

                <div className="p-2 rounded-lg mb-3 inline-flex bg-[#FF8A5B]/20 text-[#FFB286]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{t('setup.aiTitle')}</h3>
                <p className="text-sm text-white/60">
                  {t('setup.aiDesc')}
                </p>

                <div className="mt-auto pt-4 flex items-center gap-2 font-medium text-[#FFB286] text-sm transition-all opacity-100">
                  {t('setup.aiAction')} <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Option 2: Manual Setup */}
              <button
                onClick={() => handleAction("manual")}
                className={cn(
                  "flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-200 group relative overflow-hidden h-full",
                  "bg-white/[0.04] border-white/10 hover:border-[#FF8A5B]/40 hover:bg-white/5",
                )}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                  <Settings className="w-16 h-16" />
                </div>

                <div className="p-2 rounded-lg mb-3 inline-flex bg-[#FF8A5B]/10 text-[#FFB286]">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{t('setup.manualTitle')}</h3>
                <p className="text-sm text-white/60">
                  {t('setup.manualDesc')}
                </p>

                <div
                  className={cn(
                    "mt-auto pt-4 flex items-center gap-2 font-medium text-sm transition-all opacity-100 text-white/70 group-hover:text-white",
                  )}
                >
                  {t('setup.manualAction')} <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            <button
              onClick={() => handleAction("dismiss")}
              className={cn(
                "mt-6 text-sm font-medium hover:underline text-white/50 hover:text-white/70",
              )}
            >
              {t('setup.skip')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
