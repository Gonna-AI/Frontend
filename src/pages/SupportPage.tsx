import { useState } from 'react';
import { CheckCircle2, Ticket, AlertTriangle, FileText, MessageSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Header, Footer } from '../components/Landing/AgeroChrome';
import { useLanguage } from '../contexts/LanguageContext';
import './LandingFramer.css';

const CATEGORIES = [
    { value: 'technical', labelKey: 'supportPage.category.technical' },
    { value: 'billing', labelKey: 'supportPage.category.billing' },
    { value: 'account', labelKey: 'supportPage.category.account' },
    { value: 'api', labelKey: 'supportPage.category.api' },
    { value: 'general', labelKey: 'supportPage.category.general' },
];

const PRIORITIES = [
    { value: 'low', labelKey: 'supportPage.priority.low', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
    { value: 'medium', labelKey: 'supportPage.priority.medium', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' },
    { value: 'high', labelKey: 'supportPage.priority.high', color: 'text-orange-400 border-orange-500/20 bg-orange-500/10' },
    { value: 'urgent', labelKey: 'supportPage.priority.urgent', color: 'text-red-400 border-red-500/20 bg-red-500/10' },
];

interface TicketForm {
    user_name: string;
    user_email: string;
    subject: string;
    category: string;
    priority: string;
    description: string;
}

const SupportPage = () => {
    const { t } = useLanguage();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
    const [formData, setFormData] = useState<TicketForm>({
        user_name: '',
        user_email: '',
        subject: '',
        category: '',
        priority: 'medium',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [ticketId, setTicketId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            if (!supabaseUrl) {
                throw new Error(t('supportPage.error.serviceNotConfigured'));
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error(t('supportPage.error.signInRequired'));
            }

            const response = await fetch(
                `${supabaseUrl}/functions/v1/create-support-ticket`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.error || t('supportPage.error.createFailed'));
            }

            setTicketId(result.ticket_id);
            setSubmitStatus('success');
        } catch (err) {
            console.error('Ticket submission error:', err);
            setErrorMessage(err instanceof Error ? err.message : t('supportPage.error.generic'));
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="agero-works min-h-screen font-sans selection:bg-[#FF8A5B]/30 relative overflow-hidden">
            <div className="agero-top-area agero-top-area-compact">
                <Header />
            </div>

            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row py-8 md:py-12 px-4 md:px-8 gap-8 md:gap-12">

                {/* Left Sidebar - Navigation */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 mb-2 md:hidden">
                            <Link to="/docs" className="text-sm text-[rgba(19,19,19,0.6)] hover:text-[rgb(19,19,19)] transition-colors">Documentation</Link>
                            <span className="text-[rgba(19,19,19,0.2)]">·</span>
                            <Link to="/dashboard" className="text-sm text-[rgba(19,19,19,0.6)] hover:text-[rgb(19,19,19)] transition-colors">Dashboard</Link>
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-[rgba(19,19,19,0.4)] uppercase tracking-wider mb-3 px-2">Support Resources</h3>
                            <nav className="space-y-0.5">
                                <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FF8A5B]/10 text-[#FFB286] font-medium">
                                    <Ticket className="w-4 h-4" />
                                    <span>Submit Ticket</span>
                                </button>
                                <Link to="/docs" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[rgba(19,19,19,0.6)] hover:text-[rgb(19,19,19)] hover:bg-[rgba(19,19,19,0.03)] transition-colors">
                                    <FileText className="w-4 h-4" />
                                    <span>Documentation</span>
                                </Link>
                                <a href="mailto:team@clerktree.com" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[rgba(19,19,19,0.6)] hover:text-[rgb(19,19,19)] hover:bg-[rgba(19,19,19,0.03)] transition-colors">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Email Us</span>
                                </a>
                            </nav>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-[rgba(19,19,19,0.4)] uppercase tracking-wider mb-3 px-2">Common Topics</h3>
                            <nav className="space-y-0.5">
                                <Link to="/docs#auth" className="block px-3 py-1.5 text-sm text-[rgba(19,19,19,0.5)] hover:text-[rgb(19,19,19)] transition-colors">Authentication</Link>
                                <Link to="/docs#rate-limits" className="block px-3 py-1.5 text-sm text-[rgba(19,19,19,0.5)] hover:text-[rgb(19,19,19)] transition-colors">Rate Limits</Link>
                                <Link to="/docs#webhooks" className="block px-3 py-1.5 text-sm text-[rgba(19,19,19,0.5)] hover:text-[rgb(19,19,19)] transition-colors">Webhooks</Link>
                            </nav>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="max-w-3xl">

                        <div className="mb-10">
                            <div className="flex items-center gap-2 text-sm text-[#FF8A5B] mb-2 font-mono">
                                <span>Support</span>
                                <span>/</span>
                                <span>New Ticket</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-[rgb(19,19,19)] mb-4 tracking-tight">Submit a Request</h1>
                            <p className="text-lg text-[rgba(19,19,19,0.6)] leading-relaxed">
                                Encountering an issue? Our engineering team is ready to help. Please provide detailed information to ensure a fast resolution.
                            </p>
                        </div>

                        {/* Status Message */}
                        {submitStatus === 'success' ? (
                            <div className="rounded-xl border border-[#FF8A5B]/25 bg-[#FF8A5B]/10 p-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-[#FF8A5B]/10 text-[#FF8A5B]">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-[rgb(19,19,19)] mb-2">Ticket Created Successfully</h3>
                                        <p className="text-[rgba(19,19,19,0.6)] mb-6">
                                            We've received your request and sent a confirmation email to <span className="text-[rgb(19,19,19)]">{formData.user_email}</span>.
                                        </p>

                                        <div className="rounded-lg border border-[rgba(19,19,19,0.1)] bg-[rgba(19,19,19,0.03)] p-4 font-mono text-sm mb-6 flex items-center justify-between group">
                                            <span className="text-[rgba(19,19,19,0.4)]">Ticket ID</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#FF8A5B] font-bold text-lg">{ticketId}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setSubmitStatus('idle');
                                                    setTicketId('');
                                                    setFormData({
                                                        user_name: '', user_email: '', subject: '',
                                                        category: '', priority: 'medium', description: '',
                                                    });
                                                }}
                                                className="px-4 py-2 rounded-lg bg-[rgba(19,19,19,0.06)] text-[rgb(19,19,19)] text-sm font-medium hover:bg-[rgba(19,19,19,0.1)] transition-colors"
                                            >
                                                Create Another Ticket
                                            </button>
                                            <Link
                                                to="/"
                                                className="px-4 py-2 rounded-lg border border-[rgba(19,19,19,0.1)] text-[rgba(19,19,19,0.6)] text-sm font-medium hover:text-[rgb(19,19,19)] hover:bg-[rgba(19,19,19,0.03)] transition-colors"
                                            >
                                                Return Home
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Error Alert */}
                                {submitStatus === 'error' && (
                                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="text-red-400 font-medium">Submission Failed</p>
                                            <p className="text-red-400/70 mt-1">{errorMessage}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="user_name" className="block text-sm font-medium text-[rgba(19,19,19,0.75)]">Full Name</label>
                                        <input
                                            id="user_name"
                                            type="text"
                                            name="user_name"
                                            required
                                            value={formData.user_name}
                                            onChange={handleChange}
                                            className="w-full bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] rounded-lg px-4 py-2.5 text-[rgb(19,19,19)] placeholder-[rgba(19,19,19,0.35)] focus:outline-none focus:border-[#FF8A5B]/50 focus:ring-1 focus:ring-[#FF8A5B]/50 transition-all font-mono text-sm"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="user_email" className="block text-sm font-medium text-[rgba(19,19,19,0.75)]">Email Address</label>
                                        <input
                                            id="user_email"
                                            type="email"
                                            name="user_email"
                                            required
                                            value={formData.user_email}
                                            onChange={handleChange}
                                            className="w-full bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] rounded-lg px-4 py-2.5 text-[rgb(19,19,19)] placeholder-[rgba(19,19,19,0.35)] focus:outline-none focus:border-[#FF8A5B]/50 focus:ring-1 focus:ring-[#FF8A5B]/50 transition-all font-mono text-sm"
                                            placeholder="jane@company.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="block text-sm font-medium text-[rgba(19,19,19,0.75)]">Subject</label>
                                    <input
                                        id="subject"
                                        type="text"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] rounded-lg px-4 py-2.5 text-[rgb(19,19,19)] placeholder-[rgba(19,19,19,0.35)] focus:outline-none focus:border-[#FF8A5B]/50 focus:ring-1 focus:ring-[#FF8A5B]/50 transition-all font-mono text-sm"
                                        placeholder="API Rate Limit Issues..."
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="category" className="block text-sm font-medium text-[rgba(19,19,19,0.75)]">Category</label>
                                        <div className="relative">
                                            <select
                                                id="category"
                                                name="category"
                                                required
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] rounded-lg px-4 py-2.5 text-[rgb(19,19,19)] focus:outline-none focus:border-[#FF8A5B]/50 focus:ring-1 focus:ring-[#FF8A5B]/50 transition-all appearance-none font-mono text-sm"
                                            >
                                                <option value="">Select Category...</option>
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                            <ArrowLeft className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none text-[rgba(19,19,19,0.35)]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p id="priority-label" className="block text-sm font-medium text-[rgba(19,19,19,0.75)]">Priority</p>
                                        <div role="radiogroup" aria-labelledby="priority-label" className="grid grid-cols-4 gap-2">
                                            {PRIORITIES.map(p => (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                                                    className={`px-2 py-2 rounded-lg text-xs font-mono font-medium border transition-all ${formData.priority === p.value
                                                        ? p.color
                                                        : 'text-[rgba(19,19,19,0.4)] bg-[rgba(19,19,19,0.03)] border-[rgba(19,19,19,0.08)] hover:bg-[rgba(19,19,19,0.06)] hover:text-[rgba(19,19,19,0.6)]'
                                                        }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-[rgba(19,19,19,0.75)]">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={8}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full bg-[rgba(19,19,19,0.03)] border border-[rgba(19,19,19,0.1)] rounded-lg px-4 py-3 text-[rgb(19,19,19)] placeholder-[rgba(19,19,19,0.35)] focus:outline-none focus:border-[#FF8A5B]/50 focus:ring-1 focus:ring-[#FF8A5B]/50 transition-all font-mono text-sm leading-relaxed"
                                        placeholder={`Steps to reproduce:\n1. ...\n\nExpected behavior:\n...\n\nActual behavior:\n...`}
                                    />
                                    <p className="text-xs text-[rgba(19,19,19,0.35)]">Please include any relevant error codes or request IDs.</p>
                                </div>

                                <div className="pt-4 border-t border-[rgba(19,19,19,0.08)] flex items-center justify-between">
                                    <p className="text-xs text-[rgba(19,19,19,0.4)]">
                                        By submitting this form, you agree to our <Link to="/terms" className="hover:text-[rgb(19,19,19)] underline">Terms of Service</Link>.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF8A5B] via-[#FF9E6C] to-[#FFB286] text-white font-semibold text-sm hover:from-[#FF9E6C] hover:via-[#FF8A5B] hover:to-[#FFB286] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-[#FF8A5B]/30"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Submit Ticket</span>
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default SupportPage;
