import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    CalendarDays,
    CheckCircle,
    Clock3,
    ExternalLink,
    LayoutDashboard,
    Mail,
    MessagesSquare,
    Plus,
    Shield,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import ClientPortalShell from '../../components/client-portal/ClientPortalShell';
import { useClientPortal } from '../../contexts/ClientPortalContext';
import { cn } from '../../lib/utils';
import { createDeliverable, createUpdate, fetchClientPortalData, updateDeliverable } from '../../services/clientPortalService';
import type {
    ClientDeliverable,
    ClientDeliverableInput,
    ClientUpdate,
    ClientUpdateInput,
    ClientUpdateKind,
} from '../../types/clientPortal';
import { daysUntil, formatPortalDate, statusLabel } from '../../utils/clientPortal';

const easeOut = [0.23, 1, 0.32, 1] as const;

const statusOptions: ClientDeliverableInput['status'][] = ['planned', 'in_progress', 'review', 'blocked', 'done'];
const priorityOptions: ClientDeliverableInput['priority'][] = ['low', 'medium', 'high'];
const updateKinds: ClientUpdateKind[] = ['update', 'milestone', 'risk', 'note'];

const defaultDeliverableForm: ClientDeliverableInput = {
    title: '',
    summary: '',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    due_date: null,
    owner_label: '',
    category: 'General',
    resource_label: '',
    resource_url: '',
    notes: '',
};

const defaultUpdateForm: ClientUpdateInput = {
    title: '',
    body: '',
    kind: 'update',
    deliverable_id: null,
    posted_by: 'ClerkTree',
    is_pinned: false,
};

const statCards: {
    label: string;
    body: string;
    icon: LucideIcon;
    tone: 'neutral' | 'accent' | 'danger' | 'success';
    key: 'inFlight' | 'completed' | 'dueSoon' | 'updates';
}[] = [
    { label: 'In flight', body: 'Active deliverables in motion.', icon: Sparkles, tone: 'accent', key: 'inFlight' },
    { label: 'Completed', body: 'Closed items already delivered.', icon: CheckCircle, tone: 'success', key: 'completed' },
    { label: 'Due soon', body: 'Due within the next seven days.', icon: CalendarDays, tone: 'danger', key: 'dueSoon' },
    { label: 'Updates', body: 'Published to the client feed.', icon: MessagesSquare, tone: 'neutral', key: 'updates' },
];

const fieldClassName = 'mt-2 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#FF8A5B]/60 focus:bg-white/[0.06]';
const labelClassName = 'text-sm font-medium text-white/75';

function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'danger' | 'success' }) {
    const toneClassName = {
        neutral: 'border-white/10 bg-white/[0.05] text-white/70',
        accent: 'border-[#FF8A5B]/25 bg-[#FF8A5B]/10 text-[#FFB08C]',
        danger: 'border-[#FF8A5B]/22 bg-[#FF8A5B]/12 text-[#FFD1BF]',
        success: 'border-[#7BDCB5]/18 bg-[#7BDCB5]/10 text-[#C3F3DE]',
    }[tone];

    return (
        <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]', toneClassName)}>
            {children}
        </span>
    );
}

function EmptyState({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-base font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm leading-7 text-white/55">{body}</p>
        </div>
    );
}

