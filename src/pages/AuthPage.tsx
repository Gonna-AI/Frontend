import { useState, FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Loader2, Moon, Sun, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

type AuthView = 'signin' | 'signup' | 'forgot_password';

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
            <div className={cn("min-h-screen flex items-center justify-center transition-colors duration-300", isDark ? "bg-[#09090B]" : "bg-gray-50")}>
                <Loader2 className={cn("w-6 h-6 animate-spin", isDark ? "text-white/40" : "text-black/40")} />
            </div>
        );
    }

    // Success state (Email confirmation or Reset link sent)
    if (successMessage) {
        return (
            <div className={cn("min-h-screen flex items-center justify-center p-4 transition-colors duration-300", isDark ? "bg-[#09090B]" : "bg-gray-50")}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn("w-full max-w-md p-8 rounded-2xl shadow-xl text-center border",
                        isDark ? "bg-[#18181B] border-white/10" : "bg-white border-gray-100"
                    )}
                >
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                        isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-500"
                    )}>
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className={cn("text-2xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>Check your email</h2>
                    <p className={cn("text-sm mb-6", isDark ? "text-zinc-400" : "text-gray-500")}>
                        {successMessage}
                    </p>
                    <button
                        onClick={() => {
                            setSuccessMessage('');
                            setView('signin');
                            setPassword('');
                        }}
                        className={cn("w-full py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                        )}
                    >
                        Back to Sign In
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen w-full flex transition-colors duration-500", isDark ? "bg-[#09090B]" : "bg-gray-50")}>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className={cn("absolute top-6 right-6 z-50 p-2 rounded-full transition-all duration-300",
                    isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/5 text-gray-700 hover:bg-black/10"
                )}
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Main Container */}
            <div className="flex w-full max-w-[500px] mx-auto min-h-screen lg:p-4 items-center justify-center">

                {/* Card Wrapper */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={cn("w-full overflow-hidden rounded-[32px] border shadow-2xl transition-all duration-500",
                        isDark ? "bg-[#121214] border-white/5 shadow-black/50" : "bg-white border-gray-200/50 shadow-xl shadow-gray-200/50"
                    )}
                >

                    {/* Form Container */}
                    <div className="w-full flex flex-col justify-center p-8 md:p-10 relative bg-transparent z-10">

                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300",
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
                            <span className={cn("text-xl font-bold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                                ClerkTree
                            </span>
                        </div>

                        {/* Header Text */}
                        <div className="mb-8">
                            <h1 className={cn("text-3xl font-bold mb-2 tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                                {view === 'signup' ? 'Create an account' : view === 'forgot_password' ? 'Reset password' : 'Welcome back'}
                            </h1>
                            <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-gray-500")}>
                                {view === 'signup' ? 'Enter your details to get started.' : view === 'forgot_password' ? 'Enter your email to receive instructions.' : 'Login to your ClerkTree account.'}
                            </p>
                        </div>

                        {/* Auth Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {view === 'signup' && (
                                <div className="space-y-1.5">
                                    <label className={cn("text-sm font-medium", isDark ? "text-zinc-300" : "text-gray-700")}>Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="John Doe"
                                            className={cn("w-full px-4 py-3 rounded-xl text-sm border focus:ring-2 focus:ring-offset-0 outline-none transition-all duration-200",
                                                isDark
                                                    ? "bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700 focus:ring-zinc-800"
                                                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-gray-100"
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className={cn("text-sm font-medium", isDark ? "text-zinc-300" : "text-gray-700")}>Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        className={cn("w-full px-4 py-3 rounded-xl text-sm border focus:ring-2 focus:ring-offset-0 outline-none transition-all duration-200",
                                            isDark
                                                ? "bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700 focus:ring-zinc-800"
                                                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-gray-100"
                                        )}
                                    />
                                </div>
                            </div>

                            {view !== 'forgot_password' && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className={cn("text-sm font-medium", isDark ? "text-zinc-300" : "text-gray-700")}>Password</label>
                                        {view === 'signin' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setView('forgot_password');
                                                    setError('');
                                                }}
                                                className={cn("text-xs font-medium hover:underline", isDark ? "text-zinc-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}
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
                                            className={cn("w-full px-4 py-3 rounded-xl text-sm border focus:ring-2 focus:ring-offset-0 outline-none transition-all duration-200",
                                                isDark
                                                    ? "bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700 focus:ring-zinc-800"
                                                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-gray-100"
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
                                        className={cn("text-xs flex items-center gap-2 p-3 rounded-lg border",
                                            isDark ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"
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
                                        className={cn("text-xs flex items-center gap-2 p-3 rounded-lg border",
                                            isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"
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
                                className={cn("w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                                    isDark
                                        ? "bg-white text-black hover:bg-gray-100 shadow-white/5"
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
                                    className={cn("w-full flex items-center justify-center gap-2 text-sm transition-colors",
                                        isDark ? "text-zinc-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
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
                                        <span className={cn("px-2 font-medium tracking-wider", isDark ? "bg-[#121214] text-zinc-500" : "bg-white text-gray-400")}>
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGoogleSignIn}
                                    className={cn("w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 hover:bg-opacity-50",
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
                                    <span className={cn(isDark ? "text-zinc-500" : "text-gray-500")}>
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
                        <div className="mt-auto pt-8 flex justify-center gap-6 text-xs text-opacity-50">
                            <a href="/terms" className={cn("hover:underline", isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-600")}>Terms</a>
                            <a href="/privacy" className={cn("hover:underline", isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-600")}>Privacy</a>
                        </div>


                    </div>


                </motion.div>
            </div>
        </div>
    );
}
