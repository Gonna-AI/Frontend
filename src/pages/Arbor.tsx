import { useState } from 'react';
import { ArborMessage, SystemStats } from '../types/arbor';
import ArborChat from '../components/Arbor/ArborChat';
import ArborDashboard from '../components/Arbor/ArborDashboard';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';

type ChatMode = 'ask' | 'tell' | 'docsearch';

export default function Arbor() {
    const [chatMode, setChatMode] = useState<ChatMode>('ask');
    const [messages, setMessages] = useState<ArborMessage[]>([]);
    const [showDashboard, setShowDashboard] = useState(false);
    const { t } = useLanguage();

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
                content: chatMode === 'ask'
                    ? t('arbor.simulatedResponseAsk')
                    : chatMode === 'tell'
                        ? t('arbor.simulatedResponseTell')
                        : t('arbor.simulatedResponseDoc'),
                timestamp: new Date().toISOString(),
                details: {
                    mode: chatMode,
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

    const handleRefresh = () => {
        // Simulate refresh
        console.log('Refreshing data...');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-teal-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Link
                                to="/"
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 hover:border-emerald-500/50 transition-all"
                            >
                                <svg viewBox="0 0 464 468" className="w-6 h-6 sm:w-8 sm:h-8 -translate-y-0.5">
                                    <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
                                </svg>
                            </Link>
                            <div className="h-6 sm:h-8 w-px bg-white/10 shrink-0" />
                            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600 text-transparent bg-clip-text">
                                Arbor
                            </h1>
                        </div>

                        <button
                            onClick={() => setShowDashboard(!showDashboard)}
                            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${showDashboard
                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-white/70 hover:text-white'
                                }`}
                        >
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <LanguageSwitcher isExpanded={true} forceDark={true} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-[180px] sm:pb-[200px]">
                {showDashboard ? (
                    <ArborDashboard
                        stats={stats}
                        onRefresh={handleRefresh}
                    />
                ) : (
                    <ArborChat
                        mode={chatMode}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onClearChat={handleClearChat}
                        onModeChange={setChatMode}
                    />
                )}
            </div>
        </div>
    );
}
