import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── Inlined _shared/stats.ts ─────────────────────────────────────
const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','by','can','did','do',
  'for','from','get','got','had','has','have','he','her','here',
  'hi','him','his','how','i','if','in','is','it','its','just',
  'me','my','no','not','of','on','or','our','she','so','that',
  'the','their','them','then','they','this','to','up','us','was',
  'we','were','what','when','who','will','with','would','you',
  'your','hello','thanks','thank','please','need','want','help',
  'today','about','call','chat','issue','problem','customer','caller',
  'agent','user','ok','okay','yes','yeah','sure','right','well',
]);

function tokenize(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).map(t => t.trim()).filter(t => t.length >= 3 && !STOP_WORDS.has(t));
}

function termFrequency(values: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
  return freq;
}

function topByFrequency(values: string[], limit: number): string[] {
  return [...termFrequency(values).entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([v]) => v);
}

interface CallRow {
  id: string;
  caller_name?: string;
  date?: string;
  category?: string;
  priority?: string;
  sentiment?: string;
  follow_up_required?: boolean;
  duration?: number;
  tags?: string[];
  summary?: Record<string, unknown> | string | null;
  messages?: { speaker?: string; text?: string }[];
}

interface SignalLift { signal: string; lift: number; resolvedRate: number; unresolvedRate: number; totalOccurrences: number; }
interface CategoryFCR { category: string; totalCalls: number; resolvedCalls: number; fcrRate: number; avgDuration: number; }
interface KbGap { topic: string; occurrences: number; coverage: number; }

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function _parseSummary(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return {}; } }
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  return {};
}

function guessCategory(row: CallRow): string {
  if (row.category && row.category.toLowerCase() !== 'uncategorized') return row.category;
  const s = _parseSummary(row.summary);
  const text = [
    Array.isArray(s.mainPoints) ? (s.mainPoints as string[]).join(' ') : '',
    (s.notes as string) || '',
    Array.isArray(s.topics) ? (s.topics as string[]).join(' ') : ''
  ].join(' ').toLowerCase();
  if (text.includes('billing') || text.includes('payment') || text.includes('refund') || text.includes('charge') || text.includes('cost')) return 'Billing & Payments';
  if (text.includes('login') || text.includes('password') || text.includes('account') || text.includes('access')) return 'Account Access';
  if (text.includes('bug') || text.includes('error') || text.includes('not working') || text.includes('fail') || text.includes('issue')) return 'Technical Support';
  if (text.includes('feature') || text.includes('how to') || text.includes('help')) return 'Feature Request';
  if (text.length > 5) return 'General Inquiry';
  return 'Support';
}

function isFollowUpRequired(row: CallRow): boolean {
  if (typeof row.follow_up_required === 'boolean') return row.follow_up_required;
  const s = _parseSummary(row.summary);
  return s.followUpRequired === true;
}

function getTopics(row: CallRow): string[] {
  const s = _parseSummary(row.summary);
  const topics = s.topics;
  let summaryTopics = Array.isArray(topics) ? topics.map((t: unknown) => String(t).toLowerCase().trim()).filter(Boolean) : [];
  if (summaryTopics.length === 0 && Array.isArray(s.mainPoints)) {
    summaryTopics = topByFrequency(tokenize((s.mainPoints as string[]).join(' ')), 5);
  }
  const tags = Array.isArray(row.tags) ? row.tags.map((t: unknown) => String(t).toLowerCase().trim()).filter(Boolean) : [];
  return [...new Set([...summaryTopics, ...tags])];
}

function getSentiment(row: CallRow): string {
  const s = _parseSummary(row.summary);
  return ((s.sentiment as string) ?? row.sentiment ?? 'neutral');
}

const NEGATIVE_SENTIMENTS = new Set(['very_negative', 'negative', 'slightly_negative', 'anxious', 'urgent']);

