import { JurisMessage, SearchMode, CaseResult } from '../../types/juris';
import { useState } from 'react';
import JurisCaseCard from './JurisCaseCard';
import DeepSearchReasoning from './DeepSearchReasoning';
import { Sparkles, Search, Brain } from 'lucide-react';

interface JurisChatProps {
    mode: SearchMode;
    messages: JurisMessage[];
    onSendMessage: (message: string) => void;
    onClearChat: () => void;
    onModeChange: (mode: SearchMode) => void;
    showReasoning?: boolean;
    pendingQuery?: string;
    onReasoningComplete?: () => void;
}

// Sample cases for quick access
const SAMPLE_CASES = [
    { query: "Contract fraud and misrepresentation", icon: "⚖️" },
    { query: "Property rights and land disputes", icon: "🏛️" },
    { query: "Constitutional validity of amendments", icon: "📜" }
];

export default function JurisChat({
    mode,
    messages,
    onSendMessage,
    onClearChat,
    onModeChange,
    showReasoning = false,
    pendingQuery = '',
    onReasoningComplete = () => { }
}: JurisChatProps) {
    const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);
    const [showCaseConnection, setShowCaseConnection] = useState(false);
    const [showExamples, setShowExamples] = useState(true);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const message = formData.get('message') as string;
        if (message.trim()) {
            onSendMessage(message.trim());
            setShowExamples(false);
            e.currentTarget.reset();
        }
    };

    const handleSampleCaseClick = (query: string) => {
        onSendMessage(query);
        setShowExamples(false);
    };

    const handleCaseClick = (caseData: CaseResult) => {
        setSelectedCase(caseData);
        setShowCaseConnection(true);
    };

    const handleModeChange = (newMode: SearchMode) => {
        if (newMode !== mode) {
            onModeChange(newMode);
            onClearChat();
            setShowExamples(true);
        }
    };

    const modeConfig = {
        normal: {
            description: 'Fast semantic search using AI embeddings',
            placeholder: 'Search cases by legal concepts, facts, or holdings...',
            detail: 'Quick results using vector similarity'
        },
        deep_research: {
            description: 'Comprehensive analysis with citation networks and precedents',
            placeholder: 'Ask complex legal questions requiring deep analysis...',
            detail: 'Combines semantic search, knowledge graph, and citations'
        }
    };

    const config = modeConfig[mode];

    return (
        <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-4 px-1 custom-scrollbar mb-4">
                {/* Deep Search Reasoning Timeline */}
                {showReasoning && pendingQuery && (
                    <DeepSearchReasoning
                        query={pendingQuery}
                        onComplete={onReasoningComplete}
                    />
                )}

                {/* Case Connection View */}
                {showCaseConnection && selectedCase && (
                    <div className="mb-6 p-6 bg-gradient-to-br from-purple-900/30 to-violet-900/30 border border-purple-500/30 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-purple-300">Case Connection Analysis</h3>
                            <button
                                onClick={() => setShowCaseConnection(false)}
                                className="text-sm text-white/60 hover:text-white transition-colors"
                            >
                                Close ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-white/80 mb-2">Selected Case</h4>
                                <p className="text-sm text-purple-200">{selectedCase.title}</p>
                                <p className="text-xs text-white/50 mt-1">{selectedCase.citation}</p>
                            </div>
                            <div className="pt-4 border-t border-purple-500/20">
                                <h4 className="text-sm font-semibold text-white/80 mb-3">How it connects to your query:</h4>
                                <ul className="space-y-2 text-sm text-white/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400">•</span>
                                        <span><strong className="text-purple-300">Legal Concepts:</strong> Shares core principles on {selectedCase.metadata.jurisdiction.toLowerCase()}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400">•</span>
                                        <span><strong className="text-purple-300">Precedent Chain:</strong> Cites {selectedCase.precedents.length} common precedents with your query context</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400">•</span>
                                        <span><strong className="text-purple-300">Similarity Score:</strong> {(selectedCase.similarityScore * 100).toFixed(0)}% semantic match</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400">•</span>
                                        <span><strong className="text-purple-300">Cited Statutes:</strong> References {selectedCase.metadata.statutes_cited.slice(0, 2).join(', ')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center space-y-3 max-w-md px-4">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                    <Sparkles className="w-8 h-8 text-purple-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white/80">Legal Case Retrieval</h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                {config.description}
                            </p>
                            <p className="text-xs text-white/40">{config.detail}</p>
                            <div className="pt-4 text-xs text-white/40">
                                <p>92% Precision@5 · 5000+ Cases · AI-Powered Analysis</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((message, idx) => (
                        <div
                            key={idx}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl backdrop-blur-sm ${message.role === 'user'
                                    ? 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30'
                                    : 'bg-white/5 border border-white/10'
                                    }`}
                            >
                                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {message.content}
                                </p>

                                {/* Case Results */}
                                {message.caseResults && message.caseResults.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                                                Found {message.caseResults.length} Similar Cases
                                            </span>
                                        </div>

                                        <div className="grid gap-3">
                                            {message.caseResults.map((caseData) => (
                                                <JurisCaseCard
                                                    key={caseData.id}
                                                    caseData={caseData}
                                                    onClick={() => handleCaseClick(caseData)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Analysis */}
                                {message.analysis && (
                                    <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                                        <h4 className="text-sm font-semibold text-purple-300 mb-2">AI Analysis</h4>
                                        <div className="space-y-2 text-xs text-white/70">
                                            <p><strong className="text-purple-200">Summary:</strong> {message.analysis.similaritySummary}</p>
                                            <div>
                                                <strong className="text-purple-200">Key Concepts:</strong>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {message.analysis.keyLegalConcepts.map((concept, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-purple-200">
                                                            {concept}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Fixed Bottom Section */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/98 to-transparent pt-3 sm:pt-4 pb-4 sm:pb-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-3 sm:px-6">
                    {/* Sample Cases - Only show if no messages and showExamples is true */}
                    {showExamples && messages.length === 0 && (
                        <div className="mb-3 sm:mb-4">
                            <p className="text-xs text-white/40 mb-2 text-center">Try these examples:</p>
                            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                                {SAMPLE_CASES.map((sample, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSampleCaseClick(sample.query)}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-lg sm:rounded-xl text-xs text-white/70 hover:text-purple-300 transition-all duration-300 backdrop-blur-sm group"
                                    >
                                        <span className="mr-1 sm:mr-2">{sample.icon}</span>
                                        <span className="hidden sm:inline">{sample.query}</span>
                                        <span className="sm:hidden">{sample.query.length > 20 ? sample.query.substring(0, 20) + '...' : sample.query}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Form with Mode Toggle Inside */}
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="flex gap-0 items-center bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl hover:border-white/20 transition-all backdrop-blur-sm overflow-hidden">
                            <input
                                type="text"
                                name="message"
                                placeholder={config.placeholder}
                                className="flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-transparent text-white placeholder-white/40 focus:outline-none"
                                autoComplete="off"
                            />

                            {/* Mode Toggle Inside Input */}
                            <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3">
                                <div className="p-0.5 sm:p-1 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 inline-flex">
                                    <button
                                        type="button"
                                        onClick={() => handleModeChange('normal')}
                                        className={`px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${mode === 'normal'
                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                            : 'text-white/50 hover:text-white/70'
                                            }`}
                                        title="Normal Search"
                                    >
                                        <Search className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                                        <span className="hidden sm:inline">Normal</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleModeChange('deep_research')}
                                        className={`px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${mode === 'deep_research'
                                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                            : 'text-white/50 hover:text-white/70'
                                            }`}
                                        title="Deep Search"
                                    >
                                        <Brain className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                                        <span className="hidden sm:inline">Deep Search</span>
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="p-2 sm:p-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg sm:rounded-xl text-purple-300 hover:text-purple-200 transition-all duration-300"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
