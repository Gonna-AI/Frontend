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
    /**
     * Submits a PDF to PageIndex for indexing
     */
    async submitDocument(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${PAGEINDEX_API_URL}/doc/`, formData, {
            headers: {
                'Authorization': `Bearer ${PAGEINDEX_API_KEY}`,
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
            const response = await axios.get(`${PAGEINDEX_API_URL}/doc/${docId}/tree`, {
                headers: {
                    'Authorization': `Bearer ${PAGEINDEX_API_KEY}`
                }
            });

            const data: TreeResponse = response.data;
            
            if (data.status === 'completed') {
                return data.result || [];
            } else if (data.status === 'failed') {
                throw new Error('PageIndex processing failed');
            }
            
            onProgress?.(data.status);
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
