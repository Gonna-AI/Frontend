import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Settings } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../utils/cn';

// Company Logo component
const ClerkTreeLogo = ({ className, isDark = true }: { className?: string; isDark?: boolean }) => (
    <svg viewBox="0 0 464 468" className={className}>
        <path
            fill={isDark ? "currentColor" : "currentColor"}
            d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
        />
    </svg>
);

interface WelcomeManagerProps {
    isDark?: boolean;
}

export default function WelcomeManager({ isDark = true }: WelcomeManagerProps) {
    const { t } = useLanguage();
    const { knowledgeBase, switchSession } = useDemoCall();
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);
    const [newSessionName, setNewSessionName] = useState('');
    const [newSessionDescription, setNewSessionDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [existingSessions, setExistingSessions] = useState<{ id: string; name: string; config: any }[]>([]);

    useEffect(() => {
        checkFirstTime();
    }, []);

    const checkFirstTime = async () => {
        // Check if user has seen welcome
        const hasSeenWelcome = localStorage.getItem('clerktree_seen_welcome');
        if (hasSeenWelcome) return;

        // Check if there are ANY sessions
        const { data, error } = await supabase
            .from('knowledge_base_config')
            .select('id, config')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error checking sessions:', error);
            return;
        }

        if (data && data.length > 0) {
            // User has existing sessions, maybe from another device or cleared storage
            // Show welcome but offer existing sessions
            setExistingSessions(data.map(item => ({
                id: item.id,
                name: item.config?.sessionName || item.id,
                config: item.config
            })));
        }

        // Show welcome popup if no sessions OR if we just haven't seen the popup yet (local storage cleared)
        setShowWelcomePopup(true);
    };

    const createNewSession = async () => {
        if (!newSessionName.trim()) return;

        setIsLoading(true);
        try {
            const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const newConfig = {
                ...knowledgeBase,
                sessionName: newSessionName.trim(),
                sessionDescription: newSessionDescription.trim()
            };

            const { error } = await supabase
                .from('knowledge_base_config')
                .insert({
                    id: newId,
                    config: newConfig,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            // Success
            localStorage.setItem('clerktree_user_id', newId);
            localStorage.setItem('clerktree_seen_welcome', 'true');

            // Switch session via context (might trigger reload or state update)
            switchSession(newId, newConfig);

            // Reload to ensure all components sync up with the new session list
            window.location.reload();

        } catch (error) {
            console.error('Failed to create session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const switchToSession = async (session: { id: string, config: any }) => {
        localStorage.setItem('clerktree_user_id', session.id);
        localStorage.setItem('clerktree_seen_welcome', 'true');
        switchSession(session.id, session.config);
        setShowWelcomePopup(false);
        window.location.reload();
    };

    const skipSetup = () => {
        // Just create a default session silently if none exists? 
        // Or just close?
        // If we skip, we set 'seen_welcome' to true.
        localStorage.setItem('clerktree_seen_welcome', 'true');
        setShowWelcomePopup(false);
    };

    // Render Portal
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {showWelcomePopup && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className={cn(
                            "w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative",
                            "max-h-[85vh] overflow-y-auto md:overflow-hidden",
                            isDark ? "bg-[#0A0A0A]" : "bg-white"
                        )}
                    >
                        {/* Window Bar */}
                        <div className={cn(
                            "h-10 px-4 flex items-center justify-between border-b select-none",
                            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                        )}>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className={cn(
                                "text-xs font-medium opacity-50",
                                isDark ? "text-white" : "text-black"
                            )}>
                                {t('welcome.sessionManager')}
                            </div>
                            <div className="w-10" />
                        </div>

                        <div className="flex flex-col md:flex-row h-auto md:h-[500px]">
                            {/* Left Panel */}
                            <div className={cn(
                                "md:w-5/12 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shrink-0",
                                isDark
                                    ? "bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black/50"
                                    : "bg-gradient-to-br from-blue-50 via-purple-50 to-white"
                            )}>
                                <div className="relative z-10">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl mb-6 flex items-center justify-center border",
                                        isDark
                                            ? "bg-white/10 border-white/10"
                                            : "bg-white border-black/5 shadow-sm"
                                    )}>
                                        <ClerkTreeLogo className={cn("w-6 h-6", isDark ? "text-white" : "text-black")} isDark={isDark} />
                                    </div>
                                    <h2 className={cn(
                                        "text-2xl font-bold mb-4",
                                        isDark ? "text-white" : "text-black"
                                    )}>
                                        {t('welcome.title')}
                                    </h2>
                                    <p className={cn(
                                        "text-sm leading-relaxed",
                                        isDark ? "text-white/60" : "text-black/60"
                                    )}>
                                        {t('welcome.subtitle')}
                                    </p>
                                </div>

                                <div className="relative z-10 space-y-3 mt-6 md:mt-0">
                                    <div className={cn("flex items-center gap-3 text-xs", isDark ? "text-white/40" : "text-black/40")}>
                                        <Check className="w-4 h-4 shrink-0" />
                                        <span>{t('welcome.feature1')}</span>
                                    </div>
                                    <div className={cn("flex items-center gap-3 text-xs", isDark ? "text-white/40" : "text-black/40")}>
                                        <Check className="w-4 h-4 shrink-0" />
                                        <span>{t('welcome.feature2')}</span>
                                    </div>
                                    <div className={cn("flex items-center gap-3 text-xs", isDark ? "text-white/40" : "text-black/40")}>
                                        <Check className="w-4 h-4 shrink-0" />
                                        <span>{t('welcome.feature3')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel */}
                            <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-center">
                                <div className="space-y-6">
                                    <div>
                                        <div>
                                            <label className={cn(
                                                "block text-xs font-medium mb-1.5 uppercase tracking-wider",
                                                isDark ? "text-white/40" : "text-black/40"
                                            )}>
                                                {t('welcome.sessionName')}
                                            </label>
                                            <input
                                                type="text"
                                                value={newSessionName}
                                                onChange={(e) => setNewSessionName(e.target.value)}
                                                placeholder={t('welcome.sessionNamePlaceholder')}
                                                autoFocus
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl text-sm transition-all",
                                                    "focus:outline-none focus:ring-1",
                                                    isDark
                                                        ? "bg-white/5 border border-white/10 text-white placeholder-white/20 focus:ring-white/20"
                                                        : "bg-black/5 border border-black/10 text-black placeholder-black/20 focus:ring-black/20"
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <label className={cn(
                                                "block text-xs font-medium mb-1.5 uppercase tracking-wider",
                                                isDark ? "text-white/40" : "text-black/40"
                                            )}>
                                                {t('welcome.description')} <span className="opacity-50">{t('welcome.descriptionOptional')}</span>
                                            </label>
                                            <textarea
                                                value={newSessionDescription}
                                                onChange={(e) => setNewSessionDescription(e.target.value)}
                                                placeholder={t('welcome.descriptionPlaceholder')}
                                                rows={3}
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl text-sm transition-all resize-none",
                                                    "focus:outline-none focus:ring-1",
                                                    isDark
                                                        ? "bg-white/5 border border-white/10 text-white placeholder-white/20 focus:ring-white/20"
                                                        : "bg-black/5 border border-black/10 text-black placeholder-black/20 focus:ring-black/20"
                                                )}
                                            />
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            <button
                                                onClick={skipSetup}
                                                className={cn(
                                                    "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                                    isDark
                                                        ? "bg-white/5 hover:bg-white/10 text-white/70"
                                                        : "bg-black/5 hover:bg-black/10 text-black/70"
                                                )}
                                            >
                                                {t('welcome.skip')}
                                            </button>
                                            <button
                                                onClick={createNewSession}
                                                disabled={!newSessionName.trim() || isLoading}
                                                className={cn(
                                                    "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                                    isDark
                                                        ? "bg-white text-black hover:bg-white/90"
                                                        : "bg-black text-white hover:bg-black/90",
                                                    "disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                                )}
                                            >
                                                {isLoading ? t('welcome.creating') : t('welcome.create')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Existing Sessions Quick Link */}
                                    {existingSessions.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-dashed border-white/10">
                                            <p className={cn(
                                                "text-xs mb-3 text-center uppercase tracking-wider",
                                                isDark ? "text-white/30" : "text-black/30"
                                            )}>
                                                {t('welcome.orContinue')}
                                            </p>
                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                                                {existingSessions.slice(0, 3).map(session => (
                                                    <button
                                                        key={session.id}
                                                        onClick={() => switchToSession(session)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border",
                                                            isDark
                                                                ? "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                                                                : "bg-black/5 border-black/10 hover:bg-black/10 text-black/70"
                                                        )}
                                                    >
                                                        {session.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
