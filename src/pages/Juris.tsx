import { useState } from 'react';
import { JurisMessage, SearchMode, SystemMetrics, CaseResult } from '../types/juris';
import JurisChat from '../components/Juris/JurisChat';
import JurisDashboard from '../components/Juris/JurisDashboard';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample mockup data
const SAMPLE_CASES: CaseResult[] = [
    {
        id: '1',
        title: 'State of Punjab v. Ajaib Singh',
        citation: 'AIR 1953 SC 10',
        court: 'Supreme Court of India',
        date: '1953-01-15',
        judge: 'Justice Mahajan',
        similarityScore: 0.94,
        facts: 'The case involved the validity of the Punjab Security of Land Tenures Act, 1953, which imposed restrictions on the right of landowners to transfer their land.',
        holding: 'The Court held that the Act was valid and constitutional, as it was enacted to give effect to Article 31A of the Constitution.',
        precedents: ['AIR 1951 SC 41', 'AIR 1952 SC 75'],
        metadata: {
            court_type: 'Supreme Court',
            jurisdiction: 'Constitutional Law',
            case_number: 'Civil Appeal No. 25 of 1952',
            parties: {
                petitioner: 'State of Punjab',
                respondent: 'Ajaib Singh'
            },
            statutes_cited: ['Constitution of India Article 31A', 'Punjab Security of Land Tenures Act 1953'],
            year: 1953
        }
    },
    {
        id: '2',
        title: 'Kesavananda Bharati v. State of Kerala',
        citation: 'AIR 1973 SC 1461',
        court: 'Supreme Court of India',
        date: '1973-04-24',
        judge: 'Chief Justice S.M. Sikri',
        similarityScore: 0.89,
        facts: 'Challenge to the constitutional amendments limiting fundamental rights, particularly regarding property rights and religious freedom.',
        holding: 'The Court propounded the "Basic Structure Doctrine" - Parliament cannot alter the basic structure of the Constitution even through amendments.',
        precedents: ['Golaknath v. State of Punjab', 'Shankari Prasad v. Union of India'],
        metadata: {
            court_type: 'Supreme Court',
            jurisdiction: 'Constitutional Law',
            case_number: 'Writ Petition (Civil) 135 of 1970',
            parties: {
                petitioner: 'Kesavananda Bharati',
                respondent: 'State of Kerala'
            },
            statutes_cited: ['Constitution of India Article 368', 'Constitution (24th Amendment) Act, 1971'],
            year: 1973
        }
    }
];

export default function Juris() {
    const [searchMode, setSearchMode] = useState<SearchMode>('normal');
    const [messages, setMessages] = useState<JurisMessage[]>([]);
    const [showDashboard, setShowDashboard] = useState(false);
    const [showReasoning, setShowReasoning] = useState(false);
    const [pendingQuery, setPendingQuery] = useState('');

    const [metrics] = useState<SystemMetrics>({
        totalCases: 5247,
        precisionAt5: 0.92,
        avgResponseTime: 11.4,
        vectorStoreStatus: 'Active',
        graphDbStatus: 'Active',
        lastIndexed: '2 hours ago',
        entityCounts: {
            cases: 5247,
            judges: 342,
            courts: 87,
            statutes: 1453,
            sections: 8921
        }
    });

    const handleSendMessage = (message: string) => {
        // Add user message
        const userMessage: JurisMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        // For deep_research mode, show reasoning first
        if (searchMode === 'deep_research') {
            setPendingQuery(message);
            setShowReasoning(true);
            return;
        }

        // For normal mode, immediately show results
        showResults(message);
    };

    const handleReasoningComplete = () => {
        setShowReasoning(false);
        showResults(pendingQuery);
        setPendingQuery('');
    };

    const showResults = (query: string) => {
        // Simulate AI response with case results
        setTimeout(() => {
            const modeText = searchMode === 'normal' ? 'fast semantic search' : 'deep research with comprehensive citation analysis';
            const aiMessage: JurisMessage = {
                role: 'assistant',
                content: `Found ${SAMPLE_CASES.length} highly relevant cases using ${modeText}. The cases show strong similarity based on legal concepts, precedent citations, and factual patterns.`,
                timestamp: new Date().toISOString(),
                caseResults: SAMPLE_CASES,
                analysis: {
                    caseId: SAMPLE_CASES[0].id,
                    similaritySummary: 'The query matches cases involving constitutional validity of land tenure legislation and fundamental rights. The legal reasoning patterns show 94% semantic similarity.',
                    keyLegalConcepts: ['Constitutional Law', 'Property Rights', 'Article 31A', 'Land Reforms', 'Fundamental Rights'],
                    precedentAnalysis: [
                        'Both cases cite foundational property rights jurisprudence',
                        'Strong precedential link through Article 31A interpretation',
                        'Similar factual patterns in agrarian reform context'
                    ],
                    rhetoricalRoles: {
                        facts: 28,
                        arguments: 45,
                        precedents: 12,
                        reasoning: 67,
                        ruling: 15
                    },
                    citationNetwork: {
                        directCitations: 8,
                        indirectCitations: 23
                    }
                }
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 1500);
    };

    const handleClearChat = () => {
        setMessages([]);
    };

    const handleRefresh = () => {
        console.log('Refreshing metrics...');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-violet-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Link
                                to="/"
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 hover:border-purple-500/50 transition-all"
                            >
                                <svg viewBox="0 0 464 468" className="w-6 h-6 sm:w-8 sm:h-8 -translate-y-0.5">
                                    <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
                                </svg>
                            </Link>
                            <div className="h-6 sm:h-8 w-px bg-white/10 shrink-0" />
                            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 text-transparent bg-clip-text">
                                Juris
                            </h1>
                        </div>

                        <button
                            onClick={() => setShowDashboard(!showDashboard)}
                            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${showDashboard
                                ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-white/70 hover:text-white'
                                }`}
                        >
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-[180px] sm:pb-[200px]">
                {showDashboard ? (
                    <JurisDashboard
                        metrics={metrics}
                        onRefresh={handleRefresh}
                    />
                ) : (
                    <JurisChat
                        mode={searchMode}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onClearChat={handleClearChat}
                        onModeChange={setSearchMode}
                        showReasoning={showReasoning}
                        pendingQuery={pendingQuery}
                        onReasoningComplete={handleReasoningComplete}
                    />
                )}
            </div>
        </div>
    );
}