function computeTagLift(calls: CallRow[], minOcc = 2): SignalLift[] {
  const resolved = calls.filter(c => !isFollowUpRequired(c));
  const unresolved = calls.filter(c => isFollowUpRequired(c));
  const rLen = Math.max(resolved.length, 1);
  const uLen = Math.max(unresolved.length, 1);
  const rCount = new Map<string, number>();
  const uCount = new Map<string, number>();
  const totalCount = new Map<string, number>();
  for (const call of resolved) for (const signal of getTopics(call)) { rCount.set(signal, (rCount.get(signal) ?? 0) + 1); totalCount.set(signal, (totalCount.get(signal) ?? 0) + 1); }
  for (const call of unresolved) for (const signal of getTopics(call)) { uCount.set(signal, (uCount.get(signal) ?? 0) + 1); totalCount.set(signal, (totalCount.get(signal) ?? 0) + 1); }
  const results: SignalLift[] = [];
  for (const [signal, total] of totalCount) {
    if (total < minOcc) continue;
    const rRate = (rCount.get(signal) ?? 0) / rLen;
    const uRate = (uCount.get(signal) ?? 0) / uLen;
    const lift = parseFloat((rRate / Math.max(uRate, 0.005)).toFixed(3));
    results.push({ signal, lift, resolvedRate: parseFloat(rRate.toFixed(4)), unresolvedRate: parseFloat(uRate.toFixed(4)), totalOccurrences: total });
  }
  return results.sort((a, b) => b.lift - a.lift);
}

function computeCategoryFCR(calls: CallRow[]): CategoryFCR[] {
  const map = new Map<string, { total: number; resolved: number; durationSum: number }>();
  for (const call of calls) {
    const cat = guessCategory(call);
    const existing = map.get(cat) ?? { total: 0, resolved: 0, durationSum: 0 };
    existing.total++;
    if (!isFollowUpRequired(call)) existing.resolved++;
    existing.durationSum += call.duration ?? 0;
    map.set(cat, existing);
  }
  return [...map.entries()].map(([category, v]) => ({ category, totalCalls: v.total, resolvedCalls: v.resolved, fcrRate: parseFloat((v.resolved / Math.max(v.total, 1)).toFixed(4)), avgDuration: Math.round(v.durationSum / Math.max(v.total, 1)) })).sort((a, b) => b.totalCalls - a.totalCalls);
}

function computeKbGaps(calls: CallRow[], kbContents: string[], minOcc = 2, coverageThreshold = 0.3) {
  const kbTokenPool = new Set<string>();
  for (const content of kbContents) for (const token of tokenize(content)) kbTokenPool.add(token);
  const unresolved = calls.filter(c => isFollowUpRequired(c));
  const topicOccurrences = new Map<string, number>();
  for (const call of unresolved) for (const topic of getTopics(call)) topicOccurrences.set(topic, (topicOccurrences.get(topic) ?? 0) + 1);
  let coveredCount = 0, totalTopicCount = 0;
  const gaps: KbGap[] = [];
  for (const [topic, occurrences] of topicOccurrences) {
    if (occurrences < minOcc) continue;
    totalTopicCount++;
    const topicTokens = tokenize(topic);
    if (topicTokens.length === 0) { if (kbTokenPool.has(topic.toLowerCase())) coveredCount++; else gaps.push({ topic, occurrences, coverage: 0 }); continue; }
    const matchCount = topicTokens.filter(t => kbTokenPool.has(t)).length;
    const coverage = parseFloat((matchCount / topicTokens.length).toFixed(4));
    if (coverage >= coverageThreshold) coveredCount++; else gaps.push({ topic, occurrences, coverage });
  }
  return { gaps: gaps.sort((a, b) => b.occurrences - a.occurrences), coverageScore: totalTopicCount === 0 ? 1 : parseFloat((coveredCount / totalTopicCount).toFixed(4)), totalTopics: totalTopicCount, coveredTopics: coveredCount };
}

