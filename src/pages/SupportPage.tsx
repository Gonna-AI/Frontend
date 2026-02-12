import { useState } from 'react';
import { Send, CheckCircle2, Ticket, AlertTriangle, HelpCircle, FileText, MessageSquare, Search, Menu, X, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import Footer from '../components/Landing/Footer';

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
    const navigate = useNavigate();
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
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-support-ticket`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
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
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold group-hover:scale-105 transition-transform">
                                C
                            </div>
                            <span className="font-semibold text-white tracking-tight">ClerkTree</span>
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
                                <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 font-medium">
                                    <Ticket className="w-4 h-4" />
                                    <span>Submit Ticket</span>
                                </a>
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
                                        <label className="block text-sm font-medium text-white/80">Full Name</label>
                                        <input
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
                                        <label className="block text-sm font-medium text-white/80">Email Address</label>
                                        <input
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
                                    <label className="block text-sm font-medium text-white/80">Subject</label>
                                    <input
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
                                        <label className="block text-sm font-medium text-white/80">Category</label>
                                        <div className="relative">
                                            <select
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
                                        <label className="block text-sm font-medium text-white/80">Priority</label>
                                        <div className="grid grid-cols-4 gap-2">
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
                                    <label className="block text-sm font-medium text-white/80">Description</label>
                                    <textarea
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
