import { ArborMessage } from '../../types/arbor';
import { useState } from 'react';
import { Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

type ChatMode = 'ask' | 'tell' | 'docsearch';

interface ArborChatProps {
    mode: ChatMode;
    messages: ArborMessage[];
    onSendMessage: (message: string) => void;
    onClearChat: () => void;
    onModeChange: (mode: ChatMode) => void;
}

export default function ArborChat({ mode, messages, onSendMessage, onClearChat, onModeChange }: ArborChatProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [isReindexing, setIsReindexing] = useState(false);
    const { t } = useLanguage();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const message = formData.get('message') as string;
        if (message.trim()) {
            onSendMessage(message.trim());
            e.currentTarget.reset();
        }
    };

    const modeConfig = {
        ask: {
            description: t('arbor.startDescAsk'),
            placeholder: t('arbor.placeholderAsk')
        },
        tell: {
            description: t('arbor.startDescTell'),
            placeholder: t('arbor.placeholderTell')
        },
        docsearch: {
            description: t('arbor.startDescSearch'),
            placeholder: t('arbor.placeholderSearch')
        }
    };

    const config = modeConfig[mode];

    const getActiveColor = () => {
        if (mode === 'ask') return 'bg-blue-500/20';
        if (mode === 'tell') return 'bg-purple-500/20';
        return 'bg-emerald-500/20';
    };

    const handleReindex = () => {
        setIsReindexing(true);
        setTimeout(() => {
            setIsReindexing(false);
        }, 2000);
    };

    return (
        <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 px-1 custom-scrollbar mb-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center space-y-2 sm:space-y-3 max-w-md px-4">
                            <h3 className="text-lg sm:text-xl font-semibold text-white/80">{t('arbor.startTitle')}</h3>
                            <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                                {config.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, idx) => (
                        <div
                            key={idx}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[90%] sm:max-w-[80%] p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm ${message.role === 'user'
                                    ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                                    : 'bg-white/5 border border-white/10'
                                    }`}
                            >
                                <div>
                                    <p className="text-white/90 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                                        {message.content}
                                    </p>
                                    {message.details && (
                                        <details className="mt-2 sm:mt-3 text-xs">
                                            <summary className="cursor-pointer text-white/50 hover:text-white/70 transition-colors">
                                                {t('arbor.viewDetails')}
                                            </summary>
                                            <pre className="mt-2 p-2 sm:p-3 bg-black/30 rounded-lg overflow-x-auto text-white/60 text-xs">
                                                {JSON.stringify(message.details, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                    <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-white/40">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Fixed Bottom Section */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/98 to-transparent pt-4 pb-4 sm:pb-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Mode Pill Toggle */}
                    <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm inline-flex relative">
                            <div
                                className={`absolute top-1.5 bottom-1.5 left-1.5 w-16 sm:w-20 rounded-full transition-all duration-300 ${getActiveColor()} ${mode === 'ask'
                                    ? 'translate-x-0'
                                    : mode === 'tell'
                                        ? 'translate-x-[calc(100%+0rem)]'
                                        : 'translate-x-[calc(200%+0rem)]'
                                    }`}
                            />

                            <button
                                onClick={() => onModeChange('ask')}
                                className={`relative w-16 sm:w-20 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 z-10 ${mode === 'ask'
                                    ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                                    : 'text-white/60 hover:text-white/80'
                                    }`}
                            >
                                {t('arbor.modeAsk')}
                            </button>
                            <button
                                onClick={() => onModeChange('tell')}
                                className={`relative w-16 sm:w-20 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 z-10 ${mode === 'tell'
                                    ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]'
                                    : 'text-white/60 hover:text-white/80'
                                    }`}
                            >
                                {t('arbor.modeTell')}
                            </button>
                            <button
                                onClick={() => onModeChange('docsearch')}
                                className={`relative w-16 sm:w-20 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 z-10 ${mode === 'docsearch'
                                    ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                                    : 'text-white/60 hover:text-white/80'
                                    }`}
                            >
                                {t('arbor.modeSearch')}
                            </button>
                        </div>
                    </div>

                    {/* Doc Search Controls */}
                    {mode === 'docsearch' && (
                        <div className="mb-3 sm:mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <span className="text-white/60">Status:</span>
                                    <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs">
                                        {isReindexing ? t('arbor.statusIndexing') : t('arbor.statusIndexed')}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`px-3 py-1.5 text-xs sm:text-sm border rounded-lg transition-all ${showFilters
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                            : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-emerald-500/30 text-white/70 hover:text-white'
                                            }`}
                                    >
                                        {t('arbor.filters')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReindex}
                                        disabled={isReindexing}
                                        className="px-3 py-1.5 text-xs sm:text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-white/70 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isReindexing ? t('arbor.statusIndexing') : t('arbor.reindex')}
                                    </button>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm mb-3">
                                    <h4 className="text-sm font-medium text-white mb-3">{t('arbor.filterType')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['All', 'PDF', 'DOCX', 'TXT', 'XLSX'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${type === 'All'
                                                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {type === 'All' ? t('blog.all') : type}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <h4 className="text-sm font-medium text-white mb-3">{t('arbor.dateRange')}</h4>
                                        <div className="flex gap-2 text-xs">
                                            <input
                                                type="date"
                                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                            <span className="text-white/40 self-center">{t('arbor.to')}</span>
                                            <input
                                                type="date"
                                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="flex gap-2 sm:gap-3">
                            <input
                                type="text"
                                name="message"
                                placeholder={config.placeholder}
                                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-white/20 transition-all backdrop-blur-sm"
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                className="px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-emerald-900/40 hover:bg-emerald-800/50 backdrop-blur-md border border-emerald-600/30 hover:border-emerald-500/50 text-emerald-100 font-medium rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/30 flex items-center justify-center"
                            >
                                <span className="hidden sm:inline">{t('arbor.send')}</span>
                                <Send className="w-5 h-5 sm:hidden" />
                            </button>
                            {messages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={onClearChat}
                                    className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-medium rounded-xl sm:rounded-2xl transition-all duration-300"
                                >
                                    {t('arbor.clear')}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
