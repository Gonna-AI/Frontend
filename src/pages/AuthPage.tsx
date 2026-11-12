import { useState, FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidMetal } from '@paper-design/shaders-react';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

type AuthView = 'signin' | 'signup' | 'forgot_password';

const COPY = {
    en: {
        loading: 'Loading…', haveAccount: 'Already have an account?', noAccount: "Don't have an account?", signIn: 'Sign in', register: 'Register',
        createTitle: 'Create an account', resetTitle: 'Reset password', loginTitle: 'Login to your account',
        createSub: 'Enter your details to get started.', resetSub: 'Enter your email to receive instructions.', loginSub: 'Please enter your details to login.',
        google: 'Continue with Google', or: 'Or continue with', name: 'Full Name', namePh: 'John Doe', email: 'Email Address', password: 'Password',
        forgot: 'Forgot your password?', passPhNew: 'Create a password', passPhNow: 'Enter your password', signUpBtn: 'Sign up', resetBtn: 'Send Reset Link', loginBtn: 'Login',
        back: 'Back to Sign In', checkEmail: 'Check your email', terms: 'Terms', privacy: 'Privacy',
        confirmSent: (e: string) => `We've sent a confirmation link to ${e}`, resetSent: (e: string) => `Password reset link sent to ${e}`,
        notConfirmed: 'Please confirm your email before signing in. Check your inbox (and spam folder) for the confirmation link.',
        invalid: 'Invalid email or password.', network: 'Network error connecting to authentication server. Please try clearing your browser cache and cookies, then try again.',
        unexpected: 'An unexpected error occurred.',
    },
    de: {
        loading: 'Wird geladen …', haveAccount: 'Sie haben bereits ein Konto?', noAccount: 'Noch kein Konto?', signIn: 'Anmelden', register: 'Registrieren',
        createTitle: 'Konto erstellen', resetTitle: 'Passwort zurücksetzen', loginTitle: 'Bei Ihrem Konto anmelden',
        createSub: 'Geben Sie Ihre Daten ein, um zu beginnen.', resetSub: 'Geben Sie Ihre E-Mail-Adresse ein, um eine Anleitung zu erhalten.', loginSub: 'Bitte geben Sie Ihre Zugangsdaten ein.',
        google: 'Weiter mit Google', or: 'Oder weiter mit', name: 'Vollständiger Name', namePh: 'Max Mustermann', email: 'E-Mail-Adresse', password: 'Passwort',
        forgot: 'Passwort vergessen?', passPhNew: 'Passwort erstellen', passPhNow: 'Passwort eingeben', signUpBtn: 'Registrieren', resetBtn: 'Link zum Zurücksetzen senden', loginBtn: 'Anmelden',
        back: 'Zurück zur Anmeldung', checkEmail: 'Prüfen Sie Ihr Postfach', terms: 'Nutzungsbedingungen', privacy: 'Datenschutz',
        confirmSent: (e: string) => `Wir haben einen Bestätigungslink an ${e} gesendet`, resetSent: (e: string) => `Link zum Zurücksetzen des Passworts an ${e} gesendet`,
        notConfirmed: 'Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie sich anmelden. Den Bestätigungslink finden Sie in Ihrem Postfach (auch im Spam-Ordner).',
        invalid: 'E-Mail-Adresse oder Passwort ist falsch.', network: 'Netzwerkfehler bei der Verbindung zum Anmeldeserver. Bitte leeren Sie Cache und Cookies Ihres Browsers und versuchen Sie es erneut.',
        unexpected: 'Es ist ein unerwarteter Fehler aufgetreten.',
    },
} as const;

// Outer padding + rounded panel matches the main site's floating-card treatment
// (.ct-top-area / .ct-footer both sit a few pixels off the viewport edge with large
// border-radius) instead of the panel running flush to the browser edge.
const BrandPanel = () => (
    <div className="hidden h-full p-2 lg:block">
        <div className="relative h-full overflow-hidden rounded-[32px] bg-[rgb(10,10,10)]">
            <LiquidMetal
                className="absolute inset-0 h-full w-full"
                width="100%"
                height="100%"
                image="/brand-mark-tile.svg"
                colorBack="#0a0a0a"
                colorTint="#ffffff"
                repetition={2}
                softness={0.1}
                shiftRed={0.3}
                shiftBlue={0.3}
                distortion={0.07}
                contour={0.4}
                angle={70}
                speed={1}
                scale={0.6}
                fit="contain"
            />
        </div>
    </div>
);