function Modal({
    title,
    description,
    onClose,
    children,
}: {
    title: string;
    description: string;
    onClose: () => void;
    children: ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-4 backdrop-blur-md">
            <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]/96 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                <div className="border-b border-white/10 px-6 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B]">{title}</p>
                    <p className="mt-3 text-sm leading-7 text-white/55">{description}</p>
                </div>
                <div className="px-6 py-5">{children}</div>
                <div className="border-t border-white/10 px-6 py-4 text-right">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.09]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ClientPortalDashboard() {
    const { session, user, profile, account, signOut } = useClientPortal();

    const [deliverables, setDeliverables] = useState<ClientDeliverable[]>([]);
    const [updates, setUpdates] = useState<ClientUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deliverableForm, setDeliverableForm] = useState(defaultDeliverableForm);
    const [updateForm, setUpdateForm] = useState(defaultUpdateForm);
    const [editingDeliverable, setEditingDeliverable] = useState<ClientDeliverable | null>(null);
    const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);

    useEffect(() => {
        if (!session || !profile) {
            return;
        }

        let active = true;

        setLoading(true);
        fetchClientPortalData()
            .then((data) => {
                if (!active) {
                    return;
                }

                setDeliverables(data.deliverables);
                setUpdates(data.updates);
                setError(null);
            })
            .catch((fetchError) => {
                console.error('Failed to load portal data', fetchError);
                if (active) {
                    setError('We could not load this workspace.');
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [profile, session]);

    const stats = useMemo(() => {
        const completed = deliverables.filter((item) => item.status === 'done').length;
        const inFlight = deliverables.filter((item) => item.status === 'in_progress' || item.status === 'review').length;
        const dueSoon = deliverables.filter((item) => {
            const days = daysUntil(item.due_date);
            return days !== null && days >= 0 && days <= 7;
        }).length;

        return {
            completed,
            inFlight,
            dueSoon,
            updates: updates.length,
        };
    }, [deliverables, updates]);

    if (!session || !profile || !account || !user) {
        return <Navigate to="/client/login" replace />;
    }

    const resetDeliverableModal = () => {
        setDeliverableForm(defaultDeliverableForm);
        setEditingDeliverable(null);
        setDeliverableModalOpen(false);
    };

    const resetUpdateModal = () => {
        setUpdateForm({
            ...defaultUpdateForm,
            posted_by: profile.display_name || 'ClerkTree',
        });
        setUpdateModalOpen(false);
    };

    const handleDeliverableSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (editingDeliverable) {
                const updated = await updateDeliverable(editingDeliverable.id, deliverableForm);
                setDeliverables((current) => current.map((item) => item.id === updated.id ? updated : item));
            } else {
                const created = await createDeliverable(account.id, user.id, deliverableForm);
                setDeliverables((current) => [created, ...current]);
            }

            resetDeliverableModal();
        } catch (saveError) {
            console.error('Failed to save deliverable', saveError);
            setError('We could not save that deliverable.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const created = await createUpdate(account.id, user.id, {
                ...updateForm,
                posted_by: updateForm.posted_by || profile.display_name,
            });
            setUpdates((current) => [created, ...current]);
            resetUpdateModal();
        } catch (saveError) {
            console.error('Failed to save update', saveError);
            setError('We could not post that update.');
        } finally {
            setSaving(false);
        }
    };

    const workspaceSummary = account.summary?.trim() || 'Track live deliverables and recent workspace updates.';
    const supportEmail = account.support_email || 'client-success@clerktree.com';
    const roleLabel = profile.role === 'client_admin' ? 'Client admin' : 'Client member';
    const lastSeenLabel = profile.last_login_at ? formatPortalDate(profile.last_login_at) : 'First session';

    return (
        <ClientPortalShell account={account} headerBadge="Client workspace" onSignOut={signOut}>
            <div className="mx-auto w-full max-w-7xl space-y-6">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,91,0.18),transparent_35%)]" />
                    <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                                <Pill tone="accent">Client portal</Pill>
                                <Pill tone="neutral">{roleLabel}</Pill>
                                <Pill tone="neutral">@{profile.username}</Pill>
                            </div>

                            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-white p-4 shadow-[0_20px_48px_rgba(0,0,0,0.24)]">
                                    <img src={account.logo_url} alt={`${account.name} logo`} className="h-10 w-auto max-w-full object-contain" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">{account.name}</h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">{workspaceSummary}</p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Building2 className="h-4 w-4" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Workspace</span>
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-white">/{account.slug}</p>
                                </div>
                                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Clock3 className="h-4 w-4" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Last access</span>
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-white">{lastSeenLabel}</p>
                                </div>
                                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Support</span>
                                    </div>
                                    <a href={`mailto:${supportEmail}`} className="mt-3 block text-sm font-semibold text-white transition hover:text-[#FFB08C]">
                                        {supportEmail}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 xl:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setDeliverableForm(defaultDeliverableForm);
                                    setEditingDeliverable(null);
                                    setDeliverableModalOpen(true);
                                }}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#FFEEE8] active:scale-[0.98]"
                            >
                                <Plus className="h-4 w-4" />
                                New deliverable
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setUpdateForm({
                                        ...defaultUpdateForm,
                                        posted_by: profile.display_name || 'ClerkTree',
                                    });
                                    setUpdateModalOpen(true);
                                }}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#FF8A5B] px-5 text-sm font-semibold text-black transition hover:bg-[#FF9A71] active:scale-[0.98]"
                            >
                                <MessagesSquare className="h-4 w-4" />
                                Post update
                            </button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map(({ label, body, icon: Icon, tone, key }, index) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: index * 0.04, ease: easeOut }}
                            className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">{label}</p>
                                    <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">{stats[key]}</p>
                                </div>
                                <div className="rounded-full border border-white/10 bg-white/[0.06] p-3">
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="mt-5">
                                <Pill tone={tone}>{body}</Pill>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {error ? (
                    <div className="rounded-[1.5rem] border border-[#FF8A5B]/30 bg-[#FF8A5B]/10 px-4 py-3 text-sm text-[#FFD1BF]">
                        {error}
                    </div>
                ) : null}

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B]">Deliverables</p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Live scope</h2>
                            </div>
                            <Pill tone="neutral">{deliverables.length} items</Pill>
                        </div>

                        <div className="mt-6 grid gap-4">
                            {loading ? (
                                <EmptyState title="Loading deliverables" body="Workspace items are being fetched." />
                            ) : deliverables.length === 0 ? (
                                <EmptyState title="No deliverables yet" body="Create the first deliverable to start tracking scope in this workspace." />
                            ) : deliverables.map((deliverable) => {
                                const dueLabel = formatPortalDate(deliverable.due_date);
                                const dueDelta = daysUntil(deliverable.due_date);
                                const dueTone =
                                    deliverable.status === 'done'
                                        ? 'success'
                                        : dueDelta !== null && dueDelta <= 5
                                            ? 'danger'
                                            : 'accent';

                                return (
                                    <div
                                        key={deliverable.id}
                                        className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5 transition hover:border-white/16 hover:bg-white/[0.05]"
                                    >
                                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap gap-2">
                                                    <Pill tone="accent">{statusLabel(deliverable.status)}</Pill>
                                                    <Pill tone="neutral">{statusLabel(deliverable.priority)} priority</Pill>
                                                    <Pill tone={dueTone}>{dueLabel}</Pill>
                                                </div>
                                                <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-white">{deliverable.title}</h3>
                                                <p className="mt-3 text-sm leading-7 text-white/60">{deliverable.summary}</p>

                                                <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                                                    <div>
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Category</p>
                                                        <p className="mt-2 font-semibold text-white">{deliverable.category}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Owner</p>
                                                        <p className="mt-2 font-semibold text-white">{deliverable.owner_label || 'ClerkTree'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Progress</p>
                                                        <p className="mt-2 font-semibold text-white">{deliverable.progress}%</p>
                                                    </div>
                                                </div>

                                                {deliverable.notes ? (
                                                    <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Notes</p>
                                                        <p className="mt-2 text-sm leading-7 text-white/60">{deliverable.notes}</p>
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="w-full xl:max-w-xs">
                                                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                                                    <div className="flex items-center justify-between text-sm text-white/55">
                                                        <span>Progress</span>
                                                        <span>{deliverable.progress}%</span>
                                                    </div>
                                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-[#FF8A5B] to-[#FFB08C]"
                                                            style={{ width: `${deliverable.progress}%` }}
                                                        />
                                                    </div>

                                                    {deliverable.resource_url ? (
                                                        <a
                                                            href={deliverable.resource_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#FFB08C] transition hover:text-white"
                                                        >
                                                            {deliverable.resource_label || 'Open linked resource'}
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    ) : null}

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingDeliverable(deliverable);
                                                            setDeliverableForm({
                                                                title: deliverable.title,
                                                                summary: deliverable.summary,
                                                                status: deliverable.status,
                                                                priority: deliverable.priority,
                                                                progress: deliverable.progress,
                                                                due_date: deliverable.due_date,
                                                                owner_label: deliverable.owner_label || '',
                                                                category: deliverable.category,
                                                                resource_label: deliverable.resource_label || '',
                                                                resource_url: deliverable.resource_url || '',
                                                                notes: deliverable.notes || '',
                                                            });
                                                            setDeliverableModalOpen(true);
                                                        }}
                                                        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08] active:scale-[0.98]"
                                                    >
                                                        Edit deliverable
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B]">Updates</p>
                                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Client feed</h2>
                                </div>
                                <Pill tone="neutral">{updates.length} posts</Pill>
                            </div>

                            <div className="mt-6 space-y-4">
                                {loading ? (
                                    <EmptyState title="Loading updates" body="Workspace messages are being fetched." />
                                ) : updates.length === 0 ? (
                                    <EmptyState title="No updates yet" body="Post the first update to start the client timeline." />
                                ) : updates.map((update) => (
                                    <div key={update.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap gap-2">
                                                    <Pill tone={update.kind === 'risk' ? 'danger' : update.kind === 'milestone' ? 'accent' : 'neutral'}>
                                                        {statusLabel(update.kind)}
                                                    </Pill>
                                                    {update.is_pinned ? <Pill tone="success">Pinned</Pill> : null}
                                                </div>
                                                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-white">{update.title}</h3>
                                                <p className="mt-3 text-sm leading-7 text-white/60">{update.body}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
                                            <span>{update.posted_by}</span>
                                            <span>{formatPortalDate(update.posted_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B]">Workspace details</p>
                            <div className="mt-5 space-y-4">
                                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Shield className="h-4 w-4" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Role</span>
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-white">{roleLabel}</p>
                                </div>

                                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Support</span>
                                    </div>
                                    <a href={`mailto:${supportEmail}`} className="mt-3 block text-sm font-semibold text-white transition hover:text-[#FFB08C]">
                                        {supportEmail}
                                    </a>
                                </div>

                                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Portal</span>
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-white">Deliverables and updates stay in this dedicated client workspace.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
            </div>

            {deliverableModalOpen ? (
                <Modal
                    title={editingDeliverable ? 'Edit deliverable' : 'New deliverable'}
                    description="Update scope, timing, links, and ownership for this workspace."
                    onClose={resetDeliverableModal}
                >
                    <form className="grid gap-4" onSubmit={handleDeliverableSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className={labelClassName}>
                                Title
                                <input
                                    required
                                    value={deliverableForm.title}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, title: event.target.value }))}
                                    className={fieldClassName}
                                />
                            </label>
                            <label className={labelClassName}>
                                Category
                                <input
                                    value={deliverableForm.category}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, category: event.target.value }))}
                                    className={fieldClassName}
                                />
                            </label>
                        </div>

                        <label className={labelClassName}>
                            Summary
                            <textarea
                                required
                                value={deliverableForm.summary}
                                onChange={(event) => setDeliverableForm((current) => ({ ...current, summary: event.target.value }))}
                                rows={4}
                                className={fieldClassName}
                            />
                        </label>

                        <div className="grid gap-4 md:grid-cols-4">
                            <label className={labelClassName}>
                                Status
                                <select
                                    value={deliverableForm.status}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, status: event.target.value as ClientDeliverableInput['status'] }))}
                                    className={fieldClassName}
                                >
                                    {statusOptions.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}
                                </select>
                            </label>
                            <label className={labelClassName}>
                                Priority
                                <select
                                    value={deliverableForm.priority}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, priority: event.target.value as ClientDeliverableInput['priority'] }))}
                                    className={fieldClassName}
                                >
                                    {priorityOptions.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}
                                </select>
                            </label>
                            <label className={labelClassName}>
                                Progress
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={deliverableForm.progress}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, progress: Number(event.target.value) }))}
                                    className={fieldClassName}
                                />
                            </label>
                            <label className={labelClassName}>
                                Due date
                                <input
                                    type="date"
                                    value={deliverableForm.due_date || ''}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, due_date: event.target.value || null }))}
                                    className={fieldClassName}
                                />
                            </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <label className={labelClassName}>
                                Owner
                                <input
                                    value={deliverableForm.owner_label}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, owner_label: event.target.value }))}
                                    className={fieldClassName}
                                />
                            </label>
                            <label className={labelClassName}>
                                Resource label
                                <input
                                    value={deliverableForm.resource_label}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, resource_label: event.target.value }))}
                                    className={fieldClassName}
                                />
                            </label>
                            <label className={labelClassName}>
                                Resource URL
                                <input
                                    value={deliverableForm.resource_url}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, resource_url: event.target.value }))}
                                    className={fieldClassName}
                                />
                            </label>
                        </div>

                        <label className={labelClassName}>
                            Notes
                            <textarea
                                value={deliverableForm.notes}
                                onChange={(event) => setDeliverableForm((current) => ({ ...current, notes: event.target.value }))}
                                rows={3}
                                className={fieldClassName}
                            />
                        </label>

                        <div className="pt-2 text-right">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#FFEEE8] disabled:opacity-70"
                            >
                                {saving ? 'Saving...' : editingDeliverable ? 'Save changes' : 'Create deliverable'}
                            </button>
                        </div>
                    </form>
                </Modal>
            ) : null}

            {updateModalOpen ? (
                <Modal
                    title="Post an update"
                    description="Publish a message to the client timeline."
                    onClose={resetUpdateModal}
                >
                    <form className="grid gap-4" onSubmit={handleUpdateSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className={labelClassName}>
                                Title
                                <input
                                    required
                                    value={updateForm.title}
                                    onChange={(event) => setUpdateForm((current) => ({ ...current, title: event.target.value }))}
                                    className={fieldClassName}
                                />
                            </label>
                            <label className={labelClassName}>
                                Kind
                                <select
                                    value={updateForm.kind}
                                    onChange={(event) => setUpdateForm((current) => ({ ...current, kind: event.target.value as ClientUpdateKind }))}
                                    className={fieldClassName}
                                >
                                    {updateKinds.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}
                                </select>
                            </label>
                        </div>

                        <label className={labelClassName}>
                            Body
                            <textarea
                                required
                                rows={5}
                                value={updateForm.body}
                                onChange={(event) => setUpdateForm((current) => ({ ...current, body: event.target.value }))}
                                className={fieldClassName}
                            />
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className={labelClassName}>
                                Linked deliverable
                                <select
                                    value={updateForm.deliverable_id || ''}
                                    onChange={(event) => setUpdateForm((current) => ({ ...current, deliverable_id: event.target.value || null }))}
                                    className={fieldClassName}
                                >
                                    <option value="">No linked deliverable</option>
                                    {deliverables.map((item) => (
                                        <option key={item.id} value={item.id}>{item.title}</option>
                                    ))}
                                </select>
                            </label>
                            <label className={labelClassName}>
                                Posted by
                                <input
                                    value={updateForm.posted_by}
                                    onChange={(event) => setUpdateForm((current) => ({ ...current, posted_by: event.target.value }))}
                                    className={fieldClassName}
                                />
                            </label>
                        </div>

                        <label className="inline-flex items-center gap-3 text-sm font-medium text-white/75">
                            <input
                                type="checkbox"
                                checked={updateForm.is_pinned}
                                onChange={(event) => setUpdateForm((current) => ({ ...current, is_pinned: event.target.checked }))}
                                className="h-4 w-4 rounded border-white/15 bg-white/5"
                            />
                            Pin this update to the top of the feed
                        </label>

                        <div className="pt-2 text-right">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-full bg-[#FF8A5B] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#FF9A71] disabled:opacity-70"
                            >
                                {saving ? 'Posting...' : 'Publish update'}
                            </button>
                        </div>
                    </form>
                </Modal>
            ) : null}
        </ClientPortalShell>
    );
}
