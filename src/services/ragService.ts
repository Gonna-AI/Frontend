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

    // ─── Full document processing pipeline ──────────────────────────
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

            // Stage 3: Extract text
            onProgress?.({ stage: 'extracting', current: 0, total: 1, message: 'Extracting text...' });

            let text = '';

            if (['txt', 'md', 'csv'].includes(fileType)) {
                // Client-side text reading for simple formats
                text = await file.text();
            } else {
                // Use Edge Function for PDF and other complex formats
                const { data: { session } } = await supabase.auth.getSession();
                const response = await fetch(`${SUPABASE_URL}/functions/v1/api-documents/extract-text`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`,
                    },
                    body: JSON.stringify({ storagePath, fileType }),
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(`Text extraction failed: ${(err as any).error || response.statusText}`);
                }

                const result = await response.json();
                text = result.text;
            }

            if (!text || text.trim().length === 0) {
                throw new Error('No text content could be extracted from the file');
            }

            // Stage 4: Smart chunking
            onProgress?.({ stage: 'chunking', current: 0, total: 1, message: 'Splitting into chunks...' });
            const chunks = this.smartChunkText(text, 300, 50);
            const totalTokens = text.split(/\s+/).length;

            // Stage 5: Generate embeddings and store chunks
            onProgress?.({ stage: 'embedding', current: 0, total: chunks.length, message: `Embedding 0/${chunks.length} chunks...` });

            for (let i = 0; i < chunks.length; i++) {
                onProgress?.({
                    stage: 'embedding',
                    current: i + 1,
                    total: chunks.length,
                    message: `Embedding ${i + 1}/${chunks.length} chunks...`,
                });

                const embedding = await this.generateEmbedding(chunks[i]);

                const { error: insertErr } = await supabase
                    .from('kb_documents')
                    .insert({
                        kb_id: kbId,
                        content: chunks[i],
                        metadata: {
                            source: file.name,
                            document_id: documentRecord.id,
                            chunk_index: i,
                            total_chunks: chunks.length,
                        },
                        embedding,
                        user_id: userId,
                        document_id: documentRecord.id,
                        chunk_index: i,
                    });

                if (insertErr) {
                    console.error(`Failed to store chunk ${i}:`, insertErr);
                }
            }

            // Stage 6: Update document record with final status
            onProgress?.({ stage: 'storing', current: chunks.length, total: chunks.length, message: 'Finalizing...' });

            const { data: updatedDoc, error: updateErr } = await supabase
                .from('kb_uploaded_documents')
                .update({
                    status: 'ready',
                    chunk_count: chunks.length,
                    total_tokens: totalTokens,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', documentRecord.id)
                .select()
                .single();

            if (updateErr) {
                console.error('Failed to update document status:', updateErr);
            }

            onProgress?.({ stage: 'done', current: chunks.length, total: chunks.length, message: 'Document processed successfully' });

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
