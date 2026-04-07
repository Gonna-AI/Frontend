import { supabase } from '../config/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const DOCS_FN = `${SUPABASE_URL}/functions/v1/api-documents`;

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

// ─── Helper: get auth token ───────────────────────────────────────
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
}

class RAGService {

    // ─── Store a single text chunk via edge function ──────────────
    async storeDocument(kbId: string, content: string, metadata: any = {}) {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const res = await fetch(`${DOCS_FN}/store-chunk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ kb_id: kbId, content, metadata }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error((err as any).error || 'Failed to store chunk');
            }
            return true;
        } catch (error) {
            console.error('Failed to store document embedding:', error);
            return false;
        }
    }

    // ─── Vector similarity search via edge function ───────────────
    async searchRelevantContext(query: string, kbId: string, limit: number = 3): Promise<string[]> {
        try {
            const token = await getAuthToken();

            const res = await fetch(`${DOCS_FN}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ query, kb_id: kbId, limit }),
            });

            if (!res.ok) return [];
            const json = await res.json();
            return (json as any).results ?? [];
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

            if (currentWordCount + sentenceWords > maxWords && currentSentences.length > 0) {
                chunks.push(currentSentences.join(' '));

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

        if (currentSentences.length > 0) {
            const finalChunk = currentSentences.join(' ');
            if (chunks.length === 0 || finalChunk !== chunks[chunks.length - 1]) {
                chunks.push(finalChunk);
            }
        }

        return chunks;
    }

    // ─── Full document processing pipeline ───────────────────────
    // Stage 1 (storage upload) stays on the client; stages 2-5 run server-side.
    async processDocument(
        file: File,
        kbId: string,
        userId: string,
        onProgress?: (progress: ProcessingProgress) => void,
        pageIndexDocId?: string,
    ): Promise<UploadedDocument | null> {
        const fileType = file.name.split('.').pop()?.toLowerCase() || 'txt';

        try {
            // Stage 1: Upload to Supabase Storage
            onProgress?.({ stage: 'uploading', current: 0, total: 1, message: 'Uploading file...' });

            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
            const storagePath = `${userId}/${Date.now()}-${sanitizedFileName}`;
            const { error: uploadErr } = await supabase.storage
                .from('kb-documents')
                .upload(storagePath, file, {
                    contentType: file.type || 'application/octet-stream',
                    upsert: false,
                });

            if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

            // Stage 2-5: Process server-side via edge function
            // The edge function creates the DB record, extracts text, chunks, embeds, and stores.
            onProgress?.({ stage: 'embedding', current: 0, total: 1, message: 'Processing document...' });

            const token = await getAuthToken();
            if (!token) throw new Error('No active session — please sign in again');

            const requestBody = JSON.stringify({
                storagePath,
                fileType,
                fileName: file.name,
                kbId,
                file_size: file.size,
                ...(pageIndexDocId ? { pageIndexDocId } : {}),
            });

            // Retry logic for transient edge function errors (e.g. 546 boot failures)
            const MAX_RETRIES = 3;
            let response: Response | null = null;
            let result: any;

            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                try {
                    response = await fetch(`${DOCS_FN}/process-document`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: requestBody,
                    });

                    const responseText = await response.text();
                    try {
                        result = JSON.parse(responseText);
                    } catch {
                        console.error('Edge function returned non-JSON:', responseText.substring(0, 200));
                        if (attempt < MAX_RETRIES - 1) {
                            console.warn(`Retrying edge function call (attempt ${attempt + 2}/${MAX_RETRIES})...`);
                            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                            continue;
                        }
                        throw new Error(`Server returned an unexpected response (status ${response.status})`);
                    }

                    if (response.status >= 500 && attempt < MAX_RETRIES - 1) {
                        console.warn(`Edge function returned ${response.status}, retrying (attempt ${attempt + 2}/${MAX_RETRIES})...`);
                        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                        continue;
                    }

                    break;
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

            onProgress?.({
                stage: 'done',
                current: result.chunk_count || 0,
                total: result.total_chunks || 0,
                message: `Processed ${result.chunk_count} chunks successfully`,
            });

            return (result.document as UploadedDocument) ?? null;

        } catch (error) {
            console.error('Document processing failed:', error);
            onProgress?.({
                stage: 'error',
                current: 0,
                total: 0,
                message: error instanceof Error ? error.message : 'Processing failed',
            });
            return null;
        }
    }

    // ─── Fetch user's uploaded documents ─────────────────────────
    async getDocuments(_userId: string): Promise<UploadedDocument[]> {
        try {
            const token = await getAuthToken();
            if (!token) return [];

            const res = await fetch(`${DOCS_FN}/documents`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) return [];
            const json = await res.json();
            return ((json as any).documents ?? []) as UploadedDocument[];
        } catch (error) {
            console.error('Failed to fetch documents:', error);
            return [];
        }
    }

    // ─── Fetch latest PageIndex-enabled document ──────────────────
    async getLatestPageIndexDocument(kbId: string, documentName?: string): Promise<UploadedDocument | null> {
        try {
            const token = await getAuthToken();
            const params = new URLSearchParams({ kb_id: kbId });
            if (documentName && documentName.trim()) {
                params.set('name', documentName.trim());
            }

            const res = await fetch(`${DOCS_FN}/latest-pageindex?${params}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });

            if (!res.ok) return null;
            const json = await res.json();
            return ((json as any).document ?? null) as UploadedDocument | null;
        } catch (error) {
            console.error('Failed to fetch PageIndex document:', error);
            return null;
        }
    }

    // ─── Update PageIndex doc ID for an uploaded document ────────
    async setPageIndexDocId(documentId: string, pageIndexDocId: string): Promise<boolean> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const res = await fetch(`${DOCS_FN}/documents/${documentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ pageindex_doc_id: pageIndexDocId }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error((err as any).error || 'Failed to update');
            }
            return true;
        } catch (error) {
            console.error('Failed to update PageIndex doc ID:', error);
            return false;
        }
    }

    // ─── Fetch chunks for a specific document ────────────────────
    async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
        try {
            const token = await getAuthToken();
            if (!token) return [];

            const res = await fetch(`${DOCS_FN}/${documentId}/chunks`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) return [];
            const json = await res.json();
            return ((json as any).chunks ?? []) as DocumentChunk[];
        } catch (error) {
            console.error('Failed to fetch document chunks:', error);
            return [];
        }
    }

    // ─── Delete a document and its chunks ────────────────────────
    async deleteDocument(documentId: string, _userId: string): Promise<boolean> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const res = await fetch(`${DOCS_FN}/documents/${documentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error((err as any).error || 'Delete failed');
            }
            return true;
        } catch (error) {
            console.error('Failed to delete document:', error);
            return false;
        }
    }
}

export const ragService = new RAGService();
