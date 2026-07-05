import { useState, useEffect, useRef } from 'react';
import { Search, Check, Copy, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
    EndpointDoc, BASE_URL, chatEndpoints, callEndpoints,
    dashboardEndpoints, errorCodes
} from './docsContent';
import { Header } from '../components/Landing/AgeroChrome';
import './LandingFramer.css';

type DocSection = 'intro' | 'auth' | 'chat' | 'call' | 'dashboard' | 'webhooks';
interface NavItem { id: string; label: string; section: DocSection; }
interface NavGroup { title: string; items: NavItem[]; }

const navGroups: NavGroup[] = [
    {
        title: 'Get Started', items: [
            { id: 'welcome', label: 'Introduction', section: 'intro' },
            { id: 'quickstart', label: 'Quickstart', section: 'intro' },
            { id: 'auth', label: 'Authentication', section: 'auth' },
            { id: 'rate-limits', label: 'Rate Limits', section: 'auth' },
            { id: 'errors', label: 'Error Handling', section: 'auth' },
        ]
    },
    {
        title: 'Chat API', items: [
            { id: 'chat-overview', label: 'Overview', section: 'chat' },
            { id: 'chat-completions', label: 'Create Completion', section: 'chat' },
            { id: 'chat-streaming', label: 'Streaming', section: 'chat' },
            { id: 'chat-history', label: 'Conversation History', section: 'chat' },
        ]
    },
    {
        title: 'Call API', items: [
            { id: 'call-overview', label: 'Overview', section: 'call' },
            { id: 'call-initiate', label: 'Initiate Call', section: 'call' },
            { id: 'call-status', label: 'Get Call Status', section: 'call' },
            { id: 'call-history', label: 'Call History', section: 'call' },
            { id: 'call-recording', label: 'Get Recording', section: 'call' },
        ]
    },
    {
        title: 'Dashboard API', items: [
            { id: 'dash-overview', label: 'Overview', section: 'dashboard' },
            { id: 'dash-monitor', label: 'Live Monitor', section: 'dashboard' },
            { id: 'dash-analytics', label: 'Sales Analytics', section: 'dashboard' },
            { id: 'dash-leads', label: 'Leads', section: 'dashboard' },
            { id: 'dash-usage', label: 'Usage & Credits', section: 'dashboard' },
            { id: 'dash-keys', label: 'API Keys', section: 'dashboard' },
        ]
    },
    {
        title: 'Real-time', items: [
            { id: 'webhooks', label: 'Webhooks', section: 'webhooks' },
            { id: 'websocket', label: 'WebSocket Stream', section: 'webhooks' },
        ]
    },
];

const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="relative group rounded-xl overflow-hidden bg-[#0C0C0E] border border-white/10 my-4 max-w-full">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-xs text-[#FFB286]/70 font-mono">{language}</span>
                <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/40 group-hover:text-white/70" />}
                </button>
            </div>
            <div className="p-4 overflow-x-auto w-full"><pre className="text-sm font-mono text-white/80 whitespace-pre"><code>{code}</code></pre></div>
        </div>
    );
};

const MethodBadge = ({ method, color }: { method: string; color: string }) => {
    const colors: Record<string, string> = {
        emerald: 'bg-emerald-500/20 text-emerald-300',
        pink: 'bg-pink-500/20 text-pink-300',
        purple: 'bg-[#FF4D00]/20 text-[#FF8A5B]',
        amber: 'bg-amber-500/20 text-amber-300',
        blue: 'bg-blue-500/20 text-blue-300',
    };
    return <span className={`px-2 py-1 ${colors[color] || colors.emerald} rounded text-sm font-mono font-bold flex-shrink-0`}>{method}</span>;
};

const GrainOverlay = ({ className = '' }: { className?: string }) => (
    <div
        className={`pointer-events-none absolute inset-0 opacity-[0.14] [mask-image:radial-gradient(ellipse_at_center,#fff,transparent_75%)] ${className}`}
        style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '30%' }}
    />
);

