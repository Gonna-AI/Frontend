import { pipeline } from '@xenova/transformers';
import { supabase } from '../config/supabase';
import { logActivity } from './activityLogger';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Types for document management
export interface UploadedDocument {
    id: string;
    user_id: string;
    kb_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    storage_path: string | null;
    pageindex_doc_id?: string | null;
    status: 'processing' | 'ready' | 'error';
    error_message: string | null;
    chunk_count: number;
    total_tokens: number;
    summary: string | null;
    created_at: string;
    updated_at: string;
}

export interface DocumentChunk {
    id: string;
    content: string;
    metadata: Record<string, unknown>;
    chunk_index: number;
    created_at: string;
}

export interface ProcessingProgress {
    stage: 'uploading' | 'extracting' | 'chunking' | 'embedding' | 'storing' | 'done' | 'error';
    current: number;
    total: number;
    message: string;
}

class RAGService {
    private isInitializing = false;
    private generator: any = null;

    async initialize() {
        if (this.generator) return;
        if (this.isInitializing) {
            while (this.isInitializing) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            return;
        }

        try {
            this.isInitializing = true;
            // Feature extraction pipeline uses Supabase/gte-small by default
            this.generator = await pipeline('feature-extraction', 'Supabase/gte-small', {
                quantized: true
            });
            console.log('✅ RAG Embedding model loaded successfully');
        } catch (error) {
            console.error('Failed to load embedding model:', error);
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
        if (!this.generator) {
            await this.initialize();
        }

        const output = await this.generator(text, {
            pooling: 'mean',
            normalize: true,
        });

        return Array.from(output.data);
    }

    async storeDocument(kbId: string, content: string, metadata: any = {}) {
        try {
            const embedding = await this.generateEmbedding(content);

            const { error } = await supabase
                .from('kb_documents')
                .insert({
                    kb_id: kbId,
                    content,
                    metadata,
                    embedding,
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to store document embedding:', error);
            return false;
        }
    }

    async searchRelevantContext(query: string, kbId: string, limit: number = 3): Promise<string[]> {
        try {
            const queryEmbedding = await this.generateEmbedding(query);

            const { data, error } = await supabase
                .rpc('match_kb_documents', {
                    query_embedding: queryEmbedding,
                    match_kb_id: kbId,
                    match_threshold: 0.70,
                    match_count: limit,
                });

            if (error) {
                console.error('Supabase RPC Error using vector match', error);
                return [];
            }

            return data.map((doc: any) => doc.content);
        } catch (error) {
            console.error('Failed to search relevant context:', error);
            return [];
        }
    }

    // ─── Legacy word-based chunking (kept for backwards compatibility) ───
    chunkText(text: string, maxWords: number = 250): string[] {
        const words = text.split(/\s+/);
        const chunks: string[] = [];
        let currentChunk: string[] = [];

        for (let i = 0; i < words.length; i++) {
            currentChunk.push(words[i]);
            if (currentChunk.length >= maxWords) {
                chunks.push(currentChunk.join(' '));
                currentChunk = words.slice(Math.max(0, i - 19), i + 1);
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.join(' '));
        }

        return chunks;
    }

    // ─── Smart sentence-aware chunking ──────────────────────────────
    smartChunkText(text: string, maxWords: number = 300, overlapWords: number = 50): string[] {
        // Split into sentences (handles ., !, ?, and newlines as boundaries)
        const sentences = text
            .replace(/\r\n/g, '\n')
            .split(/(?<=[.!?])\s+|\n{2,}/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (sentences.length === 0) return [];

        const chunks: string[] = [];
        let currentSentences: string[] = [];
        let currentWordCount = 0;

        for (const sentence of sentences) {
            const sentenceWords = sentence.split(/\s+/).length;

            // If adding this sentence exceeds the limit and we have content, flush
            if (currentWordCount + sentenceWords > maxWords && currentSentences.length > 0) {
                chunks.push(currentSentences.join(' '));

                // Keep overlap: take sentences from the end that fit within overlapWords
                const overlapSentences: string[] = [];
                let overlapCount = 0;
                for (let i = currentSentences.length - 1; i >= 0; i--) {
                    const words = currentSentences[i].split(/\s+/).length;
                    if (overlapCount + words > overlapWords) break;
                    overlapSentences.unshift(currentSentences[i]);
                    overlapCount += words;
                }

                currentSentences = overlapSentences;
                currentWordCount = overlapCount;
            }

            currentSentences.push(sentence);
            currentWordCount += sentenceWords;
        }

        // Flush remaining
        if (currentSentences.length > 0) {
            const finalChunk = currentSentences.join(' ');
            // Avoid duplicate of last chunk
            if (chunks.length === 0 || finalChunk !== chunks[chunks.length - 1]) {
                chunks.push(finalChunk);
            }
        }

        return chunks;
    }

    // ─── Full document processing pipeline (server-side via Edge Function) ──
    async processDocument(
        file: File,
        kbId: string,
        userId: string,
        onProgress?: (progress: ProcessingProgress) => void,
        pageIndexDocId?: string,
    ): Promise<UploadedDocument | null> {
        const fileType = file.name.split('.').pop()?.toLowerCase() || 'txt';
        let documentRecord: UploadedDocument | null = null;

        try {
            // Stage 1: Upload to Supabase Storage
            onProgress?.({ stage: 'uploading', current: 0, total: 1, message: 'Uploading file...' });

            // Sanitize file name to avoid Invalid Key errors from Supabase Storage
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
            const storagePath = `${userId}/${Date.now()}-${sanitizedFileName}`;
            const { error: uploadErr } = await supabase.storage
                .from('kb-documents')
                .upload(storagePath, file, {
                    contentType: file.type || 'application/octet-stream',
                    upsert: false,
                });

            if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

            // Stage 2: Create document record
            const { data: docData, error: docErr } = await supabase
                .from('kb_uploaded_documents')
                .insert({
                    user_id: userId,
                    kb_id: kbId,
                    file_name: file.name,
                    file_type: fileType,
                    file_size: file.size,
                    storage_path: storagePath,
                    status: 'processing',
                    ...(pageIndexDocId ? { pageindex_doc_id: pageIndexDocId } : {}),
                })
                .select()
                .single();

            if (docErr || !docData) throw new Error(`Record creation failed: ${docErr?.message}`);
            documentRecord = docData as UploadedDocument;

            // Stage 3: Process server-side (extract → chunk → embed → store)
            onProgress?.({ stage: 'embedding', current: 0, total: 1, message: 'Processing document...' });

            let extractedRawText = '';
            try {
                if (['txt', 'md', 'csv'].includes(fileType)) {
                    extractedRawText = await file.text();
                }
            } catch (extractorErr) {
                console.warn("Frontend extraction warning, server will fallback:", extractorErr);
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('No active session — please sign in again');
            }

            const requestBody = JSON.stringify({
                documentId: documentRecord.id,
                storagePath,
                fileType,
                fileName: file.name,
                kbId,
                rawText: extractedRawText ? extractedRawText : undefined,
            });

            // Retry logic for transient edge function errors (e.g. 546 boot failures)
            const MAX_RETRIES = 3;
            let response: Response | null = null;
            let result: any;

            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                try {
                    response = await fetch(`${SUPABASE_URL}/functions/v1/api-documents/process-document`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`,
                        },
                        body: requestBody,
                    });

                    // Parse response safely
                    const responseText = await response.text();
                    try {
                        result = JSON.parse(responseText);
                    } catch {
                        console.error('Edge function returned non-JSON:', responseText.substring(0, 200));
                        // Retry on non-JSON responses (boot failures return HTML/text)
                        if (attempt < MAX_RETRIES - 1) {
                            console.warn(`Retrying edge function call (attempt ${attempt + 2}/${MAX_RETRIES})...`);
                            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                            continue;
                        }
                        throw new Error(`Server returned an unexpected response (status ${response.status})`);
                    }

                    // Retry on 5xx errors (including 546 boot failures)
                    if (response.status >= 500 && attempt < MAX_RETRIES - 1) {
                        console.warn(`Edge function returned ${response.status}, retrying (attempt ${attempt + 2}/${MAX_RETRIES})...`);
                        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                        continue;
                    }

                    break; // Success or non-retryable error
                } catch (fetchErr) {
                    if (attempt < MAX_RETRIES - 1) {
                        console.warn(`Fetch failed, retrying (attempt ${attempt + 2}/${MAX_RETRIES})...`, fetchErr);
                        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                        continue;
                    }
                    throw fetchErr;
                }
            }

            if (!response || !response.ok) {
                throw new Error(result?.error || `Processing failed (status ${response?.status})`);
            }

            // Stage 4: Done
            onProgress?.({
                stage: 'done',
                current: result.chunk_count || 0,
                total: result.total_chunks || 0,
                message: `Processed ${result.chunk_count} chunks successfully`,
            });

            // Refresh the document record
            const { data: updatedDoc } = await supabase
                .from('kb_uploaded_documents')
                .select('*')
                .eq('id', documentRecord.id)
                .single();

            // Fire-and-forget: sync documents to ElevenLabs agent KB
            this.syncKbToElevenLabs(kbId).catch(() => {/* already logged inside */});

            logActivity({ event_type: 'documents', action: 'document_uploaded', description: `Document "${file.name}" uploaded`, metadata: { document_id: documentRecord.id, file_size: file.size } }).catch(() => {});

            return (updatedDoc as UploadedDocument) || documentRecord;

        } catch (error) {
            console.error('Document processing failed:', error);

            // Update document record to error status
            if (documentRecord?.id) {
                await supabase
                    .from('kb_uploaded_documents')
                    .update({
                        status: 'error',
                        error_message: error instanceof Error ? error.message : 'Unknown error',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', documentRecord.id);
            }

            onProgress?.({
                stage: 'error',
                current: 0,
                total: 0,
                message: error instanceof Error ? error.message : 'Processing failed',
            });

            return null;
        }
    }

    // ─── Fetch user's uploaded documents ─────────────────────────────
    async getDocuments(userId: string): Promise<UploadedDocument[]> {
        const { data, error } = await supabase
            .from('kb_uploaded_documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch documents:', error);
            return [];
        }

        return (data ?? []) as UploadedDocument[];
    }

    // ─── Fetch latest PageIndex-enabled document (optionally by name) ────────
    async getLatestPageIndexDocument(kbId: string, documentName?: string): Promise<UploadedDocument | null> {
        let query = supabase
            .from('kb_uploaded_documents')
            .select('*')
            .eq('kb_id', kbId);

        if (documentName && documentName.trim()) {
            query = query.ilike('file_name', `%${documentName.trim()}%`);
        } else {
            query = query.not('pageindex_doc_id', 'is', null);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Failed to fetch PageIndex document:', error);
            return null;
        }

        return (data && data.length > 0 ? data[0] : null) as UploadedDocument | null;
    }

    // ─── Update PageIndex doc ID for an uploaded document ───────────────────
    async setPageIndexDocId(documentId: string, pageIndexDocId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('kb_uploaded_documents')
                .update({
                    pageindex_doc_id: pageIndexDocId,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', documentId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to update PageIndex doc ID:', error);
            return false;
        }
    }

    // ─── Fetch chunks for a specific document ────────────────────────
    async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
        const { data, error } = await supabase
            .from('kb_documents')
            .select('id, content, metadata, chunk_index, created_at')
            .eq('document_id', documentId)
            .order('chunk_index', { ascending: true });

        if (error) {
            console.error('Failed to fetch document chunks:', error);
            return [];
        }

        return (data ?? []) as DocumentChunk[];
    }

    // ─── Delete a document and its chunks ────────────────────────────
    async deleteDocument(documentId: string, userId: string): Promise<boolean> {
        try {
            // Get storage path before deleting
            const { data: doc } = await supabase
                .from('kb_uploaded_documents')
                .select('storage_path, kb_id')
                .eq('id', documentId)
                .eq('user_id', userId)
                .single();

            // Delete chunks
            await supabase
                .from('kb_documents')
                .delete()
                .eq('document_id', documentId);

            // Delete from storage
            if (doc?.storage_path) {
                await supabase.storage
                    .from('kb-documents')
                    .remove([doc.storage_path]);
            }

            // Delete parent record
            const { error } = await supabase
                .from('kb_uploaded_documents')
                .delete()
                .eq('id', documentId)
                .eq('user_id', userId);

            if (error) throw error;

            // Sync updated KB to ElevenLabs (fire-and-forget, non-blocking)
            if ((doc as any)?.kb_id) {
                this.syncKbToElevenLabs((doc as any).kb_id).catch(() => {/* already logged inside */});
            }

            logActivity({ event_type: 'documents', action: 'document_deleted', description: 'Document deleted from knowledge base', metadata: { document_id: documentId } }).catch(() => {});

            return true;
        } catch (error) {
            console.error('Failed to delete document:', error);
            return false;
        }
    }

    // ─── Sync documents to ElevenLabs agent KB ───────────────────────
    async syncKbToElevenLabs(kbId: string): Promise<void> {
        try {
            const res = await fetch('/api/elevenlabs-kb-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kbId }),
            });
            if (!res.ok) {
                const err = await res.text();
                console.warn('[ragService] ElevenLabs KB sync failed (non-fatal):', err);
            } else {
                const data = await res.json();
                console.log(`[ragService] ElevenLabs KB synced: ${data.chunks_synced ?? 0} chunks`);
            }
        } catch (e) {
            // Non-fatal — voice KB sync failure should never break the document upload UX
            console.warn('[ragService] ElevenLabs KB sync error (non-fatal):', e);
        }
    }
}

export const ragService = new RAGService();
