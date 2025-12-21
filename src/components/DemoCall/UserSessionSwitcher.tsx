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
                                "rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl border",
                                isDark
                                    ? "bg-black/80 border-white/10"
                                    : "bg-white/80 border-black/10"
                            )}
                        >
                            {/* Header */}
                            <div className={cn(
                                "px-3 md:px-4 py-2.5 md:py-3 border-b",
                                isDark ? "border-white/10" : "border-black/5"
                            )}>
                                <div className="flex items-center justify-between">
                                    <h3 className={cn(
                                        "text-xs md:text-sm font-medium",
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
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                            isDark
                                                ? "bg-white text-black hover:bg-white/90"
                                                : "bg-black text-white hover:bg-black/90"
                                        )}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>New</span>
                                    </button>
                                </div>
                            </div>

                            {/* Sessions List */}
                            <div className="max-h-48 md:max-h-64 overflow-y-auto">
                                {sessions.length === 0 ? (
                                    <div className={cn(
                                        "px-4 py-8 text-center",
                                        isDark ? "text-white/40" : "text-black/40"
                                    )}>
                                        <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm font-medium mb-1">No sessions yet</p>
                                        <p className="text-xs opacity-70">Create a session to save your settings</p>
                                    </div>
                                ) : (
                                    sessions.map(session => (
                                        <div
                                            key={session.id}
                                            onClick={() => switchToSession(session)}
                                            className={cn(
                                                "px-3 md:px-4 py-3 cursor-pointer transition-colors group border-b last:border-0",
                                                isDark ? "border-white/5" : "border-black/5",
                                                session.id === currentUserId
                                                    ? isDark
                                                        ? "bg-white/5"
                                                        : "bg-black/5"
                                                    : isDark
                                                        ? "hover:bg-white/5"
                                                        : "hover:bg-black/5"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <p className={cn(
                                                        "text-sm font-medium truncate",
                                                        isDark ? "text-white" : "text-black"
                                                    )}>
                                                        {session.name}
                                                    </p>
                                                    {session.id === currentUserId && (
                                                        <span className={cn(
                                                            "px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                                                            isDark ? "bg-white/10 text-white/70" : "bg-black/10 text-black/70"
                                                        )}>
                                                            Active
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => openEditDialog(session, e)}
                                                        className={cn(
                                                            "p-1.5 rounded-md transition-colors",
                                                            isDark
                                                                ? "hover:bg-white/10 text-white/50 hover:text-white"
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
                                                                "p-1.5 rounded-md transition-colors",
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

                                            {session.description && (
                                                <p className={cn(
                                                    "text-xs truncate pl-0.5",
                                                    isDark ? "text-white/40" : "text-black/40"
                                                )}>
                                                    {session.description}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className={cn(
                                "px-3 md:px-4 py-2 border-t text-center",
                                isDark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-black/[0.02]"
                            )}>
                                <p className={cn(
                                    "text-[10px] md:text-xs font-medium uppercase tracking-widest",
                                    isDark ? "text-white/20" : "text-black/20"
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={cn(
                                "w-full max-w-md rounded-2xl p-6 md:p-8",
                                "border shadow-2xl backdrop-blur-md",
                                isDark
                                    ? "bg-black/90 border-white/10"
                                    : "bg-white/90 border-black/10"
                            )}
                        >
                            {/* Header with Icon */}
                            <div className="text-center mb-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center",
                                    isDark ? "bg-white/10" : "bg-black/5"
                                )}>
                                    <Sparkles className={cn("w-6 h-6", isDark ? "text-white" : "text-black")} />
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
                                        placeholder="What is this session for?"
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
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={skipWelcome}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                        isDark
                                            ? "bg-white/5 hover:bg-white/10 text-white/70"
                                            : "bg-black/5 hover:bg-black/10 text-black/70"
                                    )}
                                >
                                    Skip
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

                            {/* Existing Sessions (if any from Supabase) */}
                            {sessions.length > 0 && (
                                <div className={cn(
                                    "mt-6 pt-6 border-t",
                                    isDark ? "border-white/10" : "border-black/10"
                                )}>
                                    <p className={cn(
                                        "text-xs mb-3 text-center uppercase tracking-wider",
                                        isDark ? "text-white/30" : "text-black/30"
                                    )}>
                                        Existing sessions
                                    </p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {sessions.map(session => (
                                            <button
                                                key={session.id}
                                                onClick={() => switchToSession(session)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                                                    isDark
                                                        ? "hover:bg-white/5"
                                                        : "hover:bg-black/5"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-md flex items-center justify-center",
                                                    isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"
                                                )}>
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={cn(
                                                        "text-sm font-medium truncate",
                                                        isDark ? "text-white" : "text-black"
                                                    )}>
                                                        {session.name}
                                                    </p>
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
            </AnimatePresence>

            {/* Edit Dialog */}
            <AnimatePresence>
                {showEditDialog && editingSession && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowEditDialog(false)}
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
                                        Description
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
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowEditDialog(false)}
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
                                    onClick={updateSession}
                                    disabled={!newSessionName.trim() || isLoading}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                        isDark
                                            ? "bg-white text-black hover:bg-white/90"
                                            : "bg-black text-white hover:bg-black/90",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
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
