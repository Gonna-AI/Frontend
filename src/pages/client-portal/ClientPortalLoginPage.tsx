import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2, LockKeyhole, UserRound } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import ClientPortalShell from '../../components/client-portal/ClientPortalShell';
import { useClientPortal } from '../../contexts/ClientPortalContext';
import { cn } from '../../lib/utils';
import { isValidPortalUsername, normalizePortalUsername } from '../../utils/clientPortal';
import type { ClientPortalDirectoryEntry } from '../../types/clientPortal';

type PortalStep = 'username' | 'password';

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function ClientPortalLoginPage() {
    const navigate = useNavigate();
    const { session, profile, loading, lookupUsername, signInWithUsername } = useClientPortal();

    const [step, setStep] = useState<PortalStep>('username');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [lookup, setLookup] = useState<ClientPortalDirectoryEntry | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && session && profile) {
            navigate('/client', { replace: true });
        }
    }, [loading, navigate, profile, session]);

    if (!loading && session && profile) {
        return <Navigate to="/client" replace />;
    }

    const handleUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const normalized = normalizePortalUsername(username);

        if (!normalized || !isValidPortalUsername(normalized)) {
            setError('Enter a valid workspace username.');
            return;
        }

        setSubmitting(true);

        try {
            const result = await lookupUsername(normalized);

            if (!result?.client_accounts) {
                setLookup(null);
                setError('That workspace is not active.');
                return;
            }

            setLookup(result);
            setUsername(result.username);
            setStep('password');
        } catch (lookupError) {
            console.error('Client portal lookup failed', lookupError);
            setError('Workspace lookup is unavailable right now.');
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
        <ClientPortalShell
            account={lookup?.client_accounts ?? null}
            headerBadge={lookup?.client_accounts ? 'Workspace verified' : 'Client portal'}
        >
            <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                    className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-9"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,91,0.18),transparent_40%)]" />
                    <div className="relative flex h-full flex-col justify-between gap-10">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FF8A5B]">
                                {lookup?.client_accounts ? 'Client identified' : 'Secure access'}
                            </p>
                            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                                {lookup?.client_accounts ? lookup.client_accounts.name : 'Access your workspace'}
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                                {lookup?.client_accounts
                                    ? lookup.welcome_label || 'Enter the password assigned to this workspace.'
                                    : 'Enter the workspace username first. The portal will load the matching client identity before sign-in.'}
                            </p>
                        </div>

                        <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5 backdrop-blur">
                            {lookup?.client_accounts ? (
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-white p-4 shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
                                        <img
                                            src={lookup.client_accounts.logo_url}
                                            alt={`${lookup.client_accounts.name} logo`}
                                            className="h-12 w-auto max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">Workspace</p>
                                            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{lookup.client_accounts.name}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-sm text-white/55">
                                            <span>@{lookup.username}</span>
                                            {lookup.client_accounts.support_email ? <span>{lookup.client_accounts.support_email}</span> : null}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">Route</p>
                                        <p className="mt-3 text-lg font-semibold text-white">/client/login</p>
                                    </div>
                                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">Flow</p>
                                        <p className="mt-3 text-lg font-semibold text-white">Username then password</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.04, ease: easeOut }}
                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]/80 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur"
                >
                    <div className="h-1 bg-gradient-to-r from-[#FF8A5B] via-[#FFB08C] to-white/70" />
                    <div className="space-y-8 p-7 sm:p-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                                    {step === 'username' ? 'Step 1 of 2' : 'Step 2 of 2'}
                                </p>
                                <div className="flex w-20 gap-2">
                                    <span className="h-1.5 flex-1 rounded-full bg-[#FF8A5B]" />
                                    <span className={cn('h-1.5 flex-1 rounded-full', step === 'password' ? 'bg-[#FF8A5B]' : 'bg-white/10')} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                                    {step === 'username' ? 'Identify the workspace' : 'Enter your password'}
                                </h2>
                                <p className="mt-2 text-sm leading-7 text-white/55">
                                    {step === 'username'
                                        ? 'Use the username provisioned for this client account.'
                                        : 'The workspace brand is locked. Continue with the assigned password.'}
                                </p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait" initial={false}>
                            {step === 'username' ? (
                                <motion.form
                                    key="username"
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    transition={{ duration: 0.2, ease: easeOut }}
                                    onSubmit={handleUsernameSubmit}
                                    className="space-y-5"
                                >
                                    <label htmlFor="portal-username" className="block text-sm font-medium text-white/75">
                                        Workspace username
                                        <div className="mt-2 flex items-center gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3 transition focus-within:border-[#FF8A5B]/60 focus-within:bg-white/[0.06]">
                                            <UserRound className="h-5 w-5 text-white/45" />
                                            <input
                                                id="portal-username"
                                                value={username}
                                                onChange={(event) => setUsername(event.target.value)}
                                                placeholder="Enter username"
                                                className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/25"
                                            />
                                        </div>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#FFEEE8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {submitting ? 'Checking workspace...' : 'Continue'}
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="password"
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    transition={{ duration: 0.2, ease: easeOut }}
                                    onSubmit={handlePasswordSubmit}
                                    className="space-y-5"
                                >
                                    <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">Workspace username</p>
                                                <p className="mt-2 text-base font-semibold text-white">{lookup?.username}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPassword('');
                                                    setStep('username');
                                                    setError(null);
                                                }}
                                                className="text-sm font-semibold text-[#FFB08C] transition hover:text-white"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>

                                    <label htmlFor="portal-password" className="block text-sm font-medium text-white/75">
                                        Password
                                        <div className="mt-2 flex items-center gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3 transition focus-within:border-[#FF8A5B]/60 focus-within:bg-white/[0.06]">
                                            <LockKeyhole className="h-5 w-5 text-white/45" />
                                            <input
                                                id="portal-password"
                                                type="password"
                                                value={password}
                                                onChange={(event) => setPassword(event.target.value)}
                                                placeholder="Enter password"
                                                className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/25"
                                            />
                                        </div>
                                    </label>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPassword('');
                                                setStep('username');
                                                setError(null);
                                            }}
                                            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[1rem] border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.08] active:scale-[0.98]"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="inline-flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-[1rem] bg-[#FF8A5B] px-5 text-sm font-semibold text-black transition hover:bg-[#FF9A71] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {submitting ? 'Signing in...' : 'Open portal'}
                                            <Building2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {error ? (
                            <div className="rounded-[1.15rem] border border-[#FF8A5B]/30 bg-[#FF8A5B]/10 px-4 py-3 text-sm leading-6 text-[#FFD1BF]">
                                {error}
                            </div>
                        ) : null}
                    </div>
                </motion.section>
            </div>
        </ClientPortalShell>
    );
}
