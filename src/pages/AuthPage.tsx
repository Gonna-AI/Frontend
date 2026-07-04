import { useState, FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

type AuthView = 'signin' | 'signup' | 'forgot_password';

// Same rotating ClerkTree logo video used inline in the homepage hero ("Orchestrating [video]
// Industrial Machine [video] Intelligence"), featured here as the panel's centerpiece.
const BRAND_VIDEO_URL = '/hero-logo-video.mp4';

const BrandPanel = () => (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-[rgb(10,10,10)] p-10 text-white lg:flex">
        <div
            className="pointer-events-none absolute top-[-10%] right-[-10%] h-[100%] w-[80%] opacity-90"
            style={{
                background: 'radial-gradient(circle at 70% 30%, rgba(255,77,0,0.22) 0%, rgba(255,77,0,0.08) 30%, transparent 60%)',
                filter: 'blur(40px)',
            }}
        />

        <div className="relative z-10 space-y-1">
            <h1 className="text-2xl font-medium">ClerkTree</h1>
            <p className="text-sm text-white/70">AI harness for industrial machinery.</p>
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6">
            <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                src={BRAND_VIDEO_URL}
                className="h-56 w-56 rounded-full object-cover shadow-[0_0_120px_rgba(255,77,0,0.25)]"
            />
            <p className="max-w-xs text-center text-2xl leading-tight font-medium">
                Orchestrating <span className="text-[#ff4d00]">Industrial</span> Machine Intelligence
            </p>
        </div>

        <div className="relative z-10 flex w-full justify-between gap-8">
            <div className="flex-1 space-y-1">
                <h2 className="font-medium">New here?</h2>
                <p className="text-sm text-white/70">Create an account to spin up your own Kostencheck Copilot workspace.</p>
            </div>
            <div className="mx-1 w-px self-stretch bg-white/20" />
            <div className="flex-1 space-y-1">
                <h2 className="font-medium">Need help?</h2>
                <p className="text-sm text-white/70">Reach out to your ClerkTree contact, or email team@clerktree.com.</p>
            </div>
        </div>
    </div>
);

export default function AuthPage() {
    const { session, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const initialView = searchParams.get('view') as AuthView || 'signin';
    const initialMessage = searchParams.get('message') || '';

    const [view, setView] = useState<AuthView>(initialView);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [info, setInfo] = useState(initialMessage);
    const [successMessage, setSuccessMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // If already logged in, redirect to dashboard
    if (!loading && session) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');
        setSuccessMessage('');
        setSubmitting(true);

        try {
            if (view === 'signup') {
                const { error } = await signUp(email, password, fullName);
                if (error) {
                    setError(error.message);
                } else {
                    setSuccessMessage(`We've sent a confirmation link to ${email}`);
                }
            } else if (view === 'signin') {
                const { error } = await signIn(email, password);
                if (error) {
                    if (error.message.includes('Email not confirmed')) {
                        setError('Please confirm your email before signing in. Check your inbox (and spam folder) for the confirmation link.');
                    } else if (error.message.includes('Invalid login credentials')) {
                        setError('Invalid email or password.');
                    } else if (error.message.toLowerCase().includes('load failed') || error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('networkerror')) {
                        setError('Network error connecting to authentication server. Please try clearing your browser cache and cookies, then try again.');
                    } else {
                        setError(error.message);
                    }
                } else {
                    navigate('/dashboard', { replace: true });
                }
            } else if (view === 'forgot_password') {
                const { error } = await resetPassword(email);
                if (error) {
                    setError(error.message);
                } else {
                    setSuccessMessage(`Password reset link sent to ${email}`);
                }
            }
        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-white">
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    <span className="text-sm font-medium">Loading…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid min-h-screen w-full bg-white text-neutral-900 lg:grid-cols-2">
            <div className="relative flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6">
                <div className="absolute top-5 right-4 sm:right-8">
                    <span className="text-sm text-gray-500">
                        {view === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setView(view === 'signup' ? 'signin' : 'signup');
                                setError('');
                            }}
                            className="font-medium text-gray-900 hover:underline"
                        >
                            {view === 'signup' ? 'Sign in' : 'Register'}
                        </button>
                    </span>
                </div>

                <div className="mx-auto w-full max-w-[350px] space-y-8">
                    {successMessage ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h2 className="mb-2 text-2xl font-medium">Check your email</h2>
                            <p className="mb-6 text-sm text-gray-500">{successMessage}</p>
                            <button
                                onClick={() => {
                                    setSuccessMessage('');
                                    setView('signin');
                                    setPassword('');
                                }}
                                className="w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                            >
                                Back to Sign In
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            <div className="space-y-2 text-center">
                                <img src="/favicon.svg" alt="ClerkTree" className="mx-auto mb-2 h-8 w-8" />
                                <h1 className="text-3xl font-medium">
                                    {view === 'signup' ? 'Create an account' : view === 'forgot_password' ? 'Reset password' : 'Login to your account'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {view === 'signup' ? 'Enter your details to get started.' : view === 'forgot_password' ? 'Enter your email to receive instructions.' : 'Please enter your details to login.'}
                                </p>
                            </div>

                            {view !== 'forgot_password' && (
                                <div className="space-y-4">
                                    <button
                                        onClick={handleGoogleSignIn}
                                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-gray-50"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span className="text-sm font-medium">Continue with Google</span>
                                    </button>

                                    <div className="relative text-center text-sm">
                                        <div className="absolute inset-0 top-1/2 flex items-center border-t border-gray-200" />
                                        <span className="relative bg-white px-2 text-gray-400">Or continue with</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {view === 'signup' && (
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                {view !== 'forgot_password' && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">Password</label>
                                            {view === 'signin' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setView('forgot_password');
                                                        setError('');
                                                    }}
                                                    className="text-xs font-medium text-gray-500 hover:text-gray-900 hover:underline"
                                                >
                                                    Forgot your password?
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={view === 'signup' ? "Create a password" : "Enter your password"}
                                            required
                                            minLength={6}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                                        />
                                    </div>
                                )}

                                {view === 'signin' && (
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="size-4 rounded border-gray-300"
                                        />
                                        Remember me for 30 days
                                    </label>
                                )}

                                <AnimatePresence>
                                    {info && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-600"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {info}
                                        </motion.div>
                                    )}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>
                                                {view === 'signup' ? 'Sign up' : view === 'forgot_password' ? 'Send Reset Link' : 'Login'}
                                            </span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                {view === 'forgot_password' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setView('signin');
                                            setError('');
                                        }}
                                        className="flex w-full items-center justify-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Sign In
                                    </button>
                                )}
                            </form>
                        </>
                    )}
                </div>

                <div className="absolute bottom-5 flex w-full justify-between px-4 sm:px-8">
                    <span className="text-sm text-gray-400">© 2026, ClerkTree.</span>
                    <div className="flex items-center gap-6 text-sm">
                        <a href="/terms" className="text-gray-400 hover:text-gray-600 hover:underline">Terms</a>
                        <a href="/privacy" className="text-gray-400 hover:text-gray-600 hover:underline">Privacy</a>
                    </div>
                </div>
            </div>

            <BrandPanel />
        </div>
    );
}
