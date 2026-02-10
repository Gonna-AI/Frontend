import { useState, FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthPage() {
    const { session, loading, signIn, signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // If already logged in, redirect to dashboard
    if (!loading && session) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setEmailSent(false);
        setSubmitting(true);

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password, fullName);
                if (error) {
                    setError(error.message);
                } else {
                    setEmailSent(true);
                }
            } else {
                const { error } = await signIn(email, password);
                if (error) {
                    if (error.message.includes('Email not confirmed')) {
                        setError('Please confirm your email before signing in. Check your inbox for a confirmation link.');
                    } else if (error.message.includes('Invalid login credentials')) {
                        setError('Invalid email or password. Please try again.');
                    } else {
                        setError(error.message);
                    }
                } else {
                    navigate('/dashboard', { replace: true });
                }
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
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
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
            </div>
        );
    }

    // Email confirmation success state
    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
                {/* Grid pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full max-w-md mx-4"
                >
                    <div className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-10 text-center shadow-2xl shadow-black/50">
                        {/* Top highlight */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                            className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </motion.div>

                        <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
                        <p className="text-white/40 text-sm leading-relaxed mb-2">
                            We've sent a confirmation link to
                        </p>
                        <p className="text-white/70 text-sm font-medium bg-white/[0.04] rounded-lg px-4 py-2 inline-block mb-6 border border-white/[0.05]">
                            {email}
                        </p>
                        <p className="text-white/30 text-xs leading-relaxed mb-8">
                            Click the link in your email to verify your account, then come back here to sign in. Check your spam folder if you don't see it.
                        </p>

                        <button
                            onClick={() => {
                                setEmailSent(false);
                                setIsSignUp(false);
                                setPassword('');
                            }}
                            className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/70 hover:text-white text-sm font-medium transition-all duration-200"
                        >
                            Back to Sign In
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            {/* Subtle dot grid */}
            <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
                backgroundSize: '32px 32px'
            }} />

            {/* Ambient glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[120px]" />
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[420px] mx-4 relative z-10"
            >
                {/* Card */}
                <div className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/80 backdrop-blur-sm">
                    {/* Top colored line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/[0.03] rounded-xl border border-white/[0.08] flex items-center justify-center shadow-lg shadow-black/20">
                                <img src="/favicon.svg" alt="ClerkTree" className="w-5 h-5 flex-shrink-0" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">ClerkTree</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            {isSignUp ? 'Create an account' : 'Welcome back'}
                        </h1>
                        <p className="text-white/40 text-sm">
                            {isSignUp ? 'Get started with your ClerkTree dashboard' : 'Enter your credentials to access your account'}
                        </p>
                    </div>
                    {/* Social Auth */}
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200 group mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                            Continue with Google
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/[0.06]" />
                        </div>
                        <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-medium">
                            <span className="px-3 bg-[#0A0A0A] text-white/20">Or continue with</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {isSignUp && (
                                <motion.div
                                    key="fullName"
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="relative mb-4">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Full Name"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-200"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-200"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                minLength={6}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-200"
                            />
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2.5"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden group"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Toggle View */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setEmailSent(false);
                            }}
                            className="text-white/40 hover:text-white/70 text-sm transition-colors"
                        >
                            {isSignUp ? (
                                <>Already have an account? <span className="text-white font-medium ml-1">Sign in</span></>
                            ) : (
                                <>Don't have an account? <span className="text-white font-medium ml-1">Sign up</span></>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-8 flex justify-center gap-6 text-xs text-white/20">
                    <a href="/terms-of-service" className="hover:text-white/40 transition-colors">Terms</a>
                    <a href="/privacy-policy" className="hover:text-white/40 transition-colors">Privacy</a>
                    <a href="/contact" className="hover:text-white/40 transition-colors">Contact</a>
                </div>
            </motion.div>
        </div>
    );
}
