import { pipeline } from '@xenova/transformers';
import { supabase } from '../config/supabase';

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
                    metadata: metadata, // Postgrest handles JSON serialization automatically if it's a JS object, or we can use JSON.stringify
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
                    match_threshold: 0.70, // Threshold
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

    // A helper method to split large texts into overlapping chunks
    chunkText(text: string, maxWords: number = 250): string[] {
        const words = text.split(/\s+/);
        const chunks = [];
        let currentChunk = [];

        for (let i = 0; i < words.length; i++) {
            currentChunk.push(words[i]);
            if (currentChunk.length >= maxWords) {
                chunks.push(currentChunk.join(' '));
                // Add an overlap of 20 words
                currentChunk = words.slice(Math.max(0, i - 19), i + 1);
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.join(' '));
        }

        return chunks;
    }
}

export const ragService = new RAGService();