function findCallerHistory(calls: CallRow[], callerName: string, maxCalls = 5) {
  const normalizedTarget = normalizeName(callerName);
  if (!normalizedTarget || normalizedTarget === 'unknown caller') return { isReturning: false, callerName, totalCalls: 0, lastCalls: [] as unknown[], openActionItems: [] as string[], riskFlag: 'none' };
  const matched = calls.filter(c => { const n = normalizeName(c.caller_name ?? ''); return n && n !== 'unknown caller' && n === normalizedTarget; }).sort((a, b) => (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0));
  if (matched.length === 0) return { isReturning: false, callerName, totalCalls: 0, lastCalls: [] as unknown[], openActionItems: [] as string[], riskFlag: 'none' };
  const recent = matched.slice(0, maxCalls);
  const openActionItems: string[] = [];
  for (const call of matched) {
    if (isFollowUpRequired(call)) {
      const s = _parseSummary(call.summary);
      const items = Array.isArray(s.actionItems) ? s.actionItems as { text?: string; description?: string }[] : [];
      for (const item of items) { const text = item.text ?? item.description ?? ''; if (text.trim()) openActionItems.push(text.trim()); }
    }
  }
  const last3 = recent.slice(0, 3);
  const negativeCount = last3.filter(c => NEGATIVE_SENTIMENTS.has(getSentiment(c))).length;
  const hasHighRisk = last3.some(c => { const s = _parseSummary(c.summary); return s.riskLevel === 'high' || s.riskLevel === 'critical'; });
  let riskFlag: 'none' | 'medium' | 'high' = 'none';
  if (hasHighRisk || negativeCount >= 2) riskFlag = 'high'; else if (negativeCount === 1) riskFlag = 'medium';
  return {
    isReturning: true, callerName: matched[0].caller_name ?? callerName, totalCalls: matched.length,
    lastCalls: recent.map(c => { const s = _parseSummary(c.summary); return { date: c.date ?? '', sentiment: getSentiment(c), category: c.category ?? 'uncategorized', summaryText: (typeof s === 'object' && 'summaryText' in s ? s.summaryText as string : '') ?? '', followUpRequired: isFollowUpRequired(c) }; }),
    openActionItems: [...new Set(openActionItems)].slice(0, 10), riskFlag
  };
}

// ─── CORS ────────────────────────────────────────────────────────
const corsBaseHeaders = { 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Max-Age': '86400' };
const DEFAULT_ALLOWED_ORIGINS = new Set<string>(['https://clerktree.com', 'https://www.clerktree.com', 'http://localhost:5173', 'http://127.0.0.1:5173', 'https://clerktree.netlify.app']);
const EXTRA = (Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map(o => o.trim()).filter(Boolean);
for (const o of EXTRA) DEFAULT_ALLOWED_ORIGINS.add(o);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  if (DEFAULT_ALLOWED_ORIGINS.has(origin)) return true;
  try { const url = new URL(origin); if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) return true; return url.protocol === 'https:' && (url.hostname === 'clerktree.com' || url.hostname.endsWith('.clerktree.com')); } catch { return false; }
}
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin');
  return { ...corsBaseHeaders, 'Access-Control-Allow-Origin': origin && isAllowedOrigin(origin) ? origin : 'https://clerktree.com', 'Vary': 'Origin' };
}
function json(req: Request, status: number, data: unknown) {
  return new Response(JSON.stringify(data), { status, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } });
}

// ─── Helpers ─────────────────────────────────────────────────────
function parseSentiment(val: unknown): string {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object' && 'sentiment' in (val as Record<string, unknown>)) return String((val as Record<string, unknown>).sentiment);
  return 'neutral';
}
function parseSummaryLocal(val: unknown): Record<string, unknown> {
  if (!val) return {};
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return {}; } }
  if (typeof val === 'object') return val as Record<string, unknown>;
  return {};
}
function getHour(dateStr: string): number { try { return new Date(dateStr).getHours(); } catch { return 0; } }
function getDayOfWeek(dateStr: string): number { try { return new Date(dateStr).getDay(); } catch { return 0; } }
function formatDate(dateStr: string): string { try { const d = new Date(dateStr); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; } catch { return 'unknown'; } }

