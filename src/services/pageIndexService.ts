import { supabase } from '../config/supabase';

// All PageIndex and Groq calls are proxied through the api-page-index edge function.
// Keys are stored server-side only — never in the frontend bundle.
const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-page-index`;

export interface PageIndexNode {
    title?: string;
    node_id?: string;
    page_index?: number;
    page_number?: number;
    line_num?: number;
    summary?: string;
    text?: string;
    nodes?: PageIndexNode[];
}

export interface TreeResponse {
    status: 'completed' | 'processing' | 'failed' | 'queued';
    result?: PageIndexNode[];
    doc_id: string;
    retrieval_ready?: boolean;
}

interface OcrPage {
    page_index: number;
    markdown: string;
    images?: string[];
}

async function getAuthHeader(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    return `Bearer ${session.access_token}`;
}

class PageIndexService {
    private treeCache = new Map<string, PageIndexNode[]>();
    private ocrCache = new Map<string, OcrPage[] | string>();

    private async fetchTreeStatus(docId: string): Promise<TreeResponse> {
        const auth = await getAuthHeader();
        const params = new URLSearchParams({ type: 'tree', summary: 'true' });
        const res = await fetch(`${EDGE_BASE}/doc/${docId}?${params}`, {
            headers: { Authorization: auth },
        });
        if (!res.ok) throw new Error(`PageIndex status fetch failed: ${res.status}`);
        const data = await res.json();

        const tree =
            (Array.isArray(data) && data) ||
            (Array.isArray(data?.result) && data.result) ||
            (Array.isArray(data?.tree) && data.tree) ||
            (Array.isArray(data?.result?.tree) && data.result.tree) ||
            null;

        if (tree) {
            return { doc_id: docId, status: 'completed', result: tree, retrieval_ready: true };
        }
        if (data?.status) return data as TreeResponse;
        return {
            doc_id: docId,
            status: data?.result ? 'completed' : 'processing',
            result: data?.result,
        } as TreeResponse;
    }

    /**
     * Submits a PDF to PageIndex for indexing
     */
    async submitDocument(file: File): Promise<string> {
        const auth = await getAuthHeader();
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${EDGE_BASE}/doc`, {
            method: 'POST',
            headers: { Authorization: auth },
            body: formData,
        });
        if (!res.ok) throw new Error(`Document submit failed: ${res.status}`);
        const data = await res.json();
        if (!data?.doc_id) throw new Error('Failed to get doc_id from PageIndex');
        return data.doc_id;
    }

    /**
     * Polls the tree status until completed or failed
     */
    async pollTreeStatus(docId: string, onProgress?: (status: string) => void): Promise<PageIndexNode[]> {
        const maxAttempts = 72; // 6 minutes with 5s interval
        const pollInterval = 5000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const treeResponse = await this.fetchTreeStatus(docId);
            const status = treeResponse.status;

            if (treeResponse.result && treeResponse.result.length > 0) {
                this.treeCache.set(docId, treeResponse.result);
                return treeResponse.result || [];
            } else if (status === 'failed') {
                throw new Error('PageIndex processing failed');
            }

            const readyHint = treeResponse.retrieval_ready ? ' (retrieval ready)' : '';
            onProgress?.(`${status}${readyHint}`);
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error('Indexing timed out');
    }

    /**
     * Fetch tree once (no polling). Uses cache when available.
     */
    async getTree(docId: string): Promise<PageIndexNode[]> {
        const cached = this.treeCache.get(docId);
        if (cached) return cached;

        const treeResponse = await this.fetchTreeStatus(docId);
        if (treeResponse.result && treeResponse.result.length > 0) {
            this.treeCache.set(docId, treeResponse.result);
            return treeResponse.result;
        }
        if (treeResponse.status === 'failed') throw new Error('PageIndex processing failed');
        throw new Error(`PageIndex status: ${treeResponse.status}`);
    }

    /**
     * Fetch OCR results (page/node/raw).
     */
    async getOcr(docId: string, format: 'page' | 'node' | 'raw' = 'page'): Promise<OcrPage[] | string> {
        const cacheKey = `${docId}:${format}`;
        const cached = this.ocrCache.get(cacheKey);
        if (cached) return cached;

        const auth = await getAuthHeader();
        const params = new URLSearchParams({ type: 'ocr', format });
        const res = await fetch(`${EDGE_BASE}/doc/${docId}?${params}`, {
            headers: { Authorization: auth },
        });
        if (!res.ok) throw new Error(`OCR fetch failed: ${res.status}`);
        const data = await res.json();
        const result = (Array.isArray(data) ? data : data?.result ?? data) as OcrPage[] | string;
        this.ocrCache.set(cacheKey, result);
        return result;
    }

    /**
     * Chat with Groq using the flattened tree as context
     */
    async chatWithDocument(
        question: string,
        treeNodes: PageIndexNode[],
        history: { role: string; content: string }[] = [],
        options?: { docId?: string }
    ): Promise<string> {
        const auth = await getAuthHeader();
        const flattenedTree = this.flattenTree(treeNodes);
        const treeTextChars = this.countTextChars(treeNodes);
        let ocrContext = '';

        if (options?.docId && treeTextChars < 200) {
            try {
                const matches = await this.searchOcrPages(options.docId, question, 4);
                if (matches.length > 0) {
                    ocrContext = matches.map(m => `[Page ${m.page_index}] ${m.excerpt}`).join('\n');
                } else {
                    const raw = await this.getOcr(options.docId, 'raw');
                    if (typeof raw === 'string' && raw.trim().length > 0) {
                        ocrContext = raw.substring(0, 4000);
                    }
                }
            } catch {
                // Ignore OCR fallback errors, continue with tree only
            }
        }

        const systemPrompt = `You are a helpful document assistant.
You have been given a structured index tree extracted from a PDF document.
Each node contains a title, the page number, and a short content excerpt.

Rules:
- Answer only from the provided document tree.
- Always cite the relevant page number(s).
- If the answer is not in the tree, say so clearly.
- Be concise and precise.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: `Here is the indexed structure of the document:\n\n${flattenedTree}\n\n${ocrContext ? `Additional OCR content (page-based):\n${ocrContext}\n\n` : ''}I will now ask questions about this document.`
            },
            { role: 'assistant', content: "Got it! I've read the full index. Ask me anything." },
            ...history,
            { role: 'user', content: question }
        ];

        const res = await fetch(`${EDGE_BASE}/chat`, {
            method: 'POST',
            headers: { Authorization: auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.3,
                max_tokens: 1024,
            }),
        });
        if (!res.ok) throw new Error(`Groq chat failed: ${res.status}`);
        const data = await res.json();
        return data.choices[0].message.content;
    }

    /**
     * Flattens the tree for LLM context
     */
    private flattenTree(nodes: PageIndexNode[], depth: number = 0): string {
        let result = '';
        for (const node of nodes) {
            const indent = '  '.repeat(depth);
            const excerptSource = node.summary || node.text || '';
            const excerpt = excerptSource
                ? (excerptSource.length > 300 ? excerptSource.substring(0, 300) + '...' : excerptSource)
                : '';
            const pageLabel = typeof node.page_index === 'number'
                ? `Page ${node.page_index}`
                : typeof node.page_number === 'number'
                    ? `Page ${node.page_number}`
                    : typeof node.line_num === 'number'
                        ? `Line ${node.line_num}`
                        : 'Location ?';
            const title = node.title || node.node_id || 'Untitled';
            result += `${indent}[${pageLabel}] ${title}\n`;
            if (excerpt) result += `${indent}  → ${excerpt}\n`;
            if (node.nodes && node.nodes.length > 0) {
                result += this.flattenTree(node.nodes, depth + 1);
            }
        }
        return result;
    }

    /**
     * Count total text characters in the tree (summary/text).
     */
    private countTextChars(nodes: PageIndexNode[]): number {
        let count = 0;
        for (const node of nodes) {
            const text = node.summary || node.text || '';
            count += text.length;
            if (node.nodes && node.nodes.length > 0) {
                count += this.countTextChars(node.nodes);
            }
        }
        return count;
    }

    /**
     * Search the tree for a query (simple keyword match).
     */
    searchTree(nodes: PageIndexNode[], query: string, limit: number = 5): Array<{
        title: string;
        page_label: string;
        excerpt: string;
        score: number;
    }> {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        if (terms.length === 0) return [];

        const results: Array<{ score: number; node: PageIndexNode }> = [];

        const scoreNode = (node: PageIndexNode): number => {
            const hay = `${node.title ?? ''} ${node.summary ?? ''} ${node.text ?? ''} ${node.node_id ?? ''}`.toLowerCase();
            let score = 0;
            for (const term of terms) {
                if (hay.includes(term)) score += 1;
            }
            return score;
        };

        const walk = (node: PageIndexNode) => {
            const score = scoreNode(node);
            if (score > 0) results.push({ score, node });
            if (node.nodes && node.nodes.length > 0) node.nodes.forEach(walk);
        };

        nodes.forEach(walk);

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(({ score, node }) => {
                const pageLabel = typeof node.page_index === 'number'
                    ? `Page ${node.page_index}`
                    : typeof node.page_number === 'number'
                        ? `Page ${node.page_number}`
                        : typeof node.line_num === 'number'
                            ? `Line ${node.line_num}`
                            : 'Location ?';
                const excerptSource = node.summary || node.text || '';
                const excerpt = excerptSource
                    ? (excerptSource.length > 240 ? `${excerptSource.substring(0, 240)}...` : excerptSource)
                    : '';
                return { title: node.title || node.node_id || 'Untitled', page_label: pageLabel, excerpt, score };
            });
    }

    /**
     * Search OCR page results for a query.
     */
    async searchOcrPages(docId: string, query: string, limit: number = 5): Promise<Array<{
        page_index: number;
        excerpt: string;
        score: number;
    }>> {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        if (terms.length === 0) return [];

        const ocr = await this.getOcr(docId, 'page');
        if (!Array.isArray(ocr)) return [];

        const scored = ocr.map((page) => {
            const hay = (page.markdown || '').toLowerCase();
            let score = 0;
            for (const term of terms) {
                if (hay.includes(term)) score += 1;
            }
            return { page, score };
        }).filter(item => item.score > 0);

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(({ page, score }) => ({
                page_index: page.page_index,
                excerpt: page.markdown.length > 400 ? `${page.markdown.substring(0, 400)}...` : page.markdown,
                score,
            }));
    }

    /**
     * Count total nodes in the tree
     */
    countNodes(nodes: PageIndexNode[]): number {
        let count = nodes.length;
        for (const node of nodes) {
            if (node.nodes) count += this.countNodes(node.nodes);
        }
        return count;
    }
}

export const pageIndexService = new PageIndexService();
