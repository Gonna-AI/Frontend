import { useState, FormEvent, ReactNode } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Moon, Sun, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

type AuthView = 'signin' | 'signup' | 'forgot_password';

const GrainOverlay = ({ className = '' }: { className?: string }) => (
    <div
        className={cn(
            'pointer-events-none absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,#fff,transparent_70%)]',
            className
        )}
        style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '30%' }}
    />
);

const AuthShell = ({ isDark, children }: { isDark: boolean; children: ReactNode }) => (
    <div
        className={cn(
            'relative min-h-screen w-full overflow-x-hidden font-urbanist transition-colors duration-500',
            isDark ? 'bg-[rgb(10,10,10)] text-white' : 'bg-[#f7f4f2] text-neutral-900'
        )}
    >
        {isDark ? (
            <>
                <div
                    className="pointer-events-none absolute top-[-10%] right-[-10%] w-[80%] h-[100%] opacity-90"
                    style={{
                        background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 30%, transparent 60%)',
                        filter: 'blur(40px)',
                    }}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_80%_0%,rgba(255,255,255,0.12),transparent)]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(215deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_40%,transparent_70%)]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '35%' }} />
            </>
        ) : (
            <>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_80%_0%,rgba(255,77,0,0.12),transparent)]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(215deg,rgba(0,0,0,0.06)_0%,transparent_60%)]" />
            </>
        )}
        <div className="relative z-10">{children}</div>
    </div>
);

