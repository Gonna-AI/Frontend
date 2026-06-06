import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    CalendarDays,
    CheckCircle,
    Flag,
    LayoutDashboard,
    LogOut,
    MessagesSquare,
    Plus,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Navigate } from 'react-router-dom';
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

const sidebarHighlights: { icon: LucideIcon; label: string }[] = [
    { icon: LayoutDashboard, label: 'Deliverables stay visible, prioritized, and editable from one place.' },
    { icon: MessagesSquare, label: 'Status updates become a running client-facing timeline.' },
    { icon: Sparkles, label: 'The structure is ready for Linear and Notion feeds when you switch them on.' },
];

const statCards: { label: string; body: string; icon: LucideIcon; tone: 'neutral' | 'accent' | 'danger' | 'success'; key: 'inFlight' | 'completed' | 'dueSoon' | 'updates' }[] = [
    { label: 'In flight', body: 'Deliverables actively moving right now.', icon: Sparkles, tone: 'accent', key: 'inFlight' },
    { label: 'Completed', body: 'Items already wrapped and shared.', icon: CheckCircle, tone: 'success', key: 'completed' },
    { label: 'Due soon', body: 'Deliverables landing inside the next week.', icon: CalendarDays, tone: 'danger', key: 'dueSoon' },
    { label: 'Update posts', body: 'Messages visible in the client feed.', icon: Flag, tone: 'neutral', key: 'updates' },
];

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'accent' | 'danger' | 'success' }) {
    const toneClassName = {
        neutral: 'border-[#d7dfda] bg-white text-[#4a5d67]',
        accent: 'border-[#a9e4dc] bg-[#edfbf8] text-[#0f6b60]',
        danger: 'border-[#f0cec7] bg-[#fff2ef] text-[#9b4432]',
        success: 'border-[#cfe4d6] bg-[#eff8f1] text-[#2f6a40]',
    }[tone];

    return (
        <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', toneClassName)}>
            {children}
        </span>
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
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#22323b]/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_40px_120px_rgba(34,50,59,0.24)]">
                <div className="border-b border-[#e3e8e4] px-6 py-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#4ec4b6]">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#61757f]">{description}</p>
                </div>
                <div className="px-6 py-5">{children}</div>
                <div className="border-t border-[#e3e8e4] px-6 py-4 text-right">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[#d7dfda] px-4 py-2 text-sm font-semibold text-[#22323b]"
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
                    setError('We could not load the Gluth workspace data.');
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

    return (
        <div className="min-h-screen bg-[#edf1ee] text-[#22323b]">
            <div className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
                <aside className="relative overflow-hidden rounded-[2rem] bg-[#22323b] p-6 text-white shadow-[0_32px_80px_rgba(34,50,59,0.24)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(78,196,182,0.32),transparent_40%)]" />
                    <div className="relative flex h-full flex-col">
                        <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                            <img src={account.logo_url} alt={`${account.name} logo`} className="h-12 w-auto max-w-[180px] object-contain" />
                            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.28em] text-white/55">Client workspace</p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{account.name}</h1>
                            <p className="mt-3 text-sm leading-6 text-white/72">{account.summary}</p>
                        </div>

                        <div className="mt-6 space-y-3">
                            {sidebarHighlights.map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                                    <Icon className="mt-0.5 h-5 w-5 text-[#4ec4b6]" />
                                    <p className="text-sm leading-6 text-white/72">{label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Signed in as</p>
                            <p className="mt-2 text-base font-semibold">{profile.display_name}</p>
                            <p className="mt-1 text-sm text-white/68">@{profile.username}</p>
                            <button
                                type="button"
                                onClick={async () => {
                                    await signOut();
                                }}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="space-y-6">
                    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_28px_80px_rgba(44,63,73,0.1)] backdrop-blur">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#4ec4b6]">Gluth portal</p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Manage deliverables and publish client updates without leaving the workspace.</h2>
                                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#61757f]">
                                    This portal is already structured for future AI, Linear, and Notion integrations. For now it gives Gluth a focused surface for live delivery tracking and clear communication.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeliverableForm(defaultDeliverableForm);
                                        setEditingDeliverable(null);
                                        setDeliverableModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-[1rem] bg-[#22323b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1a2930]"
                                >
                                    <Plus className="h-4 w-4" />
                                    New deliverable
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUpdateForm({
                                            ...defaultUpdateForm,
                                            posted_by: profile.display_name,
                                        });
                                        setUpdateModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-[1rem] border border-[#d7dfda] px-4 py-3 text-sm font-semibold text-[#22323b]"
                                >
                                    <MessagesSquare className="h-4 w-4" />
                                    Post update
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {statCards.map(({ label, body, icon: Icon, tone, key }) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_18px_48px_rgba(44,63,73,0.08)]"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7e9198]">{label}</p>
                                        <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{stats[key]}</p>
                                    </div>
                                    <div className="rounded-full border border-[#d7dfda] bg-[#f6f8f7] p-3">
                                        <Icon className="h-5 w-5 text-[#22323b]" />
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <Pill tone={tone}>{body}</Pill>
                                </div>
                            </motion.div>
                        ))}
                    </section>

                    {error ? (
                        <div className="rounded-[1.4rem] border border-[#f1c3bc] bg-[#fff4f1] px-4 py-3 text-sm text-[#8b392a]">
                            {error}
                        </div>
                    ) : null}

                    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_28px_80px_rgba(44,63,73,0.1)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#4ec4b6]">Deliverables</p>
                                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Current delivery stack</h3>
                                </div>
                                <Pill tone="neutral">{deliverables.length} items</Pill>
                            </div>

                            <div className="mt-6 grid gap-4">
                                {loading ? (
                                    <div className="rounded-[1.5rem] border border-[#d7dfda] bg-[#f8faf8] p-6 text-sm text-[#61757f]">
                                        Loading deliverables...
                                    </div>
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
                                        <div key={deliverable.id} className="rounded-[1.5rem] border border-[#d7dfda] bg-[#f8faf8] p-5">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="max-w-2xl">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Pill tone="accent">{statusLabel(deliverable.status)}</Pill>
                                                        <Pill tone="neutral">{deliverable.priority} priority</Pill>
                                                        <Pill tone={dueTone}>{dueLabel}</Pill>
                                                    </div>
                                                    <h4 className="mt-4 text-xl font-semibold tracking-[-0.03em]">{deliverable.title}</h4>
                                                    <p className="mt-3 text-sm leading-7 text-[#61757f]">{deliverable.summary}</p>
                                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8da0a8]">Category</p>
                                                            <p className="mt-1 text-sm font-medium text-[#22323b]">{deliverable.category}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8da0a8]">Owner</p>
                                                            <p className="mt-1 text-sm font-medium text-[#22323b]">{deliverable.owner_label || 'ClerkTree'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8da0a8]">Progress</p>
                                                            <p className="mt-1 text-sm font-medium text-[#22323b]">{deliverable.progress}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-full max-w-xs rounded-[1.35rem] border border-[#d7dfda] bg-white p-4">
                                                    <div className="h-2 overflow-hidden rounded-full bg-[#e5edeb]">
                                                        <div
                                                            className="h-full rounded-full bg-[#4ec4b6]"
                                                            style={{ width: `${deliverable.progress}%` }}
                                                        />
                                                    </div>
                                                    {deliverable.resource_url ? (
                                                        <a
                                                            href={deliverable.resource_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-4 block text-sm font-semibold text-[#0f6b60]"
                                                        >
                                                            {deliverable.resource_label || 'Open linked resource'}
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
                                                        className="mt-5 inline-flex w-full items-center justify-center rounded-[0.95rem] border border-[#d7dfda] px-4 py-2.5 text-sm font-semibold text-[#22323b]"
                                                    >
                                                        Edit deliverable
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <section className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_28px_80px_rgba(44,63,73,0.1)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#4ec4b6]">Updates</p>
                                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Client-facing timeline</h3>
                                    </div>
                                    <Pill tone="neutral">{updates.length} posts</Pill>
                                </div>
                                <div className="mt-6 space-y-4">
                                    {loading ? (
                                        <div className="rounded-[1.5rem] border border-[#d7dfda] bg-[#f8faf8] p-5 text-sm text-[#61757f]">
                                            Loading updates...
                                        </div>
                                    ) : updates.map((update) => (
                                        <div key={update.id} className="rounded-[1.5rem] border border-[#d7dfda] bg-[#f8faf8] p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Pill tone={update.kind === 'risk' ? 'danger' : update.kind === 'milestone' ? 'accent' : 'neutral'}>
                                                            {statusLabel(update.kind)}
                                                        </Pill>
                                                        {update.is_pinned ? <Pill tone="success">Pinned</Pill> : null}
                                                    </div>
                                                    <h4 className="mt-4 text-lg font-semibold tracking-[-0.02em]">{update.title}</h4>
                                                    <p className="mt-3 text-sm leading-7 text-[#61757f]">{update.body}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.24em] text-[#8da0a8]">
                                                <span>{update.posted_by}</span>
                                                <span>{formatPortalDate(update.posted_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_28px_80px_rgba(44,63,73,0.1)]">
                                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#4ec4b6]">Next integrations</p>
                                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Ready for the AI and tooling layer</h3>
                                <div className="mt-5 space-y-4 text-sm leading-7 text-[#61757f]">
                                    <p>The portal schema is already shaped so Linear issues and Notion updates can publish into the same dashboard later without redesigning the client experience.</p>
                                    <p>The branded login and separate auth client also keep the portal isolated from the main ClerkTree product session.</p>
                                </div>
                                <div className="mt-6 rounded-[1.4rem] border border-dashed border-[#b9d9d4] bg-[#eefaf7] p-4 text-sm font-medium text-[#0f6b60]">
                                    Support contact: {account.support_email || 'client-success@clerktree.com'}
                                </div>
                            </section>
                        </div>
                    </section>
                </main>
            </div>

            {deliverableModalOpen ? (
                <Modal
                    title={editingDeliverable ? 'Edit deliverable' : 'New deliverable'}
                    description="Keep the deliverable stack current so the client always sees the right scope, timing, and ownership."
                    onClose={resetDeliverableModal}
                >
                    <form className="grid gap-4" onSubmit={handleDeliverableSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="text-sm font-medium text-[#22323b]">
                                Title
                                <input
                                    required
                                    value={deliverableForm.title}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, title: event.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                />
                            </label>
                            <label className="text-sm font-medium text-[#22323b]">
                                Category
                                <input
                                    value={deliverableForm.category}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, category: event.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                />
                            </label>
                        </div>

                        <label className="text-sm font-medium text-[#22323b]">
                            Summary
                            <textarea
                                required
                                value={deliverableForm.summary}
                                onChange={(event) => setDeliverableForm((current) => ({ ...current, summary: event.target.value }))}
                                rows={4}
                                className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                            />
                        </label>

                        <div className="grid gap-4 md:grid-cols-4">
                            <label className="text-sm font-medium text-[#22323b]">
                                Status
                                <select
                                    value={deliverableForm.status}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, status: event.target.value as ClientDeliverableInput['status'] }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                >
                                    {statusOptions.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}
                                </select>
                            </label>
                            <label className="text-sm font-medium text-[#22323b]">
                                Priority
                                <select
                                    value={deliverableForm.priority}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, priority: event.target.value as ClientDeliverableInput['priority'] }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                >
                                    {priorityOptions.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}
                                </select>
                            </label>
                            <label className="text-sm font-medium text-[#22323b]">
                                Progress
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={deliverableForm.progress}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, progress: Number(event.target.value) }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                />
                            </label>
                            <label className="text-sm font-medium text-[#22323b]">
                                Due date
                                <input
                                    type="date"
                                    value={deliverableForm.due_date || ''}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, due_date: event.target.value || null }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                />
                            </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <label className="text-sm font-medium text-[#22323b]">
                                Owner
                                <input
                                    value={deliverableForm.owner_label}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, owner_label: event.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                />
                            </label>
                            <label className="text-sm font-medium text-[#22323b]">
                                Resource label
                                <input
                                    value={deliverableForm.resource_label}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, resource_label: event.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                />
                            </label>
                            <label className="text-sm font-medium text-[#22323b]">
                                Resource URL
                                <input
                                    value={deliverableForm.resource_url}
                                    onChange={(event) => setDeliverableForm((current) => ({ ...current, resource_url: event.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                />
                            </label>
                        </div>

                        <label className="text-sm font-medium text-[#22323b]">
                            Notes
                            <textarea
                                value={deliverableForm.notes}
                                onChange={(event) => setDeliverableForm((current) => ({ ...current, notes: event.target.value }))}
                                rows={3}
                                className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                            />
                        </label>

                        <div className="pt-2 text-right">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-[#22323b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
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
                    description="Add a milestone, note, risk, or status message to the client timeline."
                    onClose={resetUpdateModal}
                >
                    <form className="grid gap-4" onSubmit={handleUpdateSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="text-sm font-medium text-[#22323b]">
                                Title
                                <input
                                    required
                                    value={updateForm.title}
                                    onChange={(event) => setUpdateForm((current) => ({ ...current, title: event.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                />
                            </label>
                            <label className="text-sm font-medium text-[#22323b]">
                                Kind
                                <select
                                    value={updateForm.kind}
                                    onChange={(event) => setUpdateForm((current) => ({ ...current, kind: event.target.value as ClientUpdateKind }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                >
                                    {updateKinds.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}
                                </select>
                            </label>
                        </div>

                        <label className="text-sm font-medium text-[#22323b]">
                            Body
                            <textarea
                                required
                                rows={5}
                                value={updateForm.body}
                                onChange={(event) => setUpdateForm((current) => ({ ...current, body: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                            />
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="text-sm font-medium text-[#22323b]">
                                Linked deliverable
                                <select
                                    value={updateForm.deliverable_id || ''}
                                    onChange={(event) => setUpdateForm((current) => ({ ...current, deliverable_id: event.target.value || null }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                >
                                    <option value="">No linked deliverable</option>
                                    {deliverables.map((item) => (
                                        <option key={item.id} value={item.id}>{item.title}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="text-sm font-medium text-[#22323b]">
                                Posted by
                                <input
                                    value={updateForm.posted_by}
                                    onChange={(event) => setUpdateForm((current) => ({ ...current, posted_by: event.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-[#d7dfda] px-4 py-3"
                                />
                            </label>
                        </div>

                        <label className="inline-flex items-center gap-3 text-sm font-medium text-[#22323b]">
                            <input
                                type="checkbox"
                                checked={updateForm.is_pinned}
                                onChange={(event) => setUpdateForm((current) => ({ ...current, is_pinned: event.target.checked }))}
                                className="h-4 w-4 rounded border-[#d7dfda]"
                            />
                            Pin this update to the top of the feed
                        </label>

                        <div className="pt-2 text-right">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-[#22323b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                            >
                                {saving ? 'Posting...' : 'Publish update'}
                            </button>
                        </div>
                    </form>
                </Modal>
            ) : null}
        </div>
    );
}
