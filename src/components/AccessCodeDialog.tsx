import React, { useState, useRef, useEffect } from "react";
import { useAccessCode } from "../contexts/AccessCodeContext";
import { cn } from "../utils/cn";
import { useTheme } from "../hooks/useTheme";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

type DialogState = "input" | "validating" | "success" | "error";

export default function AccessCodeDialog() {
  const { t } = useLanguage();
  const { validateCode, error, clearError } = useAccessCode();
  const { isDark } = useTheme();
  const [code, setCode] = useState("");
  const [dialogState, setDialogState] = useState<DialogState>("input");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (error) {
      setDialogState("error");
      setShake(true);
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || dialogState === "validating") return;

    clearError();
    setDialogState("validating");

    const success = await validateCode(code);

    if (success) {
      setDialogState("success");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, "");
    setCode(val);
    if (dialogState === "error") {
      clearError();
      setDialogState("input");
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          x: shake ? [0, -12, 12, -8, 8, -4, 4, 0] : 0,
        }}
        transition={{
          duration: shake ? 0.5 : 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={cn(
          "w-full max-w-[440px] rounded-[32px] border shadow-2xl overflow-hidden transition-all duration-500",
          isDark
            ? "bg-[#121214] border-white/5 shadow-black/50"
            : "bg-white border-gray-200/50 shadow-xl shadow-gray-200/50",
        )}
      >
        <div className="p-8 md:p-10">
          {/* Icon */}
          <div className="flex items-center gap-3 mb-10">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300",
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-200",
              )}
            >
              <ShieldCheck
                className={cn(
                  "w-5 h-5",
                  isDark ? "text-white/70" : "text-gray-700",
                )}
              />
            </div>
            <span
              className={cn(
                "text-xl font-bold tracking-tight",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {t("access.title")}
            </span>
          </div>

          {/* Header Text */}
          <AnimatePresence mode="wait">
            {dialogState === "success" ? (
              <motion.div
                key="success-text"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                    isDark
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-emerald-50 text-emerald-500",
                  )}
                >
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1
                  className={cn(
                    "text-3xl font-bold mb-2 tracking-tight text-center",
                    isDark ? "text-white" : "text-gray-900",
                  )}
                >
                  {t("access.granted")}
                </h1>
                <p
                  className={cn(
                    "text-sm text-center",
                    isDark ? "text-zinc-400" : "text-gray-500",
                  )}
                >
                  {t("access.unlocking")}
                </p>
              </motion.div>
            ) : (
              <motion.div key="input-text" className="mb-8">
                <h1
                  className={cn(
                    "text-3xl font-bold mb-2 tracking-tight",
                    isDark ? "text-white" : "text-gray-900",
                  )}
                >
                  {t("access.unlockTitle")}
                </h1>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-zinc-400" : "text-gray-500",
                  )}
                >
                  {t("access.unlockDesc")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {dialogState !== "success" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  className={cn(
                    "text-sm font-medium",
                    isDark ? "text-zinc-300" : "text-gray-700",
                  )}
                >
                  {t("access.codeLabel")}
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={handleInputChange}
                  placeholder="CTX-XXX-XXXX-XXXX-XXXX"
                  maxLength={30}
                  disabled={dialogState === "validating"}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm font-mono tracking-wider border focus:ring-2 focus:ring-offset-0 outline-none transition-all duration-200",
                    isDark
                      ? "bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700 focus:ring-zinc-800"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-gray-100",
                    dialogState === "error" &&
                      (isDark
                        ? "border-red-500/40 bg-red-500/[0.06] focus:ring-red-500/20"
                        : "border-red-300 bg-red-50/50 focus:ring-red-100"),
                    dialogState === "validating" &&
                      "opacity-60 cursor-not-allowed",
                  )}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {dialogState === "error" && error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "text-xs flex items-center gap-2 p-3 rounded-lg border",
                      isDark
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-red-50 border-red-200 text-red-600",
                    )}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!code.trim() || dialogState === "validating"}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                  "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
                  isDark
                    ? "bg-white text-black hover:bg-gray-100 shadow-white/5"
                    : "bg-black text-white hover:bg-gray-800 shadow-black/10",
                )}
              >
                {dialogState === "validating" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t("access.enter")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