const sentimentScoresGlobal: Record<string, number> = { very_positive: 100, positive: 80, slightly_positive: 65, neutral: 50, mixed: 40, slightly_negative: 30, negative: 20, very_negative: 10, anxious: 25, urgent: 15 };

// ─── Main Handler ────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (!isAllowedOrigin(req.headers.get('origin'))) return json(req, 403, { error: 'Origin not allowed' });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: getCorsHeaders(req) });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return json(req, 401, { error: 'Unauthorized' });
    const userClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json(req, 401, { error: 'Unauthorized' });
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const url = new URL(req.url);
    const action = url.pathname.replace(/\/+$/, '').split('/').pop() || '';
    const startDate = url.searchParams.get('start') || '';
    const endDate = url.searchParams.get('end') || '';

    let query = adminClient.from('call_history').select('*').eq('user_id', user.id).order('date', { ascending: true });
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    const { data: calls, error: fetchError } = await query.limit(2000);
    if (fetchError) throw fetchError;
    const records = (calls ?? []) as CallRow[];

    // ─── overview ─────────────────────────────────────────────
    if (req.method === 'GET' && action === 'overview') {
      const totalCalls = records.length;
      const voiceCalls = records.filter(c => c.type === 'voice').length;
      const textCalls = records.filter(c => c.type === 'text').length;
      const avgDuration = totalCalls > 0 ? Math.round(records.reduce((s: number, c: any) => s + (c.duration || 0), 0) / totalCalls) : 0;
      const followUps = records.filter(c => c.follow_up_required).length;
      const sentimentDist: Record<string, number> = {};
      const categoryDist: Record<string, number> = {};
      const priorityDist: Record<string, number> = {};
      for (const c of records) {
        const s = parseSentiment((c as any).sentiment || parseSummaryLocal(c.summary)?.sentiment);
        sentimentDist[s] = (sentimentDist[s] || 0) + 1;
        const cat = guessCategory(c); categoryDist[cat] = (categoryDist[cat] || 0) + 1;
        const p = (c as any).priority || 'low'; priorityDist[p] = (priorityDist[p] || 0) + 1;
      }
      const resolved = records.filter(c => !c.follow_up_required).length;
      const resolutionRate = totalCalls > 0 ? Math.round((resolved / totalCalls) * 100) : 0;
      const avgSentiment = totalCalls > 0 ? Math.round(records.reduce((sum: number, c: any) => { const s = parseSentiment(c.sentiment || parseSummaryLocal(c.summary)?.sentiment); return sum + (sentimentScoresGlobal[s] ?? 50); }, 0) / totalCalls) : 50;
      return json(req, 200, { overview: { totalCalls, voiceCalls, textCalls, avgDuration, followUps, resolutionRate, avgSentiment, sentimentDistribution: sentimentDist, categoryDistribution: categoryDist, priorityDistribution: priorityDist } });
    }

    // ─── trends ─────────────────────────────────────────────
    if (req.method === 'GET' && action === 'trends') {
      const dailyMap: Record<string, { total: number; voice: number; text: number; sentimentSum: number; sentimentCount: number; durationSum: number }> = {};
      for (const c of records) {
        const day = formatDate(c.date!);
        if (!dailyMap[day]) dailyMap[day] = { total: 0, voice: 0, text: 0, sentimentSum: 0, sentimentCount: 0, durationSum: 0 };
        const d = dailyMap[day]; d.total++;
        if ((c as any).type === 'voice') d.voice++; else d.text++;
        d.durationSum += c.duration || 0;
        const s = parseSentiment((c as any).sentiment || parseSummaryLocal(c.summary)?.sentiment);
        d.sentimentSum += sentimentScoresGlobal[s] ?? 50; d.sentimentCount++;
      }
      const trends = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({ date, total: d.total, voice: d.voice, text: d.text, avgDuration: d.total > 0 ? Math.round(d.durationSum / d.total) : 0, avgSentiment: d.sentimentCount > 0 ? Math.round(d.sentimentSum / d.sentimentCount) : 50 }));
      return json(req, 200, { trends });
    }

    // ─── peak-hours ─────────────────────────────────────────
    if (req.method === 'GET' && action === 'peak-hours') {
      const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
      for (const c of records) { heatmap[getDayOfWeek(c.date!)][getHour(c.date!)]++; }
      return json(req, 200, { heatmap });
    }

    // ─── top-topics ─────────────────────────────────────────
    if (req.method === 'GET' && action === 'top-topics') {
      const topicCount: Record<string, number> = {};
      for (const c of records) {
        (Array.isArray(c.tags) ? c.tags : []).forEach((tag: unknown) => { const t = String(tag).toLowerCase().trim(); if (t) topicCount[t] = (topicCount[t] || 0) + 1; });
        const summary = parseSummaryLocal(c.summary);
        if (Array.isArray(summary.topics)) (summary.topics as string[]).forEach((topic: string) => { const t = String(topic).toLowerCase().trim(); if (t) topicCount[t] = (topicCount[t] || 0) + 1; });
      }
      return json(req, 200, { topTopics: Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([topic, count]) => ({ topic, count })) });
    }

    // ─── default combined GET ─────────────────────────────
    if (req.method === 'GET' && !['patterns', 'kb-gaps', 'precall-brief', 'user-profile'].includes(action)) {
      const totalCalls = records.length;
      const voiceCalls = records.filter(c => (c as any).type === 'voice').length;
      const textCalls = records.filter(c => (c as any).type === 'text').length;
      const avgDuration = totalCalls > 0 ? Math.round(records.reduce((s: number, c: any) => s + (c.duration || 0), 0) / totalCalls) : 0;
      const followUps = records.filter(c => c.follow_up_required).length;
      const resolved = records.filter(c => !c.follow_up_required).length;
      const resolutionRate = totalCalls > 0 ? Math.round((resolved / totalCalls) * 100) : 0;
      const sentimentDist: Record<string, number> = {};
      const categoryDist: Record<string, number> = {};
      const priorityDist: Record<string, number> = {};
      const topicCount: Record<string, number> = {};
      let sentimentTotal = 0;
      const dailyMap: Record<string, { total: number; voice: number; text: number; sentimentSum: number; sentimentCount: number; durationSum: number }> = {};

      for (const c of records) {
        const s = parseSentiment((c as any).sentiment || parseSummaryLocal(c.summary)?.sentiment);
        sentimentDist[s] = (sentimentDist[s] || 0) + 1;
        sentimentTotal += sentimentScoresGlobal[s] ?? 50;
        const cat = guessCategory(c); categoryDist[cat] = (categoryDist[cat] || 0) + 1;
        const p = (c as any).priority || 'low'; priorityDist[p] = (priorityDist[p] || 0) + 1;
        (Array.isArray(c.tags) ? c.tags : []).forEach((tag: unknown) => { const t = String(tag).toLowerCase().trim(); if (t) topicCount[t] = (topicCount[t] || 0) + 1; });
        const summary = parseSummaryLocal(c.summary);
        if (Array.isArray(summary.topics)) (summary.topics as string[]).forEach((topic: string) => { const t = String(topic).toLowerCase().trim(); if (t) topicCount[t] = (topicCount[t] || 0) + 1; });
        const day = formatDate(c.date!);
        if (!dailyMap[day]) dailyMap[day] = { total: 0, voice: 0, text: 0, sentimentSum: 0, sentimentCount: 0, durationSum: 0 };
        const d = dailyMap[day]; d.total++;
        if ((c as any).type === 'voice') d.voice++; else d.text++;
        d.durationSum += c.duration || 0;
        d.sentimentSum += sentimentScoresGlobal[s] ?? 50; d.sentimentCount++;
      }

      const avgSentiment = totalCalls > 0 ? Math.round(sentimentTotal / totalCalls) : 50;
      const trends = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({ date, total: d.total, voice: d.voice, text: d.text, avgDuration: d.total > 0 ? Math.round(d.durationSum / d.total) : 0, avgSentiment: d.sentimentCount > 0 ? Math.round(d.sentimentSum / d.sentimentCount) : 50 }));
      const topTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([topic, count]) => ({ topic, count }));
      return json(req, 200, { overview: { totalCalls, voiceCalls, textCalls, avgDuration, followUps, resolutionRate, avgSentiment, sentimentDistribution: sentimentDist, categoryDistribution: categoryDist, priorityDistribution: priorityDist }, trends, topTopics });
    }

    // ─── patterns ─────────────────────────────────────────
    if (req.method === 'GET' && action === 'patterns') {
      const days = parseInt(url.searchParams.get('days') ?? '90', 10);
      const minOcc = parseInt(url.searchParams.get('min_occ') ?? '1', 10);
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data: rows, error: fetchErr } = await adminClient.from('call_history').select('id, caller_name, date, category, priority, sentiment, follow_up_required, duration, tags, summary, messages').eq('user_id', user.id).gte('date', since).order('date', { ascending: false }).limit(2000);
      if (fetchErr) throw fetchErr;
      const callRows = (rows ?? []) as CallRow[];
      const liftResults = computeTagLift(callRows, minOcc);
      const categoryFCR = computeCategoryFCR(callRows);
      const winningSignals = liftResults.filter(s => s.lift >= 1).slice(0, 15);
      const riskSignals = liftResults.filter(s => s.lift < 1).slice(-15).reverse();
      const totalCalls = callRows.length;
      const resolvedTotal = categoryFCR.reduce((s, c) => s + c.resolvedCalls, 0);
      const overallFCR = totalCalls > 0 ? parseFloat((resolvedTotal / totalCalls).toFixed(4)) : 0;
      return json(req, 200, { periodDays: days, totalCalls, overallFCR, winningSignals, riskSignals, categoryFCR });
    }

    // ─── kb-gaps ─────────────────────────────────────────
    if (req.method === 'GET' && action === 'kb-gaps') {
      const days = parseInt(url.searchParams.get('days') ?? '90', 10);
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const minOcc = parseInt(url.searchParams.get('min_occ') ?? '2', 10);
      const threshold = parseFloat(url.searchParams.get('threshold') ?? '0.3');
      const { data: callRows, error: callErr } = await adminClient.from('call_history').select('id, follow_up_required, tags, summary').eq('user_id', user.id).gte('date', since).limit(2000);
      if (callErr) throw callErr;
      const { data: kbRows, error: kbErr } = await adminClient.from('kb_documents').select('content').eq('user_id', user.id).not('content', 'is', null);
      if (kbErr) throw kbErr;
      const callData = (callRows ?? []) as CallRow[];
      const kbContents = (kbRows ?? []).map((r: Record<string, unknown>) => (r.content as string) ?? '');
      const result = computeKbGaps(callData, kbContents, minOcc, threshold);
      return json(req, 200, { periodDays: days, kbArticleCount: kbContents.length, ...result });
    }

    // ─── precall-brief ─────────────────────────────────────
    if (req.method === 'GET' && action === 'precall-brief') {
      const callerName = url.searchParams.get('name') ?? '';
      if (!callerName.trim()) return json(req, 400, { error: 'name parameter is required' });
      const { data: rows, error: fetchErr } = await adminClient.from('call_history').select('id, caller_name, date, category, sentiment, follow_up_required, duration, tags, summary').eq('user_id', user.id).order('date', { ascending: false }).limit(500);
      if (fetchErr) throw fetchErr;
      return json(req, 200, findCallerHistory((rows ?? []) as CallRow[], callerName));
    }

    // ─── user-profile ─────────────────────────────────────
    if (req.method === 'GET' && action === 'user-profile') {
      const callerName = url.searchParams.get('name') ?? '';
      if (!callerName.trim()) return json(req, 400, { error: 'name parameter is required' });
      const { data: rows, error: fetchErr } = await adminClient.from('call_history').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(2000);
      if (fetchErr) throw fetchErr;
      const normalizedTarget = callerName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
      const matchedCalls = (rows ?? []).filter((c: Record<string, unknown>) => {
        const n = ((c.caller_name as string) || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
        return n && n !== 'unknown caller' && n === normalizedTarget;
      });
      const totalDuration = matchedCalls.reduce((acc: number, c: Record<string, unknown>) => acc + ((c.duration as number) || 0), 0);
      const avgSentiment = matchedCalls.length > 0 ? Math.round(matchedCalls.reduce((sum: number, c: Record<string, unknown>) => { const s = parseSentiment(c.sentiment || parseSummaryLocal(c.summary)?.sentiment); return sum + (sentimentScoresGlobal[s] ?? 50); }, 0) / matchedCalls.length) : 50;
      const topicCount: Record<string, number> = {};
      const categoryCount: Record<string, number> = {};
      const sentimentDist: Record<string, number> = {};
      matchedCalls.forEach((c: Record<string, unknown>) => {
        const s = parseSummaryLocal(c.summary);
        (Array.isArray(s.topics) ? s.topics as string[] : []).forEach((t: string) => { const topic = String(t).toLowerCase().trim(); if (topic) topicCount[topic] = (topicCount[topic] || 0) + 1; });
        (Array.isArray(c.tags) ? c.tags as string[] : []).forEach((t: string) => { const topic = String(t).toLowerCase().trim(); if (topic) topicCount[topic] = (topicCount[topic] || 0) + 1; });
        const cat = guessCategory(c as unknown as CallRow); categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        const sent = parseSentiment(c.sentiment || s.sentiment); sentimentDist[sent] = (sentimentDist[sent] || 0) + 1;
      });
      const frequentTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(e => ({ name: e[0], count: e[1] }));
      const structuredCalls = matchedCalls.map((c: Record<string, unknown>) => {
        const s = parseSummaryLocal(c.summary);
        return { id: c.id, date: c.date, duration: c.duration, category: guessCategory(c as unknown as CallRow), type: c.type, sentiment: parseSentiment(c.sentiment || s.sentiment), followUpRequired: (c.follow_up_required as boolean) ?? (s.followUpRequired === true), summaryText: typeof s === 'object' && 'summaryText' in s ? s.summaryText : (s.notes || ''), riskLevel: (s.riskLevel as string) || 'none', metrics: { wordCount: c.messages ? JSON.stringify(c.messages).split(/\s+/).length : 0, turnCount: Array.isArray(c.messages) ? (c.messages as unknown[]).length : 0 } };
      });
      const sortedByDate = [...matchedCalls].sort((a: Record<string, unknown>, b: Record<string, unknown>) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
      const firstContact = sortedByDate.length > 0 ? sortedByDate[0].date : null;
      const lastContact = sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1].date : null;
      const resolvedCount = matchedCalls.filter((c: Record<string, unknown>) => !c.follow_up_required).length;
      const resolutionRate = matchedCalls.length > 0 ? Math.round((resolvedCount / matchedCalls.length) * 100) : 0;
      return json(req, 200, { callerName: matchedCalls.length > 0 && matchedCalls[0].caller_name ? matchedCalls[0].caller_name : callerName, totalCalls: matchedCalls.length, totalDuration, avgDuration: matchedCalls.length > 0 ? Math.round(totalDuration / matchedCalls.length) : 0, avgSentiment, resolutionRate, firstContact, lastContact, frequentTopics, categoryDistribution: categoryCount, sentimentDistribution: sentimentDist, calls: structuredCalls });
    }

    return json(req, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('[api-analytics]', err);
    return json(req, 500, { error: 'Internal server error' });
  }
});
