import { useState, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../contexts/LanguageContext';
import { Plus, User, Mail, Shield, Trash2, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TeamMember {
    id: string;
    email: string;
    role: 'admin' | 'member';
    status: 'active' | 'pending';
    dateAdded: string;
    lastActive?: string;
}

export default function TeamView({ isDark = true }: { isDark?: boolean }) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'member'>('member');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState(false);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);

    // Load team members from Supabase
    const loadMembers = useCallback(async () => {
        if (!user?.id) return;
        setIsLoadingMembers(true);
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .eq('owner_id', user.id)
                .order('invited_at', { ascending: false });

            if (!error && data) {
                setMembers(data.map(m => ({
                    id: m.id,
                    email: m.email,
                    role: m.role,
                    status: m.status,
                    dateAdded: new Date(m.invited_at).toISOString().split('T')[0],
                    lastActive: m.last_active ? getRelativeTime(new Date(m.last_active)) : undefined
                })));
            }
        } catch (err) {
            console.error('Failed to load team members:', err);
        } finally {
            setIsLoadingMembers(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const getRelativeTime = (date: Date) => {
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        return `${Math.floor(hours / 24)} days ago`;
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !user?.id) return;

        setIsInviting(true);

        try {
            const { data, error } = await supabase
                .from('team_members')
                .insert({
                    owner_id: user.id,
                    email,
                    role,
                    status: 'pending'
                })
                .select()
                .single();

            if (!error && data) {
                const newMember: TeamMember = {
                    id: data.id,
                    email: data.email,
                    role: data.role,
                    status: data.status,
                    dateAdded: new Date(data.invited_at).toISOString().split('T')[0]
                };
                setMembers([newMember, ...members]);
                setInviteSuccess(true);
                setEmail('');
                setTimeout(() => setInviteSuccess(false), 3000);
            } else {
                console.error('Failed to invite member:', error);
            }
        } catch (err) {
            console.error('Failed to invite member:', err);
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (id: string) => {
        if (confirm('Are you sure you want to remove this member?')) {
            try {
                const { error } = await supabase
                    .from('team_members')
                    .delete()
                    .eq('id', id)
                    .eq('owner_id', user?.id);

                if (!error) {
                    setMembers(members.filter(m => m.id !== id));
                }
            } catch (err) {
                console.error('Failed to remove member:', err);
            }
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>
                        {t('team.title')}
                    </h1>
                    <p className={cn("text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>
                        {t('team.subtitle')}
                    </p>
                </div>
            </div>

            {/* Invite Card */}
            <div className={cn(
                "p-6 rounded-xl border relative overflow-hidden transition-all duration-300",
                isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
            )}>
                <div className="relative z-10">
                    <h3 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-black")}>
                        {t('team.invite')}
                    </h3>

                    <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2 w-full">
                            <label className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-white/40" : "text-black/40")}>
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDark ? "text-white/40" : "text-black/40")} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('team.emailPlaceholder')}
                                    required
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none transition-all",
                                        isDark
                                            ? "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-white/20 focus:bg-white/10"
                                            : "bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:border-gray-300 focus:bg-white"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 w-full md:w-48">
                            <label className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-white/40" : "text-black/40")}>
                                {t('team.role')}
                            </label>
                            <div className="relative">
                                <Shield className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDark ? "text-white/40" : "text-black/40")} />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                                    className={cn(
                                        "w-full pl-10 pr-8 py-2.5 rounded-lg border outline-none appearance-none cursor-pointer transition-all",
                                        isDark
                                            ? "bg-white/5 border-white/10 text-white focus:border-white/20 focus:bg-white/10"
                                            : "bg-gray-50 border-gray-200 text-black focus:border-gray-300 focus:bg-white"
                                    )}
                                >
                                    <option value="member">{t('team.role.member')}</option>
                                    <option value="admin">{t('team.role.admin')}</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isInviting || !email}
                            className={cn(
                                "py-2.5 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 min-w-[140px]",
                                isDark
                                    ? "bg-white text-black hover:bg-gray-200 disabled:bg-white/50 disabled:cursor-not-allowed"
                                    : "bg-black text-white hover:bg-gray-800 disabled:bg-black/50 disabled:cursor-not-allowed"
                            )}
                        >
                            {isInviting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : inviteSuccess ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Sent!</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    <span>{t('team.sendInvite')}</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Team List */}
            <div className={cn(
                "rounded-xl border overflow-hidden",
                isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
            )}>
                <div className="p-6 border-b border-inherit">
                    <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>
                        {t('team.members')}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className={cn(
                            "text-xs uppercase font-semibold",
                            isDark ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-600"
                        )}>
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Activity</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                            <AnimatePresence>
                                {members.map((member) => (
                                    <motion.tr
                                        key={member.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={cn(isDark ? "hover:bg-white/5" : "hover:bg-gray-50")}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                                                    isDark ? "bg-white/10 text-white" : "bg-black/10 text-black"
                                                )}>
                                                    {member.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={cn("font-medium", isDark ? "text-white" : "text-black")}>
                                                        {member.email.split('@')[0]}
                                                    </span>
                                                    <span className={cn("text-xs", isDark ? "text-white/40" : "text-black/40")}>
                                                        {member.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-xs font-medium capitalize",
                                                member.role === 'admin'
                                                    ? (isDark ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-600 border border-purple-200")
                                                    : (isDark ? "bg-white/5 text-white/60 border border-white/10" : "bg-gray-100 text-gray-600 border border-gray-200")
                                            )}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "flex items-center gap-1.5 w-fit px-2 py-1 rounded-full text-xs font-medium",
                                                member.status === 'active'
                                                    ? (isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                                                    : (isDark ? "bg-yellow-500/10 text-yellow-400" : "bg-yellow-50 text-yellow-600")
                                            )}>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    member.status === 'active' ? "bg-emerald-500" : "bg-yellow-500"
                                                )} />
                                                {member.status === 'active' ? t('team.status.active') : t('team.status.pending')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={cn("text-xs", isDark ? "text-white/60" : "text-black/60")}>
                                                    Added: {member.dateAdded}
                                                </span>
                                                {member.lastActive && (
                                                    <span className={cn("text-xs", isDark ? "text-white/40" : "text-black/40")}>
                                                        Last active: {member.lastActive}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100",
                                                    isDark
                                                        ? "hover:bg-red-500/10 text-white/40 hover:text-red-400"
                                                        : "hover:bg-red-50 text-black/40 hover:text-red-600"
                                                )}
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
