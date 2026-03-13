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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { ragService, UploadedDocument, DocumentChunk, ProcessingProgress } from '../../services/ragService';
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

const ACCEPTED_TYPES = '.pdf,.txt,.md,.csv,.docx';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ─── Main Component ──────────────────────────────────────────────
export default function DocumentsView({ isDark = true }: { isDark?: boolean }) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { knowledgeBase } = useDemoCall();

    const [documents, setDocuments] = useState<UploadedDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
    const [chunks, setChunks] = useState<DocumentChunk[]>([]);
    const [loadingChunks, setLoadingChunks] = useState(false);
    const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const kbId = knowledgeBase?.id || user?.id || '';

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

    // ─── Upload handler ───────────────────────────────────────
    const handleUpload = useCallback(async (file: File) => {
        if (!user?.id || !kbId) return;

        if (file.size > MAX_FILE_SIZE) {
            alert(`File too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}.`);
            return;
        }

        setProcessingProgress({
            stage: 'uploading',
            current: 0,
            total: 1,
            message: 'Starting upload...',
        });

        const result = await ragService.processDocument(
            file,
            kbId,
            user.id,
            (progress) => setProcessingProgress(progress),
        );

        if (result) {
            // Refresh list
            await loadDocuments();
        }

        // Clear progress after a delay
        setTimeout(() => setProcessingProgress(null), 3000);
    }, [user?.id, kbId, loadDocuments]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        e.target.value = '';
    };

    // ─── Drag & drop ──────────────────────────────────────────
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    // ─── Expand / view chunks ─────────────────────────────────
    const toggleExpand = async (docId: string) => {
        if (expandedDocId === docId) {
            setExpandedDocId(null);
            setChunks([]);
            return;
        }

        setExpandedDocId(docId);
        setLoadingChunks(true);
        const docChunks = await ragService.getDocumentChunks(docId);
        setChunks(docChunks);
        setLoadingChunks(false);
    };

    // ─── Delete ───────────────────────────────────────────────
    const handleDelete = async (docId: string) => {
        if (!user?.id) return;
        const success = await ragService.deleteDocument(docId, user.id);
        if (success) {
            setDocuments(prev => prev.filter(d => d.id !== docId));
            if (expandedDocId === docId) {
                setExpandedDocId(null);
                setChunks([]);
            }
        }
        setDeleteConfirmId(null);
    };

    // ─── Styles ───────────────────────────────────────────────
    const cardBg = isDark ? 'bg-white/5 backdrop-blur-md border-white/10' : 'bg-white border-gray-200';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-white/60' : 'text-gray-500';
    const textMuted = isDark ? 'text-white/40' : 'text-gray-400';

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
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
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!!processingProgress && processingProgress.stage !== 'done' && processingProgress.stage !== 'error'}
                    className={cn(
                        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border shadow-sm",
                        "bg-gradient-to-r from-[#FF8A5B] via-[#FF9E6C] to-[#FFB286] text-white border-[#FF8A5B]/30",
                        "hover:from-[#FF9E6C] hover:via-[#FF8A5B] hover:to-[#FFB286] hover:shadow-md hover:-translate-y-0.5",
                        "disabled:opacity-50 disabled:pointer-events-none"
                    )}
                >
                    <Upload className="w-4 h-4" />
                    {t('kbDocs.upload')}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                    if (!processingProgress || processingProgress.stage === 'done' || processingProgress.stage === 'error') {
                        fileInputRef.current?.click();
                    }
                }}
                className={cn(
                    "relative rounded-xl border-2 border-dashed p-8 transition-all duration-200 cursor-pointer",
                    isDragging
                        ? "border-[#FF8A5B] bg-[#FF8A5B]/10 scale-[1.01]"
                        : isDark
                            ? "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-sm"
                            : "border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50",
                )}
            >
                {/* Processing Progress Overlay */}
                {processingProgress && processingProgress.stage !== 'done' && processingProgress.stage !== 'error' && (
                    <div className="absolute inset-0 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-3 text-center px-6">
                            <Loader2 className="w-8 h-8 text-[#FFB286] animate-spin" />
                            <p className="text-white font-medium text-sm">{processingProgress.message}</p>
                            {processingProgress.total > 1 && (
                                <div className="w-48">
                                    <div className={cn("h-1.5 rounded-full overflow-hidden", isDark ? "bg-white/10" : "bg-gray-200")}>
                                        <div
                                            className="h-full bg-gradient-to-r from-[#FF8A5B] via-[#FF9E6C] to-[#FFB286] rounded-full transition-all duration-300"
                                            style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-white/60 text-xs mt-1.5">
                                        {processingProgress.current} / {processingProgress.total}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Success overlay */}
                {processingProgress?.stage === 'done' && (
                    <div className="absolute inset-0 rounded-xl bg-[#FF8A5B]/10 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex items-center gap-2 text-[#FFB286]">
                            <CheckCircle className="w-6 h-6" />
                            <span className="font-medium">{processingProgress.message}</span>
                        </div>
                    </div>
                )}

                {/* Error overlay */}
                {processingProgress?.stage === 'error' && (
                    <div className="absolute inset-0 rounded-xl bg-red-500/10 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-6 h-6" />
                            <span className="font-medium text-sm">{processingProgress.message}</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center gap-3">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border",
                        isDark
                            ? "bg-white/5 border-white/10"
                            : "bg-gray-100 border-gray-200"
                    )}>
                        <UploadCloud className={cn("w-7 h-7", isDark ? "text-white/40" : "text-gray-400")} />
                    </div>
                    <div className="text-center">
                        <p className={cn("text-sm font-medium", textPrimary)}>
                            {t('kbDocs.dropzone')}
                        </p>
                        <p className={cn("text-xs mt-1", textMuted)}>
                            PDF, TXT, MD, CSV, DOCX &middot; Max {formatBytes(MAX_FILE_SIZE)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Documents List */}
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
                    {documents.map((doc) => (
                        <div key={doc.id}>
                            {/* Document Row */}
                            <div className={cn(
                                "rounded-xl border p-4 transition-all duration-200",
                                cardBg,
                                expandedDocId === doc.id && (isDark ? "ring-1 ring-[#FF8A5B]/30" : "ring-1 ring-[#FF8A5B]/30")
                            )}>
                                <div className="flex items-center gap-4">
                                    {/* Expand toggle */}
                                    <button
                                        onClick={() => toggleExpand(doc.id)}
                                        className={cn(
                                            "p-1 rounded-md transition-colors cursor-pointer",
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
                                        "w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0",
                                        isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
                                    )}>
                                        {getFileIcon(doc.file_type)}
                                    </div>

                                    {/* File info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm font-medium truncate", textPrimary)}>
                                            {doc.file_name}
                                        </p>
                                        <div className={cn("flex items-center gap-3 mt-0.5 text-xs", textMuted)}>
                                            <span>{formatBytes(doc.file_size)}</span>
                                            <span>&middot;</span>
                                            <span className="uppercase">{doc.file_type}</span>
                                            <span>&middot;</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {timeAgo(doc.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    <div className="flex items-center gap-3">
                                        {doc.status === 'ready' && (
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                    "bg-[#FF8A5B]/10 text-[#FFB286] border border-[#FF8A5B]/20"
                                                )}>
                                                    <CheckCircle className="w-3 h-3" />
                                                    {t('kbDocs.ready')}
                                                </span>
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                                                    isDark ? "bg-white/5 text-white/60" : "bg-gray-100 text-gray-600"
                                                )}>
                                                    <Layers className="w-3 h-3" />
                                                    {doc.chunk_count} {t('kbDocs.chunks')}
                                                </span>
                                            </div>
                                        )}
                                        {doc.status === 'processing' && (
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                "bg-[#FFB286]/10 text-[#FFB286] border border-[#FF8A5B]/20"
                                            )}>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                {t('kbDocs.processing')}
                                            </span>
                                        )}
                                        {doc.status === 'error' && (
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                "bg-red-500/10 text-red-400 border border-red-500/20"
                                            )}>
                                                <AlertCircle className="w-3 h-3" />
                                                {t('kbDocs.error')}
                                            </span>
                                        )}

                                        {/* Delete button */}
                                        {deleteConfirmId === doc.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                                                >
                                                    Confirm
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
                                                    "p-2 rounded-lg transition-colors cursor-pointer",
                                                    isDark
                                                        ? "text-white/30 hover:text-red-400 hover:bg-red-500/10"
                                                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                )}
                                            >
                                                <Trash2 className="w-4 h-4" />
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

                            {/* Expanded Chunks */}
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
                                            <div className={cn("flex items-center gap-4 text-xs pb-3 border-b", isDark ? "border-white/5" : "border-gray-200")}>
                                                <span className={textSecondary}>
                                                    <strong className={textPrimary}>{doc.chunk_count}</strong> chunks
                                                </span>
                                                <span className={textSecondary}>
                                                    <strong className={textPrimary}>{doc.total_tokens?.toLocaleString()}</strong> words
                                                </span>
                                                <span className={cn("uppercase text-[10px] font-mono px-1.5 py-0.5 rounded", isDark ? "bg-white/5" : "bg-gray-200")}>
                                                    {doc.file_type}
                                                </span>
                                            </div>

                                            {loadingChunks ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className={cn("w-5 h-5 animate-spin", textMuted)} />
                                                </div>
                                            ) : chunks.length === 0 ? (
                                                <p className={cn("text-sm text-center py-6", textMuted)}>
                                                    No chunks found
                                                </p>
                                            ) : (
                                                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                                                    {chunks.map((chunk, idx) => (
                                                        <div
                                                            key={chunk.id}
                                                                className={cn(
                                                                    "rounded-lg border p-3 transition-colors",
                                                                    isDark
                                                                    ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
                                                                    : "bg-white border-gray-200 hover:bg-gray-50"
                                                                )}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <span className={cn(
                                                                    "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold",
                                                                    isDark ? "bg-[#FF8A5B]/10 text-[#FFB286]" : "bg-orange-50 text-orange-600"
                                                                )}>
                                                                    {idx + 1}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={cn(
                                                                        "text-xs leading-relaxed line-clamp-4",
                                                                        isDark ? "text-white/70" : "text-gray-600"
                                                                    )}>
                                                                        {chunk.content}
                                                                    </p>
                                                                    <p className={cn("text-[10px] mt-1.5", textMuted)}>
                                                                        {chunk.content.split(/\s+/).length} words
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
