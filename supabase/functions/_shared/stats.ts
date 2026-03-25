/**
 * Pure statistical utilities for conversation analytics.
 *
 * No AI, no GPU, no external APIs.
 * All functions are deterministic and operate on pre-tagged call data.
 *
 * Shared by api-analytics and api-customer-graph edge functions.
 */

// ─── Stop words ──────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'did', 'do',
  'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'here',
  'hi', 'him', 'his', 'how', 'i', 'if', 'in', 'is', 'it', 'its', 'just',
  'me', 'my', 'no', 'not', 'of', 'on', 'or', 'our', 'she', 'so', 'that',
  'the', 'their', 'them', 'then', 'they', 'this', 'to', 'up', 'us', 'was',
  'we', 'were', 'what', 'when', 'who', 'will', 'with', 'would', 'you',
  'your', 'hello', 'thanks', 'thank', 'please', 'need', 'want', 'help',
  'today', 'about', 'call', 'chat', 'issue', 'problem', 'customer', 'caller',
  'agent', 'user', 'ok', 'okay', 'yes', 'yeah', 'sure', 'right', 'well',
]);

// ─── Core primitives ─────────────────────────────────────────────────────────

/**
 * Tokenize a string: lowercase, strip punctuation, remove stopwords,
 * remove tokens shorter than 3 characters.
 */
export function tokenize(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')  // replace all non-alphanumeric (incl. hyphens) with space
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 3 && !STOP_WORDS.has(t));
}

/**
 * Jaccard similarity between two token arrays.
 * Returns 0.0–1.0. Both empty → 0 (no evidence of similarity).
 */
