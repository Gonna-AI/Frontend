import { pipeline } from '@xenova/transformers';
import { supabase } from '../config/supabase';

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

    // ─── Friendly error messages for non-standard status codes ──
    private getProcessingErrorMessage(status: number, serverError?: string): string {
        if (serverError) return serverError;

        switch (true) {
            case status === 546:
                return 'Document processing timed out — the file may be too large. Try a smaller document.';
            case status >= 500 && status < 600:
                return 'Server encountered an error while processing your document. Please try again.';
            case status === 422:
                return 'No text content could be extracted from this file.';
            case status === 413:
                return 'File is too large for the server to process.';
            default:
                return `Processing failed (status ${status})`;
        }
    }

    // ─── Call edge function with retry for transient failures ──
    private async callProcessEndpoint(
        url: string,
        headers: Record<string, string>,
        body: string,
        maxRetries: number = 2,
    ): Promise<Response> {
        const retryableStatuses = new Set([546, 502, 503, 504]);
        let lastResponse: Response | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                lastResponse = await fetch(url, { method: 'POST', headers, body });

                if (lastResponse.ok || !retryableStatuses.has(lastResponse.status)) {
                    return lastResponse;
                }

                console.warn(
                    `Edge function returned ${lastResponse.status}, retrying (${attempt + 1}/${maxRetries})...`,
                );
            } catch (networkErr) {
                console.warn(`Network error on attempt ${attempt + 1}:`, networkErr);
                if (attempt === maxRetries) throw networkErr;
            }

            // Exponential backoff: 2s, 4s
            if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 2000 * Math.pow(2, attempt)));
            }
        }

        return lastResponse!;
    }

    // ─── Full document processing pipeline (server-side via Edge Function) ──
    async processDocument(
        file: File,
        kbId: string,
        userId: string,
        onProgress?: (progress: ProcessingProgress) => void,
    ): Promise<UploadedDocument | null> {
        const fileType = file.name.split('.').pop()?.toLowerCase() || 'txt';
        let documentRecord: UploadedDocument | null = null;

        try {
            // Stage 1: Upload to Supabase Storage
            onProgress?.({ stage: 'uploading', current: 0, total: 1, message: 'Uploading file...' });

            const storagePath = `${userId}/${Date.now()}-${file.name}`;
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
                })
                .select()
                .single();

            if (docErr || !docData) throw new Error(`Record creation failed: ${docErr?.message}`);
            documentRecord = docData as UploadedDocument;

            // Stage 3: Process server-side (extract → chunk → embed → store)
            onProgress?.({ stage: 'embedding', current: 0, total: 1, message: 'Processing document on server...' });

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('No active session — please sign in again');
            }

            const response = await this.callProcessEndpoint(
                `${SUPABASE_URL}/functions/v1/api-documents/process-document`,
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                JSON.stringify({
                    documentId: documentRecord.id,
                    storagePath,
                    fileType,
                    fileName: file.name,
                    kbId,
                }),
            );

            // Parse response safely
            const responseText = await response.text();
            let result: any;
            try {
                result = JSON.parse(responseText);
            } catch {
                console.error('Edge function returned non-JSON:', responseText.substring(0, 200));
                throw new Error(this.getProcessingErrorMessage(response.status));
            }

            if (!response.ok) {
                throw new Error(this.getProcessingErrorMessage(response.status, result.error));
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

    // ─── Retry processing for a failed document ──────────────────
    async retryDocument(
        documentId: string,
        userId: string,
        onProgress?: (progress: ProcessingProgress) => void,
    ): Promise<UploadedDocument | null> {
        try {
            // Fetch the existing document record
            const { data: doc, error: fetchErr } = await supabase
                .from('kb_uploaded_documents')
                .select('*')
                .eq('id', documentId)
                .eq('user_id', userId)
                .single();

            if (fetchErr || !doc) throw new Error('Document not found');
            if (doc.status !== 'error') throw new Error('Document is not in error state');

            // Reset status to processing
            await supabase
                .from('kb_uploaded_documents')
                .update({ status: 'processing', error_message: null, updated_at: new Date().toISOString() })
                .eq('id', documentId);

            onProgress?.({ stage: 'embedding', current: 0, total: 1, message: 'Retrying document processing...' });

            // Delete any previously stored chunks for this document
            await supabase.from('kb_documents').delete().eq('document_id', documentId);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('No active session — please sign in again');
            }

            const response = await this.callProcessEndpoint(
                `${SUPABASE_URL}/functions/v1/api-documents/process-document`,
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                JSON.stringify({
                    documentId: doc.id,
                    storagePath: doc.storage_path,
                    fileType: doc.file_type,
                    fileName: doc.file_name,
                    kbId: doc.kb_id,
                }),
            );

            const responseText = await response.text();
            let result: any;
            try {
                result = JSON.parse(responseText);
            } catch {
                throw new Error(this.getProcessingErrorMessage(response.status));
            }

            if (!response.ok) {
                throw new Error(this.getProcessingErrorMessage(response.status, result.error));
            }

            onProgress?.({
                stage: 'done',
                current: result.chunk_count || 0,
                total: result.total_chunks || 0,
                message: `Processed ${result.chunk_count} chunks successfully`,
            });

            const { data: updatedDoc } = await supabase
                .from('kb_uploaded_documents')
                .select('*')
                .eq('id', documentId)
                .single();

            return (updatedDoc as UploadedDocument) || null;

        } catch (error) {
            console.error('Document retry failed:', error);

            await supabase
                .from('kb_uploaded_documents')
                .update({
                    status: 'error',
                    error_message: error instanceof Error ? error.message : 'Retry failed',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', documentId);

            onProgress?.({
                stage: 'error',
                current: 0,
                total: 0,
                message: error instanceof Error ? error.message : 'Retry failed',
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
                .select('storage_path')
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
            return true;
        } catch (error) {
            console.error('Failed to delete document:', error);
            return false;
        }
    }
}

export const ragService = new RAGService();
