import { ArborMode } from '../../types/arbor';
import { MessageSquare, Zap, Info } from 'lucide-react';

interface ArborSettingsProps {
    mode: ArborMode;
    onModeChange: (mode: ArborMode) => void;
    isInitialized: boolean;
    onInitialize: () => void;
}

export default function ArborSettings({ mode, onModeChange, isInitialized, onInitialize }: ArborSettingsProps) {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Mode Selector */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Control Panel</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-white/70 mb-2 sm:mb-3 block">Select Mode</label>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                            <button
                                onClick={() => onModeChange('ask')}
                                className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-left group ${mode === 'ask'
                                        ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/25'
                                        : 'bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10'
                                    }`}
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div
                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${mode === 'ask' ? 'bg-blue-500/30 text-blue-400' : 'bg-white/10 text-white/50 group-hover:text-blue-400'
                                            }`}
                                    >
                                        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3
                                            className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 transition-colors ${mode === 'ask' ? 'text-blue-400' : 'text-white group-hover:text-blue-400'
                                                }`}
                                        >
                                            Ask Arbor
                                        </h3>
                                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                                            Ask questions about your documents, tasks, and calendar. Get intelligent answers powered by RAG technology.
                                        </p>
                                    </div>
                                </div>
                                {mode === 'ask' && (
                                    <div className="mt-3 sm:mt-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500/20 border border-blue-500/30 rounded-full inline-block">
                                        <span className="text-[10px] sm:text-xs font-medium text-blue-400">Active</span>
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => onModeChange('tell')}
                                className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-left group ${mode === 'tell'
                                        ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/25'
                                        : 'bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10'
                                    }`}
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div
                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${mode === 'tell' ? 'bg-purple-500/30 text-purple-400' : 'bg-white/10 text-white/50 group-hover:text-purple-400'
                                            }`}
                                    >
                                        <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3
                                            className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 transition-colors ${mode === 'tell' ? 'text-purple-400' : 'text-white group-hover:text-purple-400'
                                                }`}
                                        >
                                            Tell Arbor
                                        </h3>
                                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                                            Execute autonomous tasks like generating reports, sending emails, and managing your workflow.
                                        </p>
                                    </div>
                                </div>
                                {mode === 'tell' && (
                                    <div className="mt-3 sm:mt-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-500/20 border border-purple-500/30 rounded-full inline-block">
                                        <span className="text-[10px] sm:text-xs font-medium text-purple-400">Active</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Controls */}
            <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">System Controls</h3>
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-white/70 mb-2 block">Document Repository</label>
                        <input
                            type="text"
                            defaultValue="./arbor_data/documents"
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                            placeholder="Path to documents folder"
                        />
                    </div>

                    {!isInitialized && (
                        <button
                            onClick={onInitialize}
                            className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25"
                        >
                            Initialize System
                        </button>
                    )}
                </div>
            </div>

            {/* System Info */}
            <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl">
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mt-0.5" />
                    <h3 className="text-base sm:text-lg font-semibold text-white">System Information</h3>
                </div>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                        <span className="text-white/60">Model</span>
                        <span className="text-white font-medium">DeepSeek R1 7B</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                        <span className="text-white/60">Status</span>
                        <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${isInitialized
                                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                    : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                                }`}
                        >
                            {isInitialized ? 'Ready' : 'Not Initialized'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-white/60">Backend</span>
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                            Connected
                        </span>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">About Arbor</h3>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                    Arbor is your intelligent enterprise AI assistant that seamlessly integrates with Google Drive, Calendar, Sheets, and Gmail to provide advanced document search, task management, and workflow automation.
                </p>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/60">
                    <p>
                        <strong className="text-emerald-400">✓</strong> Advanced RAG technology for Q&A
                    </p>
                    <p>
                        <strong className="text-emerald-400">✓</strong> Hybrid search (65% keyword + 35% semantic)
                    </p>
                    <p>
                        <strong className="text-emerald-400">✓</strong> Multilingual support (EN, DE, FR, ES)
                    </p>
                    <p>
                        <strong className="text-emerald-400">✓</strong> 100% local processing for privacy
                    </p>
                </div>
            </div>
        </div>
    );
}
