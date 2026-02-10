import React, { useState, useRef, useEffect } from 'react';
import { useAccessCode } from '../contexts/AccessCodeContext';
import { cn } from '../utils/cn';
import { useTheme } from '../hooks/useTheme';
import { Shield, ArrowRight, CheckCircle2, Loader2, Lock, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type DialogState = 'input' | 'validating' | 'success' | 'error';

export default function AccessCodeDialog() {
    const { validateCode, error, clearError } = useAccessCode();
    const { isDark } = useTheme();
    const [code, setCode] = useState('');
    const [dialogState, setDialogState] = useState<DialogState>('input');
    const [shake, setShake] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus input on mount
        const timer = setTimeout(() => inputRef.current?.focus(), 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (error) {
            setDialogState('error');
            setShake(true);
            const timer = setTimeout(() => setShake(false), 600);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || dialogState === 'validating') return;

        clearError();
        setDialogState('validating');

        const success = await validateCode(code);

        if (success) {
            setDialogState('success');
        }
        // error state is handled by the useEffect above
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
        setCode(val);
        if (dialogState === 'error') {
            clearError();
            setDialogState('input');
        }
    };

    return (
        <div className="flex items-center justify-center w-full h-full min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: shake ? [0, -12, 12, -8, 8, -4, 4, 0] : 0,
                }}
                transition={{
                    duration: shake ? 0.5 : 0.5,
                    ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                    "relative w-full max-w-md rounded-2xl border p-8 shadow-2xl overflow-hidden",
                    isDark
                        ? "bg-[#111111]/90 border-white/[0.08] shadow-black/60"
                        : "bg-white/90 border-black/[0.06] shadow-black/10",
                    "backdrop-blur-xl"
                )}
            >
                {/* Decorative gradient orbs */}
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 blur-3xl pointer-events-none" />

                {/* Content */}
                <div className="relative z-10">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <AnimatePresence mode="wait">
                            {dialogState === 'success' ? (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20"
                                >
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="lock"
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center border",
                                        "bg-gradient-to-br from-purple-500/20 to-blue-500/10 border-purple-500/20"
                                    )}
                                >
                                    <Shield className="w-8 h-8 text-purple-400" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Title & Description */}
                    <AnimatePresence mode="wait">
                        {dialogState === 'success' ? (
                            <motion.div
                                key="success-text"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-6"
                            >
                                <h2 className={cn(
                                    "text-xl font-bold mb-2 tracking-tight",
                                    isDark ? "text-white" : "text-gray-900"
                                )}>
                                    Access Granted
                                </h2>
                                <p className={cn(
                                    "text-sm",
                                    isDark ? "text-white/50" : "text-gray-500"
                                )}>
                                    Your dashboard is being unlocked...
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="input-text"
                                className="text-center mb-6"
                            >
                                <h2 className={cn(
                                    "text-xl font-bold mb-2 tracking-tight",
                                    isDark ? "text-white" : "text-gray-900"
                                )}>
                                    Enter Access Code
                                </h2>
                                <p className={cn(
                                    "text-sm leading-relaxed",
                                    isDark ? "text-white/50" : "text-gray-500"
                                )}>
                                    A valid access code is required to unlock the full dashboard.
                                    Contact your administrator if you don't have one.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    {dialogState !== 'success' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Input */}
                            <div className="relative">
                                <div className={cn(
                                    "absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none",
                                    isDark ? "text-white/30" : "text-gray-400"
                                )}>
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={code}
                                    onChange={handleInputChange}
                                    placeholder="ENTER CODE"
                                    maxLength={20}
                                    disabled={dialogState === 'validating'}
                                    className={cn(
                                        "w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-mono tracking-[0.2em] text-center",
                                        "transition-all duration-200 outline-none",
                                        "placeholder:tracking-[0.15em] placeholder:font-sans placeholder:font-normal",
                                        isDark
                                            ? "bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 focus:border-purple-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-purple-500/20"
                                            : "bg-black/[0.03] border border-black/[0.06] text-gray-900 placeholder:text-gray-400 focus:border-purple-500/40 focus:bg-white focus:ring-1 focus:ring-purple-500/20",
                                        dialogState === 'error' && (isDark ? "border-red-500/40 bg-red-500/[0.04]" : "border-red-400/50 bg-red-50/50"),
                                        dialogState === 'validating' && "opacity-60 cursor-not-allowed"
                                    )}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {dialogState === 'error' && error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -4, height: 0 }}
                                        className="text-xs text-red-400 text-center font-medium"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!code.trim() || dialogState === 'validating'}
                                className={cn(
                                    "w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2",
                                    "cursor-pointer",
                                    code.trim() && dialogState !== 'validating'
                                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98]"
                                        : cn(
                                            "cursor-not-allowed",
                                            isDark
                                                ? "bg-white/[0.04] text-white/25 border border-white/[0.06]"
                                                : "bg-gray-100 text-gray-400 border border-gray-200"
                                        )
                                )}
                            >
                                {dialogState === 'validating' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Validating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Unlock Dashboard</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer info */}
                    <div className={cn(
                        "mt-6 pt-5 border-t flex items-center justify-center gap-2",
                        isDark ? "border-white/[0.06]" : "border-black/[0.04]"
                    )}>
                        <Lock className={cn("w-3 h-3", isDark ? "text-white/25" : "text-gray-400")} />
                        <p className={cn(
                            "text-[11px]",
                            isDark ? "text-white/25" : "text-gray-400"
                        )}>
                            Enterprise-grade access control · End-to-end encrypted
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
