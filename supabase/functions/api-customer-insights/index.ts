import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── CORS ────────────────────────────────────────────────────────
const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const ALLOWED_ORIGINS = new Set([
  'https://clerktree.com',
  'https://www.clerktree.com',
  'https://clerktree.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://clerktree.com';
  return { ...corsBaseHeaders, 'Access-Control-Allow-Origin': allowedOrigin };
}

function jsonResponse(data: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

// ─── Helpers ────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

function parseSummary(summaryValue: unknown): { sentiment?: string; topics?: string[]; mainPoints?: string[] } {
  if (!summaryValue) return {};
  if (typeof summaryValue === 'string') {
    try { return JSON.parse(summaryValue); } catch { return { mainPoints: [summaryValue] }; }
  }
  if (typeof summaryValue === 'object') return summaryValue as any;
  return {};
}

// ─── Customer Health Score Algorithm ────────────────────────────
// Composite score 0-100 based on:
//   - Recency (when was last interaction?) — 30%
//   - Frequency (how often do they interact?) — 25%
//   - Sentiment trend (improving or declining?) — 25%
//   - Issue resolution (are issues being resolved?) — 20%
function computeHealthScore(interactions: any[]): {
  score: number;
  recencyScore: number;
  frequencyScore: number;
  sentimentScore: number;
  resolutionScore: number;
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
} {
  if (interactions.length === 0) {
    return { score: 0, recencyScore: 0, frequencyScore: 0, sentimentScore: 0, resolutionScore: 0, trend: 'stable', riskLevel: 'critical' };
  }

  const now = new Date();
  const dates = interactions
    .map((i) => new Date(i.date || i.created_at))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  // Recency: days since last interaction (0-30+ days mapped to 100-0)
  const lastInteraction = dates[0] || now;
  const daysSinceLast = daysBetween(now, lastInteraction);
  const recencyScore = clamp(100 - (daysSinceLast / 30) * 100, 0, 100);

  // Frequency: interactions per 30-day period
  const firstInteraction = dates[dates.length - 1] || now;
  const spanDays = Math.max(daysBetween(firstInteraction, now), 1);
  const interactionsPerMonth = (interactions.length / spanDays) * 30;
  const frequencyScore = clamp(Math.min(interactionsPerMonth * 20, 100), 0, 100);

  // Sentiment: weighted average with recency bias
  const sentimentMap: Record<string, number> = {
    positive: 90, neutral: 60, mixed: 45, negative: 15, urgent: 10, anxious: 20,
  };
  let sentimentWeightedSum = 0;
  let sentimentWeightTotal = 0;
  interactions.forEach((item, idx) => {
    const summary = parseSummary(item.summary);
    const sentimentStr = (summary.sentiment || item.sentiment || 'neutral').toLowerCase();
    const sentimentValue = sentimentMap[sentimentStr] ?? 60;
    const weight = 1 + (interactions.length - idx) * 0.1; // More recent = higher weight
    sentimentWeightedSum += sentimentValue * weight;
    sentimentWeightTotal += weight;
  });
  const sentimentScore = sentimentWeightTotal > 0
    ? clamp(sentimentWeightedSum / sentimentWeightTotal, 0, 100)
    : 60;

  // Resolution: check if follow-ups were resolved
  let resolvedCount = 0;
  interactions.forEach((item) => {
    const summary = parseSummary(item.summary);
    if (summary.sentiment === 'positive') resolvedCount++;
    if (item.priority === 'low') resolvedCount += 0.5;
  });
  const resolutionScore = clamp((resolvedCount / Math.max(interactions.length, 1)) * 100, 0, 100);

  // Composite
  const score = Math.round(
    recencyScore * 0.30 +
    frequencyScore * 0.25 +
    sentimentScore * 0.25 +
    resolutionScore * 0.20
  );

  // Trend: compare first half vs second half sentiment
  const mid = Math.floor(interactions.length / 2);
  const firstHalf = interactions.slice(mid);
  const secondHalf = interactions.slice(0, mid);
  const avgSentiment = (items: any[]) => {
    if (items.length === 0) return 60;
    return items.reduce((sum, item) => {
      const s = parseSummary(item.summary);
      return sum + (sentimentMap[(s.sentiment || 'neutral').toLowerCase()] ?? 60);
    }, 0) / items.length;
  };
  const earlyAvg = avgSentiment(firstHalf);
  const recentAvg = avgSentiment(secondHalf);
  const trend = recentAvg - earlyAvg > 10 ? 'improving' : recentAvg - earlyAvg < -10 ? 'declining' : 'stable';

  const riskLevel = score >= 70 ? 'low' : score >= 50 ? 'medium' : score >= 30 ? 'high' : 'critical';

  return {
    score: clamp(score, 0, 100),
    recencyScore: Math.round(recencyScore),
    frequencyScore: Math.round(frequencyScore),
    sentimentScore: Math.round(sentimentScore),
    resolutionScore: Math.round(resolutionScore),
    trend,
    riskLevel,
  };
}

// ─── Churn Prediction ───────────────────────────────────────────
function predictChurn(interactions: any[], healthScore: number): {
  probability: number;
  factors: string[];
  timeframe: string;
} {
  const factors: string[] = [];
  let churnSignal = 0;

  // Health-based
  if (healthScore < 30) { churnSignal += 0.35; factors.push('Very low health score'); }
  else if (healthScore < 50) { churnSignal += 0.2; factors.push('Below-average health score'); }

  // Recency gap
  if (interactions.length > 0) {
    const lastDate = new Date(interactions[0].date || interactions[0].created_at);
    const daysGap = daysBetween(new Date(), lastDate);
    if (daysGap > 21) { churnSignal += 0.25; factors.push(`No interaction in ${Math.round(daysGap)} days`); }
    else if (daysGap > 14) { churnSignal += 0.15; factors.push(`${Math.round(daysGap)} days since last contact`); }
  }

  // Declining frequency
  if (interactions.length >= 4) {
    const mid = Math.floor(interactions.length / 2);
    const recentCount = mid;
    const earlyCount = interactions.length - mid;
    const recentDates = interactions.slice(0, mid).map((i) => new Date(i.date || i.created_at));
    const earlyDates = interactions.slice(mid).map((i) => new Date(i.date || i.created_at));
    const recentSpan = recentDates.length >= 2 ? daysBetween(recentDates[0], recentDates[recentDates.length - 1]) : 30;
    const earlySpan = earlyDates.length >= 2 ? daysBetween(earlyDates[0], earlyDates[earlyDates.length - 1]) : 30;
    const recentFreq = recentCount / Math.max(recentSpan, 1);
    const earlyFreq = earlyCount / Math.max(earlySpan, 1);
    if (recentFreq < earlyFreq * 0.5) {
      churnSignal += 0.2;
      factors.push('Interaction frequency dropped >50%');
    }
  }

  // Negative sentiment streak
  const recentSentiments = interactions.slice(0, 3).map((i) => {
    const s = parseSummary(i.summary);
    return (s.sentiment || 'neutral').toLowerCase();
  });
  const negativeStreak = recentSentiments.filter((s) => s === 'negative' || s === 'urgent' || s === 'anxious').length;
  if (negativeStreak >= 2) {
    churnSignal += 0.2;
    factors.push(`${negativeStreak} consecutive negative interactions`);
  }

  // High-priority unresolved
  const highPriorityRecent = interactions.slice(0, 5).filter((i) => i.priority === 'critical' || i.priority === 'high');
  if (highPriorityRecent.length >= 2) {
    churnSignal += 0.15;
    factors.push(`${highPriorityRecent.length} recent high-priority issues`);
  }

  const probability = clamp(churnSignal, 0, 0.95);
  const timeframe = probability > 0.6 ? '7 days' : probability > 0.4 ? '14 days' : probability > 0.2 ? '30 days' : '60+ days';

  if (factors.length === 0) factors.push('No significant risk factors detected');

  return { probability: Math.round(probability * 100) / 100, factors, timeframe };
}

// ─── Topic/Signal Extraction ────────────────────────────────────
function extractInsights(interactions: any[]): {
  topTopics: { topic: string; count: number; sentiment: string }[];
  commonIssues: string[];
  peakInteractionDays: string[];
  avgResponseSentiment: string;
  totalInteractions: number;
  voiceCount: number;
  textCount: number;
} {
  const topicCounts = new Map<string, { count: number; sentiments: string[] }>();
  const issues: string[] = [];
  const dayOfWeekCounts = new Map<string, number>();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let voiceCount = 0;
  let textCount = 0;
  const sentiments: string[] = [];

  for (const item of interactions) {
    const summary = parseSummary(item.summary);
    const sentiment = (summary.sentiment || 'neutral').toLowerCase();
    sentiments.push(sentiment);

    // Type counting
    if (item.type === 'voice') voiceCount++;
    else textCount++;

    // Topic extraction
    const topics = Array.isArray(summary.topics) ? summary.topics : [];
    for (const topic of topics) {
      const normalized = String(topic).toLowerCase().trim();
      if (!normalized) continue;
      const entry = topicCounts.get(normalized) || { count: 0, sentiments: [] };
      entry.count++;
      entry.sentiments.push(sentiment);
      topicCounts.set(normalized, entry);
    }

    // Issues from negative interactions
    if (sentiment === 'negative' || sentiment === 'urgent') {
      const points = summary.mainPoints || [];
      if (Array.isArray(points)) {
        issues.push(...points.map((p: any) => String(p)).slice(0, 2));
      }
    }

    // Day of week
    const date = new Date(item.date || item.created_at);
    if (!isNaN(date.getTime())) {
      const day = days[date.getDay()];
      dayOfWeekCounts.set(day, (dayOfWeekCounts.get(day) || 0) + 1);
    }
  }

  // Top topics
  const topTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([topic, data]) => {
      const avgSentiment = data.sentiments.reduce((sum, s) => {
        const map: Record<string, number> = { positive: 1, neutral: 0, negative: -1, urgent: -1, anxious: -0.5 };
        return sum + (map[s] ?? 0);
      }, 0) / data.sentiments.length;
      return { topic, count: data.count, sentiment: avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral' };
    });

  // Peak interaction days
  const peakInteractionDays = Array.from(dayOfWeekCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => day);

  // Average sentiment
  const sentimentScore = sentiments.reduce((sum, s) => {
    const map: Record<string, number> = { positive: 1, neutral: 0, negative: -1, urgent: -1, anxious: -0.5 };
    return sum + (map[s] ?? 0);
  }, 0) / Math.max(sentiments.length, 1);
  const avgResponseSentiment = sentimentScore > 0.2 ? 'positive' : sentimentScore < -0.2 ? 'negative' : 'neutral';

  return {
    topTopics,
    commonIssues: [...new Set(issues)].slice(0, 5),
    peakInteractionDays,
    avgResponseSentiment,
    totalInteractions: interactions.length,
    voiceCount,
    textCount,
  };
}

// ─── Main Handler ───────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return jsonResponse({ error: 'Unauthorized' }, 401, cors);

    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const resource = parts[parts.length - 1] || '';

    // ━━━ GET /health — Overall customer portfolio health ━━━━━━━
    if (req.method === 'GET' && resource === 'health') {
      const { data: callHistory, error: fetchErr } = await supabase
        .from('call_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchErr) return jsonResponse({ error: fetchErr.message }, 500, cors);

      const history = callHistory || [];

      // Group by customer name
      const customerMap = new Map<string, any[]>();
      for (const item of history) {
        const name = (item.caller_name || item.callerName || 'Unknown').trim();
        if (!customerMap.has(name)) customerMap.set(name, []);
        customerMap.get(name)!.push(item);
      }

      const customers = Array.from(customerMap.entries()).map(([name, interactions]) => {
        const health = computeHealthScore(interactions);
        const churn = predictChurn(interactions, health.score);
        return {
          name,
          interactionCount: interactions.length,
          health,
          churn,
          lastInteraction: interactions[0]?.date || interactions[0]?.created_at || null,
        };
      });

      // Sort by risk (lowest health first)
      customers.sort((a, b) => a.health.score - b.health.score);

      // Portfolio summary
      const avgHealth = customers.length > 0
        ? Math.round(customers.reduce((s, c) => s + c.health.score, 0) / customers.length)
        : 0;
      const atRiskCount = customers.filter((c) => c.health.riskLevel === 'high' || c.health.riskLevel === 'critical').length;
      const avgChurnProb = customers.length > 0
        ? Math.round(customers.reduce((s, c) => s + c.churn.probability, 0) / customers.length * 100) / 100
        : 0;

      return jsonResponse({
        portfolio: {
          totalCustomers: customers.length,
          avgHealthScore: avgHealth,
          atRiskCount,
          avgChurnProbability: avgChurnProb,
          healthDistribution: {
            critical: customers.filter((c) => c.health.riskLevel === 'critical').length,
            high: customers.filter((c) => c.health.riskLevel === 'high').length,
            medium: customers.filter((c) => c.health.riskLevel === 'medium').length,
            low: customers.filter((c) => c.health.riskLevel === 'low').length,
          },
          trendDistribution: {
            improving: customers.filter((c) => c.health.trend === 'improving').length,
            stable: customers.filter((c) => c.health.trend === 'stable').length,
            declining: customers.filter((c) => c.health.trend === 'declining').length,
          },
        },
        customers,
      }, 200, cors);
    }

    // ━━━ GET /insights — Aggregated analytics ━━━━━━━━━━━━━━━━━━
    if (req.method === 'GET' && resource === 'insights') {
      const { data: callHistory, error: fetchErr } = await supabase
        .from('call_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchErr) return jsonResponse({ error: fetchErr.message }, 500, cors);

      const history = callHistory || [];
      const insights = extractInsights(history);

      // Rescue effectiveness (from rescue_actions)
      const { data: actions } = await supabase
        .from('rescue_actions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const completedActions = actions || [];
      const rescueStats = {
        totalRescues: completedActions.length,
        totalCustomersRescued: completedActions.reduce((s: number, a: any) => s + (a.member_count || 0), 0),
        avgCostPerRescue: completedActions.length > 0
          ? Math.round(completedActions.reduce((s: number, a: any) => s + Number(a.estimated_cost_inr || 0), 0) / completedActions.length)
          : 0,
      };

      return jsonResponse({ insights, rescueStats }, 200, cors);
    }

    // ━━━ POST /customer — Single customer deep analysis ━━━━━━━━
    if (req.method === 'POST' && resource === 'customer') {
      const body = await req.json();
      const { customerName } = body;

      if (!customerName) return jsonResponse({ error: 'customerName required' }, 400, cors);

      const { data: callHistory, error: fetchErr } = await supabase
        .from('call_history')
        .select('*')
        .eq('user_id', user.id)
        .or(`caller_name.ilike.%${customerName}%`)
        .order('date', { ascending: false });

      if (fetchErr) return jsonResponse({ error: fetchErr.message }, 500, cors);

      const interactions = callHistory || [];
      if (interactions.length === 0) {
        return jsonResponse({ error: 'No interactions found for this customer' }, 404, cors);
      }

      const health = computeHealthScore(interactions);
      const churn = predictChurn(interactions, health.score);
      const insights = extractInsights(interactions);

      // Rescue history for this customer
      const { data: rescueActions } = await supabase
        .from('rescue_actions')
        .select('*')
        .eq('user_id', user.id)
        .contains('member_names', JSON.stringify([customerName]));

      return jsonResponse({
        customerName,
        health,
        churn,
        insights,
        interactionTimeline: interactions.slice(0, 20).map((i: any) => ({
          date: i.date || i.created_at,
          type: i.type || 'text',
          priority: i.priority || 'medium',
          sentiment: parseSummary(i.summary).sentiment || 'neutral',
          topics: parseSummary(i.summary).topics || [],
        })),
        rescueHistory: (rescueActions || []).map((a: any) => ({
          id: a.id,
          playbookName: a.playbook_name,
          status: a.status,
          executedAt: a.executed_at,
          clusterLabel: a.cluster_label,
        })),
      }, 200, cors);
    }

    return jsonResponse({ error: 'Not found' }, 404, cors);
  } catch (err) {
    console.error('customer-insights error:', err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      500,
      { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    );
  }
});
