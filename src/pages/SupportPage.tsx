import { useState } from 'react';
import { Send, CheckCircle2, Ticket, AlertTriangle, ArrowLeft } from 'lucide-react';
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
    { value: 'low', label: 'Low', color: 'text-emerald-400', desc: 'No rush' },
    { value: 'medium', label: 'Medium', color: 'text-amber-400', desc: 'Normal' },
    { value: 'high', label: 'High', color: 'text-orange-400', desc: 'Important' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400', desc: 'Critical' },
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
        <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
            {/* Purple theme background accents */}
            <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
                <div
                    className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
                    style={{
                        background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0.25) 40%, transparent 100%)',
                        filter: 'blur(80px)',
                    }}
                />
                <div
                    className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(139,92,246,0.2) 40%, transparent 100%)',
                        filter: 'blur(80px)',
                    }}
                />
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-md bg-[rgb(10,10,10)]/80 border-b border-white/10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 group"
                        aria-label="Go to home"
                    >
                        <svg viewBox="0 0 464 468" className="w-9 h-9 md:w-11 md:h-11">
                            <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
                        </svg>
                        <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors">
                            ClerkTree
                        </span>
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="hidden md:inline-block px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                            Support Center
                        </span>
                        <Link to="/docs" className="text-sm text-white/60 hover:text-white transition-colors">
                            Docs
                        </Link>
                        <Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </header>

            <div className="relative z-10 py-12 px-6 pt-32 md:pt-36">
                <div className="max-w-4xl mx-auto">

                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm">Back</span>
                    </button>

                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                            <Ticket className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 text-sm font-medium">Support Ticket System</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                                How can we
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 text-transparent bg-clip-text">
                                help you?
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
                            Submit a support ticket and our team will get back to you. Every ticket receives a unique tracking ID for follow-up.
                        </p>
                    </div>

                    {/* Info Cards */}
                    <div className="grid md:grid-cols-3 gap-4 mb-12">
                        <div className="group rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 hover:border-purple-500/30 transition-all duration-300 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Ticket className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-white/90 text-sm mb-1">Auto Ticket ID</h3>
                            <p className="text-white/50 text-xs">Every request gets a unique CT-XXXXX tracking ID</p>
                        </div>
                        <div className="group rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 hover:border-purple-500/30 transition-all duration-300 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Send className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-white/90 text-sm mb-1">Email Confirmation</h3>
                            <p className="text-white/50 text-xs">You'll receive a confirmation email with ticket details</p>
                        </div>
                        <div className="group rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 hover:border-purple-500/30 transition-all duration-300 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-white/90 text-sm mb-1">Priority Routing</h3>
                            <p className="text-white/50 text-xs">Urgent issues are flagged for immediate attention</p>
                        </div>
                    </div>

                    {/* Ticket Form */}
                    <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl shadow-black/50 relative overflow-hidden">
                        {/* Decorative gradient glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                        {submitStatus === 'success' ? (
                            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Ticket Created!</h3>
                                <p className="text-white/60 mb-8">Your support request has been submitted successfully.</p>

                                {/* Ticket ID Display */}
                                <div className="inline-block bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-2xl p-8 mb-8">
                                    <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Your Ticket ID</p>
                                    <p className="text-4xl md:text-5xl font-mono font-bold text-purple-400 tracking-wider">{ticketId}</p>
                                    <p className="text-xs text-white/40 mt-3">Save this ID for tracking your request</p>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-white/50 text-sm">
                                        A confirmation email has been sent to <span className="text-purple-400">{formData.user_email}</span>
                                    </p>
                                    <div className="flex items-center justify-center gap-4 pt-4">
                                        <button
                                            onClick={() => {
                                                setSubmitStatus('idle');
                                                setTicketId('');
                                                setFormData({
                                                    user_name: '', user_email: '', subject: '',
                                                    category: '', priority: 'medium', description: '',
                                                });
                                            }}
                                            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-all"
                                        >
                                            Submit Another
                                        </button>
                                        <Link
                                            to="/"
                                            className="px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-all"
                                        >
                                            Back to Home
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-10">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-white via-white/90 to-white/70 text-transparent bg-clip-text">
                                        Submit a Support Ticket
                                    </h2>
                                    <p className="text-white/50 text-sm max-w-lg mx-auto">
                                        Provide as much detail as possible so our team can resolve your issue quickly.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name & Email */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="user_name" className="text-sm font-medium text-white/70 ml-1">
                                                Full Name <span className="text-purple-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="user_name"
                                                name="user_name"
                                                required
                                                value={formData.user_name}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="user_email" className="text-sm font-medium text-white/70 ml-1">
                                                Email Address <span className="text-purple-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="user_email"
                                                name="user_email"
                                                required
                                                value={formData.user_email}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
                                                placeholder="you@company.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium text-white/70 ml-1">
                                            Subject <span className="text-purple-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-purple-500/10 transition-all duration-300"
                                            placeholder="Brief summary of your issue"
                                        />
                                    </div>

                                    {/* Category & Priority */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="category" className="text-sm font-medium text-white/70 ml-1">
                                                Category <span className="text-purple-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="category"
                                                    name="category"
                                                    required
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 appearance-none"
                                                >
                                                    <option value="" className="bg-neutral-900">Select category</option>
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat.value} value={cat.value} className="bg-neutral-900">{cat.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/70 ml-1">
                                                Priority
                                            </label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {PRIORITIES.map(p => (
                                                    <button
                                                        key={p.value}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                                                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 ${formData.priority === p.value
                                                            ? `${p.color} bg-white/[0.08] border-current shadow-sm`
                                                            : 'text-white/40 bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:text-white/60'
                                                            }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label htmlFor="description" className="text-sm font-medium text-white/70 ml-1">
                                            Description <span className="text-purple-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <textarea
                                                id="description"
                                                name="description"
                                                required
                                                rows={6}
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="peer w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] transition-all duration-300 resize-none text-base leading-relaxed"
                                                placeholder="Describe your issue in detail. Include steps to reproduce, expected behavior, and any error messages..."
                                            />
                                            <div className="absolute inset-0 rounded-xl border border-purple-500/50 opacity-0 peer-focus:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_20px_rgba(124,58,237,0.15)]" />
                                        </div>
                                    </div>

                                    {/* Error message */}
                                    {submitStatus === 'error' && (
                                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-red-400 font-medium text-sm">Failed to create ticket</p>
                                                <p className="text-red-400/70 text-xs mt-1">{errorMessage}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 p-[1px] focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-600/10 transition-all duration-300 hover:shadow-purple-500/30 hover:scale-[1.01] active:scale-[0.99]"
                                        >
                                            <div className="relative h-full w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-8 py-4 transition-all duration-300 group-hover:bg-opacity-0">
                                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl" />
                                                <div className="relative flex items-center justify-center gap-3 text-white font-bold text-lg">
                                                    {isSubmitting ? (
                                                        <>
                                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                            </svg>
                                                            <span>Creating Ticket...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="tracking-wide">Submit Ticket</span>
                                                            <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Bottom help text */}
                    <div className="text-center mt-12">
                        <p className="text-white/30 text-sm">
                            Need immediate help? Email us directly at{' '}
                            <a href="mailto:team@clerktree.com" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
                                team@clerktree.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SupportPage;