const ParamTable = ({ params, title }: { params: EndpointDoc['params']; title?: string }) => {
    if (!params || params.length === 0) return null;
    return (
        <div className="mt-6">
            {title && <h4 className="text-sm font-semibold text-[rgba(19,19,19,0.75)] mb-3">{title}</h4>}
            <div className="rounded-xl border border-[rgba(19,19,19,0.1)] overflow-hidden w-full overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                    <thead><tr className="bg-[rgba(19,19,19,0.03)] text-left">
                        <th className="px-4 py-3 text-[rgba(19,19,19,0.6)] font-medium">Parameter</th>
                        <th className="px-4 py-3 text-[rgba(19,19,19,0.6)] font-medium">Type</th>
                        <th className="px-4 py-3 text-[rgba(19,19,19,0.6)] font-medium">Required</th>
                        <th className="px-4 py-3 text-[rgba(19,19,19,0.6)] font-medium">Description</th>
                    </tr></thead>
                    <tbody>
                        {params.map((p, i) => (
                            <tr key={i} className="border-t border-[rgba(19,19,19,0.08)]">
                                <td className="px-4 py-3 font-mono text-[#D14000]">{p.name}</td>
                                <td className="px-4 py-3 text-[rgba(19,19,19,0.5)]">{p.type}</td>
                                <td className="px-4 py-3">{p.required ? <span className="text-amber-400 text-xs font-semibold">Required</span> : <span className="text-[rgba(19,19,19,0.35)] text-xs">Optional</span>}</td>
                                <td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">{p.desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SectionHeader = ({ title, description, iconColor, iconClass }: { title: string; description: string; iconColor: string; iconClass: string }) => (
    <div className="relative overflow-hidden rounded-3xl border border-[rgba(19,19,19,0.1)] bg-white p-8 shadow-[0_24px_70px_rgba(0,0,0,0.08)] group">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_top,rgba(255,77,0,0.08),transparent)]" />
        <GrainOverlay className="opacity-[0.18]" />
        <div className={`absolute top-0 right-0 p-32 ${iconColor} opacity-[0.05] blur-3xl rounded-full translate-x-12 -translate-y-12 transition-opacity group-hover:opacity-[0.12]`} />
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl ${iconClass} flex items-center justify-center mb-6 shadow-inner`}>
                <div className="w-6 h-6 rounded-full bg-current opacity-80" />
            </div>
            <h2 className="text-3xl font-bold text-[rgb(19,19,19)] mb-3 tracking-tight font-urbanist">{title}</h2>
            <p className="text-[rgba(19,19,19,0.6)] leading-relaxed text-lg max-w-2xl">{description}</p>
        </div>
    </div>
);

const TryItPanel = ({ ep }: { ep: EndpointDoc }) => {
    const [apiKey, setApiKey] = useState('');
    const [body, setBody] = useState(ep.tryItBody || '');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusCode, setStatusCode] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    if (!ep.realUrl) return null;

    const handleSend = async () => {
        if (!apiKey) { setResponse('{"error": "Enter your API key above"}'); setStatusCode(401); return; }
        setLoading(true); setResponse(''); setStatusCode(null);
        try {
            const method = ep.realMethod || ep.method;
            const opts: RequestInit = {
                method,
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            };
            if (method === 'POST' && body) opts.body = body;
            const res = await fetch(ep.realUrl!, opts);
            setStatusCode(res.status);
            const text = await res.text();
            try { setResponse(JSON.stringify(JSON.parse(text), null, 2)); } catch { setResponse(text); }
        } catch (err: any) {
            setResponse(JSON.stringify({ error: 'Network error', message: err.message }, null, 2));
            setStatusCode(0);
        }
        setLoading(false);
    };

    return (
        <div className="mt-6">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D00]/20 to-[#FF8A5B]/20 border border-[#FF4D00]/30 hover:border-[#FF8A5B]/50 text-sm font-medium text-[#D14000] hover:text-[rgb(19,19,19)] transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                {isOpen ? 'Hide' : 'Try It Live'}
                <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
                <div className="mt-3 p-5 rounded-2xl bg-[rgba(19,19,19,0.02)] border border-[rgba(19,19,19,0.1)] space-y-4">
                    <div>
                        <label className="text-xs text-[rgba(19,19,19,0.5)] font-medium block mb-1.5">API Key</label>
                        <input type="password" placeholder="ct_live_..." value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-[rgba(19,19,19,0.04)] border border-[rgba(19,19,19,0.1)] rounded-lg px-3 py-2 text-sm font-mono text-[rgb(19,19,19)] placeholder-[rgba(19,19,19,0.3)] focus:outline-none focus:border-[#FF4D00]/50 transition-colors" />
                    </div>
                    {(ep.realMethod === 'POST' || ep.method === 'POST') && (
                        <div>
                            <label className="text-xs text-[rgba(19,19,19,0.5)] font-medium block mb-1.5">Request Body</label>
                            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={Math.min(10, (body.split('\n').length || 3) + 1)}
                                className="w-full bg-[rgba(19,19,19,0.04)] border border-[rgba(19,19,19,0.1)] rounded-lg px-3 py-2 text-sm font-mono text-[rgba(19,19,19,0.75)] focus:outline-none focus:border-[#FF4D00]/50 resize-y transition-colors" />
                        </div>
                    )}
                    <button onClick={handleSend} disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D00]/15 to-[#FF8A5B]/10 border border-[#FF4D00]/30 hover:border-[#FF8A5B]/50 text-sm font-medium text-[#D14000] hover:text-[#FF4D00] transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm">
                        {loading ? (
                            <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending...</span>
                        ) : <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" /></svg>Send Request</>}
                    </button>
                    {response && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-[rgba(19,19,19,0.5)]">Response</span>
                                {statusCode !== null && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${statusCode >= 200 && statusCode < 300 ? 'bg-emerald-500/20 text-emerald-400' : statusCode >= 400 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {statusCode}
                                    </span>
                                )}
                            </div>
                            <CodeBlock code={response} language="json" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const EndpointSection = ({ ep }: { ep: EndpointDoc }) => (
    <section id={ep.id} className="scroll-mt-24 space-y-4 py-8">
        <h3 className="text-2xl font-semibold text-[rgb(19,19,19)]">{ep.title}</h3>
        <p className="text-[rgba(19,19,19,0.6)] leading-relaxed">{ep.description}</p>
        <div className="flex items-center gap-3 text-sm font-mono mt-4 overflow-x-auto pb-2 w-full">
            <MethodBadge method={ep.method} color={ep.color} />
            <span className="text-[rgba(19,19,19,0.7)] whitespace-nowrap">{BASE_URL}{ep.path}</span>
        </div>
        <ParamTable params={ep.params} title="Request Body Parameters" />
        <ParamTable params={ep.queryParams} title="Query Parameters" />
        {ep.requestBody && (<div className="mt-6"><h4 className="text-sm font-semibold text-[rgba(19,19,19,0.75)] mb-2">Request Example</h4><CodeBlock code={ep.requestBody} language="bash" /></div>)}
        {ep.responseBody && (<div className="mt-6"><h4 className="text-sm font-semibold text-[rgba(19,19,19,0.75)] mb-2">Response</h4><CodeBlock code={ep.responseBody} language="json" /></div>)}
        <TryItPanel ep={ep} />
    </section>
);

export default function DocsPage() {
    const [activeId, setActiveId] = useState('welcome');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const allNavItems = navGroups.flatMap(g => g.items);
    const isManualScroll = useRef(false);

    // Collect ALL observable section IDs (nav items + endpoint IDs)
    const allSectionIds = [
        ...allNavItems.map(item => item.id),
        ...chatEndpoints.map(ep => ep.id),
        ...callEndpoints.map(ep => ep.id),
        ...dashboardEndpoints.map(ep => ep.id),
    ];

    // Scroll-spy: observe all sections and update activeId on scroll
    useEffect(() => {
        const observerCallback: IntersectionObserverCallback = (entries) => {
            if (isManualScroll.current) return;

            // Find all currently intersecting entries
            const visibleEntries = entries.filter(entry => entry.isIntersecting);
            if (visibleEntries.length === 0) return;

            // Pick the entry closest to the top of the viewport
            let closest: IntersectionObserverEntry | null = null;
            let closestDistance = Infinity;
            for (const entry of visibleEntries) {
                const distance = Math.abs(entry.boundingClientRect.top);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closest = entry;
                }
            }

            if (closest) {
                const id = closest.target.id;
                // Map endpoint section IDs back to their parent nav item ID
                const navItem = allNavItems.find(item => item.id === id);
                if (navItem) {
                    setActiveId(id);
                } else {
                    // For endpoint sections not in nav, find the closest parent nav item
                    // by checking which nav group the endpoint belongs to
                    const epInChat = chatEndpoints.find(ep => ep.id === id);
                    const epInCall = callEndpoints.find(ep => ep.id === id);
                    const epInDash = dashboardEndpoints.find(ep => ep.id === id);

                    if (epInChat) setActiveId('chat-overview');
                    else if (epInCall) setActiveId('call-overview');
                    else if (epInDash) setActiveId('dash-overview');
                    else setActiveId(id);
                }
            }
        };

        const observer = new IntersectionObserver(observerCallback, {
            rootMargin: '-80px 0px -60% 0px',
            threshold: [0, 0.1, 0.5],
        });

        // Observe all sections
        for (const id of allSectionIds) {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    }, []);

    // Combine nav items with actual API endpoints for search
    const allSearchItems = [
        ...allNavItems.map(item => ({ ...item, description: '' })),
        ...chatEndpoints.map(ep => ({ id: ep.id, label: ep.title, section: 'chat' as DocSection, description: ep.description })),
        ...callEndpoints.map(ep => ({ id: ep.id, label: ep.title, section: 'call' as DocSection, description: ep.description })),
        ...dashboardEndpoints.map(ep => ({ id: ep.id, label: ep.title, section: 'dashboard' as DocSection, description: ep.description }))
    ];

    const filteredItems = allSearchItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(prev => !prev); }
            if (e.key === 'Escape') setIsSearchOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const scrollToSection = (id: string) => {
        // Temporarily disable scroll-spy so it doesn't fight with smooth scroll
        isManualScroll.current = true;
        setActiveId(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setIsSearchOpen(false);
        // Re-enable scroll-spy after the smooth scroll finishes
        setTimeout(() => { isManualScroll.current = false; }, 1000);
    };

    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            // Brief delay to ensure render
            setTimeout(() => {
                scrollToSection(id);
            }, 100);
        }
    }, [location.hash]);

    return (
        <div className="agero-works clerktree-docs relative min-h-screen font-urbanist selection:bg-[#FF4D00]/30 overflow-hidden">
            <div className="relative z-10">
                <div className="agero-top-area agero-top-area-compact">
                    <Header />
                </div>

                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row">
                {/* Sidebar */}
                <nav className="w-full md:w-72 shrink-0 pt-8 pb-6 md:pb-12 px-4 md:px-6">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[rgba(19,19,19,0.1)]">
                        <button onClick={() => setIsSearchOpen(true)} className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(19,19,19,0.1)] bg-[rgba(19,19,19,0.02)] text-sm text-[rgba(19,19,19,0.5)] hover:text-[rgb(19,19,19)] hover:border-[rgba(19,19,19,0.18)] transition-colors">
                            <Search className="w-4 h-4" />
                            <span>Search docs...</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                        <Link to="/support" className="text-sm text-[rgba(19,19,19,0.6)] hover:text-[rgb(19,19,19)] transition-colors">Support</Link>
                        <span className="text-[rgba(19,19,19,0.2)]">·</span>
                        <Link to="/dashboard" className="text-sm text-[rgba(19,19,19,0.6)] hover:text-[rgb(19,19,19)] transition-colors">Dashboard</Link>
                    </div>
                    <div className="space-y-8">
                        {navGroups.map((group) => (
                            <div key={group.title}>
                                <h3 className="text-sm font-semibold text-[rgba(19,19,19,0.85)] mb-3">{group.title}</h3>
                                <ul className="space-y-1">
                                    {group.items.map((item) => (
                                        <li key={item.id}><button onClick={() => scrollToSection(item.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeId === item.id ? 'bg-[#FF4D00]/10 text-[#FF8A5B] font-medium border border-[#FF4D00]/20' : 'text-[rgba(19,19,19,0.5)] hover:text-[rgba(19,19,19,0.75)] hover:bg-[rgba(19,19,19,0.03)]'}`}>{item.label}</button></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 px-4 md:px-12 pt-4 md:pt-8 pb-12 max-w-full md:max-w-5xl overflow-hidden">
                    <div className="space-y-16">

                        {/* ─── INTRODUCTION ─── */}
                        <section id="welcome" className="scroll-mt-24 space-y-6">
                            <div className="space-y-4">
                                <p className="text-[#FF8A5B] font-medium uppercase tracking-[0.2em] text-xs">API Reference</p>
                                <h1 className="text-3xl md:text-5xl font-bold text-[rgb(19,19,19)] font-urbanist">ClerkTree API Documentation</h1>
                                <p className="text-xl text-[rgba(19,19,19,0.6)] leading-relaxed max-w-3xl">
                                    Integrate AI-powered sales chat and voice calling into your product with a single API. ClerkTree provides blackbox AI models for chat and call — you send requests, we handle the intelligence.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                <div className="relative overflow-hidden rounded-2xl border border-[rgba(19,19,19,0.1)] bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] hover:border-[#FF4D00]/40 transition-colors">
                                    <GrainOverlay />
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4"><div className="w-5 h-5 bg-emerald-500 rounded-full" /></div>
                                        <h3 className="text-lg font-semibold text-[rgb(19,19,19)] mb-2">Chat API</h3>
                                        <p className="text-[rgba(19,19,19,0.5)] text-sm">AI chat completions for sales conversations, support, and lead qualification.</p>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden rounded-2xl border border-[rgba(19,19,19,0.1)] bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] hover:border-[#FF4D00]/40 transition-colors">
                                    <GrainOverlay />
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4"><div className="w-5 h-5 bg-pink-500 rounded-full" /></div>
                                        <h3 className="text-lg font-semibold text-[rgb(19,19,19)] mb-2">Call API</h3>
                                        <p className="text-[rgba(19,19,19,0.5)] text-sm">AI-powered voice calls with real-time transcription, sentiment analysis, and lead extraction.</p>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden rounded-2xl border border-[#FF4D00]/20 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] hover:border-[#FF4D00]/40 transition-colors">
                                    <GrainOverlay />
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-[#FF4D00]/15 flex items-center justify-center mb-4"><div className="w-5 h-5 bg-[#FF4D00] rounded-full" /></div>
                                        <h3 className="text-lg font-semibold text-[rgb(19,19,19)] mb-2">Dashboard API</h3>
                                        <p className="text-[rgba(19,19,19,0.5)] text-sm">Access your sales analytics, leads, usage data, and manage API keys programmatically.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ─── QUICKSTART ─── */}
                        <section id="quickstart" className="scroll-mt-24 space-y-6 border-t border-[rgba(19,19,19,0.08)] pt-12">
                            <h2 className="text-3xl font-bold text-[rgb(19,19,19)] font-urbanist">Quickstart</h2>
                            <p className="text-[rgba(19,19,19,0.6)]">Get up and running in under 2 minutes. All you need is an API key from your <Link to="/dashboard" className="text-[#FF8A5B] hover:text-[#D14000] underline underline-offset-4">ClerkTree Dashboard</Link>.</p>
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row items-start gap-3">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FF4D00]/20 text-[#FF8A5B] flex items-center justify-center text-sm font-bold">1</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[rgb(19,19,19)] font-medium">Get your API key</p>
                                        <p className="text-[rgba(19,19,19,0.5)] text-sm mt-1">Navigate to Dashboard → API Keys → Create New Key. Copy the generated token.</p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-3">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FF4D00]/20 text-[#FF8A5B] flex items-center justify-center text-sm font-bold">2</span>
                                    <div className="w-full min-w-0 flex-1">
                                        <p className="text-[rgb(19,19,19)] font-medium mb-2">Make your first Chat request</p>
                                        <CodeBlock code={`curl -X POST "https://api.clerktree.com/v1/chat/completions" \\
  -H "Authorization: Bearer ct_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "clerktree-sales-v1",
    "messages": [
      { "role": "user", "content": "Hello, what can you do?" }
    ]
  }'`} language="bash" />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-3">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FF4D00]/20 text-[#FF8A5B] flex items-center justify-center text-sm font-bold">3</span>
                                    <div className="w-full min-w-0 flex-1">
                                        <p className="text-[rgb(19,19,19)] font-medium mb-2">Make your first Call request</p>
                                        <CodeBlock code={`curl -X POST "https://api.clerktree.com/v1/calls" \\
  -H "Authorization: Bearer ct_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "+14155551234",
    "agent_id": "agent_sales_v2",
    "context": { "customer_name": "Jane Doe" }
  }'`} language="bash" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ─── AUTH ─── */}
                        <section id="auth" className="scroll-mt-24 space-y-6 border-t border-[rgba(19,19,19,0.08)] pt-12">
                            <h2 className="text-3xl font-bold text-[rgb(19,19,19)]">Authentication</h2>
                            <p className="text-[rgba(19,19,19,0.6)]">The ClerkTree API uses Bearer token authentication. Include your API key in every request.</p>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-amber-200/80 text-sm flex gap-3 items-start">
                                <div className="mt-1">⚠️</div>
                                <p>Your API keys carry many privileges. Keep them secure! Never expose them in client-side code, public repositories, or browser applications. Use environment variables on your server.</p>
                            </div>
                            <p className="text-[rgba(19,19,19,0.6)]">All requests must include the <code className="text-[#D14000] bg-[#FF4D00]/10 px-1.5 py-0.5 rounded">Authorization</code> header:</p>
                            <CodeBlock code={`Authorization: Bearer ct_live_YOUR_API_KEY`} language="http" />
                            <p className="text-[rgba(19,19,19,0.6)]">API keys are prefixed for easy identification:</p>
                            <div className="rounded-xl border border-[rgba(19,19,19,0.1)] overflow-hidden w-full overflow-x-auto">
                                <table className="w-full text-sm min-w-[600px]"><tbody>
                                    <tr className="border-b border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 font-mono text-emerald-400">ct_live_*</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Production key — full access</td></tr>
                                    <tr className="border-b border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 font-mono text-amber-400">ct_test_*</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Test key — sandbox only, no real calls</td></tr>
                                    <tr><td className="px-4 py-3 font-mono text-blue-400">ct_restrict_*</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Restricted key — limited scopes</td></tr>
                                </tbody></table>
                            </div>
                        </section>

                        {/* ─── RATE LIMITS ─── */}
                        <section id="rate-limits" className="scroll-mt-24 space-y-6 border-t border-[rgba(19,19,19,0.08)] pt-12">
                            <h2 className="text-3xl font-bold text-[rgb(19,19,19)]">Rate Limits</h2>
                            <p className="text-[rgba(19,19,19,0.6)]">Rate limits vary by plan. Limits are applied per API key.</p>
                            <div className="rounded-xl border border-[rgba(19,19,19,0.1)] overflow-hidden w-full overflow-x-auto">
                                <table className="w-full text-sm min-w-[600px]">
                                    <thead><tr className="bg-[rgba(19,19,19,0.03)]"><th className="px-4 py-3 text-left text-[rgba(19,19,19,0.6)]">Plan</th><th className="px-4 py-3 text-left text-[rgba(19,19,19,0.6)]">Chat</th><th className="px-4 py-3 text-left text-[rgba(19,19,19,0.6)]">Calls</th><th className="px-4 py-3 text-left text-[rgba(19,19,19,0.6)]">Dashboard</th></tr></thead>
                                    <tbody>
                                        <tr className="border-t border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 text-[rgb(19,19,19)]">Starter</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">30 req/min</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">5 concurrent</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">60 req/min</td></tr>
                                        <tr className="border-t border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 text-[rgb(19,19,19)]">Professional</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">120 req/min</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">20 concurrent</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">120 req/min</td></tr>
                                        <tr className="border-t border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 text-[rgb(19,19,19)]">Enterprise</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Custom</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Custom</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Custom</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-[rgba(19,19,19,0.5)] text-sm">Rate limit headers are included in every response: <code className="text-[#D14000] bg-[#FF4D00]/10 px-1 rounded">X-RateLimit-Limit</code>, <code className="text-[#D14000] bg-[#FF4D00]/10 px-1 rounded">X-RateLimit-Remaining</code>, <code className="text-[#D14000] bg-[#FF4D00]/10 px-1 rounded">X-RateLimit-Reset</code></p>
                        </section>

                        {/* ─── ERRORS ─── */}
                        <section id="errors" className="scroll-mt-24 space-y-6 border-t border-[rgba(19,19,19,0.08)] pt-12">
                            <h2 className="text-3xl font-bold text-[rgb(19,19,19)]">Error Handling</h2>
                            <p className="text-[rgba(19,19,19,0.6)]">The ClerkTree API uses standard HTTP status codes. Errors return a consistent JSON body:</p>
                            <CodeBlock code={`{
  "error": {
    "code": "invalid_api_key",
    "message": "The API key provided is invalid or has been revoked.",
    "status": 401,
    "request_id": "req_abc123"
  }
}`} language="json" />
                            <div className="rounded-xl border border-[rgba(19,19,19,0.1)] overflow-hidden w-full overflow-x-auto">
                                <table className="w-full text-sm min-w-[600px]">
                                    <thead><tr className="bg-[rgba(19,19,19,0.03)]"><th className="px-4 py-3 text-left text-[rgba(19,19,19,0.6)]">Status</th><th className="px-4 py-3 text-left text-[rgba(19,19,19,0.6)]">Meaning</th><th className="px-4 py-3 text-left text-[rgba(19,19,19,0.6)]">What to do</th></tr></thead>
                                    <tbody>{errorCodes.map(e => (
                                        <tr key={e.code} className="border-t border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 font-mono text-[rgb(19,19,19)]">{e.code}</td><td className="px-4 py-3 text-[rgb(19,19,19)] font-medium">{e.name}</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">{e.desc}</td></tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        </section>

                        {/* ─── CHAT API ─── */}
                        <section id="chat-overview" className="scroll-mt-24 space-y-8 border-t border-[rgba(19,19,19,0.08)] pt-16">
                            <SectionHeader
                                title="Chat API"
                                description="The ClerkTree Chat API provides a blackbox AI model for conversational interactions. Send messages and receive intelligent completions without managing model infrastructure. Ideal for sales chatbots, support agents, and lead qualification flows."
                                iconColor="bg-emerald-500"
                                iconClass="bg-emerald-500/10 text-emerald-500"
                            />
                            <p className="text-[rgba(19,19,19,0.6)] px-2 flex items-center gap-2 overflow-x-auto pb-2 w-full"><span className="flex-shrink-0">Base URL:</span> <code className="text-[#D14000] bg-[#FF4D00]/10 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{BASE_URL}/chat</code></p>
                        </section>
                        {chatEndpoints.map(ep => <EndpointSection key={ep.id} ep={ep} />)}

                        {/* ─── CALL API ─── */}
                        <section id="call-overview" className="scroll-mt-24 space-y-8 border-t border-[rgba(19,19,19,0.08)] pt-16">
                            <SectionHeader
                                title="Call API"
                                description="The ClerkTree Call API lets you deploy AI voice agents that handle outbound and inbound calls. Each call is fully autonomous — the model handles conversation flow, objection handling, and data extraction. You get a full transcript, sentiment analysis, and extracted leads after every call."
                                iconColor="bg-pink-500"
                                iconClass="bg-pink-500/10 text-pink-500"
                            />
                            <p className="text-[rgba(19,19,19,0.6)] px-2 flex items-center gap-2 overflow-x-auto pb-2 w-full"><span className="flex-shrink-0">Base URL:</span> <code className="text-[#D14000] bg-[#FF4D00]/10 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{BASE_URL}/calls</code></p>
                        </section>
                        {callEndpoints.map(ep => <EndpointSection key={ep.id} ep={ep} />)}

                        {/* ─── DASHBOARD API ─── */}
                        <section id="dash-overview" className="scroll-mt-24 space-y-8 border-t border-[rgba(19,19,19,0.08)] pt-16">
                            <SectionHeader
                                title="Dashboard API"
                                description="Access all the data powering your ClerkTree Dashboard programmatically. Monitor live activity, pull sales analytics, manage leads, track usage and credits, and manage API keys — all via REST endpoints."
                                iconColor="bg-[#FF4D00]"
                                iconClass="bg-[#FF4D00]/10 text-[#FF4D00]"
                            />
                            <p className="text-[rgba(19,19,19,0.6)] px-2 flex items-center gap-2 overflow-x-auto pb-2 w-full"><span className="flex-shrink-0">Base URL:</span> <code className="text-[#D14000] bg-[#FF4D00]/10 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{BASE_URL}/dashboard</code></p>
                        </section>
                        {dashboardEndpoints.map(ep => <EndpointSection key={ep.id} ep={ep} />)}

                        {/* ─── WEBHOOKS ─── */}
                        <section id="webhooks" className="scroll-mt-24 space-y-8 border-t border-[rgba(19,19,19,0.08)] pt-16">
                            <SectionHeader
                                title="Webhooks"
                                description="Subscribe to real-time events. ClerkTree sends POST requests to your configured webhook URL whenever key events occur."
                                iconColor="bg-amber-500"
                                iconClass="bg-amber-500/10 text-amber-500"
                            />
                            <h3 className="text-xl font-semibold text-[rgb(19,19,19)] mt-8 px-2">Available Events</h3>
                            <div className="rounded-xl border border-[rgba(19,19,19,0.1)] overflow-hidden w-full overflow-x-auto">
                                <table className="w-full text-sm min-w-[600px]">
                                    <thead><tr className="bg-[rgba(19,19,19,0.03)]"><th className="px-4 py-3 text-left text-[rgba(19,19,19,0.6)]">Event</th><th className="px-4 py-3 text-left text-[rgba(19,19,19,0.6)]">Description</th></tr></thead>
                                    <tbody>
                                        <tr className="border-t border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 font-mono text-emerald-400">call.started</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Call has been connected</td></tr>
                                        <tr className="border-t border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 font-mono text-emerald-400">call.completed</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Call ended with full transcript and analysis</td></tr>
                                        <tr className="border-t border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 font-mono text-emerald-400">call.failed</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Call could not be completed</td></tr>
                                        <tr className="border-t border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 font-mono text-emerald-400">lead.created</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">New lead extracted from a call or chat</td></tr>
                                        <tr className="border-t border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 font-mono text-emerald-400">lead.updated</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Lead status or priority changed</td></tr>
                                        <tr className="border-t border-[rgba(19,19,19,0.08)]"><td className="px-4 py-3 font-mono text-emerald-400">usage.threshold</td><td className="px-4 py-3 text-[rgba(19,19,19,0.6)]">Credit usage exceeded 80% or 95% threshold</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <h4 className="text-sm font-semibold text-[rgba(19,19,19,0.75)] mt-6 mb-2">Webhook Payload Example</h4>
                            <CodeBlock code={`{
  "id": "evt_9a8b7c6d",
  "type": "call.completed",
  "created": "2025-03-15T10:05:00Z",
  "data": {
    "call_id": "call_a1b2c3d4",
    "duration_seconds": 247,
    "sentiment": "positive",
    "lead": {
      "id": "lead_8x92k",
      "name": "John Smith",
      "interest_level": 0.92
    },
    "action_items": ["Send revised quote", "Schedule follow-up"]
  }
}`} language="json" />
                            <h4 className="text-sm font-semibold text-[rgba(19,19,19,0.75)] mt-6 mb-2">Verifying Webhook Signatures</h4>
                            <p className="text-[rgba(19,19,19,0.6)] text-sm">Every webhook includes a <code className="text-[#D14000] bg-[#FF4D00]/10 px-1 rounded">X-ClerkTree-Signature</code> header. Verify it using HMAC-SHA256 with your webhook secret:</p>
                            <CodeBlock code={`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`} language="javascript" />
                        </section>

                        {/* ─── WEBSOCKET ─── */}
                        <section id="websocket" className="scroll-mt-24 space-y-6 border-t border-[rgba(19,19,19,0.08)] pt-12">
                            <h3 className="text-2xl font-semibold text-[rgb(19,19,19)]">WebSocket Stream</h3>
                            <p className="text-[rgba(19,19,19,0.6)]">Connect to a full-duplex WebSocket for real-time call audio streaming and live transcript updates.</p>
                            <div className="flex items-center gap-3 text-sm font-mono mt-4">
                                <MethodBadge method="WSS" color="blue" />
                                <span className="text-[rgba(19,19,19,0.7)]">wss://api.clerktree.com/v1/stream</span>
                            </div>
                            <CodeBlock code={`const ws = new WebSocket(
  "wss://api.clerktree.com/v1/stream",
  { headers: { "Authorization": "Bearer ct_live_YOUR_KEY" } }
);

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "subscribe",
    channels: ["call.call_a1b2c3d4.transcript"]
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data.type = "transcript.delta"
  // data.content = "Sure, I can help with..."
  console.log(data);
};`} language="javascript" />
                        </section>

                    </div>

                    {/* Footer */}
                    <footer className="mt-24 pt-12 border-t border-[rgba(19,19,19,0.1)] flex flex-col md:flex-row justify-between items-center gap-6 text-[rgba(19,19,19,0.4)] text-sm">
                        <p>&copy; {new Date().getFullYear()} ClerkTree Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/privacy-policy" className="hover:text-[rgb(19,19,19)] transition-colors">Privacy Policy</Link>
                            <Link to="/terms-of-service" className="hover:text-[rgb(19,19,19)] transition-colors">Terms of Service</Link>
                            <Link to="/security" className="hover:text-[rgb(19,19,19)] transition-colors">Security</Link>
                        </div>
                    </footer>
                </main>

                {/* Right Table of Contents */}
                <aside className="hidden xl:block w-64 pt-8 px-6 border-l border-[rgba(19,19,19,0.08)] sticky top-0 h-screen overflow-y-auto">
                    <h4 className="text-sm font-semibold text-[rgba(19,19,19,0.85)] mb-4">On this page</h4>
                    <ul className="space-y-3 text-sm">
                        {allNavItems.map(item => (
                            <li key={item.id}><a href={`#${item.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(item.id); }} className={`transition-colors ${activeId === item.id ? 'text-[#FF8A5B]' : 'text-[rgba(19,19,19,0.6)] hover:text-[rgb(19,19,19)]'}`}>{item.label}</a></li>
                        ))}
                    </ul>
                </aside>
            </div>

                {/* Search Modal */}
                {isSearchOpen && (
                    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-12 md:pt-24 px-4">
                        <div className="absolute inset-0 bg-[rgba(19,19,19,0.04)] backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
                        <div className="relative w-full max-w-lg bg-white border border-[rgba(19,19,19,0.1)] rounded-xl shadow-2xl overflow-hidden">
                            <div className="flex items-center px-4 py-3 border-b border-[rgba(19,19,19,0.08)]">
                                <Search className="w-5 h-5 text-[rgba(19,19,19,0.4)] mr-3" />
                                <input type="text" placeholder="Search documentation..." className="flex-1 bg-transparent border-none outline-none text-[rgb(19,19,19)] placeholder-[rgba(19,19,19,0.35)] text-base md:text-sm h-6" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                                <button onClick={() => setIsSearchOpen(false)} className="p-1 hover:bg-[rgba(19,19,19,0.06)] rounded text-[rgba(19,19,19,0.4)] hover:text-[rgb(19,19,19)]">
                                    <kbd className="text-xs bg-[rgba(19,19,19,0.06)] px-1.5 py-0.5 rounded">ESC</kbd>
                                </button>
                            </div>
                            <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto py-2">
                                {filteredItems.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-[rgba(19,19,19,0.4)] text-sm">No results found for "{searchQuery}"</div>
                                ) : (
                                    <ul>{filteredItems.map(item => (
                                        <li key={item.id}>
                                            <button onClick={() => scrollToSection(item.id)} className="w-full text-left px-4 py-3 hover:bg-[rgba(19,19,19,0.03)] group border-b border-[rgba(19,19,19,0.08)] last:border-0 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-[rgba(19,19,19,0.85)] group-hover:text-[#FF8A5B] transition-colors">{item.label}</span>
                                                    <span className="text-[10px] text-[rgba(19,19,19,0.35)] uppercase tracking-widest bg-[rgba(19,19,19,0.03)] px-1.5 py-0.5 rounded">{item.section}</span>
                                                </div>
                                                {item.description && <p className="text-xs text-[rgba(19,19,19,0.5)] line-clamp-1 group-hover:text-[rgba(19,19,19,0.7)]">{item.description}</p>}
                                            </button>
                                        </li>
                                    ))}</ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
