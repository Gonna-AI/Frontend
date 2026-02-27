import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Loader2, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { cn } from "../utils/cn";

interface ReauthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isDark?: boolean;
}

export default function ReauthModal({
  isOpen,
  onClose,
  onSuccess,
  isDark = true,
}: ReauthModalProps) {
  const { reauthenticate } = useAuth();
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await reauthenticate(password);
    if (authError) {
      setError(t("reauth.incorrectPassword"));
      setLoading(false);
    } else {
      setLoading(false);
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "relative w-full max-w-md p-6 rounded-2xl shadow-xl border",
            isDark
              ? "bg-[#09090B] border-white/10"
              : "bg-white border-black/10",
          )}
        >
          <button
            onClick={onClose}
            className={cn(
              "absolute top-4 right-4 p-1 rounded-lg transition-colors",
              isDark
                ? "hover:bg-white/10 text-white/60"
                : "hover:bg-black/10 text-black/60",
            )}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center gap-4 mb-6">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                isDark ? "bg-white/10" : "bg-black/5",
              )}
            >
              <Lock
                className={cn("w-6 h-6", isDark ? "text-white" : "text-black")}
              />
            </div>
            <div className="text-center">
              <h2
                className={cn(
                  "text-xl font-semibold",
                  isDark ? "text-white" : "text-black",
                )}
              >
                {t("reauth.title")}
              </h2>
              <p
                className={cn(
                  "text-sm mt-1",
                  isDark ? "text-white/60" : "text-black/60",
                )}
              >
                {t("reauth.desc")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white/80" : "text-black/80",
                )}
              >
                {t("reauth.passwordLabel")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl outline-none border transition-all",
                  isDark
                    ? "bg-white/5 border-white/10 text-white focus:border-white/20"
                    : "bg-gray-50 border-gray-200 text-black focus:border-gray-300",
                )}
                placeholder={t("reauth.passwordPlaceholder")}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-medium transition-colors",
                  isDark
                    ? "bg-white/5 hover:bg-white/10 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-black",
                )}
              >
                {t("sidebar.cancel")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center",
                  isDark
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800",
                  loading && "opacity-50 cursor-not-allowed",
                )}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t("reauth.verify")
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
