import { ArborMessage, ArborMode } from '../../types/arbor';

interface ArborChatProps {
    mode: ArborMode;
    messages: ArborMessage[];
    onSendMessage: (message: string) => void;
    onClearChat: () => void;
}

export default function ArborChat({ mode, messages, onSendMessage, onClearChat }: ArborChatProps) {
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
            emoji: '💬',
            name: 'Ask Arbor',
            color: '#3b82f6',
            description: 'Ask questions and get intelligent answers',
            placeholder: 'Ask a question about your documents...'
        },
        tell: {
            emoji: '⚡',
            name: 'Tell Arbor',
            color: '#8b5cf6',
            description: 'Execute autonomous tasks and actions',
            placeholder: 'Tell Arbor what to do...'
        }
    };

    const config = modeConfig[mode];

    return (
        <div className="flex flex-col h-full">
            {/* Mode Indicator */}
            <div
                className="mb-6 p-4 rounded-2xl border backdrop-blur-sm"
                style={{
                    background: `linear-gradient(135deg, ${config.color}20 0%, ${config.color}10 100%)`,
                    borderColor: `${config.color}40`
                }}
            >
                <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                    <span>{config.emoji}</span>
                    <span>{config.name} Mode</span>
                </h3>
                <p className="text-white/60 text-sm">{config.description}</p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 custom-scrollbar pr-2">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3 max-w-md">
                            <div className="text-6xl mb-4">{config.emoji}</div>
                            <h3 className="text-xl font-semibold text-white/80">Start a Conversation</h3>
                            <p className="text-white/50 text-sm">
                                {mode === 'ask'
                                    ? 'Ask questions about your documents, tasks, calendar, and more. Arbor uses advanced RAG technology for intelligent answers.'
                                    : 'Tell Arbor to execute tasks like generating reports, sending emails, scheduling meetings, and more.'}
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
                                className={`max-w-[80%] p-4 rounded-2xl backdrop-blur-sm ${message.role === 'user'
                                        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                                        : 'bg-white/5 border border-white/10'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === 'user'
                                            ? 'bg-emerald-500/30 text-emerald-400'
                                            : 'bg-white/10 text-white/70'
                                        }`}>
                                        {message.role === 'user' ? '👤' : '🌳'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                            {message.content}
                                        </p>
                                        {message.details && (
                                            <details className="mt-3 text-xs">
                                                <summary className="cursor-pointer text-white/50 hover:text-white/70 transition-colors">
                                                    View Details
                                                </summary>
                                                <pre className="mt-2 p-3 bg-black/30 rounded-lg overflow-x-auto text-white/60">
                                                    {JSON.stringify(message.details, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                        <div className="mt-2 text-xs text-white/40">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="flex gap-3">
                    <input
                        type="text"
                        name="message"
                        placeholder={config.placeholder}
                        className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]"
                    >
                        Send
                    </button>
                    {messages.length > 0 && (
                        <button
                            type="button"
                            onClick={onClearChat}
                            className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-medium rounded-2xl transition-all duration-300"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
