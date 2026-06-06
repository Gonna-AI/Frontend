import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2, LockKeyhole, UserRound } from 'lucide-react';
import { useClientPortal } from '../../contexts/ClientPortalContext';
import { cn } from '../../lib/utils';
import { isValidPortalUsername, normalizePortalUsername } from '../../utils/clientPortal';
import type { ClientPortalDirectoryEntry } from '../../types/clientPortal';

type PortalStep = 'username' | 'password';

function AccentSquare() {
    return <span className="inline-block h-3 w-3 rounded-[3px] bg-[#4ec4b6]" aria-hidden="true" />;
}

function LogoPanel({ lookup }: { lookup: ClientPortalDirectoryEntry | null }) {
    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#22323b] p-8 text-white shadow-[0_32px_80px_rgba(15,24,29,0.4)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(78,196,182,0.25),transparent_45%)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
            <div className="relative space-y-8">
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.34em] text-white/60">
                    <AccentSquare />
                    Client access
                </div>
                <div className="space-y-5">
                    <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-[-0.03em]">
                        A branded portal for deliverables, decisions, and rollout updates.
                    </h1>
                    <p className="max-w-lg text-base leading-7 text-white/70">
                        Start with the client username. Once it matches, the workspace locks onto that client identity and keeps the branding visible through the full portal.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {[
                        ['Separate auth', 'The main ClerkTree login stays intact while client access lives on its own route and session.'],
                        ['Built for rollout', 'Deliverables, milestones, and new updates already have a place before Linear and Notion are connected.'],
                    ].map(([title, body]) => (
                        <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/50">{title}</p>
                            <p className="mt-3 text-sm leading-6 text-white/75">{body}</p>
                        </div>
                    ))}
                </div>

                <AnimatePresence initial={false}>
                    {lookup?.client_accounts ? (
                        <motion.div
                            key={lookup.username}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            className="rounded-[1.75rem] border border-white/10 bg-white p-5 text-[#22323b]"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#4a5d67]">Client identified</p>
                            <div className="mt-4 flex items-center gap-4">
                                <img
                                    src={lookup.client_accounts.logo_url}
                                    alt={`${lookup.client_accounts.name} logo`}
                                    className="h-12 w-auto max-w-[180px] object-contain"
                                />
                                <div>
                                    <p className="text-lg font-semibold">{lookup.client_accounts.name}</p>
                                    <p className="text-sm text-[#61757f]">{lookup.welcome_label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function ClientPortalLoginPage() {
    const navigate = useNavigate();
    const { session, profile, account, loading, lookupUsername, signInWithUsername } = useClientPortal();

    const [step, setStep] = useState<PortalStep>('username');
    const [username, setUsername] = useState('gluth');
    const [password, setPassword] = useState('');
    const [lookup, setLookup] = useState<ClientPortalDirectoryEntry | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && session && profile) {
            navigate('/client', { replace: true });
        }
    }, [loading, navigate, profile, session]);

    const cardAccent = lookup?.client_accounts?.accent_color ?? '#4ec4b6';
    const clientName = lookup?.client_accounts?.name ?? account?.name ?? 'Client workspace';
    const loginHint = useMemo(() => {
        if (!lookup?.client_accounts) {
            return 'Use the client username we provisioned for this workspace.';
        }

        return `${lookup.client_accounts.name} will stay branded throughout the portal once you sign in.`;
    }, [lookup]);

    if (!loading && session && profile) {
        return <Navigate to="/client" replace />;
    }

    const handleUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const normalized = normalizePortalUsername(username);

        if (!normalized || !isValidPortalUsername(normalized)) {
            setError('Enter a valid portal username using letters, numbers, dots, dashes, or underscores.');
            return;
        }

        setSubmitting(true);

        try {
            const result = await lookupUsername(normalized);

            if (!result?.client_accounts) {
                setLookup(null);
                setError('That client portal username is not active.');
                return;
            }

            setLookup(result);
            setUsername(result.username);
            setStep('password');
        } catch (lookupError) {
            console.error('Client portal lookup failed', lookupError);
            setError('We could not verify that username right now.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!lookup) {
            setStep('username');
            return;
        }

        setSubmitting(true);

        try {
            const result = await signInWithUsername(lookup.username, password);

            if (result.error) {
                setError(result.error);
                return;
            }

            navigate('/client', { replace: true });
        } catch (signInError) {
            console.error('Client portal sign-in failed', signInError);
            setError('We could not start the client session.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#eef1ee]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(78,196,182,0.08),rgba(255,255,255,0)_40%,rgba(44,63,73,0.08))]" />
            <div className="absolute left-0 top-0 h-[26rem] w-[26rem] rounded-full bg-[#4ec4b6]/10 blur-3xl" />
            <div className="absolute right-0 top-20 h-[30rem] w-[30rem] rounded-full bg-[#22323b]/10 blur-3xl" />

            <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_28rem] lg:items-center lg:px-10">
                <LogoPanel lookup={lookup} />

                <div className="relative">
                    <div className="absolute inset-0 rounded-[2rem] bg-white/70 blur-2xl" />
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-7 shadow-[0_32px_80px_rgba(44,63,73,0.14)] backdrop-blur sm:p-9"
                    >
                        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: cardAccent }} />
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.32em] text-[#61757f]">
                                    <span>Client portal</span>
                                    <span>{step === 'username' ? 'Step 1 of 2' : 'Step 2 of 2'}</span>
                                </div>
                                <div className="space-y-3">
                                    {lookup?.client_accounts ? (
                                        <div className="rounded-[1.5rem] border border-[#d7dfda] bg-[#f8faf8] p-4">
                                            <img
                                                src={lookup.client_accounts.logo_url}
                                                alt={`${lookup.client_accounts.name} logo`}
                                                className="h-12 w-auto max-w-[180px] object-contain"
                                            />
                                            <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[#22323b]">{clientName}</p>
                                            <p className="mt-1 text-sm leading-6 text-[#61757f]">{loginHint}</p>
                                        </div>
                                    ) : (
                                        <div className="rounded-[1.5rem] border border-dashed border-[#d7dfda] bg-[#f7f8f6] p-4">
                                            <p className="text-lg font-semibold tracking-[-0.02em] text-[#22323b]">Find the client workspace first.</p>
                                            <p className="mt-2 text-sm leading-6 text-[#61757f]">{loginHint}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence mode="wait" initial={false}>
                                {step === 'username' ? (
                                    <motion.form
                                        key="username"
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        onSubmit={handleUsernameSubmit}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label htmlFor="portal-username" className="mb-2 block text-sm font-semibold text-[#22323b]">
                                                Client username
                                            </label>
                                            <div className="flex items-center gap-3 rounded-[1.15rem] border border-[#d7dfda] bg-[#f8faf8] px-4 py-3 focus-within:border-[#4ec4b6] focus-within:bg-white">
                                                <UserRound className="h-5 w-5 text-[#61757f]" />
                                                <input
                                                    id="portal-username"
                                                    value={username}
                                                    onChange={(event) => setUsername(event.target.value)}
                                                    placeholder="gluth"
                                                    className="w-full bg-transparent text-base text-[#22323b] outline-none placeholder:text-[#8da0a8]"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex w-full items-center justify-center gap-2 rounded-[1.15rem] bg-[#22323b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1b2a31] disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {submitting ? 'Checking workspace...' : 'Continue'}
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.form
                                        key="password"
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        onSubmit={handlePasswordSubmit}
                                        className="space-y-5"
                                    >
                                        <div className="flex items-center justify-between rounded-[1.15rem] border border-[#d7dfda] bg-[#f8faf8] px-4 py-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8da0a8]">Workspace username</p>
                                                <p className="mt-1 text-base font-semibold text-[#22323b]">{lookup?.username}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPassword('');
                                                    setStep('username');
                                                    setError(null);
                                                }}
                                                className="text-sm font-semibold text-[#22323b]"
                                            >
                                                Change
                                            </button>
                                        </div>

                                        <div>
                                            <label htmlFor="portal-password" className="mb-2 block text-sm font-semibold text-[#22323b]">
                                                Password
                                            </label>
                                            <div className="flex items-center gap-3 rounded-[1.15rem] border border-[#d7dfda] bg-[#f8faf8] px-4 py-3 focus-within:border-[#4ec4b6] focus-within:bg-white">
                                                <LockKeyhole className="h-5 w-5 text-[#61757f]" />
                                                <input
                                                    id="portal-password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(event) => setPassword(event.target.value)}
                                                    placeholder="Enter password"
                                                    className="w-full bg-transparent text-base text-[#22323b] outline-none placeholder:text-[#8da0a8]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPassword('');
                                                    setStep('username');
                                                    setError(null);
                                                }}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-[1.15rem] border border-[#d7dfda] px-5 py-3.5 text-sm font-semibold text-[#22323b] transition hover:border-[#22323b]"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex flex-[1.4] items-center justify-center gap-2 rounded-[1.15rem] bg-[#22323b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1b2a31] disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {submitting ? 'Signing in...' : 'Open portal'}
                                                <Building2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            {error ? (
                                <div className={cn(
                                    'rounded-[1.15rem] border px-4 py-3 text-sm leading-6',
                                    'border-[#f1c3bc] bg-[#fff4f1] text-[#8b392a]'
                                )}>
                                    {error}
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
