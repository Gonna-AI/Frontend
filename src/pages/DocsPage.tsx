
import { useState, useEffect } from 'react';
import { Search, Menu, X, Check, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

// Types
type DocSection = 'intro' | 'auth' | 'arbor' | 'juris' | 'voice';

interface NavItem {
    id: string;
    label: string;
    section: DocSection;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        title: 'Get Started',
        items: [
            { id: 'welcome', label: 'Welcome to ClerkTree', section: 'intro' },
            { id: 'auth', label: 'Authentication', section: 'auth' },
        ]
    },
    {
        title: 'Arbor API',
        items: [
            { id: 'arbor-workflows', label: 'Workflows', section: 'arbor' },
            { id: 'arbor-execution', label: 'Execute Workflow', section: 'arbor' },
        ]
    },
    {
        title: 'Juris API',
        items: [
            { id: 'juris-analyze', label: 'Analyze Contract', section: 'juris' },
            { id: 'juris-draft', label: 'Draft Clause', section: 'juris' },
        ]
    },
    {
        title: 'Voice API',
        items: [
            { id: 'voice-call', label: 'Initiate Call', section: 'voice' },
            { id: 'voice-history', label: 'Call History', section: 'voice' },
        ]
    }
];

// Code Block Component
const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/10 my-6 max-w-full">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-xs text-white/40 font-mono">{language}</span>
                <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <Copy className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                    )}
                </button>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-white/80">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
};

