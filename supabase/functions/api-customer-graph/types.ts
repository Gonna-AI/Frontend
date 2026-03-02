export type InteractionType = 'voice' | 'text';
export interface NormalizedCategory { id: string; name: string; color: string; description: string; }
export interface NormalizedHistoryItem { id: string; callerName: string; normalizedName: string; date: Date; type: InteractionType; priority: 'critical' | 'high' | 'medium' | 'low'; sentiment: string; category: NormalizedCategory; summaryText: string; topics: string[]; tags: string[]; intentTokens: string[]; contact: { email?: string; phone?: string; }; }
export interface CustomerSignalBundle { topics: string[]; tags: string[]; categories: string[]; priorities: string[]; sentiments: string[]; intentTokens: string[]; }
export interface CustomerInteraction { id: string; date: Date; type: InteractionType; priority: string; sentiment: string; category: NormalizedCategory; summaryText: string; topics: string[]; tags: string[]; contact: { email?: string; phone?: string; }; }
export interface CustomerProfile { id: string; displayName: string; normalizedName: string; interactionCount: number; firstSeen: Date; lastSeen: Date; contact: { email?: string; phone?: string; }; interactions: CustomerInteraction[]; signal: CustomerSignalBundle; riskScore: number; opportunityScore: number; embeddingText: string; }
export interface SimilarityBreakdown { topics: number; tags: number; categories: number; priorities: number; sentiments: number; intentTokens: number; }
export interface SimilarityEdge { id: string; source: string; target: string; score: number; deterministicScore: number; semanticScore?: number; evidence: string[]; breakdown: SimilarityBreakdown; }
export type ClusterCopilotAction = 'save_at_risk' | 'upsell' | 're_engage' | 'nurture';
export interface ClusterCopilotScoreCard { save_at_risk: number; upsell: number; re_engage: number; nurture: number; }
export interface ClusterCopilotEvidenceMetric { id: string; label: string; value: number; formattedValue: string; direction: 'up' | 'down' | 'neutral'; }
export interface ClusterCopilotPlan { clusterId: string; primaryAction: ClusterCopilotAction; secondaryAction?: ClusterCopilotAction; confidence: number; scoreCard: ClusterCopilotScoreCard; rationale: string[]; playbook: string[]; evidence: ClusterCopilotEvidenceMetric[]; summary: string; expectedOutcome: { metric: 'retention' | 'revenue' | 'engagement'; lift: number; windowDays: number; }; algorithmVersion: string; }
export interface CustomerCluster { id: string; label: string; memberIds: string[]; memberCount: number; riskScore: number; opportunityScore: number; sharedSignals: string[]; copilot?: ClusterCopilotPlan; }
export interface CustomerGraphFilters { startDate?: string | null; endDate?: string | null; interactionType: 'all' | InteractionType; minSimilarity: number; anonymize: boolean; enrichWithAI?: boolean; }
export interface GraphBuildOptions { maxNeighbors: number; minScore: number; semanticEnabled: boolean; semanticTimeoutMs: number; }
export interface CustomerGraphStats { totalCustomers: number; totalEdges: number; totalClusters: number; highRiskClusters: number; opportunityClusters: number; }
export interface CustomerGraphModel { generatedAt: string; profiles: CustomerProfile[]; edges: SimilarityEdge[]; clusters: CustomerCluster[]; stats: CustomerGraphStats; }
