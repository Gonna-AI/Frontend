import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Check,
    X,
    ChevronDown,
    Settings,
    Trash2,
    Edit2,
    Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase } from '../../config/supabase';
import { useSidebar, SidebarMenuButton } from "@/components/ui/sidebar";

interface UserSession {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    config: Record<string, unknown>;
}

interface UserSessionSwitcherProps {
    isDark?: boolean;
    currentUserId: string;
    onSessionChange: (sessionId: string, config?: Record<string, unknown>) => void;
    currentConfig: Record<string, unknown>;
    onSaveSession: () => Promise<boolean>;
    mobile?: boolean;
    collapsed?: boolean;
}

// Company Logo component
const ClerkTreeLogo = ({ className, isDark = true }: { className?: string; isDark?: boolean }) => (
    <svg viewBox="0 0 464 468" className={className}>
        <path
            fill={isDark ? "currentColor" : "currentColor"}
            d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
        />
    </svg>
);

export default function UserSessionSwitcher({
    isDark = true,
    currentUserId,
    onSessionChange,
    currentConfig,
    onSaveSession,
    mobile = false,
    collapsed = false
}: UserSessionSwitcherProps) {
    // Get sidebar state from context
    const sidebar = useSidebar();
    const sidebarState = sidebar?.state || 'expanded';

    const isCollapsed = collapsed || (sidebarState === 'collapsed' && !mobile);

    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);
    const [editingSession, setEditingSession] = useState<UserSession | null>(null);
    const [newSessionName, setNewSessionName] = useState('');
    const [newSessionDescription, setNewSessionDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
    const [hasCheckedFirstTime, setHasCheckedFirstTime] = useState(false);

    // Load all sessions from Supabase
    useEffect(() => {
        loadSessions();
    }, []);

    // Check for first time user and set current session
    useEffect(() => {
        if (!hasCheckedFirstTime && sessions.length >= 0) {
            setHasCheckedFirstTime(true);
            const session = sessions.find(s => s.id === currentUserId);
            if (session) {
                setCurrentSession(session);
            }
            // Logic for welcome popup moved to WelcomeManager to support mobile
        }
    }, [sessions, currentUserId, hasCheckedFirstTime]);

    // Update current session when sessions change
    useEffect(() => {
        const session = sessions.find(s => s.id === currentUserId);
        if (session) {
            setCurrentSession(session);
        }
    }, [sessions, currentUserId]);

    const loadSessions = async () => {
        try {
            const { data, error } = await supabase
                .from('knowledge_base_config')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading sessions:', error);
                return;
            }

            // Map to UserSession format
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedSessions: UserSession[] = (data || []).map((item: any) => ({
                id: item.id,
                name: item.config?.sessionName || item.id.substring(0, 15) + '...',
                description: item.config?.sessionDescription || '',
                created_at: item.created_at,
                updated_at: item.updated_at,
                config: item.config || {}
            }));

            setSessions(mappedSessions);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const createNewSession = async () => {
        if (!newSessionName.trim()) return;

        setIsLoading(true);
        try {
            const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            const newConfig = {
                ...currentConfig,
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

            if (error) {
                console.error('Error creating session:', error);
                return;
            }

            // Update localStorage with new user ID
            localStorage.setItem('clerktree_user_id', newId);
            localStorage.setItem('clerktree_seen_welcome', 'true');

            // Reload sessions and switch to new one
            await loadSessions();
            onSessionChange(newId, newConfig);

            setShowCreateDialog(false);
            setShowWelcomePopup(false);
            setNewSessionName('');
            setNewSessionDescription('');
        } catch (error) {
            console.error('Failed to create session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSession = async () => {
        if (!editingSession || !newSessionName.trim()) return;

        setIsLoading(true);
        try {
            const updatedConfig = {
                ...editingSession.config,
                sessionName: newSessionName.trim(),
                sessionDescription: newSessionDescription.trim()
            };

            const { error } = await supabase
                .from('knowledge_base_config')
                .update({
                    config: updatedConfig,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingSession.id);

            if (error) {
                console.error('Error updating session:', error);
                return;
            }

            await loadSessions();
            setShowEditDialog(false);
            setEditingSession(null);
            setNewSessionName('');
            setNewSessionDescription('');
        } catch (error) {
            console.error('Failed to update session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSession = async (sessionId: string) => {
        if (sessionId === currentUserId) {
            alert('Cannot delete current session. Switch to another session first.');
            return;
        }

        if (!confirm('Are you sure you want to delete this session?')) return;

        try {
            const { error } = await supabase
                .from('knowledge_base_config')
                .delete()
                .eq('id', sessionId);

            if (error) {
                console.error('Error deleting session:', error);
                return;
            }

            await loadSessions();
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const switchToSession = async (session: UserSession) => {
        // First save current session
        await onSaveSession();

        // Update localStorage
        localStorage.setItem('clerktree_user_id', session.id);
        localStorage.setItem('clerktree_knowledge_base', JSON.stringify(session.config));
        localStorage.setItem('clerktree_seen_welcome', 'true');

        // Notify parent
        onSessionChange(session.id, session.config);
        setCurrentSession(session);
        setIsOpen(false);
        setShowWelcomePopup(false);
    };

    const openEditDialog = (session: UserSession, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSession(session);
        setNewSessionName(session.name);
        setNewSessionDescription(session.description || '');
        setShowEditDialog(true);
    };

    const skipWelcome = () => {
        localStorage.setItem('clerktree_seen_welcome', 'true');
        setShowWelcomePopup(false);
    };

    // Helper to get consistent color for session
    const getSessionColor = (id: string, isDark: boolean) => {
        const colors = [
            { bg: isDark ? "bg-blue-500/10" : "bg-blue-100", text: isDark ? "text-blue-400" : "text-blue-600" },
            { bg: isDark ? "bg-purple-500/10" : "bg-purple-100", text: isDark ? "text-purple-400" : "text-purple-600" },
            { bg: isDark ? "bg-emerald-500/10" : "bg-emerald-100", text: isDark ? "text-emerald-400" : "text-emerald-600" },
            { bg: isDark ? "bg-amber-500/10" : "bg-amber-100", text: isDark ? "text-amber-400" : "text-amber-600" },
            { bg: isDark ? "bg-rose-500/10" : "bg-rose-100", text: isDark ? "text-rose-400" : "text-rose-600" },
            { bg: isDark ? "bg-cyan-500/10" : "bg-cyan-100", text: isDark ? "text-cyan-400" : "text-cyan-600" },
            { bg: isDark ? "bg-indigo-500/10" : "bg-indigo-100", text: isDark ? "text-indigo-400" : "text-indigo-600" },
            { bg: isDark ? "bg-orange-500/10" : "bg-orange-100", text: isDark ? "text-orange-400" : "text-orange-600" },
            { bg: isDark ? "bg-teal-500/10" : "bg-teal-100", text: isDark ? "text-teal-400" : "text-teal-600" },
            { bg: isDark ? "bg-pink-500/10" : "bg-pink-100", text: isDark ? "text-pink-400" : "text-pink-600" },
            { bg: isDark ? "bg-lime-500/10" : "bg-lime-100", text: isDark ? "text-lime-400" : "text-lime-600" },
            { bg: isDark ? "bg-fuchsia-500/10" : "bg-fuchsia-100", text: isDark ? "text-fuchsia-400" : "text-fuchsia-600" },
            { bg: isDark ? "bg-red-500/10" : "bg-red-100", text: isDark ? "text-red-400" : "text-red-600" },
            { bg: isDark ? "bg-violet-500/10" : "bg-violet-100", text: isDark ? "text-violet-400" : "text-violet-600" },
        ];

        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }

        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    const sessionListContent = (
        <>
            {/* Header */}
            <div className={cn(
                "px-4 py-3 flex items-center justify-between border-b",
                isDark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-black/[0.02]"
            )}>
                <span className={cn(
                    "text-xs font-semibold uppercase tracking-wider opacity-70",
                    isDark ? "text-white" : "text-black"
                )}>
                    Switch Session
                </span>
                <button
                    onClick={() => {
                        setShowCreateDialog(true);
                        setIsOpen(false);
                    }}
                    className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group",
                        isDark
                            ? "bg-white text-black hover:bg-white/90"
                            : "bg-black text-white hover:bg-black/90"
                    )}
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                </button>
            </div>

            {/* Sessions List */}
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {sessions.length === 0 ? (
                    <div className="px-4 py-12 text-center opacity-50">
                        <p className="text-sm">No sessions found</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => switchToSession(session)}
                                className={cn(
                                    "relative px-3 py-2.5 rounded-xl cursor-pointer transition-all group",
                                    session.id === currentUserId
                                        ? isDark
                                            ? "bg-white/10"
                                            : "bg-black/5"
                                        : isDark
                                            ? "hover:bg-white/5"
                                            : "hover:bg-black/5"
                                )}
                            >
                                <div className="flex items-center justify-between mb-0.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {/* Session Icon/Avatar */}
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                            getSessionColor(session.id, isDark || false).bg
                                        )}>
                                            <ClerkTreeLogo className={cn(
                                                "w-4 h-4",
                                                getSessionColor(session.id, isDark || false).text
                                            )} isDark={isDark} />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    isDark ? "text-white" : "text-black"
                                                )}>
                                                    {session.name}
                                                </p>
                                                {session.id === currentUserId && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                )}
                                            </div>
                                            {session.description && (
                                                <p className={cn(
                                                    "text-[11px] truncate max-w-[160px]",
                                                    isDark ? "text-white/40" : "text-black/40"
                                                )}>
                                                    {session.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions - Visible on hover only */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => openEditDialog(session, e)}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-colors",
                                                isDark
                                                    ? "hover:bg-white/20 text-white/50 hover:text-white"
                                                    : "hover:bg-black/10 text-black/50 hover:text-black"
                                            )}
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        {session.id !== currentUserId && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteSession(session.id);
                                                }}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors",
                                                    isDark
                                                        ? "hover:bg-red-500/20 text-white/50 hover:text-red-400"
                                                        : "hover:bg-red-500/10 text-black/50 hover:text-red-600"
                                                )}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className={cn(
                "px-4 py-2 text-center text-[10px] uppercase tracking-widest font-medium border-t",
                isDark
                    ? "border-white/5 text-white/20 bg-white/[0.01]"
                    : "border-black/5 text-black/20 bg-black/[0.01]"
            )}>
                {sessions.length} Active Session{sessions.length !== 1 ? 's' : ''}
            </div>
        </>
    );

    return (
        <div className="relative">
            {/* Session Selector Button - Using SidebarMenuButton for proper collapsed handling */}
            <SidebarMenuButton
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                tooltip={currentSession?.name || 'Sessions'}
                className={cn(
                    "text-white/80 hover:text-white hover:bg-white/10",
                    isOpen && "bg-white/10"
                )}
            >
                <Users />
                <span>{currentSession?.name || 'Session'}</span>
                <ChevronDown className={cn(
                    "ml-auto transition-transform",
                    isOpen && "rotate-180"
                )} />
            </SidebarMenuButton>

            {/* ... Dropdowns ... */}

            {/* Dropdown - Different behavior based on collapsed state */}
            <AnimatePresence>
                {isOpen && !isCollapsed && (
                    /* Expanded Sidebar: Inline Accordion */
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className={cn(
                            "mt-2 rounded-xl border overflow-hidden",
                            isDark ? "bg-black/40 border-white/10" : "bg-black/5 border-black/5"
                        )}>
                            {sessionListContent}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed Sidebar Popover - Portaled to escape stacking context */}
            {typeof document !== 'undefined' && isOpen && isCollapsed && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop to close on click outside */}
                        <div
                            className="fixed inset-0 z-[9998]"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, x: -10, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={cn(
                                "fixed left-14 bottom-4 w-64 z-[9999] origin-bottom-left",
                                "rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl border",
                                isDark
                                    ? "bg-[#0A0A0A]/95 border-white/10 shadow-black/50"
                                    : "bg-white/95 border-black/5 shadow-xl"
                            )}
                        >
                            {sessionListContent}
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}

            {/* Welcome Popup (First Time) - Portaled */}


            {/* Welcome Popup (First Time) - Portaled */}
            {
                typeof document !== 'undefined' && createPortal(
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
                                            ClerkTree Session Manager
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
                                                    Welcome to ClerkTree
                                                </h2>
                                                <p className={cn(
                                                    "text-sm leading-relaxed",
                                                    isDark ? "text-white/60" : "text-black/60"
                                                )}>
                                                    Create a personalized session for your AI workflow. Sessions allow you to maintain separate configurations and contexts.
                                                </p>
                                            </div>

                                            <div className="relative z-10 space-y-3 mt-6 md:mt-0">
                                                <div className={cn("flex items-center gap-3 text-xs", isDark ? "text-white/40" : "text-black/40")}>
                                                    <Check className="w-4 h-4 shrink-0" />
                                                    <span>Context-aware interactions</span>
                                                </div>
                                                <div className={cn("flex items-center gap-3 text-xs", isDark ? "text-white/40" : "text-black/40")}>
                                                    <Check className="w-4 h-4 shrink-0" />
                                                    <span>Persistent configuration</span>
                                                </div>
                                                <div className={cn("flex items-center gap-3 text-xs", isDark ? "text-white/40" : "text-black/40")}>
                                                    <Check className="w-4 h-4 shrink-0" />
                                                    <span>Secure data isolation</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Panel */}
                                        <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-center">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className={cn(
                                                        "block text-xs font-medium mb-1.5 uppercase tracking-wider",
                                                        isDark ? "text-white/40" : "text-black/40"
                                                    )}>
                                                        Session Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newSessionName}
                                                        onChange={(e) => setNewSessionName(e.target.value)}
                                                        placeholder="e.g., Medical Office"
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
                                                        Description <span className="opacity-50">(optional)</span>
                                                    </label>
                                                    <textarea
                                                        value={newSessionDescription}
                                                        onChange={(e) => setNewSessionDescription(e.target.value)}
                                                        placeholder="What is this session for?"
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
                                                        onClick={skipWelcome}
                                                        className={cn(
                                                            "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                                            isDark
                                                                ? "bg-white/5 hover:bg-white/10 text-white/70"
                                                                : "bg-black/5 hover:bg-black/10 text-black/70"
                                                        )}
                                                    >
                                                        Skip Setup
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
                                                        {isLoading ? 'Creating...' : 'Create Session'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Existing Sessions Quick Link */}
                                            {sessions.length > 0 && (
                                                <div className="mt-8 pt-6 border-t border-dashed border-white/10">
                                                    <p className={cn(
                                                        "text-xs mb-3 text-center uppercase tracking-wider",
                                                        isDark ? "text-white/30" : "text-black/30"
                                                    )}>
                                                        or continue with
                                                    </p>
                                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                                                        {sessions.slice(0, 3).map(session => (
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
                )
            }

            {/* Create Dialog - Portaled */}
            {
                typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {showCreateDialog && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                                onClick={() => setShowCreateDialog(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                        "w-full max-w-md rounded-2xl p-6",
                                        "backdrop-blur-xl border shadow-2xl",
                                        isDark
                                            ? "bg-black/80 border-white/10"
                                            : "bg-white/90 border-black/10"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className={cn(
                                            "text-lg font-semibold",
                                            isDark ? "text-white" : "text-black"
                                        )}>
                                            Create New Session
                                        </h2>
                                        <button
                                            onClick={() => setShowCreateDialog(false)}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-colors",
                                                isDark
                                                    ? "hover:bg-white/10 text-white/60"
                                                    : "hover:bg-black/10 text-black/60"
                                            )}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={cn(
                                                "block text-xs font-medium mb-1.5 uppercase tracking-wider",
                                                isDark ? "text-white/40" : "text-black/40"
                                            )}>
                                                Session Name
                                            </label>
                                            <input
                                                type="text"
                                                value={newSessionName}
                                                onChange={(e) => setNewSessionName(e.target.value)}
                                                autoFocus
                                                className={cn(
                                                    "w-full px-4 py-2.5 rounded-xl text-sm transition-all",
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
                                                Description <span className="opacity-50">(optional)</span>
                                            </label>
                                            <textarea
                                                value={newSessionDescription}
                                                onChange={(e) => setNewSessionDescription(e.target.value)}
                                                rows={2}
                                                className={cn(
                                                    "w-full px-4 py-2.5 rounded-xl text-sm transition-all resize-none",
                                                    "focus:outline-none focus:ring-1",
                                                    isDark
                                                        ? "bg-white/5 border border-white/10 text-white placeholder-white/20 focus:ring-white/20"
                                                        : "bg-black/5 border border-black/10 text-black placeholder-black/20 focus:ring-black/20"
                                                )}
                                            />
                                        </div>

                                        <div className={cn(
                                            "p-3 rounded-lg flex items-start gap-2.5",
                                            isDark ? "bg-white/5" : "bg-black/5"
                                        )}>
                                            <Settings className={cn("w-4 h-4 mt-0.5", isDark ? "text-white/50" : "text-black/50")} />
                                            <p className={cn(
                                                "text-xs leading-relaxed",
                                                isDark ? "text-white/50" : "text-black/50"
                                            )}>
                                                Creates a new session with your current settings.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => setShowCreateDialog(false)}
                                            className={cn(
                                                "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                                isDark
                                                    ? "bg-white/5 hover:bg-white/10 text-white/70"
                                                    : "bg-black/5 hover:bg-black/10 text-black/70"
                                            )}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={createNewSession}
                                            disabled={!newSessionName.trim() || isLoading}
                                            className={cn(
                                                "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                                isDark
                                                    ? "bg-white text-black hover:bg-white/90"
                                                    : "bg-black text-white hover:bg-black/90",
                                                "disabled:opacity-50 disabled:cursor-not-allowed"
                                            )}
                                        >
                                            {isLoading ? 'Creating...' : 'Create Session'}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }
        </div>
    );
}
