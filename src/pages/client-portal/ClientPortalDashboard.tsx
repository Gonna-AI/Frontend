import { FormEvent, ReactNode, useState } from 'react';
import {
    Building2,
    CalendarDays,
    Clock3,
    Mail,
    MessageCircle,
    Send,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import ClickUpTasks from '../../components/client-portal/ClickUpTasks';
import ClientPortalShell from '../../components/client-portal/ClientPortalShell';
import NotionNotes from '../../components/client-portal/NotionNotes';
import { useClientPortal } from '../../contexts/ClientPortalContext';
import { cn } from '../../lib/utils';
import { sendSlackSupportMessage } from '../../services/clientPortalService';
import { formatPortalDate } from '../../utils/clientPortal';

const fieldClassName = 'mt-2 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#FF8A5B]/60 focus:bg-white/[0.06]';
const labelClassName = 'text-sm font-medium text-white/75';

function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' }) {
    const toneClassName = {
        neutral: 'border-white/10 bg-white/[0.05] text-white/70',
        accent: 'border-[#FF8A5B]/25 bg-[#FF8A5B]/10 text-[#FFB08C]',
    }[tone];

    return (
        <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]', toneClassName)}>
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

    const [slackModalOpen, setSlackModalOpen] = useState(false);
    const [slackMessage, setSlackMessage] = useState('');
    const [slackSending, setSlackSending] = useState(false);
    const [slackSent, setSlackSent] = useState(false);
    const [slackError, setSlackError] = useState<string | null>(null);

    if (!session || !profile || !account || !user) {
        return <Navigate to="/client/login" replace />;
    }

    const handleSlackSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!slackMessage.trim()) return;
        setSlackSending(true);
        setSlackError(null);
        try {
            await sendSlackSupportMessage(slackMessage.trim(), profile.display_name || profile.username);
            setSlackSent(true);
            setSlackMessage('');
        } catch {
            setSlackError('Could not send your message. Please try email instead.');
        } finally {
            setSlackSending(false);
        }
    };

    const resetSlackModal = () => {
        setSlackModalOpen(false);
        setSlackMessage('');
        setSlackSent(false);
        setSlackError(null);
    };

    const workspaceSummary = account.summary?.trim() || null;
    const supportEmail = account.support_email || null;
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
                            </div>

                            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-white p-4 shadow-[0_20px_48px_rgba(0,0,0,0.24)]">
                                    <img src={account.logo_url} alt={`${account.name} logo`} className="h-10 w-auto max-w-full object-contain" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">{account.name}</h1>
                                    {workspaceSummary ? <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">{workspaceSummary}</p> : null}
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
                                {(supportEmail || account.calendly_url) ? (
                                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Support</span>
                                    </div>
                                    {supportEmail ? (
                                        <a href={`mailto:${supportEmail}`} className="mt-3 block text-sm font-semibold text-white transition hover:text-[#FFB08C]">
                                            {supportEmail}
                                        </a>
                                    ) : null}
                                    {account.calendly_url ? (
                                        <a
                                            href={account.calendly_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFB08C] transition hover:text-white"
                                        >
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Book a call
                                        </a>
                                    ) : null}
                                </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 xl:justify-end">
                            <button
                                type="button"
                                onClick={() => { setSlackSent(false); setSlackError(null); setSlackModalOpen(true); }}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#FF8A5B] px-5 text-sm font-semibold text-black transition hover:bg-[#FF9A71] active:scale-[0.98]"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Contact support
                            </button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                    <NotionNotes notionPageId={account.notion_page_id} defaultOpen />
                    <ClickUpTasks clickupListId={account.clickup_list_id} defaultOpen />
                </section>
            </div>

            {slackModalOpen ? (
                <Modal
                    title="Contact support"
                    description="Send a message directly to the ClerkTree team. We'll reply via Slack or email."
                    onClose={resetSlackModal}
                >
                    {slackSent ? (
                        <div className="rounded-[1.2rem] border border-[#7BDCB5]/20 bg-[#7BDCB5]/10 px-4 py-5 text-center">
                            <p className="text-base font-semibold text-white">Message sent!</p>
                            <p className="mt-2 text-sm text-white/55">The ClerkTree team has received your message and will be in touch shortly.</p>
                        </div>
                    ) : (
                        <form className="grid gap-4" onSubmit={handleSlackSubmit}>
                            <label className={labelClassName}>
                                Your message
                                <textarea
                                    required
                                    rows={5}
                                    value={slackMessage}
                                    onChange={(e) => setSlackMessage(e.target.value)}
                                    placeholder="Describe what you need help with…"
                                    className={fieldClassName}
                                />
                            </label>
                            {slackError ? (
                                <p className="text-sm text-[#FFD1BF]">{slackError}</p>
                            ) : null}
                            <div className="pt-1 text-right">
                                <button
                                    type="submit"
                                    disabled={slackSending || !slackMessage.trim()}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#FF8A5B] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#FF9A71] disabled:opacity-60"
                                >
                                    <Send className="h-4 w-4" />
                                    {slackSending ? 'Sending…' : 'Send message'}
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>
            ) : null}
        </ClientPortalShell>
    );
}
