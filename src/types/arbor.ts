// Arbor Type Definitions

export type ArborMode = 'ask' | 'tell';

export interface ArborMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    details?: Record<string, any>;
}

export interface SearchFilters {
    docType: string;
    urgency: string;
    topK: number;
    generateSummaries: boolean;
}

export interface SearchResult {
    id: string;
    title: string;
    content: string;
    file_type: string;
    file_path: string;
    bm25_score: number;
    semantic_score: number;
    combined_score: number;
    snippets: string[];
    summary?: string;
    metadata: DocumentMetadata;
    relevant_chunks?: string[];
}

export interface DocumentMetadata {
    claim_numbers: string[];
    policy_numbers: string[];
    dates: string[];
    amounts: Array<{ amount: string; context: string }>;
    urgency: {
        score: number;
        level: 'critical' | 'high' | 'medium' | 'normal';
        indicators_found: Array<{ term: string; count: number; weight: number }>;
        total_mentions: number;
    };
    document_type: {
        type: string;
        confidence: number;
        scores: Record<string, number>;
    };
    status: string;
    contacts: {
        emails: string[];
        phones: string[];
    };
    word_count: number;
    char_count: number;
}

export interface SystemStats {
    total_documents: number;
    vectorstore_status: string;
    calendar_status: string;
    sheets_status: string;
    email_status: string;
    search_documents: number;
    last_refresh: string | null;
    by_type?: Record<string, number>;
    by_urgency?: {
        critical: number;
        high: number;
        medium: number;
        normal: number;
    };
    with_claim_numbers?: number;
    with_amounts?: number;
    with_contacts?: number;
}

export interface SearchResponse {
    query: string;
    results: SearchResult[];
    total_results: number;
    bm25_weight: number;
    semantic_weight: number;
    semantic_enabled: boolean;
    processing_time: number;
    filter_applied: {
        doc_type: string | null;
        urgency: string | null;
    };
}
