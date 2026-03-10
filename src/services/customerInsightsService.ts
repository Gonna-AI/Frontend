import { supabase } from '../config/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const INSIGHTS_API = `${SUPABASE_URL}/functions/v1/api-customer-insights`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error('Authentication required');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

// ─── Types ──────────────────────────────────────────────────────

export interface CustomerHealth {
  score: number;
  recencyScore: number;
  frequencyScore: number;
  sentimentScore: number;
  resolutionScore: number;
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ChurnPrediction {
  probability: number;
  factors: string[];
  timeframe: string;
}

export interface CustomerSummary {
  name: string;
  interactionCount: number;
  health: CustomerHealth;
  churn: ChurnPrediction;
  lastInteraction: string | null;
}

export interface PortfolioHealth {
  totalCustomers: number;
  avgHealthScore: number;
  atRiskCount: number;
  avgChurnProbability: number;
  healthDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  trendDistribution: {
    improving: number;
    stable: number;
    declining: number;
  };
}

export interface TopicInsight {
  topic: string;
  count: number;
  sentiment: string;
}

export interface AggregatedInsights {
  topTopics: TopicInsight[];
  commonIssues: string[];
  peakInteractionDays: string[];
  avgResponseSentiment: string;
  totalInteractions: number;
  voiceCount: number;
  textCount: number;
}

export interface RescueStats {
  totalRescues: number;
  totalCustomersRescued: number;
  avgCostPerRescue: number;
}

export interface CustomerDetailedAnalysis {
  customerName: string;
  health: CustomerHealth;
  churn: ChurnPrediction;
  insights: AggregatedInsights;
  interactionTimeline: {
    date: string;
    type: string;
    priority: string;
    sentiment: string;
    topics: string[];
  }[];
  rescueHistory: {
    id: string;
    playbookName: string;
    status: string;
    executedAt: string | null;
    clusterLabel: string;
  }[];
}

// ─── API Functions ──────────────────────────────────────────────

export async function fetchPortfolioHealth(): Promise<{
  portfolio: PortfolioHealth;
  customers: CustomerSummary[];
}> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${INSIGHTS_API}/health`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch health data (${response.status})`);
  }

  return response.json();
}

export async function fetchInsights(): Promise<{
  insights: AggregatedInsights;
  rescueStats: RescueStats;
}> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${INSIGHTS_API}/insights`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch insights (${response.status})`);
  }

  return response.json();
}

export async function fetchCustomerAnalysis(customerName: string): Promise<CustomerDetailedAnalysis> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${INSIGHTS_API}/customer`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ customerName }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch customer analysis (${response.status})`);
  }

  return response.json();
}
