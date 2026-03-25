import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../../utils/cn';
import {
    FileText,
    Upload,
    Trash2,
    ChevronDown,
    ChevronRight,
    Loader2,
    CheckCircle,
    AlertCircle,
    File,
    FileType,
    Clock,
    Layers,
    X,
    UploadCloud,
    Network,
    Zap,
    MessageSquare,
    Send,
    Cpu,
    BookOpen,
    AlertOctagon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { supabase } from '../../config/supabase';
import { ragService, UploadedDocument, ProcessingProgress } from '../../services/ragService';
import { pageIndexService, PageIndexNode } from '../../services/pageIndexService';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Helpers ─────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getFileIcon(fileType: string) {
    switch (fileType) {
        case 'pdf': return <FileType className="w-5 h-5 text-[#FF8A5B]" />;
        case 'md': return <FileText className="w-5 h-5 text-[#FFB286]" />;
        case 'csv': return <File className="w-5 h-5 text-[#FFD1B8]" />;
        default: return <FileText className="w-5 h-5 text-white/40" />;
    }
}

function getPageCount(nodes: PageIndexNode[]): number | null {
    let minPage = Number.POSITIVE_INFINITY;
    let maxPage = Number.NEGATIVE_INFINITY;
    let found = false;

    const walk = (node: PageIndexNode) => {
        const pageValue = typeof node.page_index === 'number'
            ? node.page_index
            : typeof node.page_number === 'number'
                ? node.page_number
                : null;

        if (pageValue !== null) {
            found = true;
            minPage = Math.min(minPage, pageValue);
            maxPage = Math.max(maxPage, pageValue);
        }

        if (node.nodes && node.nodes.length > 0) {
            node.nodes.forEach(walk);
        }
    };

    nodes.forEach(walk);

    if (!found) return null;

    // If pages are 0-indexed, convert to count
    if (minPage === 0) {
        return maxPage + 1;
    }

    return maxPage;
}

const ACCEPTED_TYPES = '.pdf,.txt,.md,.csv,.docx';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ─── Sub-Component: TreeNode ────────────────────────────────────
const TreeNodeNode = ({ node, depth = 0 }: { node: PageIndexNode; depth?: number }) => {
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
                            <span className="text-[11px] font-mono text-[#FFB286] bg-[#FF8A5B]/10 px-1.5 py-0.5 rounded">
                                {pageLabel}
                            </span>
                        ) : null}
                        {node.node_id && (
                            <span className="text-[11px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded truncate max-w-[120px]">
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
                            <TreeNodeNode key={i} node={child} depth={depth + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────
export default function DocumentsView({ isDark = true }: { isDark?: boolean }) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { knowledgeBase } = useDemoCall();

    const [documents, setDocuments] = useState<UploadedDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
    const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);
    const [textTitle, setTextTitle] = useState('');
    const [textContent, setTextContent] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // PageIndex Specific State
    const [uploadMode, setUploadMode] = useState<'text' | 'pdf'>('pdf');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pageIndexTree, setPageIndexTree] = useState<PageIndexNode[]>([]);
    const [pageIndexByDocId, setPageIndexByDocId] = useState<Record<string, PageIndexNode[]>>({});
    const [pageIndexDocIdByDocId, setPageIndexDocIdByDocId] = useState<Record<string, string>>({});
    const [pageIndexLoadingByDocId, setPageIndexLoadingByDocId] = useState<Record<string, boolean>>({});
    const [pageIndexErrorByDocId, setPageIndexErrorByDocId] = useState<Record<string, string>>({});
    const [currentPageIndexDocId, setCurrentPageIndexDocId] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const [intelligenceTab, setIntelligenceTab] = useState<'tree' | 'chat'>('tree');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const kbId = knowledgeBase?.id || user?.id || '';

    // ─── KB Coverage State ────────────────────────────────────────
    const [kbGaps, setKbGaps] = useState<{
        coverageScore: number;
        kbArticleCount: number;
        totalTopics: number;
        coveredTopics: number;
        gaps: { topic: string; occurrences: number; coverage: number }[];
    } | null>(null);
    const [kbGapsLoading, setKbGapsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function fetchKbGaps() {
            setKbGapsLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.access_token) return;
                const res = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-analytics/kb-gaps?days=90`,
                    { headers: { Authorization: `Bearer ${session.access_token}` } }
                );
                if (res.ok && !cancelled) {
                    const data = await res.json();
                    setKbGaps(data);
                }
            } catch { /* silent — coverage panel is non-critical */ }
            finally { if (!cancelled) setKbGapsLoading(false); }
        }
        fetchKbGaps();
        return () => { cancelled = true; };
    }, []);

    // ─── Load documents ───────────────────────────────────────
    const loadDocuments = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const docs = await ragService.getDocuments(user.id);
            setDocuments(docs);
        } catch (err) {
            console.error('Failed to load documents:', err);
        }
        setIsLoading(false);
    }, [user?.id]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    // ─── File Selection ──────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setTextTitle(file.name.split('.')[0]);
        }
    };

    // ─── Document Submission ───────────────────────────────────────
    const handleSubmit = async () => {
        if (typeof document !== 'undefined') {
            const activeEl = document.activeElement as HTMLElement | null;
            activeEl?.blur();
        }
        if (!user?.id || !kbId) return;
        const clearProgressSoon = () => setTimeout(() => setProcessingProgress(null), 3000);

        if (uploadMode === 'text') {
            if (!textTitle.trim() || !textContent.trim()) {
                alert('Please provide both a title and text content.');
                return;
            }

            const syntheticFile = new File([textContent], `${textTitle.trim()}.txt`, { type: 'text/plain' });

            setProcessingProgress({
                stage: 'uploading',
                current: 0,
                total: 1,
                message: 'Starting upload...',
            });

            const result = await ragService.processDocument(
                syntheticFile,
                kbId,
                user.id,
                (progress) => setProcessingProgress(progress),
            );

            if (result) {
                setTextTitle('');
                setTextContent('');
                await loadDocuments();
                setProcessingProgress({
                    stage: 'done',
                    current: 1,
                    total: 1,
                    message: 'Saved to Knowledge Base',
                });
                clearProgressSoon();
            }
        } else {
            // PDF / PageIndex Mode
            if (!selectedFile) return;

            setProcessingProgress({
                stage: 'uploading',
                current: 0,
                total: 1,
                message: 'Uploading to PageIndex...',
            });

            try {
                const docId = await pageIndexService.submitDocument(selectedFile);

                setProcessingProgress({
                    stage: 'embedding',
                    current: 0,
                    total: 1,
                    message: 'Vectorless indexing in progress...',
                });

                const result = await pageIndexService.pollTreeStatus(docId, (s) =>
                    setProcessingProgress(prev => ({ ...prev!, message: `PageIndex: ${s}...` }))
                );

                setPageIndexTree(result);
                setCurrentPageIndexDocId(docId);
                setIntelligenceTab('tree');

                // Initial AI greeting
                setChatMessages([
                    { role: 'assistant', content: `Indexed **${selectedFile.name}**. I've extracted ${pageIndexService.countNodes(result)} structured points. Ask me anything about it!` }
                ]);

                setSelectedFile(null);
                setTextTitle('');
                setProcessingProgress({
                    stage: 'done',
                    current: 1,
                    total: 1,
                    message: `Indexed ${pageIndexService.countNodes(result)} nodes successfully`,
                });
                clearProgressSoon();

                // Also save to standard Knowledge Base for voice agents (non-blocking)
                ragService.processDocument(
                    selectedFile,
                    kbId,
                    user.id,
                    () => { }, // Silent progress for standard RAG
                    docId
                ).then(async (ragDoc) => {
                    if (ragDoc) {
                        await ragService.setPageIndexDocId(ragDoc.id, docId);
                        setPageIndexByDocId(prev => ({ ...prev, [ragDoc.id]: result }));
                        setPageIndexDocIdByDocId(prev => ({ ...prev, [ragDoc.id]: docId }));
                    }
                    loadDocuments();
                }).catch((err) => {
                    console.error('Failed to store backup RAG doc:', err);
                });
            } catch (err: any) {
                setProcessingProgress({
                    stage: 'error',
                    current: 0,
                    total: 1,
                    message: err.message || 'Indexing failed',
                });
                clearProgressSoon();
            }
        }
    };

    // ─── Chat Logic ──────────────────────────────────────────────
    const handleSendMessage = async () => {
        if (!chatInput.trim() || !pageIndexTree.length || isChatting) return;

        const userMsg = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsChatting(true);
        setIntelligenceTab('chat');

        try {
            const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
            const response = await pageIndexService.chatWithDocument(
                userMsg,
                pageIndexTree,
                history,
                { docId: currentPageIndexDocId || undefined }
            );
            setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error while processing your request." }]);
        } finally {
            setIsChatting(false);
        }
    };

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatMessages, isChatting]);

    // ─── Expand / view structure ──────────────────────────────
    const resolvePageIndexDocId = (doc: UploadedDocument) =>
        doc.pageindex_doc_id || pageIndexDocIdByDocId[doc.id];

    const fetchPageIndexTreeForDoc = async (doc: UploadedDocument) => {
        const pageIndexId = resolvePageIndexDocId(doc);
        if (!pageIndexId || pageIndexByDocId[doc.id] || pageIndexLoadingByDocId[doc.id]) return;

        setPageIndexLoadingByDocId(prev => ({ ...prev, [doc.id]: true }));
        setPageIndexErrorByDocId(prev => {
            const next = { ...prev };
            delete next[doc.id];
            return next;
        });

        try {
            const tree = await pageIndexService.getTree(pageIndexId);
            setPageIndexByDocId(prev => ({ ...prev, [doc.id]: tree }));
        } catch (err: any) {
            setPageIndexErrorByDocId(prev => ({
                ...prev,
                [doc.id]: err?.message || 'Failed to load PageIndex structure',
            }));
        } finally {
            setPageIndexLoadingByDocId(prev => ({ ...prev, [doc.id]: false }));
        }
    };

    const toggleExpand = (doc: UploadedDocument) => {
        const docId = doc.id;
        if (expandedDocId === docId) {
            setExpandedDocId(null);
            return;
        }
        setExpandedDocId(docId);
        fetchPageIndexTreeForDoc(doc);
    };

    // ─── Delete ───────────────────────────────────────────────
    const handleDelete = async (docId: string) => {
        if (!user?.id) return;
        const success = await ragService.deleteDocument(docId, user.id);
        if (success) {
            setDocuments(prev => prev.filter(d => d.id !== docId));
            if (expandedDocId === docId) {
                setExpandedDocId(null);
            }
            setPageIndexByDocId(prev => {
                const next = { ...prev };
                delete next[docId];
                return next;
            });
            setPageIndexLoadingByDocId(prev => {
                const next = { ...prev };
                delete next[docId];
                return next;
            });
            setPageIndexErrorByDocId(prev => {
                const next = { ...prev };
                delete next[docId];
                return next;
            });
            setPageIndexDocIdByDocId(prev => {
                const next = { ...prev };
                delete next[docId];
                return next;
            });
        }
        setDeleteConfirmId(null);
    };

    // ─── Styles ───────────────────────────────────────────────
    const cardBg = isDark ? 'bg-white/5 backdrop-blur-md border-white/10' : 'bg-white border-gray-200';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-white/60' : 'text-gray-500';
    const textMuted = isDark ? 'text-white/40' : 'text-gray-400';

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={cn("text-2xl font-bold", textPrimary)}>
                        {t('kbDocs.title')}
                    </h1>
                    <p className={cn("text-sm mt-1", textSecondary)}>
                        {t('kbDocs.description')}
                    </p>
                </div>
            </div>

            {/* Input / Upload Zone */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className={cn(
                    "lg:col-span-12 relative rounded-xl border p-6 transition-all duration-200",
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"
                )}>
                    <div className="flex flex-col gap-6">
                        {/* Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-black/20 rounded-lg w-fit">
                            <button
                                onClick={() => setUploadMode('pdf')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                                    uploadMode === 'pdf' ? "bg-[#FF8A5B] text-white shadow-lg" : "text-white/40 hover:text-white/60"
                                )}
                            >
                                <UploadCloud className="w-3.5 h-3.5" />
                                PDF Upload
                            </button>
                            <button
                                onClick={() => setUploadMode('text')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                                    uploadMode === 'text' ? "bg-[#FF8A5B] text-white shadow-lg" : "text-white/40 hover:text-white/60"
                                )}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Paste Text
                            </button>
                        </div>

                        {processingProgress && (
                            <div className={cn(
                                "rounded-lg border px-4 py-3 flex items-start gap-3",
                                processingProgress.stage === 'error'
                                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                                    : processingProgress.stage === 'done'
                                        ? "border-[#FF8A5B]/30 bg-[#FF8A5B]/10 text-[#FFB286]"
                                        : isDark
                                            ? "border-white/10 bg-black/20 text-white/80"
                                            : "border-gray-200 bg-gray-50 text-gray-700"
                            )}>
                                <div className="mt-0.5">
                                    {processingProgress.stage === 'error' ? (
                                        <AlertCircle className="w-4 h-4" />
                                    ) : processingProgress.stage === 'done' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium">{processingProgress.message}</p>
                                    {processingProgress.total > 1 && (
                                        <div className="mt-2">
                                            <div className={cn("h-1.5 rounded-full overflow-hidden", isDark ? "bg-white/10" : "bg-gray-200")}>
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#FF8A5B] via-[#FF9E6C] to-[#FFB286] rounded-full transition-all duration-300"
                                                    style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                                                />
                                            </div>
                                            <p className={cn("text-[11px] mt-1", isDark ? "text-white/50" : "text-gray-500")}>
                                                {processingProgress.current} / {processingProgress.total}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className={cn("block text-[11px] font-bold uppercase tracking-wider mb-2", textSecondary)}>
                                        Document Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Employee Handbook"
                                        value={textTitle}
                                        onChange={(e) => setTextTitle(e.target.value)}
                                        className={cn(
                                            "w-full rounded-lg px-4 py-2.5 border text-sm outline-none transition-all",
                                            isDark
                                                ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF8A5B]/50"
                                                : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF8A5B]"
                                        )}
                                    />
                                </div>

                                {uploadMode === 'pdf' ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group",
                                            isDark
                                                ? "bg-black/20 border-white/10 hover:border-[#FF8A5B]/50"
                                                : "bg-gray-50 border-gray-200 hover:border-[#FF8A5B]"
                                        )}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept=".pdf"
                                            className="hidden"
                                        />
                                        <div className="w-12 h-12 rounded-full bg-[#FF8A5B]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-[#FF8A5B]" />
                                        </div>
                                        <p className={cn("text-sm font-medium", textPrimary)}>
                                            {selectedFile ? selectedFile.name : "Click or drag PDF to upload"}
                                        </p>
                                        <p className={cn("text-xs mt-1", textMuted)}>
                                            {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "Max 10MB"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className={cn("block text-[11px] font-bold uppercase tracking-wider mb-2", textSecondary)}>
                                            Content
                                        </label>
                                        <textarea
                                            placeholder="Paste your text content here..."
                                            rows={5}
                                            value={textContent}
                                            onChange={(e) => setTextContent(e.target.value)}
                                            className={cn(
                                                "w-full rounded-lg px-4 py-3 border text-sm outline-none transition-all resize-y min-h-[140px]",
                                                isDark
                                                    ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF8A5B]/50"
                                                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#FF8A5B]"
                                            )}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={
                                            (uploadMode === 'text' && (!textTitle.trim() || !textContent.trim())) ||
                                            (uploadMode === 'pdf' && !selectedFile) ||
                                            !!processingProgress
                                        }
                                        className={cn(
                                            "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer border shadow-lg",
                                            "bg-gradient-to-r from-[#FF8A5B] to-[#FFB286] text-white border-[#FF8A5B]/30",
                                            "hover:scale-[1.02] hover:shadow-[#FF8A5B]/20",
                                            "disabled:opacity-50 disabled:pointer-events-none"
                                        )}
                                    >
                                        <Zap className="w-4 h-4" />
                                        {uploadMode === 'pdf' ? "Start Vectorless Indexing" : "Save to Knowledge Base"}
                                    </button>
                                </div>
                            </div>

                            <div className={cn(
                                "rounded-xl border flex flex-col min-h-[300px] sm:min-h-[400px]",
                                isDark ? "bg-black/20 border-white/10" : "bg-gray-50 border-gray-200"
                            )}>
                                <div className="flex items-center justify-between p-4 border-b border-white/5">
                                    <div className="flex items-center gap-1 p-1 bg-black/20 rounded-lg">
                                        <button
                                            onClick={() => setIntelligenceTab('tree')}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                                                intelligenceTab === 'tree' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                                            )}
                                        >
                                            <Network className="w-3 h-3" />
                                            Structure
                                        </button>
                                        <button
                                            onClick={() => setIntelligenceTab('chat')}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-bold transition-all relative",
                                                intelligenceTab === 'chat' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                                            )}
                                        >
                                            <MessageSquare className="w-3 h-3" />
                                            AI Analyst
                                            {chatMessages.length > 0 && intelligenceTab !== 'chat' && (
                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF8A5B] rounded-full animate-pulse" />
                                            )}
                                        </button>
                                    </div>
                                    {pageIndexTree.length > 0 && intelligenceTab === 'tree' && (
                                        <span className="text-[11px] font-mono text-[#FFB286]">
                                            {pageIndexService.countNodes(pageIndexTree)} NODES
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 overflow-hidden flex flex-col">
                                    {intelligenceTab === 'tree' ? (
                                        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                                            {pageIndexTree.length > 0 ? (
                                                <div className="space-y-1">
                                                    {pageIndexTree.map((node, i) => (
                                                        <TreeNodeNode key={i} node={node} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-6">
                                                    <Layers className="w-10 h-10 mb-3" />
                                                    <p className="text-xs font-medium">No structured data found.</p>
                                                    <p className="text-[11px] mt-1 leading-relaxed">
                                                        Vectorless RAG preserves structure for 100% accuracy.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col min-h-0 bg-black/10">
                                            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                                                {chatMessages.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 px-8">
                                                        <Cpu className="w-10 h-10 mb-3" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">Contextual AI</p>
                                                        <p className="text-[11px] mt-1">Chat using the actual document structure.</p>
                                                    </div>
                                                ) : (
                                                    chatMessages.map((msg, i) => (
                                                        <div key={i} className={cn(
                                                            "flex gap-3 max-w-[90%]",
                                                            msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                                        )}>
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border text-[11px]",
                                                                msg.role === 'user' ? "bg-white/10 border-white/20" : "bg-[#FF8A5B]/20 border-[#FF8A5B]/30"
                                                            )}>
                                                                {msg.role === 'user' ? 'U' : 'AI'}
                                                            </div>
                                                            <div className={cn(
                                                                "px-3 py-2 rounded-xl text-[11px] leading-relaxed",
                                                                msg.role === 'user' ? "bg-white/5 border border-white/10" : "bg-[#FF8A5B]/10 border border-[#FF8A5B]/20 text-white/90"
                                                            )}>
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                                {isChatting && (
                                                    <div className="flex gap-2 mr-auto items-center opacity-50">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        <span className="text-[11px] italic">Expert is thinking...</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3 border-t border-white/5">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Ask about this document..."
                                                        value={chatInput}
                                                        onChange={(e) => setChatInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 pr-10 text-[11px] outline-none focus:border-[#FF8A5B]/50 transition-all"
                                                        disabled={pageIndexTree.length === 0 || isChatting}
                                                    />
                                                    <button
                                                        onClick={handleSendMessage}
                                                        disabled={!chatInput.trim() || isChatting || pageIndexTree.length === 0}
                                                        className="absolute right-1.5 top-1.5 p-1 rounded-md bg-[#FF8A5B] text-white disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <Send className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="pt-4">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-5 h-5 text-[#FF8A5B]" />
                            <h2 className={cn("text-lg font-bold", textPrimary)}>Knowledge Base</h2>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className={cn("w-6 h-6 animate-spin", textMuted)} />
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center border",
                                    isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
                                )}>
                                    <FileText className={cn("w-8 h-8", textMuted)} />
                                </div>
                                <p className={cn("text-sm font-medium", textSecondary)}>
                                    {t('kbDocs.empty')}
                                </p>
                                <p className={cn("text-xs", textMuted)}>
                                    Upload documents to provide context for your AI assistant
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {documents.map((doc) => {
                                    const treeForDoc = pageIndexByDocId[doc.id];
                                    const nodeCount = treeForDoc ? pageIndexService.countNodes(treeForDoc) : 0;
                                    const pageCount = treeForDoc ? getPageCount(treeForDoc) : null;
                                    const pageIndexId = resolvePageIndexDocId(doc);
                                    const isTreeLoading = !!pageIndexLoadingByDocId[doc.id];
                                    const treeError = pageIndexErrorByDocId[doc.id];

                                    return (
                                        <div key={doc.id}>
                                        {/* Document Row */}
                                        <div className={cn(
                                            "rounded-xl border p-4 transition-all duration-200",
                                            cardBg,
                                            expandedDocId === doc.id && (isDark ? "ring-1 ring-[#FF8A5B]/30" : "ring-1 ring-[#FF8A5B]/30")
                                        )}>
                                            <div className="flex items-center gap-2 sm:gap-4">
                                                {/* Expand toggle */}
                                                <button
                                                    onClick={() => toggleExpand(doc)}
                                                    className={cn(
                                                        "p-1 rounded-md transition-colors cursor-pointer shrink-0",
                                                        isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                                                    )}
                                                >
                                                    {expandedDocId === doc.id
                                                        ? <ChevronDown className={cn("w-4 h-4", textSecondary)} />
                                                        : <ChevronRight className={cn("w-4 h-4", textSecondary)} />
                                                    }
                                                </button>

                                                {/* File icon */}
                                                <div className={cn(
                                                    "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border flex-shrink-0",
                                                    isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
                                                )}>
                                                    {getFileIcon(doc.file_type)}
                                                </div>

                                                {/* File info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-sm font-medium truncate", textPrimary)}>
                                                        {doc.file_name}
                                                    </p>
                                                    <div className={cn("flex items-center gap-2 mt-0.5 text-xs flex-wrap", textMuted)}>
                                                        <span>{formatBytes(doc.file_size)}</span>
                                                        <span className="hidden sm:inline">&middot;</span>
                                                        <span className="hidden sm:inline uppercase">{doc.file_type}</span>
                                                        <span>&middot;</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {timeAgo(doc.created_at)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Status badge */}
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {doc.status === 'ready' && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                                                "bg-[#FF8A5B]/10 text-[#FFB286] border border-[#FF8A5B]/20"
                                                            )}>
                                                                <CheckCircle className="w-3 h-3" />
                                                                <span className="hidden sm:inline">Ready</span>
                                                            </span>
                                                            <span className={cn(
                                                                "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                                                                isDark ? "bg-white/5 text-white/60" : "bg-gray-100 text-gray-600"
                                                            )}>
                                                                <Layers className="w-3 h-3" />
                                                                {treeForDoc ? `${nodeCount} Nodes` : `${doc.chunk_count} Chunks`}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {doc.status === 'processing' && (
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                                            "bg-[#FFB286]/10 text-[#FFB286] border border-[#FF8A5B]/20"
                                                        )}>
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            <span className="hidden sm:inline">Processing</span>
                                                        </span>
                                                    )}
                                                    {doc.status === 'error' && (
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                                            "bg-red-500/10 text-red-400 border border-red-500/20"
                                                        )}>
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span className="hidden sm:inline">Error</span>
                                                        </span>
                                                    )}

                                                    {/* Delete button */}
                                                    {deleteConfirmId === doc.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleDelete(doc.id)}
                                                                className="px-2 py-0.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                                                            >
                                                                Del
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirmId(null)}
                                                                className={cn(
                                                                    "p-1 rounded-md transition-colors cursor-pointer",
                                                                    isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                                                                )}
                                                            >
                                                                <X className={cn("w-3.5 h-3.5", textMuted)} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirmId(doc.id)}
                                                            className={cn(
                                                                "p-1.5 rounded-lg transition-colors cursor-pointer shrink-0",
                                                                isDark
                                                                    ? "text-white/30 hover:text-red-400 hover:bg-red-500/10"
                                                                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                            )}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Error message */}
                                            {doc.status === 'error' && doc.error_message && (
                                                <p className="mt-2 text-xs text-red-400/80 pl-[3.75rem]">
                                                    {doc.error_message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Expanded Structure */}
                                        <AnimatePresence>
                                            {expandedDocId === doc.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className={cn(
                                                        "ml-6 mt-2 rounded-xl border p-4 space-y-3",
                                                        isDark ? "bg-white/[0.03] border-white/10 backdrop-blur-md" : "bg-gray-50 border-gray-100"
                                                    )}>
                                                        {/* Stats bar */}
                                                        <div className={cn("flex flex-wrap items-center gap-4 text-xs pb-3 border-b", isDark ? "border-white/5" : "border-gray-200")}>                                                                                                                            
                                                            <span className={textSecondary}>
                                                                <strong className={textPrimary}>{treeForDoc ? nodeCount : (isTreeLoading ? 'Loading' : 'N/A')}</strong> nodes
                                                            </span>
                                                            <span className={textSecondary}>
                                                                <strong className={textPrimary}>{treeForDoc ? treeForDoc.length : (isTreeLoading ? 'Loading' : 'N/A')}</strong> sections
                                                            </span>
                                                            <span className={textSecondary}>
                                                                <strong className={textPrimary}>{treeForDoc ? (pageCount ?? 'N/A') : (isTreeLoading ? 'Loading' : 'N/A')}</strong> pages
                                                            </span>
                                                            {pageIndexId && (
                                                                <span className={cn(
                                                                    "text-[11px] font-mono px-1.5 py-0.5 rounded border",
                                                                    isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-gray-100 border-gray-200 text-gray-600"
                                                                )}>
                                                                    ID {pageIndexId}
                                                                </span>
                                                            )}
                                                            <span className={cn("uppercase text-[11px] font-mono px-1.5 py-0.5 rounded", isDark ? "bg-white/5" : "bg-gray-200")}> 
                                                                {doc.file_type}
                                                            </span>
                                                        </div>

                                                        {treeForDoc ? (
                                                            <div className="space-y-2 max-h-[280px] sm:max-h-[400px] overflow-y-auto scrollbar-hide">
                                                                {treeForDoc.map((node, idx) => (
                                                                    <div
                                                                        key={`${doc.id}-${idx}`}
                                                                        className={cn(
                                                                            "rounded-lg border p-3 transition-colors",
                                                                            isDark
                                                                                ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
                                                                                : "bg-white border-gray-200 hover:bg-gray-50"
                                                                        )}
                                                                    >
                                                                        <TreeNodeNode node={node} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : treeError ? (
                                                            <p className={cn("text-sm text-center py-6", textMuted)}>
                                                                {treeError}
                                                            </p>
                                                        ) : isTreeLoading ? (
                                                            <p className={cn("text-sm text-center py-6", textMuted)}>
                                                                Loading PageIndex structure...
                                                            </p>
                                                        ) : (
                                                            <p className={cn("text-sm text-center py-6", textMuted)}>
                                                                This document hasn't been indexed with PageIndex yet. Re-upload using Vectorless Indexing to generate structure.
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── KB Coverage Panel ─────────────────────────── */}
                <div className={cn("rounded-xl border p-5 mt-6", isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-gray-200")}>
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <h2 className={cn("text-base font-semibold", textPrimary)}>KB Coverage Analysis</h2>
                        {kbGaps && (
                            <span className={cn(
                                "ml-auto text-xs font-medium px-2 py-0.5 rounded-full",
                                kbGaps.coverageScore >= 0.7
                                    ? "bg-green-500/10 text-green-400"
                                    : kbGaps.coverageScore >= 0.4
                                        ? "bg-amber-500/10 text-amber-400"
                                        : "bg-red-500/10 text-red-400"
                            )}>
                                {Math.round(kbGaps.coverageScore * 100)}% covered
                            </span>
                        )}
                    </div>

                    {kbGapsLoading ? (
                        <div className="flex items-center gap-2 py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            <span className={cn("text-sm", textMuted)}>Analysing KB coverage…</span>
                        </div>
                    ) : !kbGaps || kbGaps.totalTopics === 0 ? (
                        <p className={cn("text-sm py-4", textMuted)}>
                            No call topics found yet. Coverage analysis will appear once calls have been logged.
                        </p>
                    ) : (
                        <>
                            {/* Coverage score bar */}
                            <div className="mb-5">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className={textMuted}>Topics from recent calls ({kbGaps.totalTopics} total)</span>
                                    <span className={textSecondary}>{kbGaps.coveredTopics}/{kbGaps.totalTopics} covered · {kbGaps.kbArticleCount} KB articles</span>
                                </div>
                                <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-white/10" : "bg-gray-100")}>
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            kbGaps.coverageScore >= 0.7 ? "bg-green-500" : kbGaps.coverageScore >= 0.4 ? "bg-amber-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${Math.round(kbGaps.coverageScore * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Gaps list */}
                            {kbGaps.gaps.length === 0 ? (
                                <div className="flex items-center gap-2 py-3">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className={cn("text-sm", textSecondary)}>All frequent topics are covered by your KB articles.</span>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertOctagon className="w-4 h-4 text-amber-400" />
                                        <span className={cn("text-sm font-medium", textSecondary)}>
                                            {kbGaps.gaps.length} topic{kbGaps.gaps.length !== 1 ? 's' : ''} not covered
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {kbGaps.gaps.slice(0, 10).map((gap) => (
                                            <div
                                                key={gap.topic}
                                                className={cn("flex items-center justify-between rounded-lg px-3 py-2", isDark ? "bg-white/[0.04]" : "bg-gray-50")}
                                            >
                                                <span className={cn("text-sm font-medium truncate max-w-[60%]", textPrimary)}>{gap.topic}</span>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className={cn("text-xs", textMuted)}>{gap.occurrences} unresolved call{gap.occurrences !== 1 ? 's' : ''}</span>
                                                    <span className={cn(
                                                        "text-xs px-1.5 py-0.5 rounded font-mono",
                                                        gap.coverage === 0
                                                            ? "bg-red-500/10 text-red-400"
                                                            : "bg-amber-500/10 text-amber-400"
                                                    )}>
                                                        {Math.round(gap.coverage * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