export function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const v of setA) {
    if (setB.has(v)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Count occurrences of each value in an array.
 */
export function termFrequency(values: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const v of values) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  return freq;
}

/**
 * Return the top N values by frequency.
 */
export function topByFrequency(values: string[], limit: number): string[] {
  const freq = termFrequency(values);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([v]) => v);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CallRow {
  id: string;
  caller_name?: string;
  date?: string;
  category?: string;
  priority?: string;
  sentiment?: string;
  follow_up_required?: boolean;
  duration?: number;
  tags?: string[];
  summary?: {
    topics?: string[];
    sentiment?: string;
    followUpRequired?: boolean;
    actionItems?: { text?: string; description?: string }[];
    riskLevel?: string;
  } | string | null;
  messages?: { speaker?: string; text?: string }[];
}

export interface SignalLift {
  signal: string;              // tag or topic string
  lift: number;                // resolved_rate / unresolved_rate (>1 = winning, <1 = risk)
  resolvedRate: number;        // fraction of resolved calls containing this signal
  unresolvedRate: number;      // fraction of unresolved calls containing this signal
  totalOccurrences: number;    // absolute occurrence count across all calls
}

export interface CategoryFCR {
  category: string;
  totalCalls: number;
  resolvedCalls: number;
  fcrRate: number;             // 0.0–1.0
  avgDuration: number;         // seconds
}

export interface KbGap {
  topic: string;
  occurrences: number;         // times this topic appears in unresolved calls
  coverage: number;            // 0.0–1.0 — fraction of topic tokens found in KB
}

export interface CallerHistory {
  isReturning: boolean;
  callerName: string;
  totalCalls: number;
  lastCalls: {
    date: string;
    sentiment: string;
    category: string;
    summaryText: string;
    followUpRequired: boolean;
  }[];
  openActionItems: string[];
  riskFlag: 'none' | 'medium' | 'high';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function parseSummary(raw: CallRow['summary']): NonNullable<Exclude<CallRow['summary'], string>> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

function isFollowUpRequired(row: CallRow): boolean {
  if (typeof row.follow_up_required === 'boolean') return row.follow_up_required;
  const s = parseSummary(row.summary);
  return s.followUpRequired === true;
}

function getTopics(row: CallRow): string[] {
  const s = parseSummary(row.summary);
  const summaryTopics = Array.isArray(s.topics) ? s.topics.map(t => String(t).toLowerCase().trim()).filter(Boolean) : [];
  const tags = Array.isArray(row.tags) ? row.tags.map(t => String(t).toLowerCase().trim()).filter(Boolean) : [];
  // Deduplicate
  return [...new Set([...summaryTopics, ...tags])];
}

function getSentiment(row: CallRow): string {
  const s = parseSummary(row.summary);
  return (s.sentiment ?? row.sentiment ?? 'neutral') as string;
}

const POSITIVE_SENTIMENTS = new Set(['very_positive', 'positive', 'slightly_positive']);
const NEGATIVE_SENTIMENTS = new Set(['very_negative', 'negative', 'slightly_negative', 'anxious', 'urgent']);

// ─── computeTagLift ───────────────────────────────────────────────────────────

/**
 * Compute lift ratio for each topic/tag signal.
 *
 * Lift > 1: signal appears proportionally more in RESOLVED calls → winning signal.
 * Lift < 1: signal appears proportionally more in UNRESOLVED calls → risk signal.
 *
 * Only signals with at least minOccurrences total are included.
 *
 * @param calls     Array of call records
 * @param minOcc    Minimum total occurrences to include a signal (default 2)
 * @returns Array sorted descending by lift
 */
export function computeTagLift(calls: CallRow[], minOcc = 2): SignalLift[] {
  const resolved = calls.filter(c => !isFollowUpRequired(c));
  const unresolved = calls.filter(c => isFollowUpRequired(c));

  const rLen = Math.max(resolved.length, 1);
  const uLen = Math.max(unresolved.length, 1);

  // Count per signal per group
  const rCount = new Map<string, number>();
  const uCount = new Map<string, number>();
  const totalCount = new Map<string, number>();

  for (const call of resolved) {
    for (const signal of getTopics(call)) {
      rCount.set(signal, (rCount.get(signal) ?? 0) + 1);
      totalCount.set(signal, (totalCount.get(signal) ?? 0) + 1);
    }
  }
  for (const call of unresolved) {
    for (const signal of getTopics(call)) {
      uCount.set(signal, (uCount.get(signal) ?? 0) + 1);
      totalCount.set(signal, (totalCount.get(signal) ?? 0) + 1);
    }
  }

  const results: SignalLift[] = [];

  for (const [signal, total] of totalCount) {
    if (total < minOcc) continue;

    const rRate = (rCount.get(signal) ?? 0) / rLen;
    const uRate = (uCount.get(signal) ?? 0) / uLen;

    // Lift: resolved_rate / unresolved_rate. Smooth denominator to avoid ÷0.
    const smoothed = Math.max(uRate, 0.005);
    const lift = parseFloat((rRate / smoothed).toFixed(3));

    results.push({
      signal,
      lift,
      resolvedRate: parseFloat(rRate.toFixed(4)),
      unresolvedRate: parseFloat(uRate.toFixed(4)),
      totalOccurrences: total,
    });
  }

  return results.sort((a, b) => b.lift - a.lift);
}

// ─── computeCategoryFCR ───────────────────────────────────────────────────────

/**
 * First Call Resolution rate and Average Handle Time per category.
 */
export function computeCategoryFCR(calls: CallRow[]): CategoryFCR[] {
  const map = new Map<string, { total: number; resolved: number; durationSum: number }>();

  for (const call of calls) {
    const cat = (call.category ?? 'uncategorized').toLowerCase().trim() || 'uncategorized';
    const existing = map.get(cat) ?? { total: 0, resolved: 0, durationSum: 0 };
    existing.total++;
    if (!isFollowUpRequired(call)) existing.resolved++;
    existing.durationSum += call.duration ?? 0;
    map.set(cat, existing);
  }

  return [...map.entries()]
    .map(([category, v]) => ({
      category,
      totalCalls: v.total,
      resolvedCalls: v.resolved,
      fcrRate: parseFloat((v.resolved / Math.max(v.total, 1)).toFixed(4)),
      avgDuration: Math.round(v.durationSum / Math.max(v.total, 1)),
    }))
    .sort((a, b) => b.totalCalls - a.totalCalls);
}

// ─── computeKbGaps ────────────────────────────────────────────────────────────

/**
 * Find topics from unresolved calls that have poor KB coverage.
 *
 * Coverage is measured by checking what fraction of a topic's tokens
 * appear anywhere in the KB content token pool.
 *
 * @param calls        All call records (we filter to unresolved internally)
 * @param kbContents   Array of KB chunk text strings
 * @param minOcc       Minimum occurrences to include a topic (default 2)
 * @param coverageThreshold  Coverage fraction below which a gap is flagged (default 0.3)
 */
export function computeKbGaps(
  calls: CallRow[],
  kbContents: string[],
  minOcc = 2,
  coverageThreshold = 0.3,
): { gaps: KbGap[]; coverageScore: number; totalTopics: number; coveredTopics: number } {
  // Build KB token pool (union of all tokens across all KB chunks)
  const kbTokenPool = new Set<string>();
  for (const content of kbContents) {
    for (const token of tokenize(content)) {
      kbTokenPool.add(token);
    }
  }

  // Collect topics from unresolved calls
  const unresolved = calls.filter(c => isFollowUpRequired(c));
  const topicOccurrences = new Map<string, number>();

  for (const call of unresolved) {
    for (const topic of getTopics(call)) {
      topicOccurrences.set(topic, (topicOccurrences.get(topic) ?? 0) + 1);
    }
  }

  let coveredCount = 0;
  let totalCount = 0;
  const gaps: KbGap[] = [];

  for (const [topic, occurrences] of topicOccurrences) {
    if (occurrences < minOcc) continue;
    totalCount++;

    const topicTokens = tokenize(topic);
    if (topicTokens.length === 0) {
      // Single-word topic with no tokens after filter: check direct inclusion
      if (kbTokenPool.has(topic.toLowerCase())) {
        coveredCount++;
      } else {
        gaps.push({ topic, occurrences, coverage: 0 });
      }
      continue;
    }

    const matchCount = topicTokens.filter(t => kbTokenPool.has(t)).length;
    const coverage = parseFloat((matchCount / topicTokens.length).toFixed(4));

    if (coverage >= coverageThreshold) {
      coveredCount++;
    } else {
      gaps.push({ topic, occurrences, coverage });
    }
  }

  const coverageScore = totalCount === 0 ? 1 : parseFloat((coveredCount / totalCount).toFixed(4));

  return {
    gaps: gaps.sort((a, b) => b.occurrences - a.occurrences),
    coverageScore,
    totalTopics: totalCount,
    coveredTopics: coveredCount,
  };
}

// ─── findCallerHistory ────────────────────────────────────────────────────────

/**
 * Look up a caller's past calls and derive a pre-call brief.
 *
 * Matches by normalized name. Returns last N calls, open action items,
 * and a risk flag based on recent sentiment trend.
 */
export function findCallerHistory(
  calls: CallRow[],
  callerName: string,
  maxCalls = 5,
): CallerHistory {
  const normalizedTarget = normalizeName(callerName);

  if (!normalizedTarget || normalizedTarget === 'unknown caller') {
    return {
      isReturning: false,
      callerName,
      totalCalls: 0,
      lastCalls: [],
      openActionItems: [],
      riskFlag: 'none',
    };
  }

  // Match past calls by normalized name
  const matched = calls.filter(c => {
    const n = normalizeName(c.caller_name ?? '');
    return n && n !== 'unknown caller' && n === normalizedTarget;
  }).sort((a, b) => {
    // Most recent first
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  if (matched.length === 0) {
    return {
      isReturning: false,
      callerName,
      totalCalls: 0,
      lastCalls: [],
      openActionItems: [],
      riskFlag: 'none',
    };
  }

  const recent = matched.slice(0, maxCalls);

  // Open action items: from calls where followUpRequired=true, extract actionItems
  const openActionItems: string[] = [];
  for (const call of matched) {
    if (isFollowUpRequired(call)) {
      const s = parseSummary(call.summary);
      const items = Array.isArray(s.actionItems) ? s.actionItems : [];
      for (const item of items) {
        const text = item.text ?? item.description ?? '';
        if (text.trim()) openActionItems.push(text.trim());
      }
    }
  }

  // Risk flag: look at sentiment trend of last 3 calls
  const last3 = recent.slice(0, 3);
  const negativeCount = last3.filter(c => NEGATIVE_SENTIMENTS.has(getSentiment(c))).length;
  const hasHighRisk = last3.some(c => {
    const s = parseSummary(c.summary);
    return s.riskLevel === 'high' || s.riskLevel === 'critical';
  });

  let riskFlag: 'none' | 'medium' | 'high' = 'none';
  if (hasHighRisk || negativeCount >= 2) riskFlag = 'high';
  else if (negativeCount === 1) riskFlag = 'medium';

  return {
    isReturning: true,
    callerName: matched[0].caller_name ?? callerName,
    totalCalls: matched.length,
    lastCalls: recent.map(c => {
      const s = parseSummary(c.summary);
      return {
        date: c.date ?? '',
        sentiment: getSentiment(c),
        category: c.category ?? 'uncategorized',
        summaryText: (typeof s === 'object' && 'summaryText' in s ? (s as Record<string, unknown>).summaryText as string : '') ?? '',
        followUpRequired: isFollowUpRequired(c),
      };
    }),
    openActionItems: [...new Set(openActionItems)].slice(0, 10),
    riskFlag,
  };
}
