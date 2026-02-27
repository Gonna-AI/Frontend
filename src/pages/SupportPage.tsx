import { useState } from 'react';
import { CheckCircle2, Ticket, AlertTriangle, FileText, MessageSquare, Menu, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';

const CATEGORIES = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'account', label: 'Account & Access' },
    { value: 'api', label: 'API & Integration' },
    { value: 'general', label: 'General Inquiry' },
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
    { value: 'medium', label: 'Medium', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' },
    { value: 'high', label: 'High', color: 'text-orange-400 border-orange-500/20 bg-orange-500/10' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400 border-red-500/20 bg-red-500/10' },
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                throw new Error('Support service is not configured.');
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('Please sign in to submit a support ticket.');
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
                throw new Error(result.message || result.error || 'Failed to create ticket');
            }

            setTicketId(result.ticket_id);
            setSubmitStatus('success');
        } catch (err) {
            console.error('Ticket submission error:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#0A0A0A] min-h-screen text-white/80 font-sans selection:bg-purple-500/30">
            {/* Header - Matching DocsPage */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
                <div className="h-full max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 464 468" className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity">
                                <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
                            </svg>
                            <span className="font-semibold text-white tracking-tight hidden sm:block">ClerkTree</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-white/40 border border-white/5">
                                v1.0
                            </span>
                            <span className="h-4 w-[1px] bg-white/10 mx-2" />
                            <span className="text-sm font-medium text-purple-400">Support Center</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link to="/contact" className="text-white/60 hover:text-white transition-colors">Contact Sales</Link>
                        </div>
                        <Link to="/dashboard" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors">
                            Dashboard
                        </Link>
                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-white/60"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="pt-16 max-w-[1600px] mx-auto flex min-h-[calc(100vh-64px)]">

                {/* Left Sidebar - Navigation */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0A0A0A] border-r border-white/5 transform transition-transform duration-300 md:translate-x-0 md:static md:block pt-20 md:pt-8 px-4 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">Support Resources</h3>
                            <nav className="space-y-0.5">
                                <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 font-medium">
                                    <Ticket className="w-4 h-4" />
                                    <span>Submit Ticket</span>
                                </button>
                                <Link to="/docs" className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                                    <FileText className="w-4 h-4" />
                                    <span>Documentation</span>
                                </Link>
                                <a href="mailto:team@clerktree.com" className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Email Us</span>
                                </a>
                            </nav>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">Common Topics</h3>
                            <nav className="space-y-0.5">
                                <Link to="/docs#auth" className="block px-3 py-1.5 text-sm text-white/50 hover:text-white transition-colors">Authentication</Link>
                                <Link to="/docs#rate-limits" className="block px-3 py-1.5 text-sm text-white/50 hover:text-white transition-colors">Rate Limits</Link>
                                <Link to="/docs#webhooks" className="block px-3 py-1.5 text-sm text-white/50 hover:text-white transition-colors">Webhooks</Link>
                            </nav>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 py-12 px-4 md:px-12 lg:px-16 overflow-y-auto">
                    <div className="max-w-3xl">

                        <div className="mb-10">
                            <div className="flex items-center gap-2 text-sm text-purple-400 mb-2 font-mono">
                                <span>Support</span>
                                <span>/</span>
                                <span>New Ticket</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Submit a Request</h1>
                            <p className="text-lg text-white/60 leading-relaxed">
                                Encountering an issue? Our engineering team is ready to help. Please provide detailed information to ensure a fast resolution.
                            </p>
                        </div>

                        {/* Status Message */}
                        {submitStatus === 'success' ? (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-2">Ticket Created Successfully</h3>
                                        <p className="text-white/60 mb-6">
                                            We've received your request and sent a confirmation email to <span className="text-white">{formData.user_email}</span>.
                                        </p>

                                        <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-4 font-mono text-sm mb-6 flex items-center justify-between group">
                                            <span className="text-white/40">Ticket ID</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-purple-400 font-bold text-lg">{ticketId}</span>
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
                                                className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                                            >
                                                Create Another Ticket
                                            </button>
                                            <Link
                                                to="/"
                                                className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-sm font-medium hover:text-white hover:bg-white/5 transition-colors"
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
                                        <label htmlFor="user_name" className="block text-sm font-medium text-white/80">Full Name</label>
                                        <input
                                            id="user_name"
                                            type="text"
                                            name="user_name"
                                            required
                                            value={formData.user_name}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="user_email" className="block text-sm font-medium text-white/80">Email Address</label>
                                        <input
                                            id="user_email"
                                            type="email"
                                            name="user_email"
                                            required
                                            value={formData.user_email}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm"
                                            placeholder="jane@company.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="block text-sm font-medium text-white/80">Subject</label>
                                    <input
                                        id="subject"
                                        type="text"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm"
                                        placeholder="API Rate Limit Issues..."
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="category" className="block text-sm font-medium text-white/80">Category</label>
                                        <div className="relative">
                                            <select
                                                id="category"
                                                name="category"
                                                required
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all appearance-none font-mono text-sm"
                                            >
                                                <option value="" className="bg-[#0A0A0A]">Select Category...</option>
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat.value} value={cat.value} className="bg-[#0A0A0A]">{cat.label}</option>
                                                ))}
                                            </select>
                                            <ArrowLeft className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none text-white/30" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p id="priority-label" className="block text-sm font-medium text-white/80">Priority</p>
                                        <div role="radiogroup" aria-labelledby="priority-label" className="grid grid-cols-4 gap-2">
                                            {PRIORITIES.map(p => (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                                                    className={`px-2 py-2 rounded-lg text-xs font-mono font-medium border transition-all ${formData.priority === p.value
                                                        ? p.color
                                                        : 'text-white/40 bg-white/5 border-white/5 hover:bg-white/10 hover:text-white/60'
                                                        }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-white/80">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={8}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm leading-relaxed"
                                        placeholder={`Steps to reproduce:\n1. ...\n\nExpected behavior:\n...\n\nActual behavior:\n...`}
                                    />
                                    <p className="text-xs text-white/30">Please include any relevant error codes or request IDs.</p>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <p className="text-xs text-white/40">
                                        By submitting this form, you agree to our <Link to="/terms" className="hover:text-white underline">Terms of Service</Link>.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
        </div>
    );
};

export default SupportPage;
