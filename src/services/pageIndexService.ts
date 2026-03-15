import axios from 'axios';

const PAGEINDEX_API_URL = 'https://api.pageindex.ai';
// Default to the keys provided in the reference script if not in env
const PAGEINDEX_API_KEY = import.meta.env.VITE_PAGEINDEX_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export interface PageIndexNode {
    title: string;
    page_index: number;
    text: string;
    nodes?: PageIndexNode[];
}

export interface TreeResponse {
    status: 'completed' | 'processing' | 'failed' | 'queued';
    result?: PageIndexNode[];
    doc_id: string;
}

class PageIndexService {
    private getPageIndexHeaders() {
        if (!PAGEINDEX_API_KEY) {
            throw new Error('Missing PageIndex API key');
        }
        return {
            'Authorization': `Bearer ${PAGEINDEX_API_KEY}`,
        };
    }

    private async fetchTreeStatus(docId: string): Promise<TreeResponse | PageIndexNode[] | null> {
        const headers = this.getPageIndexHeaders();
        const urls = [
            `${PAGEINDEX_API_URL}/doc/${docId}`,
            `${PAGEINDEX_API_URL}/doc/${docId}/tree/`,
            `${PAGEINDEX_API_URL}/doc/${docId}/tree`,
        ];

        let sawNotFound = false;
        for (const url of urls) {
            try {
                const response = await axios.get(url, { headers });
                const data = response.data;
                if (Array.isArray(data)) {
                    return data;
                }
                if (data?.result) {
                    return data;
                }
                if (data?.status && data.status !== 'completed') {
                    return data;
                }
                if (data?.status === 'completed' && !data?.result) {
                    continue;
                }
                return data;
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    sawNotFound = true;
                    continue;
                }
                throw err;
            }
        }

        return sawNotFound ? null : null;
    }

    /**
     * Submits a PDF to PageIndex for indexing
     */
    async submitDocument(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${PAGEINDEX_API_URL}/doc/`, formData, {
            headers: {
                ...this.getPageIndexHeaders(),
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (!response.data || !response.data.doc_id) {
            throw new Error('Failed to get doc_id from PageIndex');
        }
        
        return response.data.doc_id;
    }

    /**
     * Polls the tree status until completed or failed
     */
    async pollTreeStatus(docId: string, onProgress?: (status: string) => void): Promise<PageIndexNode[]> {
        const maxAttempts = 72; // 6 minutes with 5s interval
        const pollInterval = 5000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const data = await this.fetchTreeStatus(docId);
            if (!data) {
                onProgress?.('processing');
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                continue;
            }

            const treeResponse = Array.isArray(data) ? {
                status: 'completed' as const,
                result: data,
                doc_id: docId,
            } : data;
            const status = treeResponse.status;
            
            if (status === 'completed') {
                return treeResponse.result || [];
            } else if (status === 'failed') {
                throw new Error('PageIndex processing failed');
            }
            
            onProgress?.(status);
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error('Indexing timed out');
    }

    /**
     * Chat with Groq using the flattened tree as context
     */
    async chatWithDocument(
        question: string, 
        treeNodes: PageIndexNode[], 
        history: { role: string; content: string }[] = []
    ): Promise<string> {
        if (!GROQ_API_KEY) {
            throw new Error('Missing Groq API key');
        }
        const flattenedTree = this.flattenTree(treeNodes);
        
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
                content: `Here is the indexed structure of the document:\n\n${flattenedTree}\n\nI will now ask questions about this document.` 
            },
            { role: 'assistant', content: "Got it! I've read the full index. Ask me anything." },
            ...history,
            { role: 'user', content: question }
        ];

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.3,
            max_tokens: 1024
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    }

    /**
     * Flattens the tree for LLM context
     */
    private flattenTree(nodes: PageIndexNode[], depth: number = 0): string {
        let result = '';
        for (const node of nodes) {
            const indent = '  '.repeat(depth);
            const excerpt = node.text ? (node.text.length > 300 ? node.text.substring(0, 300) + '...' : node.text) : '';
            result += `${indent}[Page ${node.page_index}] ${node.title}\n`;
            if (excerpt) {
                result += `${indent}  → ${excerpt}\n`;
            }
            if (node.nodes && node.nodes.length > 0) {
                result += this.flattenTree(node.nodes, depth + 1);
            }
        }
        return result;
    }

    /**
     * Count total nodes in the tree
     */
    countNodes(nodes: PageIndexNode[]): number {
        let count = nodes.length;
        for (const node of nodes) {
            if (node.nodes) {
                count += this.countNodes(node.nodes);
            }
        }
        return count;
    }
}

export const pageIndexService = new PageIndexService();
