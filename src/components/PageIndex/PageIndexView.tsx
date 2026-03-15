import React, { useState, useRef, useEffect } from 'react';
import {
    Upload,
    FileText,
    Search,
    Send,
    ChevronRight,
    ChevronDown,
    Loader2,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Info,
    Network,
    Cpu,
    Zap,
    UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { pageIndexService, PageIndexNode } from '../../services/pageIndexService';
import { useAuth } from '../../contexts/AuthContext';
import log from '../../utils/logger';

// ─── Sub-Component: TreeNode ────────────────────────────────────
const TreeNode = ({ node, depth = 0 }: { node: PageIndexNode; depth?: number }) => {
    const [isExpanded, setIsExpanded] = useState(depth < 1);
    const hasChildren = node.nodes && node.nodes.length > 0;
    const pageLabel = typeof node.page_index === 'number'
        ? `P${node.page_index}`
        : typeof node.page_number === 'number'
            ? `P${node.page_number}`
            : typeof node.line_num === 'number'
                ? `L${node.line_num}`
                : null;
    const summaryText = node.summary || node.text;
    const titleText = node.title || node.node_id || "Untitled Section";

    return (
        <div className="select-none">
            <div
                className={cn(
                    "flex items-start gap-2 py-1.5 px-2 rounded-lg transition-colors cursor-pointer group",
                    "hover:bg-white/5"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-shrink-0 mt-0.5">
                    {hasChildren ? (
                        isExpanded ? <ChevronDown className="w-4 h-4 text-[#FF8A5B]" /> : <ChevronRight className="w-4 h-4 text-white/40" />
                    ) : (
                        <div className="w-4 h-4" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {pageLabel ? (
                            <span className="text-[10px] font-mono text-[#FFB286] bg-[#FF8A5B]/10 px-1.5 py-0.5 rounded">
                                {pageLabel}
                            </span>
                        ) : null}
                        {node.node_id && (
                            <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                {node.node_id}
                            </span>
                        )}
                        <h4 className="text-sm font-medium text-white/90 truncate group-hover:text-white">
                            {titleText}
                        </h4>
                    </div>
                    {summaryText && isExpanded && (
                        <p className="text-xs text-white/50 mt-1 line-clamp-2 italic leading-relaxed">
                            {summaryText}
                        </p>
                    )}
                    {!summaryText && isExpanded && (
                        <p className="text-xs text-white/30 mt-1 italic leading-relaxed">
                            No summary available
                        </p>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 border-l border-white/10 pl-2 mt-1"
                    >
                        {node.nodes?.map((child, i) => (
                            <TreeNode key={i} node={child} depth={depth + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────
export default function PageIndexView() {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'ready' | 'error'>('idle');
    const [progress, setProgress] = useState('');
    const [docId, setDocId] = useState<string | null>(null);
    const [tree, setTree] = useState<PageIndexNode[]>([]);
    const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages, isChatting]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setTree([]);
            setChatMessages([]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setStatus('uploading');
            setProgress('Uploading to PageIndex...');
            const id = await pageIndexService.submitDocument(file);
            setDocId(id);

            setStatus('processing');
            setProgress('Vectorless indexing in progress...');

            const result = await pageIndexService.pollTreeStatus(id, (s) => setProgress(`Status: ${s}...`));
            setTree(result);
            setStatus('ready');

            // Initial AI greeting
            setChatMessages([
                { role: 'assistant', content: `Hello! I've successfully indexed **${file.name}**. I've extracted ${pageIndexService.countNodes(result)} structured points across the document. Ask me anything about it!` }
            ]);
        } catch (err: any) {
            log.error('PageIndex upload failed', err);
            setStatus('error');
            setProgress(err.message || 'Indexing failed');
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || !tree.length || isChatting) return;

        const userMsg = input.trim();
        setInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsChatting(true);

        try {
            const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
            const response = await pageIndexService.chatWithDocument(userMsg, tree, history);
            setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error while processing your request." }]);
        } finally {
            setIsChatting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-120px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Bar / Upload Zone */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Network className="w-32 h-32 text-[#FF8A5B]" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#FF8A5B]/20 rounded-lg">
                                <UploadCloud className="w-5 h-5 text-[#FF8A5B]" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Document Intelligence</h2>
                        </div>

                        <p className="text-white/60 text-sm mb-6 max-w-md">
                            Upload a PDF to perform **Vectorless RAG**. We extract the document's logical structure (Index Tree) for highly accurate, context-aware reasoning.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4 text-[#FFB286]" />
                                {file ? file.name : "Select PDF Document"}
                            </button>

                            {file && status === 'idle' && (
                                <button
                                    onClick={handleUpload}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A5B] to-[#FFB286] text-white font-bold shadow-lg shadow-[#FF8A5B]/20 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <Zap className="w-4 h-4" />
                                    Start Indexing
                                </button>
                            )}

                            {(status === 'uploading' || status === 'processing') && (
                                <div className="flex items-center gap-3 text-[#FFB286] animate-pulse">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-sm font-medium">{progress}</span>
                                </div>
                            )}

                            {status === 'ready' && (
                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Indexed & Ready</span>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{progress}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#FF8A5B]/10 to-transparent border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#FFB286]" />
                        What is Vectorless RAG?
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex gap-3 text-xs text-white/70">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FFB286] flex-shrink-0" />
                            <span>Traditional RAG splits text blindly into chunks, losing hierarchy.</span>
                        </li>
                        <li className="flex gap-3 text-xs text-white/70">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FFB286] flex-shrink-0" />
                            <span>**PageIndex** extracts the actual index tree, keeping sections and sub-sections intact.</span>
                        </li>
                        <li className="flex gap-3 text-xs text-white/70">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FFB286] flex-shrink-0" />
                            <span>This results in perfect context retrieval and much higher accuracy in LLM responses.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Content Area: Split Tree and Chat */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                {/* Left: Tree Viewer */}
                <div className="lg:col-span-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col min-h-0">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Network className="w-4 h-4 text-[#FF8A5B]" />
                            Document Structure
                        </h3>
                        {tree.length > 0 && (
                            <span className="text-[10px] font-bold text-white/40">
                                {pageIndexService.countNodes(tree)} NODES
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                        {tree.length > 0 ? (
                            <div className="space-y-1">
                                {tree.map((node, i) => (
                                    <TreeNode key={i} node={node} />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                                <FileText className="w-12 h-12 mb-4" />
                                <p className="text-sm">No structured data available.<br />Upload and index a document to see the tree.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Chat Interface */}
                <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col min-h-0">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#FF8A5B]" />
                            Contextual AI Chat
                        </h3>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
                    >
                        {chatMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                                <div className="p-6 rounded-full bg-white/5 border border-white/5 scale-125">
                                    <Cpu className="w-12 h-12" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold">Vectorless RAG Chat</h4>
                                    <p className="text-sm max-w-xs">Once indexed, you can chat with your document using structured context.</p>
                                </div>
                            </div>
                        ) : (
                            chatMessages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-4 max-w-[85%]",
                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border",
                                        msg.role === 'user' ? "bg-white/10 border-white/20" : "bg-[#FF8A5B]/20 border-[#FF8A5B]/30"
                                    )}>
                                        {msg.role === 'user' ? <FileText className="w-4 h-4 text-white/70" /> : <Cpu className="w-4 h-4 text-[#FFB286]" />}
                                    </div>
                                    <div className={cn(
                                        "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                        msg.role === 'user'
                                            ? "bg-gradient-to-br from-white/10 to-white/5 text-white border border-white/10"
                                            : "bg-[#FF8A5B]/5 text-white/90 border border-[#FF8A5B]/20 shadow-lg shadow-[#FF8A5B]/5"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))
                        )}
                        {isChatting && (
                            <div className="flex gap-4 mr-auto">
                                <div className="w-8 h-8 rounded-full bg-[#FF8A5B]/20 border border-[#FF8A5B]/30 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 text-[#FFB286] animate-spin" />
                                </div>
                                <div className="bg-[#FF8A5B]/5 border border-[#FF8A5B]/20 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFB286] animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFB286] animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFB286] animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white/5 border-t border-white/10">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={status === 'ready' ? "Ask a question about this document..." : "Index a document first to start chatting..."}
                                disabled={status !== 'ready' || isChatting}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FF8A5B]/50 transition-all"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!input.trim() || status !== 'ready' || isChatting}
                                className="absolute right-2 top-1.5 p-1.5 rounded-lg bg-[#FF8A5B] text-white hover:bg-[#FFB286] disabled:opacity-30 transition-all cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
