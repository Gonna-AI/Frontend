import { useState } from 'react';
import { ArborMode, ArborMessage, SystemStats } from '../types/arbor';
import ArborChat from '../components/Arbor/ArborChat';
import ArborSearch from '../components/Arbor/ArborSearch';
import ArborDashboard from '../components/Arbor/ArborDashboard';
import ArborSettings from '../components/Arbor/ArborSettings';
import { MessageSquare, Search, BarChart3, Settings, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

type TabType = 'chat' | 'search' | 'dashboard' | 'examples';

export default function Arbor() {
    const [activeTab, setActiveTab] = useState<TabType>('chat');
    const [mode, setMode] = useState<ArborMode>('ask');
    const [messages, setMessages] = useState<ArborMessage[]>([]);
    const [isIndexed, setIsIndexed] = useState(false);
    const [isInitialized, setIsInitialized] = useState(true);

    const [stats] = useState<SystemStats>({
        total_documents: 147,
        vectorstore_status: 'Active',
        calendar_status: 'Connected',
        sheets_status: 'Connected',
        email_status: 'Ready',
        search_documents: 147,
        last_refresh: new Date().toISOString(),
        by_type: {
            general: 85,
            claim: 32,
            policy: 18,
            guideline: 12
        },
        by_urgency: {
            critical: 3,
            high: 12,
            medium: 28,
            normal: 104
        },
        with_claim_numbers: 32,
        with_amounts: 45,
        with_contacts: 67
    });

    const handleSendMessage = (message: string) => {
        const userMessage: ArborMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        setMessages([...messages, userMessage]);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: ArborMessage = {
                role: 'assistant',
                content: mode === 'ask'
                    ? `Based on the information in your documents, here's what I found: This is a simulated response. In production, this would connect to the Arbor backend API.`
                    : `Task executed successfully. This is a simulated response. In production, this would connect to the Arbor backend and perform the requested action.`,
                timestamp: new Date().toISOString(),
                details: {
                    mode,
                    query: message,
                    timestamp: new Date().toISOString()
                }
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const handleClearChat = () => {
        setMessages([]);
    };

    const handleIndexDocuments = () => {
        // Simulate indexing
        setTimeout(() => {
            setIsIndexed(true);
        }, 1500);
    };

    const handleRefresh = () => {
        // Simulate refresh
        console.log('Refreshing data...');
    };

    const handleInitialize = () => {
        setIsInitialized(true);
    };

    const tabs = [
        { id: 'chat' as TabType, label: 'Chat', icon: MessageSquare },
        { id: 'search' as TabType, label: 'Search Documents', icon: Search },
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
        { id: 'examples' as TabType, label: 'Examples', icon: Sparkles }
    ];

    const exampleQueries = {
        ask: [
            'What are my high priority tasks for today?',
            'Was sind meine Aufgaben für diese Woche?',
            'Show me all documents related to project Alpha',
            'What meetings do I have scheduled this week?',
            'Summarize the Q3 financial reports'
        ],
        tell: [
            'Generate a weekly task report and email it to team@example.com',
            'Find free time slots for a 2-hour meeting this week',
            'Email overdue tasks to manager@example.com',
            'Create a summary of today\'s meetings',
            'Schedule a reminder for tomorrow\'s deadline'
        ]
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link
                                to="/"
                                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="text-sm font-medium">Back to Home</span>
                            </Link>
                            <div className="h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                                    <span className="text-2xl">🌳</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600 text-transparent bg-clip-text">
                                        Arbor
                                    </h1>
                                    <p className="text-sm text-white/60">Your Intelligent Enterprise AI Assistant</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveTab('examples')}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-white/70 hover:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="text-sm">Settings</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="relative border-b border-white/10 bg-black/10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-4 font-medium transition-all duration-300 border-b-2 flex items-center gap-2 ${isActive
                                            ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5'
                                            : 'text-white/60 border-transparent hover:text-white/80 hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-6 py-8">
                <div className="min-h-[70vh]">
                    {activeTab === 'chat' && (
                        <ArborChat
                            mode={mode}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onClearChat={handleClearChat}
                        />
                    )}

                    {activeTab === 'search' && (
                        <ArborSearch
                            isIndexed={isIndexed}
                            onIndexDocuments={handleIndexDocuments}
                            documentCount={stats.total_documents}
                        />
                    )}

                    {activeTab === 'dashboard' && (
                        <ArborDashboard
                            stats={stats}
                            onRefresh={handleRefresh}
                        />
                    )}

                    {activeTab === 'examples' && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <ArborSettings
                                    mode={mode}
                                    onModeChange={setMode}
                                    isInitialized={isInitialized}
                                    onInitialize={handleInitialize}
                                />
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Example Queries</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                                <MessageSquare className="w-5 h-5" />
                                                Ask Mode Examples
                                            </h3>
                                            <div className="space-y-2">
                                                {exampleQueries.ask.map((query, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setMode('ask');
                                                            setActiveTab('chat');
                                                            handleSendMessage(query);
                                                        }}
                                                        className="w-full text-left p-4 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all duration-300 text-white/70 hover:text-white text-sm"
                                                    >
                                                        "{query}"
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                                <Zap className="w-5 h-5" />
                                                Tell Mode Examples
                                            </h3>
                                            <div className="space-y-2">
                                                {exampleQueries.tell.map((query, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setMode('tell');
                                                            setActiveTab('chat');
                                                            handleSendMessage(query);
                                                        }}
                                                        className="w-full text-left p-4 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-300 text-white/70 hover:text-white text-sm"
                                                    >
                                                        "{query}"
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
