import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Plus,
    Check,
    X,
    ChevronDown,
    Settings,
    Trash2,
    Edit2,
    Users,
    Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase } from '../../config/supabase';

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
}

export default function UserSessionSwitcher({
    isDark = true,
    currentUserId,
    onSessionChange,
    currentConfig,
    onSaveSession
}: UserSessionSwitcherProps) {
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
            } else if (sessions.length === 0) {
                // First time user - show welcome popup
                const hasSeenWelcome = localStorage.getItem('clerktree_seen_welcome');
                if (!hasSeenWelcome) {
                    setShowWelcomePopup(true);
                }
            }
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

    return (
        <>
            {/* Session Selector Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all",
                    "border text-xs md:text-sm font-medium",
                    isDark
                        ? "bg-white/5 border-white/10 hover:bg-white/10 text-white/80 hover:text-white"
                        : "bg-black/5 border-black/10 hover:bg-black/10 text-black/80 hover:text-black"
                )}
            >
                <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="max-w-[60px] md:max-w-[100px] truncate">
                    {currentSession?.name || 'Session'}
                </span>
                <ChevronDown className={cn(
                    "w-3 h-3 md:w-4 md:h-4 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className={cn(
                                "absolute top-full right-0 mt-2 w-64 md:w-72 z-50",
                                "rounded-xl overflow-hidden",
                                "backdrop-blur-xl border shadow-2xl",
                                isDark
                                    ? "bg-[rgb(20,20,20)]/95 border-white/10"
                                    : "bg-white/95 border-black/10"
                            )}
                        >
                            {/* Header */}
                            <div className={cn(
                                "px-3 md:px-4 py-2.5 md:py-3 border-b",
                                isDark ? "border-white/10" : "border-black/10"
                            )}>
                                <div className="flex items-center justify-between">
                                    <h3 className={cn(
                                        "text-xs md:text-sm font-semibold",
                                        isDark ? "text-white" : "text-black"
                                    )}>
                                        Sessions
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowCreateDialog(true);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all",
                                            "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
                                            "hover:from-blue-600 hover:to-purple-600",
                                            "shadow-lg shadow-blue-500/20"
                                        )}
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span className="hidden md:inline">New</span>
                                    </button>
                                </div>
                            </div>

                            {/* Sessions List */}
                            <div className="max-h-48 md:max-h-64 overflow-y-auto">
                                {sessions.length === 0 ? (
                                    <div className={cn(
                                        "px-4 py-6 text-center",
                                        isDark ? "text-white/40" : "text-black/40"
                                    )}>
                                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">No sessions yet</p>
                                        <p className="text-xs mt-1">Create one to get started!</p>
                                    </div>
                                ) : (
                                    sessions.map(session => (
                                        <div
                                            key={session.id}
                                            onClick={() => switchToSession(session)}
                                            className={cn(
                                                "px-3 md:px-4 py-2.5 md:py-3 cursor-pointer transition-colors group",
                                                "flex items-center justify-between",
                                                session.id === currentUserId
                                                    ? isDark
                                                        ? "bg-blue-500/10"
                                                        : "bg-blue-500/5"
                                                    : isDark
                                                        ? "hover:bg-white/5"
                                                        : "hover:bg-black/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                                <div className={cn(
                                                    "w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                                    session.id === currentUserId
                                                        ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                                                        : isDark
                                                            ? "bg-white/5 text-white/60"
                                                            : "bg-black/5 text-black/60"
                                                )}>
                                                    <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={cn(
                                                        "text-xs md:text-sm font-medium truncate",
                                                        isDark ? "text-white" : "text-black"
                                                    )}>
                                                        {session.name}
                                                    </p>
                                                    {session.description && (
                                                        <p className={cn(
                                                            "text-[10px] md:text-xs truncate",
                                                            isDark ? "text-white/40" : "text-black/40"
                                                        )}>
                                                            {session.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-0.5 md:gap-1">
                                                {session.id === currentUserId && (
                                                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                                                )}
                                                <button
                                                    onClick={(e) => openEditDialog(session, e)}
                                                    className={cn(
                                                        "p-1 md:p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
                                                        isDark
                                                            ? "hover:bg-white/10 text-white/60"
                                                            : "hover:bg-black/10 text-black/60"
                                                    )}
                                                >
                                                    <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                </button>
                                                {session.id !== currentUserId && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteSession(session.id);
                                                        }}
                                                        className={cn(
                                                            "p-1 md:p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
                                                            isDark
                                                                ? "hover:bg-red-500/20 text-red-400"
                                                                : "hover:bg-red-500/10 text-red-600"
                                                        )}
                                                    >
                                                        <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className={cn(
                                "px-3 md:px-4 py-2 border-t text-center",
                                isDark ? "border-white/10 bg-white/[0.02]" : "border-black/10 bg-black/[0.02]"
                            )}>
                                <p className={cn(
                                    "text-[10px] md:text-xs",
                                    isDark ? "text-white/30" : "text-black/30"
                                )}>
                                    {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Welcome Popup (First Time) */}
            <AnimatePresence>
                {showWelcomePopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={cn(
                                "w-full max-w-md rounded-2xl p-6 md:p-8",
                                "backdrop-blur-xl border shadow-2xl",
                                isDark
                                    ? "bg-[rgb(15,15,15)] border-white/10"
                                    : "bg-white border-black/10"
                            )}
                        >
                            {/* Header with Icon */}
                            <div className="text-center mb-6">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                                    "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/30"
                                )}>
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h2 className={cn(
                                    "text-xl md:text-2xl font-bold mb-2",
                                    isDark ? "text-white" : "text-black"
                                )}>
                                    Welcome to ClerkTree
                                </h2>
                                <p className={cn(
                                    "text-sm",
                                    isDark ? "text-white/60" : "text-black/60"
                                )}>
                                    Create a session to save your AI assistant configuration
                                </p>
                            </div>

                            {/* Session Name Input */}
                            <div className="space-y-4">
                                <div>
                                    <label className={cn(
                                        "block text-sm font-medium mb-2",
                                        isDark ? "text-white/80" : "text-black/80"
                                    )}>
                                        Session Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newSessionName}
                                        onChange={(e) => setNewSessionName(e.target.value)}
                                        placeholder="e.g., Medical Office, Law Firm..."
                                        autoFocus
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl text-sm transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                            isDark
                                                ? "bg-white/5 border border-white/10 text-white placeholder-white/30"
                                                : "bg-black/5 border border-black/10 text-black placeholder-black/30"
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className={cn(
                                        "block text-sm font-medium mb-2",
                                        isDark ? "text-white/80" : "text-black/80"
                                    )}>
                                        Description <span className={isDark ? "text-white/40" : "text-black/40"}>(optional)</span>
                                    </label>
                                    <textarea
                                        value={newSessionDescription}
                                        onChange={(e) => setNewSessionDescription(e.target.value)}
                                        placeholder="What is this session for?"
                                        rows={2}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl text-sm transition-all resize-none",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                            isDark
                                                ? "bg-white/5 border border-white/10 text-white placeholder-white/30"
                                                : "bg-black/5 border border-black/10 text-black placeholder-black/30"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={skipWelcome}
                                    className={cn(
                                        "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                        isDark
                                            ? "bg-white/5 hover:bg-white/10 text-white/70"
                                            : "bg-black/5 hover:bg-black/10 text-black/70"
                                    )}
                                >
                                    Skip for now
                                </button>
                                <button
                                    onClick={createNewSession}
                                    disabled={!newSessionName.trim() || isLoading}
                                    className={cn(
                                        "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                        "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
                                        "hover:from-blue-600 hover:to-purple-700",
                                        "shadow-lg shadow-blue-500/25",
                                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                    )}
                                >
                                    {isLoading ? 'Creating...' : 'Create Session'}
                                </button>
                            </div>

                            {/* Existing Sessions (if any from Supabase) */}
                            {sessions.length > 0 && (
                                <div className={cn(
                                    "mt-6 pt-6 border-t",
                                    isDark ? "border-white/10" : "border-black/10"
                                )}>
                                    <p className={cn(
                                        "text-xs mb-3 text-center",
                                        isDark ? "text-white/50" : "text-black/50"
                                    )}>
                                        Or select an existing session:
                                    </p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {sessions.map(session => (
                                            <button
                                                key={session.id}
                                                onClick={() => switchToSession(session)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors",
                                                    isDark
                                                        ? "bg-white/5 hover:bg-white/10"
                                                        : "bg-black/5 hover:bg-black/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                                    "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                                                )}>
                                                    <User className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={cn(
                                                        "text-sm font-medium truncate",
                                                        isDark ? "text-white" : "text-black"
                                                    )}>
                                                        {session.name}
                                                    </p>
                                                    {session.description && (
                                                        <p className={cn(
                                                            "text-xs truncate",
                                                            isDark ? "text-white/40" : "text-black/40"
                                                        )}>
                                                            {session.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Dialog */}
            <AnimatePresence>
                {showCreateDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowCreateDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-md rounded-2xl p-6",
                                "backdrop-blur-xl border shadow-2xl",
                                isDark
                                    ? "bg-[rgb(15,15,15)] border-white/10"
                                    : "bg-white border-black/10"
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
                                        "block text-sm font-medium mb-1.5",
                                        isDark ? "text-white/80" : "text-black/80"
                                    )}>
                                        Session Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newSessionName}
                                        onChange={(e) => setNewSessionName(e.target.value)}
                                        placeholder="e.g., Medical Office, Law Firm..."
                                        autoFocus
                                        className={cn(
                                            "w-full px-4 py-2.5 rounded-xl text-sm transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                            isDark
                                                ? "bg-white/5 border border-white/10 text-white placeholder-white/30"
                                                : "bg-black/5 border border-black/10 text-black placeholder-black/30"
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className={cn(
                                        "block text-sm font-medium mb-1.5",
                                        isDark ? "text-white/80" : "text-black/80"
                                    )}>
                                        Description (optional)
                                    </label>
                                    <textarea
                                        value={newSessionDescription}
                                        onChange={(e) => setNewSessionDescription(e.target.value)}
                                        placeholder="What is this session for?"
                                        rows={2}
                                        className={cn(
                                            "w-full px-4 py-2.5 rounded-xl text-sm transition-all resize-none",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                            isDark
                                                ? "bg-white/5 border border-white/10 text-white placeholder-white/30"
                                                : "bg-black/5 border border-black/10 text-black placeholder-black/30"
                                        )}
                                    />
                                </div>

                                <div className={cn(
                                    "p-3 rounded-xl flex items-start gap-2",
                                    isDark ? "bg-blue-500/10" : "bg-blue-500/5"
                                )}>
                                    <Settings className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className={cn(
                                        "text-xs",
                                        isDark ? "text-blue-300" : "text-blue-600"
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
                                            ? "bg-white/5 hover:bg-white/10 text-white"
                                            : "bg-black/5 hover:bg-black/10 text-black"
                                    )}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createNewSession}
                                    disabled={!newSessionName.trim() || isLoading}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                        "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
                                        "hover:from-blue-600 hover:to-purple-700",
                                        "shadow-lg shadow-blue-500/25",
                                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                    )}
                                >
                                    {isLoading ? 'Creating...' : 'Create Session'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Dialog */}
            <AnimatePresence>
                {showEditDialog && editingSession && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowEditDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-md rounded-2xl p-6",
                                "backdrop-blur-xl border shadow-2xl",
                                isDark
                                    ? "bg-[rgb(15,15,15)] border-white/10"
                                    : "bg-white border-black/10"
                            )}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className={cn(
                                    "text-lg font-semibold",
                                    isDark ? "text-white" : "text-black"
                                )}>
                                    Edit Session
                                </h2>
                                <button
                                    onClick={() => setShowEditDialog(false)}
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
                                        "block text-sm font-medium mb-1.5",
                                        isDark ? "text-white/80" : "text-black/80"
                                    )}>
                                        Session Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newSessionName}
                                        onChange={(e) => setNewSessionName(e.target.value)}
                                        autoFocus
                                        className={cn(
                                            "w-full px-4 py-2.5 rounded-xl text-sm transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                            isDark
                                                ? "bg-white/5 border border-white/10 text-white placeholder-white/30"
                                                : "bg-black/5 border border-black/10 text-black placeholder-black/30"
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className={cn(
                                        "block text-sm font-medium mb-1.5",
                                        isDark ? "text-white/80" : "text-black/80"
                                    )}>
                                        Description
                                    </label>
                                    <textarea
                                        value={newSessionDescription}
                                        onChange={(e) => setNewSessionDescription(e.target.value)}
                                        rows={2}
                                        className={cn(
                                            "w-full px-4 py-2.5 rounded-xl text-sm transition-all resize-none",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                            isDark
                                                ? "bg-white/5 border border-white/10 text-white placeholder-white/30"
                                                : "bg-black/5 border border-black/10 text-black placeholder-black/30"
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowEditDialog(false)}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                        isDark
                                            ? "bg-white/5 hover:bg-white/10 text-white"
                                            : "bg-black/5 hover:bg-black/10 text-black"
                                    )}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={updateSession}
                                    disabled={!newSessionName.trim() || isLoading}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                        "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
                                        "hover:from-blue-600 hover:to-purple-700",
                                        "shadow-lg shadow-blue-500/25",
                                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                    )}
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
