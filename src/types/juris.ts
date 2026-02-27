// Juris Type Definitions

export type SearchMode = "normal" | "deep_research";

export interface JurisMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  caseResults?: CaseResult[];
  analysis?: LegalAnalysis;
}

export interface CaseResult {
  id: string;
  title: string;
  citation: string;
  court: string;
  date: string;
  judge: string;
  similarityScore: number;
  facts: string;
  holding: string;
  precedents: string[];
  metadata: CaseMetadata;
}

export interface CaseMetadata {
  court_type: string;
  jurisdiction: string;
  case_number: string;
  parties: {
    petitioner: string;
    respondent: string;
  };
  statutes_cited: string[];
  year: number;
}

export interface JudgeInfo {
  id: string;
  name: string;
  court: string;
  yearsOfService: number;
  notableCases: number;
  specializations: string[];
  profileImage?: string;
}

export interface CourtInfo {
  id: string;
  name: string;
  jurisdiction: string;
  type: "Supreme Court" | "High Court" | "District Court";
  established: number;
  totalCases: number;
  activeCases: number;
}

export interface StatuteInfo {
  id: string;
  title: string;
  section: string;
  act: string;
  description: string;
  relatedCases: number;
}

export interface GraphNode {
  id: string;
  type: "case" | "judge" | "court" | "statute" | "section";
  label: string;
  metadata: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "cites" | "decided_by" | "heard_in" | "references" | "related_to";
  weight: number;
}

export interface LegalAnalysis {
  caseId: string;
  similaritySummary: string;
  keyLegalConcepts: string[];
  precedentAnalysis: string[];
  rhetoricalRoles: {
    facts: number;
    arguments: number;
    precedents: number;
    reasoning: number;
    ruling: number;
  };
  citationNetwork: {
    directCitations: number;
    indirectCitations: number;
  };
}

export interface SystemMetrics {
  totalCases: number;
  precisionAt5: number;
  avgResponseTime: number;
  vectorStoreStatus: string;
  graphDbStatus: string;
  lastIndexed: string;
  entityCounts: {
    cases: number;
    judges: number;
    courts: number;
    statutes: number;
    sections: number;
  };
}