export default function AuthPage() {
    const { session, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const c = COPY[language === 'de' ? 'de' : 'en'];

    const [searchParams] = useSearchParams();
    const initialView = searchParams.get('view') as AuthView || 'signin';
    // The message comes from the URL, so anyone can link to this page with text of their choosing.
    // Show it only as short plain text, without links or contact details that could be used to phish.
    const initialMessage = (searchParams.get('message') || '').replace(/https?:\/\/\S+|\S+@\S+|[+\d][\d\s()-]{7,}/g, '').trim().slice(0, 140);

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
                    setSuccessMessage(c.confirmSent(email));
                }
            } else if (view === 'signin') {
                const { error } = await signIn(email, password);
                if (error) {
                    if (error.message.includes('Email not confirmed')) {
                        setError(c.notConfirmed);
                    } else if (error.message.includes('Invalid login credentials')) {
                        setError(c.invalid);
                    } else if (error.message.toLowerCase().includes('load failed') || error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('networkerror')) {
                        setError(c.network);
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
                    setSuccessMessage(c.resetSent(email));
                }
            }
        } catch {
            setError(c.unexpected);
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
                    <span className="text-sm font-medium">{c.loading}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid min-h-screen w-full bg-white text-neutral-900 lg:grid-cols-2">
            <div className="relative flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6">
                <div className="absolute top-5 right-4 sm:right-8">
                    <span className="text-sm text-gray-500">
                        {view === 'signup' ? c.haveAccount : c.noAccount}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setView(view === 'signup' ? 'signin' : 'signup');
                                setError('');
                            }}
                            className="inline-flex min-h-6 items-center font-medium text-gray-900 hover:underline"
                        >
                            {view === 'signup' ? c.signIn : c.register}
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
                            <h2 className="mb-2 text-2xl font-medium">{c.checkEmail}</h2>
                            <p className="mb-6 text-sm text-gray-500">{successMessage}</p>
                            <button
                                onClick={() => {
                                    setSuccessMessage('');
                                    setView('signin');
                                    setPassword('');
                                }}
                                className="w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                            >
                                {c.back}
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            <div className="space-y-2 text-center">
                                <img src="/brand-mark-tile.svg" alt="ClerkTree" className="mx-auto mb-2 h-8 w-8" />
                                <h1 className="text-3xl font-medium">
                                    {view === 'signup' ? c.createTitle : view === 'forgot_password' ? c.resetTitle : c.loginTitle}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {view === 'signup' ? c.createSub : view === 'forgot_password' ? c.resetSub : c.loginSub}
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
                                        <span className="text-sm font-medium">{c.google}</span>
                                    </button>

                                    <div className="relative text-center text-sm">
                                        <div className="absolute inset-0 top-1/2 flex items-center border-t border-gray-200" />
                                        <span className="relative bg-white px-2 text-gray-400">{c.or}</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {view === 'signup' && (
                                    <div className="space-y-1.5">
                                        <label htmlFor="auth-name" className="text-sm font-medium text-gray-700">{c.name}</label>
                                        <input
                                            id="auth-name"
                                            autoComplete="name"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder={c.namePh}
                                            className="ct-field w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label htmlFor="auth-email" className="text-sm font-medium text-gray-700">{c.email}</label>
                                    <input
                                        id="auth-email"
                                        autoComplete="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="ct-field w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                {view !== 'forgot_password' && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="auth-password" className="text-sm font-medium text-gray-700">{c.password}</label>
                                            {view === 'signin' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setView('forgot_password');
                                                        setError('');
                                                    }}
                                                    className="inline-flex min-h-6 items-center text-xs font-medium text-gray-500 hover:text-gray-900 hover:underline"
                                                >
                                                    {c.forgot}
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            id="auth-password"
                                            autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={view === 'signup' ? c.passPhNew : c.passPhNow}
                                            required
                                            minLength={6}
                                            className="ct-field w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                                        />
                                    </div>
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
                                                {view === 'signup' ? c.signUpBtn : view === 'forgot_password' ? c.resetBtn : c.loginBtn}
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
                                        {c.back}
                                    </button>
                                )}
                            </form>
                        </>
                    )}
                </div>

                <div className="absolute bottom-5 left-0 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 sm:px-8">
                    <span className="text-sm text-gray-400">© {new Date().getFullYear()}, ClerkTree.</span>
                    <div className="flex items-center gap-x-5 text-sm">
                        <a href="/terms-of-service" className="inline-flex min-h-6 items-center text-gray-400 hover:text-gray-600 hover:underline">{c.terms}</a>
                        <a href="/privacy-policy" className="inline-flex min-h-6 items-center text-gray-400 hover:text-gray-600 hover:underline">{c.privacy}</a>
                    </div>
                </div>
            </div>

            <BrandPanel />
        </div>
    );
}