export default function AuthPage() {
    const { session, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const initialView = searchParams.get('view') as AuthView || 'signin';
    const initialMessage = searchParams.get('message') || '';

    const [view, setView] = useState<AuthView>(initialView);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
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
            <AuthShell isDark={isDark}>
                <div className="flex min-h-screen items-center justify-center px-4">
                    <div className={cn(
                        "flex items-center gap-3 rounded-2xl border px-5 py-4",
                        isDark ? "bg-black/60 border-white/10 text-white/70" : "bg-white border-gray-200 text-gray-600"
                    )}>
                        <Loader2 className={cn("w-5 h-5 animate-spin", isDark ? "text-white/60" : "text-gray-500")} />
                        <span className="text-sm font-medium">Loading…</span>
                    </div>
                </div>
            </AuthShell>
        );
    }

    // Success state (Email confirmation or Reset link sent)
    if (successMessage) {
        return (
            <AuthShell isDark={isDark}>
                <div className="flex min-h-screen items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "relative w-full max-w-md overflow-hidden rounded-[28px] border p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)]",
                            isDark
                                ? "bg-[linear-gradient(180deg,#141414_0%,#0b0b0b_100%)] border-white/10"
                                : "bg-white border-gray-200 shadow-xl"
                        )}
                    >
                        {isDark && (
                            <>
                                <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_top,rgba(255,77,0,0.12),transparent)]" />
                                <GrainOverlay className="opacity-[0.16]" />
                            </>
                        )}
                        <div className="relative z-10">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                                isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-500"
                            )}>
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className={cn("text-2xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>Check your email</h2>
                            <p className={cn("text-sm mb-6", isDark ? "text-white/60" : "text-gray-500")}>
                                {successMessage}
                            </p>
                            <button
                                onClick={() => {
                                    setSuccessMessage('');
                                    setView('signin');
                                    setPassword('');
                                }}
                                className={cn(
                                    "w-full py-2.5 rounded-xl text-sm font-semibold transition-colors",
                                    isDark
                                        ? "bg-gradient-to-r from-[#FF4D00] to-[#FF8A5B] text-white hover:from-[#FF6A2A] hover:to-[#FF9B74]"
                                        : "bg-black text-white hover:bg-gray-800"
                                )}
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </motion.div>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell isDark={isDark}>

            {/* Back to Home */}
            <button
                onClick={() => navigate('/')}
                className={cn(
                    "absolute top-6 left-6 z-50 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    isDark
                        ? "border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20"
                        : "border-black/10 bg-white/70 text-gray-700 hover:text-gray-900"
                )}
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to home
            </button>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className={cn(
                    "absolute top-6 right-6 z-50 p-2 rounded-full transition-all duration-300",
                    isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/5 text-gray-700 hover:bg-black/10"
                )}
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Main Container */}
            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-start gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-stretch lg:justify-center lg:py-16">

                {/* Brand Panel */}
                <div className="hidden lg:flex w-full max-w-sm flex-col justify-center">
                    <div className={cn(
                        "relative overflow-hidden rounded-3xl border p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]",
                        isDark
                            ? "border-white/10 bg-[linear-gradient(135deg,#151515_0%,#0f0f0f_100%)]"
                            : "border-gray-200 bg-white shadow-xl"
                    )}>
                        {isDark && (
                            <>
                                <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_top,rgba(255,77,0,0.08),transparent)]" />
                                <GrainOverlay className="opacity-[0.18]" />
                            </>
                        )}
                        <div className="relative z-10 space-y-6">
                            <p className={cn("font-semibold uppercase tracking-[0.35em] text-xs", isDark ? "text-[#FF8A5B]" : "text-orange-500")}>
                                ClerkTree
                            </p>
                            <h2 className={cn("text-3xl font-bold font-urbanist", isDark ? "text-white" : "text-gray-900")}>
                                Autonomous ops, elegant UX.
                            </h2>
                            <p className={cn("text-sm leading-relaxed", isDark ? "text-white/60" : "text-gray-600")}>
                                Access workflows, analytics, and API keys with the same premium look you see across the home and docs experience.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn("rounded-2xl border px-4 py-3", isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50")}>
                                    <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-500")}>Latency</p>
                                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>120ms</p>
                                </div>
                                <div className={cn("rounded-2xl border px-4 py-3", isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50")}>
                                    <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-500")}>Uptime</p>
                                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>99.98%</p>
                                </div>
                            </div>
                            <div className={cn("flex items-center gap-2 text-xs", isDark ? "text-white/50" : "text-gray-500")}>
                                <span className={cn("inline-flex h-2 w-2 rounded-full", isDark ? "bg-emerald-400" : "bg-emerald-500")} />
                                Secure, audited infrastructure
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Wrapper */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                        "relative w-full max-w-[520px] overflow-hidden rounded-[28px] border p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-8",
                        isDark
                            ? "bg-[linear-gradient(180deg,#141414_0%,#0b0b0b_100%)] border-white/10"
                            : "bg-white border-gray-200 shadow-xl"
                    )}
                >
                    {isDark && (
                        <>
                            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_top,rgba(255,77,0,0.12),transparent)]" />
                            <GrainOverlay className="opacity-[0.16]" />
                        </>
                    )}

                    {/* Form Container */}
                    <div className="relative z-10 flex w-full flex-col">

                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300",
                                isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                            )}>
                                <img
                                    src="/favicon.svg"
                                    alt="ClerkTree"
                                    className={cn("w-5 h-5 transition-all duration-300",
                                        !isDark && "brightness-0 invert-0"
                                    )}
                                />
                            </div>
                            <div>
                                <p className={cn("text-[10px] uppercase tracking-[0.3em]", isDark ? "text-[#FF8A5B]" : "text-orange-500")}>ClerkTree</p>
                                <span className={cn("text-lg font-semibold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                                    Secure access
                                </span>
                            </div>
                        </div>

                        {/* Header Text */}
                        <div className="mb-8">
                            <h1 className={cn("text-3xl font-bold mb-2 tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                                {view === 'signup' ? 'Create an account' : view === 'forgot_password' ? 'Reset password' : 'Welcome back'}
                            </h1>
                            <p className={cn("text-sm", isDark ? "text-white/60" : "text-gray-500")}>
                                {view === 'signup' ? 'Enter your details to get started.' : view === 'forgot_password' ? 'Enter your email to receive instructions.' : 'Login to your ClerkTree account.'}
                            </p>
                        </div>

                        {/* Auth Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {view === 'signup' && (
                                <div className="space-y-1.5">
                                    <label className={cn("text-sm font-medium", isDark ? "text-white/70" : "text-gray-700")}>Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="John Doe"
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl text-sm border focus:ring-2 focus:ring-offset-0 outline-none transition-all duration-200",
                                                isDark
                                                    ? "bg-black/60 border-white/10 text-white placeholder-white/30 focus:border-[#FF4D00]/50 focus:ring-[#FF4D00]/20"
                                                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-300 focus:ring-orange-100"
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className={cn("text-sm font-medium", isDark ? "text-white/70" : "text-gray-700")}>Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl text-sm border focus:ring-2 focus:ring-offset-0 outline-none transition-all duration-200",
                                            isDark
                                                ? "bg-black/60 border-white/10 text-white placeholder-white/30 focus:border-[#FF4D00]/50 focus:ring-[#FF4D00]/20"
                                                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-300 focus:ring-orange-100"
                                        )}
                                    />
                                </div>
                            </div>

                            {view !== 'forgot_password' && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className={cn("text-sm font-medium", isDark ? "text-white/70" : "text-gray-700")}>Password</label>
                                        {view === 'signin' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setView('forgot_password');
                                                    setError('');
                                                }}
                                                className={cn("text-xs font-medium hover:underline", isDark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-gray-900")}
                                            >
                                                Forgot your password?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={view === 'signup' ? "Create a password" : "Enter your password"}
                                            required
                                            minLength={6}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl text-sm border focus:ring-2 focus:ring-offset-0 outline-none transition-all duration-200",
                                                isDark
                                                    ? "bg-black/60 border-white/10 text-white placeholder-white/30 focus:border-[#FF4D00]/50 focus:ring-[#FF4D00]/20"
                                                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-300 focus:ring-orange-100"
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Info/Error Display */}
                            <AnimatePresence>
                                {info && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={cn(
                                            "text-xs flex items-center gap-2 p-3 rounded-lg border",
                                            isDark ? "bg-[#FF4D00]/10 border-[#FF4D00]/20 text-[#FFB286]" : "bg-orange-50 border-orange-200 text-orange-600"
                                        )}
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
                                        className={cn(
                                            "text-xs flex items-center gap-2 p-3 rounded-lg border",
                                            isDark ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-600"
                                        )}
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={cn(
                                    "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                                    isDark
                                        ? "bg-gradient-to-r from-[#FF4D00] to-[#FF8A5B] text-white hover:from-[#FF6A2A] hover:to-[#FF9B74] shadow-[#FF4D00]/20"
                                        : "bg-black text-white hover:bg-gray-800 shadow-black/10"
                                )}
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
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 text-sm transition-colors",
                                        isDark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </button>
                            )}
                        </form>

                        {view !== 'forgot_password' && (
                            <>
                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className={cn("w-full border-t", isDark ? "border-white/10" : "border-gray-200")} />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className={cn("px-2 font-medium tracking-wider", isDark ? "bg-[#0f0f0f] text-white/40" : "bg-white text-gray-400")}>
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGoogleSignIn}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 hover:bg-opacity-50",
                                        isDark
                                            ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                                    )}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="font-medium text-sm">Continue with Google</span>
                                </button>

                                <div className="mt-8 text-center text-sm">
                                    <span className={cn(isDark ? "text-white/50" : "text-gray-500")}>
                                        {view === 'signup' ? "Already have an account?" : "Don't have an account?"}
                                    </span>
                                    {' '}
                                    <button
                                        onClick={() => {
                                            setView(view === 'signup' ? 'signin' : 'signup');
                                            setError('');
                                        }}
                                        className={cn("font-semibold hover:underline", isDark ? "text-white" : "text-black")}
                                    >
                                        {view === 'signup' ? 'Sign in' : 'Sign up'}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Legal Links Footer */}
                        <div className="mt-10 flex justify-center gap-6 text-xs text-opacity-50">
                            <a href="/terms" className={cn("hover:underline", isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-600")}>Terms</a>
                            <a href="/privacy" className={cn("hover:underline", isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-600")}>Privacy</a>
                        </div>


                    </div>


                </motion.div>
            </div>
        </AuthShell>
    );
}