export default function DocsPage() {
    const [activeId, setActiveId] = useState('welcome');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Flatten nav items for search
    const allNavItems = navGroups.flatMap(group => group.items);

    const filteredItems = allNavItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Helper to scroll to section
    const scrollToSection = (id: string) => {
        setActiveId(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-[1600px] mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 464 468"
                                className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity"
                            >
                                <path
                                    fill="white"
                                    d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
                                />
                            </svg>
                            <span className="font-semibold text-lg tracking-tight">ClerkTree Docs</span>
                        </Link>
                        <div
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:flex items-center gap-1 text-sm text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:border-white/20 hover:text-white/80 transition-all cursor-pointer"
                        >
                            <Search className="w-4 h-4" />
                            <span>Search documentation...</span>
                            <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white/10 rounded text-white/60">⌘K</kbd>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="md:hidden p-2 text-white/60 hover:text-white"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <Link to="/contact" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Support</Link>
                        <Link to="/" className="px-3 md:px-4 py-2 bg-white text-black text-xs md:text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
                            <span className="md:hidden">Dashboard</span>
                            <span className="hidden md:inline">Go to Dashboard</span>
                        </Link>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-white/60 hover:text-white"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto pt-16 flex min-h-screen">
                {/* Sidebar Navigation */}
                <nav className={`
          fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:static md:bg-transparent md:w-72 border-r border-white/10 pt-24 pb-12 px-6 overflow-y-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          transition-transform duration-300 ease-in-out
        `}>
                    <div className="space-y-8">
                        {navGroups.map((group) => (
                            <div key={group.title}>
                                <h3 className="text-sm font-semibold text-white/90 mb-3">{group.title}</h3>
                                <ul className="space-y-1">
                                    {group.items.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => scrollToSection(item.id)}
                                                className={`
                          w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                          ${activeId === item.id
                                                        ? 'bg-purple-500/10 text-purple-400 font-medium border border-purple-500/20'
                                                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
                        `}
                                            >
                                                {item.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 px-4 md:px-12 py-12 max-w-full md:max-w-5xl overflow-hidden">
                    <div className="space-y-16">

                        {/* Intro Section */}
                        <section id="welcome" className="scroll-mt-24 space-y-6">
                            <div className="space-y-4">
                                <p className="text-purple-400 font-medium">Get Started</p>
                                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                                    Welcome to ClerkTree
                                </h1>
                                <p className="text-xl text-white/60 leading-relaxed max-w-3xl">
                                    Build custom workflow agents, analyze complex legal documents, and deploy AI voice assistants — all through a unified, powerful interface.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors">
                                    <h3 className="text-lg font-semibold text-white mb-2">Workflow Automation</h3>
                                    <p className="text-white/50 text-sm">Automate business logic with our visual bioflow editor and API.</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors">
                                    <h3 className="text-lg font-semibold text-white mb-2">Legal Intelligence</h3>
                                    <p className="text-white/50 text-sm">Analyze and draft contracts with Juris AI smart contract engine.</p>
                                </div>
                            </div>
                        </section>

                        {/* Auth Section */}
                        <section id="auth" className="scroll-mt-24 space-y-6 border-t border-white/5 pt-12">
                            <h2 className="text-3xl font-bold text-white">Authentication</h2>
                            <p className="text-white/60">
                                The ClerkTree API uses API keys to authenticate requests. You can view and manage your API keys in the dashboard.
                            </p>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-amber-200/80 text-sm flex gap-3 items-start">
                                <div className="mt-1">⚠️</div>
                                <p>Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.</p>
                            </div>

                            <p className="text-white/60 break-words">
                                All API requests should include your API key in an <code className="text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded break-all">Authorization</code> header as follows:
                            </p>

                            <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} language="http" />
                        </section>

                        {/* Arbor API Section */}
                        <section id="arbor-workflows" className="scroll-mt-24 space-y-6 border-t border-white/5 pt-12">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <div className="w-6 h-6 bg-emerald-500 rounded-full" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Arbor API</h2>
                            </div>
                            <p className="text-white/60">
                                Programmatically manage and execute workflows defined in the Arbor editor.
                            </p>
                        </section>

                        <section id="arbor-execution" className="scroll-mt-24 space-y-4">
                            <h3 className="text-2xl font-semibold text-white">Execute Workflow</h3>
                            <p className="text-white/60">
                                Trigger a specific workflow run with input parameters.
                            </p>

                            <div className="flex items-center gap-3 text-sm font-mono mt-4">
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">POST</span>
                                <span className="text-white/70">https://api.clerktree.com/v1/arbor/run</span>
                            </div>

                            <CodeBlock
                                code={`curl -X POST "https://api.clerktree.com/v1/arbor/run" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflow_id": "wf_123456789",
    "inputs": {
      "patient_id": "p_98765",
      "priority": "high"
    }
  }'`}
                                language="bash"
                            />

                            <div className="mt-6">
                                <h4 className="text-sm font-semibold text-white/80 mb-2">Response</h4>
                                <CodeBlock
                                    code={`{
  "run_id": "run_abc123",
  "status": "queued",
  "estimated_completion": "2s"
}`}
                                    language="json"
                                />
                            </div>
                        </section>

                        {/* Juris API Section */}
                        <section id="juris-analyze" className="scroll-mt-24 space-y-6 border-t border-white/5 pt-12">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <div className="w-6 h-6 bg-indigo-500 rounded-full" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Juris API</h2>
                            </div>
                            <p className="text-white/60">
                                Leverage our legal AI models to analyze documents and draft smart contracts.
                            </p>

                            <div className="mt-8">
                                <h3 className="text-2xl font-semibold text-white">Analyze Document</h3>
                                <p className="text-white/60 mt-2">
                                    Upload a PDF or text document for legal risk analysis.
                                </p>

                                <div className="flex items-center gap-3 text-sm font-mono mt-4">
                                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded">POST</span>
                                    <span className="text-white/70">https://api.clerktree.com/v1/juris/analyze</span>
                                </div>

                                <CodeBlock
                                    code={`curl -X POST "https://api.clerktree.com/v1/juris/analyze" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/contract.pdf" \\
  -F "mode=risk_assessment"`}
                                    language="bash"
                                />
                            </div>
                        </section>

                        {/* Voice API Section */}
                        <section id="voice-call" className="scroll-mt-24 space-y-6 border-t border-white/5 pt-12">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-500/10 rounded-lg">
                                    <div className="w-6 h-6 bg-pink-500 rounded-full" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Voice API</h2>
                            </div>
                            <p className="text-white/60">
                                Deploy AI voice agents to handle inbound and outbound calls.
                            </p>

                            <div className="mt-8">
                                <h3 className="text-2xl font-semibold text-white">Initiate Outbound Call</h3>
                                <p className="text-white/60 mt-2">
                                    Trigger an AI voice agent to call a specific number.
                                </p>

                                <div className="flex items-center gap-3 text-sm font-mono mt-4">
                                    <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded">POST</span>
                                    <span className="text-white/70">https://api.clerktree.com/v1/voice/call</span>
                                </div>

                                <CodeBlock
                                    code={`curl -X POST "https://api.clerktree.com/v1/voice/call" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "+15550123456",
    "agent_id": "agent_support_v1",
    "context": {
      "customer_name": "Alice"
    }
  }'`}
                                    language="bash"
                                />
                            </div>
                        </section>
                        {/* Real-time Events Section */}
                        <section id="webhooks" className="scroll-mt-24 space-y-6 border-t border-white/5 pt-12">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <div className="w-6 h-6 bg-amber-500 rounded-full" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Events & Real-time</h2>
                            </div>
                            <p className="text-white/60">
                                Subscribe to asynchronous state changes and stream live audio/data via WebSocket.
                            </p>

                            <div className="mt-8">
                                <h3 className="text-2xl font-semibold text-white">Webhook Configuration</h3>
                                <p className="text-white/60 mt-2">
                                    Receive POST callbacks for workflow completions, call milestones, and document analysis results.
                                </p>

                                <div className="flex items-center gap-3 text-sm font-mono mt-4">
                                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">POST</span>
                                    <span className="text-white/70">https://your-server.com/webhooks/clerktree</span>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-white/80 mb-2">Payload Example</h4>
                                    <CodeBlock
                                        code={`{
  "event": "workflow.completed",
  "workflow_id": "wf_123456789",
  "data": {
    "output_variables": { ... },
    "execution_time_ms": 1240
  },
  "timestamp": "2025-12-26T12:00:00Z"
}`}
                                        language="json"
                                    />
                                </div>
                            </div>

                            <div className="mt-12" id="websocket">
                                <h3 className="text-2xl font-semibold text-white">WebSocket Stream</h3>
                                <p className="text-white/60 mt-2">
                                    Connect to a full-duplex WebSocket for real-time voice buffering and agent intervention.
                                </p>

                                <div className="flex items-center gap-3 text-sm font-mono mt-4">
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">WSS</span>
                                    <span className="text-white/70">wss://api.clerktree.com/v1/stream</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-white/40 text-sm">
                        <p>&copy; {new Date().getFullYear()} ClerkTree Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Status</a>
                        </div>
                    </footer>
                </main>

                {/* Right Table of Contents (Hidden on mobile) */}
                <aside className="hidden xl:block w-64 pt-24 px-6 border-l border-white/5 sticky top-0 h-screen overflow-y-auto">
                    <h4 className="text-sm font-semibold text-white/90 mb-4">On this page</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#welcome" className="text-white/60 hover:text-white transition-colors">Welcome</a></li>
                        <li><a href="#auth" className="text-white/60 hover:text-white transition-colors">Authentication</a></li>
                        <li><a href="#arbor-execution" className="text-white/60 hover:text-white transition-colors">Arbor: Execute Workflow</a></li>
                        <li><a href="#juris-analyze" className="text-white/60 hover:text-white transition-colors">Juris: Analyze Contract</a></li>
                        <li><a href="#voice-call" className="text-white/60 hover:text-white transition-colors">Voice: Initiate Call</a></li>
                        <li><a href="#webhooks" className="text-white/60 hover:text-white transition-colors">Webhooks</a></li>
                        <li><a href="#websocket" className="text-white/60 hover:text-white transition-colors">WebSocket Stream</a></li>
                    </ul>
                </aside>
            </div>

            {/* Search Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsSearchOpen(false)}
                    />
                    <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        <div className="flex items-center px-4 py-3 border-b border-white/5">
                            <Search className="w-5 h-5 text-white/40 mr-3" />
                            <input
                                type="text"
                                placeholder="Search documentation..."
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm h-6"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white"
                            >
                                <kbd className="text-xs bg-white/10 px-1.5 py-0.5 rounded">ESC</kbd>
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto py-2">
                            {filteredItems.length === 0 ? (
                                <div className="px-4 py-8 text-center text-white/40 text-sm">
                                    No results found for "{searchQuery}"
                                </div>
                            ) : (
                                <ul>
                                    {filteredItems.map(item => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => scrollToSection(item.id)}
                                                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between group"
                                            >
                                                <span className="text-sm text-white/80 group-hover:text-white">{item.label}</span>
                                                <span className="text-xs text-white/30 uppercase tracking-wider">{item.section}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
