import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  computeTagLift,
  computeCategoryFCR,
  computeKbGaps,
  findCallerHistory,
  type CallRow,
} from "../_shared/stats.ts";

// ─── CORS ────────────────────────────────────────────────────────
const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

function json(req: Request, status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────
interface CallRecord {
  id: string;
  date: string;
  duration: number;
  type: string;
  category: string;
  priority: string;
  sentiment: string;
  summary: unknown;
  tags: string[];
  follow_up_required: boolean;
  messages: unknown[];
}

function parseSentiment(val: unknown): string {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object' && 'sentiment' in (val as Record<string, unknown>)) {
    return String((val as Record<string, unknown>).sentiment);
  }
  return 'neutral';
}

function parseSummary(val: unknown): { topics?: string[]; sentiment?: string } {
  if (!val) return {};
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return {}; }
  }
  if (typeof val === 'object') return val as { topics?: string[]; sentiment?: string };
  return {};
}

function getHour(dateStr: string): number {
  try { return new Date(dateStr).getHours(); } catch { return 0; }
}

function getDayOfWeek(dateStr: string): number {
  try { return new Date(dateStr).getDay(); } catch { return 0; }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } catch { return 'unknown'; }
}

// ─── Main Handler ────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return json(req, 401, { error: 'Unauthorized' });

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json(req, 401, { error: 'Unauthorized' });

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const url = new URL(req.url);
    const action = url.pathname.replace(/\/+$/, '').split('/').pop() || '';

    // Parse date range from query params
    const startDate = url.searchParams.get('start') || '';
    const endDate = url.searchParams.get('end') || '';

    // Fetch call history
    let query = adminClient
      .from('call_history')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data: calls, error: fetchError } = await query.limit(2000);
    if (fetchError) throw fetchError;

    const records = (calls ?? []) as CallRecord[];

    if (req.method === 'GET' && action === 'overview') {
      // ─── Overview stats ──────────────────────────────────
      const totalCalls = records.length;
      const voiceCalls = records.filter(c => c.type === 'voice').length;
      const textCalls = records.filter(c => c.type === 'text').length;
      const avgDuration = totalCalls > 0
        ? Math.round(records.reduce((sum, c) => sum + (c.duration || 0), 0) / totalCalls)
        : 0;
      const followUps = records.filter(c => c.follow_up_required).length;

      // Sentiment distribution
      const sentimentDist: Record<string, number> = {};
      for (const c of records) {
        const s = parseSentiment(c.sentiment || parseSummary(c.summary)?.sentiment);
        sentimentDist[s] = (sentimentDist[s] || 0) + 1;
      }

      // Category distribution
      const categoryDist: Record<string, number> = {};
      for (const c of records) {
        const cat = c.category || 'uncategorized';
        categoryDist[cat] = (categoryDist[cat] || 0) + 1;
      }

      // Priority distribution
      const priorityDist: Record<string, number> = {};
      for (const c of records) {
        const p = c.priority || 'low';
        priorityDist[p] = (priorityDist[p] || 0) + 1;
      }

      // Resolution rate (calls without follow-up / total)
      const resolved = records.filter(c => !c.follow_up_required).length;
      const resolutionRate = totalCalls > 0 ? Math.round((resolved / totalCalls) * 100) : 0;

      // Avg sentiment score
      const sentimentScores: Record<string, number> = {
        very_positive: 100, positive: 80, slightly_positive: 65,
        neutral: 50, mixed: 40,
        slightly_negative: 30, negative: 20, very_negative: 10,
        anxious: 25, urgent: 15,
      };
      const avgSentiment = totalCalls > 0
        ? Math.round(records.reduce((sum, c) => {
            const s = parseSentiment(c.sentiment || parseSummary(c.summary)?.sentiment);
            return sum + (sentimentScores[s] ?? 50);
          }, 0) / totalCalls)
        : 50;

      return json(req, 200, {
        overview: {
          totalCalls,
          voiceCalls,
          textCalls,
          avgDuration,
          followUps,
          resolutionRate,
          avgSentiment,
          sentimentDistribution: sentimentDist,
          categoryDistribution: categoryDist,
          priorityDistribution: priorityDist,
        },
      });
    }

    if (req.method === 'GET' && action === 'trends') {
      // ─── Daily call volume + sentiment trend ─────────────
      const dailyMap: Record<string, { total: number; voice: number; text: number; sentimentSum: number; sentimentCount: number; avgDuration: number; durationSum: number }> = {};

      const sentimentScores: Record<string, number> = {
        very_positive: 100, positive: 80, slightly_positive: 65,
        neutral: 50, mixed: 40,
        slightly_negative: 30, negative: 20, very_negative: 10,
        anxious: 25, urgent: 15,
      };

      for (const c of records) {
        const day = formatDate(c.date);
        if (!dailyMap[day]) {
          dailyMap[day] = { total: 0, voice: 0, text: 0, sentimentSum: 0, sentimentCount: 0, avgDuration: 0, durationSum: 0 };
        }
        const d = dailyMap[day];
        d.total++;
        if (c.type === 'voice') d.voice++;
        else d.text++;
        d.durationSum += c.duration || 0;

        const s = parseSentiment(c.sentiment || parseSummary(c.summary)?.sentiment);
        d.sentimentSum += sentimentScores[s] ?? 50;
        d.sentimentCount++;
      }

      const trends = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, d]) => ({
          date,
          total: d.total,
          voice: d.voice,
          text: d.text,
          avgDuration: d.total > 0 ? Math.round(d.durationSum / d.total) : 0,
          avgSentiment: d.sentimentCount > 0 ? Math.round(d.sentimentSum / d.sentimentCount) : 50,
        }));

      return json(req, 200, { trends });
    }

    if (req.method === 'GET' && action === 'peak-hours') {
      // ─── Peak hours heatmap data ─────────────────────────
      // 7 days x 24 hours grid
      const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

      for (const c of records) {
        const dayOfWeek = getDayOfWeek(c.date);
        const hour = getHour(c.date);
        heatmap[dayOfWeek][hour]++;
      }

      return json(req, 200, { heatmap });
    }

    if (req.method === 'GET' && action === 'top-topics') {
      // ─── Top topics extracted from tags + summaries ──────
      const topicCount: Record<string, number> = {};

      for (const c of records) {
        const tags = Array.isArray(c.tags) ? c.tags : [];
        for (const tag of tags) {
          const t = String(tag).toLowerCase().trim();
          if (t) topicCount[t] = (topicCount[t] || 0) + 1;
        }
        const summary = parseSummary(c.summary);
        if (Array.isArray(summary.topics)) {
          for (const topic of summary.topics) {
            const t = String(topic).toLowerCase().trim();
            if (t) topicCount[t] = (topicCount[t] || 0) + 1;
          }
        }
      }

      const topTopics = Object.entries(topicCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([topic, count]) => ({ topic, count }));

      return json(req, 200, { topTopics });
    }

    // Default: return all analytics in one call (only when no specific sub-action)
    if (req.method === 'GET' && !['patterns', 'kb-gaps', 'precall-brief'].includes(action)) {
      // Combine overview, trends and top-topics for a single request
      const totalCalls = records.length;
      const voiceCalls = records.filter(c => c.type === 'voice').length;
      const textCalls = records.filter(c => c.type === 'text').length;
      const avgDuration = totalCalls > 0
        ? Math.round(records.reduce((sum, c) => sum + (c.duration || 0), 0) / totalCalls)
        : 0;
      const followUps = records.filter(c => c.follow_up_required).length;
      const resolved = records.filter(c => !c.follow_up_required).length;
      const resolutionRate = totalCalls > 0 ? Math.round((resolved / totalCalls) * 100) : 0;

      const sentimentScores: Record<string, number> = {
        very_positive: 100, positive: 80, slightly_positive: 65,
        neutral: 50, mixed: 40,
        slightly_negative: 30, negative: 20, very_negative: 10,
        anxious: 25, urgent: 15,
      };

      const sentimentDist: Record<string, number> = {};
      const categoryDist: Record<string, number> = {};
      const priorityDist: Record<string, number> = {};
      const topicCount: Record<string, number> = {};
      let sentimentTotal = 0;

      const dailyMap: Record<string, { total: number; voice: number; text: number; sentimentSum: number; sentimentCount: number; durationSum: number }> = {};

      for (const c of records) {
        const s = parseSentiment(c.sentiment || parseSummary(c.summary)?.sentiment);
        sentimentDist[s] = (sentimentDist[s] || 0) + 1;
        sentimentTotal += sentimentScores[s] ?? 50;

        const cat = c.category || 'uncategorized';
        categoryDist[cat] = (categoryDist[cat] || 0) + 1;

        const p = c.priority || 'low';
        priorityDist[p] = (priorityDist[p] || 0) + 1;

        const tags = Array.isArray(c.tags) ? c.tags : [];
        for (const tag of tags) {
          const t = String(tag).toLowerCase().trim();
          if (t) topicCount[t] = (topicCount[t] || 0) + 1;
        }
        const summary = parseSummary(c.summary);
        if (Array.isArray(summary.topics)) {
          for (const topic of summary.topics) {
            const t = String(topic).toLowerCase().trim();
            if (t) topicCount[t] = (topicCount[t] || 0) + 1;
          }
        }

        const day = formatDate(c.date);
        if (!dailyMap[day]) {
          dailyMap[day] = { total: 0, voice: 0, text: 0, sentimentSum: 0, sentimentCount: 0, durationSum: 0 };
        }
        const d = dailyMap[day];
        d.total++;
        if (c.type === 'voice') d.voice++;
        else d.text++;
        d.durationSum += c.duration || 0;
        d.sentimentSum += sentimentScores[s] ?? 50;
        d.sentimentCount++;
      }

      const avgSentiment = totalCalls > 0 ? Math.round(sentimentTotal / totalCalls) : 50;

      const trends = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, d]) => ({
          date,
          total: d.total,
          voice: d.voice,
          text: d.text,
          avgDuration: d.total > 0 ? Math.round(d.durationSum / d.total) : 0,
          avgSentiment: d.sentimentCount > 0 ? Math.round(d.sentimentSum / d.sentimentCount) : 50,
        }));

      const topTopics = Object.entries(topicCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([topic, count]) => ({ topic, count }));

      return json(req, 200, {
        overview: {
          totalCalls, voiceCalls, textCalls, avgDuration,
          followUps, resolutionRate, avgSentiment,
          sentimentDistribution: sentimentDist,
          categoryDistribution: categoryDist,
          priorityDistribution: priorityDist,
        },
        trends,
        topTopics,
      });
    }

    // ─── GET /patterns ───────────────────────────────────────────
    // Outcome-driven signal analysis: which topics/tags correlate with
    // resolved vs unresolved calls. Pure statistics — no AI calls.
    if (req.method === 'GET' && action === 'patterns') {
      const days = parseInt(url.searchParams.get('days') ?? '90', 10);
      const minOcc = parseInt(url.searchParams.get('min_occ') ?? '1', 10);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data: rows, error: fetchErr } = await adminClient
        .from('call_history')
        .select('id, caller_name, date, category, priority, sentiment, follow_up_required, duration, tags, summary, messages')
        .eq('user_id', user.id)
        .gte('date', since)
        .order('date', { ascending: false })
        .limit(2000);

      if (fetchErr) throw fetchErr;
      const calls = (rows ?? []) as CallRow[];

      const liftResults = computeTagLift(calls, minOcc);
      const categoryFCR = computeCategoryFCR(calls);

      // Split into top winning signals (lift > 1) and top risk signals (lift < 1)
      const winningSignals = liftResults.filter(s => s.lift >= 1).slice(0, 15);
      const riskSignals = liftResults.filter(s => s.lift < 1).slice(-15).reverse();

      // Overall FCR — derived from per-category results to avoid duplicating logic
      const totalCalls = calls.length;
      const resolvedCallsTotal = categoryFCR.reduce((s, c) => s + c.resolvedCalls, 0);
      const overallFCR = totalCalls > 0 ? parseFloat((resolvedCallsTotal / totalCalls).toFixed(4)) : 0;

      return json(req, 200, {
        periodDays: days,
        totalCalls,
        overallFCR,
        winningSignals,
        riskSignals,
        categoryFCR,
      });
    }

    // ─── GET /kb-gaps ─────────────────────────────────────────────
    // Detect which topics from unresolved calls are not covered in the KB.
    // Uses token-pool coverage check (no embeddings, no AI).
    if (req.method === 'GET' && action === 'kb-gaps') {
      const days = parseInt(url.searchParams.get('days') ?? '90', 10);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const minOcc = parseInt(url.searchParams.get('min_occ') ?? '2', 10);
      const threshold = parseFloat(url.searchParams.get('threshold') ?? '0.3');

      // Fetch unresolved calls
      const { data: callRows, error: callErr } = await adminClient
        .from('call_history')
        .select('id, follow_up_required, tags, summary')
        .eq('user_id', user.id)
        .gte('date', since)
        .limit(2000);
      if (callErr) throw callErr;

      // Fetch KB chunks for this user
      const { data: kbRows, error: kbErr } = await adminClient
        .from('kb_documents')
        .select('content')
        .eq('user_id', user.id)
        .not('content', 'is', null);
      if (kbErr) throw kbErr;

      const calls = (callRows ?? []) as CallRow[];
      const kbContents = (kbRows ?? []).map((r: { content: string }) => r.content ?? '');

      const result = computeKbGaps(calls, kbContents, minOcc, threshold);

      return json(req, 200, {
        periodDays: days,
        kbArticleCount: kbContents.length,
        ...result,
      });
    }

    // ─── GET /precall-brief?name=<caller_name> ────────────────────
    // Look up a caller's history before a call starts.
    // Returns past calls, open action items, and a risk flag.
    // Pure tag/name matching — no AI calls.
    if (req.method === 'GET' && action === 'precall-brief') {
      const callerName = url.searchParams.get('name') ?? '';
      if (!callerName.trim()) {
        return json(req, 400, { error: 'name parameter is required' });
      }

      const { data: rows, error: fetchErr } = await adminClient
        .from('call_history')
        .select('id, caller_name, date, category, sentiment, follow_up_required, duration, tags, summary')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(500);
      if (fetchErr) throw fetchErr;

      const calls = (rows ?? []) as CallRow[];
      const brief = findCallerHistory(calls, callerName);

      return json(req, 200, brief);
    }

    return json(req, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('[api-analytics]', err);
    return json(req, 500, { error: 'Internal server error' });
  }
});
