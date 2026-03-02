import { ragService } from './ragService';
import type {
  ClusterCopilotAction,
  ClusterCopilotEvidenceMetric,
  ClusterCopilotPlan,
  ClusterCopilotScoreCard,
  CustomerCluster,
  CustomerGraphFilters,
  CustomerGraphModel,
  CustomerInteraction,
  CustomerProfile,
  CustomerSignalBundle,
  GraphBuildOptions,
  NormalizedCategory,
  NormalizedHistoryItem,
  SimilarityBreakdown,
  SimilarityEdge,
} from '../types/customerGraph';

const DEFAULT_CATEGORY: NormalizedCategory = {
  id: 'uncategorized',
  name: 'Uncategorized',
  color: 'gray',
  description: '',
};

const DEFAULT_OPTIONS: GraphBuildOptions = {
  maxNeighbors: 4,
  minScore: 0.58,
  semanticEnabled: false,
  semanticTimeoutMs: 4000,
  cacheTtlMs: 5 * 60 * 1000,
  cacheMode: 'default',
};

const CACHE_KEY_PREFIX = 'clerktree_customer_graph_cache_v2';
const MEMORY_CACHE = new Map<string, { expiresAt: number; data: CustomerGraphModel }>();
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const COPILOT_ALGORITHM_VERSION = 'cluster-copilot-v1.0.0';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 'he', 'her', 'here', 'his',
  'i', 'in', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or', 'our', 'she', 'that', 'the', 'their', 'them',
  'they', 'this', 'to', 'was', 'we', 'were', 'with', 'you', 'your', 'hello', 'hi', 'thanks', 'thank', 'please',
  'need', 'want', 'help', 'today', 'about', 'just', 'call', 'chat', 'issue', 'problem', 'customer', 'caller',
]);

const PRIORITY_RISK: Record<string, number> = {
  critical: 1,
  high: 0.8,
  medium: 0.45,
  low: 0.2,
};

const POSITIVE_SENTIMENTS = new Set(['very_positive', 'positive', 'slightly_positive']);
const NEGATIVE_SENTIMENTS = new Set(['very_negative', 'negative', 'slightly_negative', 'anxious', 'urgent']);

const RISK_INTENT_HINTS = [
  'refund',
  'cancel',
  'outage',
  'downtime',
  'complaint',
  'escalation',
  'frustrated',
  'broken',
  'chargeback',
  'unresolved',
  'churn',
  'urgent',
];

const UPSELL_INTENT_HINTS = [
  'upgrade',
  'enterprise',
  'premium',
  'pricing',
  'add-on',
  'expansion',
  'annual',
  'plan',
  'seat',
  'bundle',
  'feature',
  'purchase',
];

const REENGAGE_INTENT_HINTS = [
  'followup',
  'follow-up',
  'trial',
  'inactive',
  'reconnect',
  'nudge',
  'checkin',
  'reminder',
  'revisit',
  'paused',
  'cold',
  'return',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeName(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function normalizeTag(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, '')
    .trim();
}

function normalizePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7) return undefined;
  return digits;
}

function normalizeEmail(value: string): string | undefined {
  const email = normalizeWhitespace(value).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return undefined;
  return email;
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => normalizeWhitespace(entry))
    .filter(Boolean);
}

function tokenizeIntent(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function takeTopByFrequency(values: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}

function intersection(valuesA: string[], valuesB: string[]): string[] {
  const setB = new Set(valuesB);
  return unique(valuesA.filter((entry) => setB.has(entry)));
}

function jaccard(valuesA: string[], valuesB: string[]): number {
  if (!valuesA.length && !valuesB.length) return 0;
  const setA = new Set(valuesA);
  const setB = new Set(valuesB);
  let shared = 0;
  for (const value of setA) {
    if (setB.has(value)) shared += 1;
  }
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;
  return shared / union;
}

function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (!vectorA.length || vectorA.length !== vectorB.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < vectorA.length; i += 1) {
    const a = vectorA[i];
    const b = vectorB[i];
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash >>> 0).toString(36);
}

function keywordSignalScore(values: string[], hints: string[]): number {
  if (!values.length) return 0;

  const normalized = values
    .map((value) => normalizeTag(value))
    .filter(Boolean);

  if (!normalized.length) return 0;

  let hits = 0;
  for (const hint of hints) {
    if (normalized.some((value) => value.includes(hint))) {
      hits += 1;
    }
  }

  return clamp(hits / Math.max(4, Math.min(8, hints.length)), 0, 1);
}

function formatPercent(value: number): string {
  return `${Math.round(clamp(value, 0, 1) * 100)}%`;
}

function formatSignedPercent(value: number): string {
  const bounded = clamp(value, -1, 1);
  const raw = Math.round(Math.abs(bounded) * 100);
  if (raw === 0) return '0%';
  return `${bounded > 0 ? '+' : '-'}${raw}%`;
}

function formatDays(value: number): string {
  const rounded = Math.max(0, Math.round(value));
  return `${rounded}d`;
}

function resolveCategory(value: unknown): NormalizedCategory {
  if (!isRecord(value)) return DEFAULT_CATEGORY;

  const id = typeof value.id === 'string' && value.id.trim() ? value.id : DEFAULT_CATEGORY.id;
  const name = typeof value.name === 'string' && value.name.trim() ? value.name : DEFAULT_CATEGORY.name;
  const color = typeof value.color === 'string' && value.color.trim() ? value.color : DEFAULT_CATEGORY.color;
  const description = typeof value.description === 'string' ? value.description : DEFAULT_CATEGORY.description;

  return {
    id,
    name,
    color,
    description,
  };
}

function resolvePriority(value: unknown): 'critical' | 'high' | 'medium' | 'low' {
  if (typeof value !== 'string') return 'medium';
  if (value === 'critical' || value === 'high' || value === 'medium' || value === 'low') return value;
  return 'medium';
}

function resolveType(value: unknown): 'voice' | 'text' {
  return value === 'voice' ? 'voice' : 'text';
}

function resolveSummaryFields(summaryValue: unknown): {
  summaryText: string;
  topics: string[];
  sentiment: string;
} {
  if (!isRecord(summaryValue)) {
    return {
      summaryText: '',
      topics: [],
      sentiment: 'neutral',
    };
  }

  const summaryText = typeof summaryValue.summaryText === 'string'
    ? summaryValue.summaryText
    : (typeof summaryValue.notes === 'string' ? summaryValue.notes : '');

  const topics = toStringArray(summaryValue.topics).map(normalizeTag).filter(Boolean);
  const sentiment = typeof summaryValue.sentiment === 'string' ? summaryValue.sentiment : 'neutral';

  return {
    summaryText: normalizeWhitespace(summaryText),
    topics,
    sentiment,
  };
}

function resolveContact(extractedFieldsValue: unknown, summaryText: string): { email?: string; phone?: string } {
  let email: string | undefined;
  let phone: string | undefined;

  if (Array.isArray(extractedFieldsValue)) {
    for (const field of extractedFieldsValue) {
      if (!isRecord(field)) continue;

      const label = typeof field.label === 'string' ? field.label.toLowerCase() : '';
      const id = typeof field.id === 'string' ? field.id.toLowerCase() : '';
      const value = typeof field.value === 'string' ? field.value : '';

      if (!email && (label.includes('email') || id.includes('email') || label.includes('contact'))) {
        email = normalizeEmail(value);
      }

      if (!phone && (label.includes('phone') || label.includes('mobile') || id.includes('phone') || id.includes('mobile'))) {
        phone = normalizePhone(value);
      }
    }
  }

  if (!email && summaryText) {
    const emailMatch = summaryText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (emailMatch?.[0]) {
      email = normalizeEmail(emailMatch[0]);
    }
  }

  if (!phone && summaryText) {
    const phoneMatch = summaryText.match(/\+?[0-9][0-9\s\-()]{6,}[0-9]/);
    if (phoneMatch?.[0]) {
      phone = normalizePhone(phoneMatch[0]);
    }
  }

  return {
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
  };
}

function buildSignalBundle(interactions: CustomerInteraction[]): CustomerSignalBundle {
  const topics: string[] = [];
  const tags: string[] = [];
  const categories: string[] = [];
  const priorities: string[] = [];
  const sentiments: string[] = [];
  const intentTokens: string[] = [];

  for (const interaction of interactions) {
    topics.push(...interaction.topics.map(normalizeTag).filter(Boolean));
    tags.push(...interaction.tags.map(normalizeTag).filter(Boolean));
    categories.push(interaction.category.id);
    priorities.push(interaction.priority);
    sentiments.push(interaction.sentiment);
    intentTokens.push(...tokenizeIntent(interaction.summaryText));
  }

  return {
    topics: takeTopByFrequency(topics, 16),
    tags: takeTopByFrequency(tags, 16),
    categories: takeTopByFrequency(categories, 8),
    priorities: takeTopByFrequency(priorities, 6),
    sentiments: takeTopByFrequency(sentiments, 8),
    intentTokens: takeTopByFrequency(intentTokens, 20),
  };
}

function computeProfileRisk(interactions: CustomerInteraction[]): number {
  if (!interactions.length) return 0;

  let weightedRisk = 0;
  for (const interaction of interactions) {
    const priorityRisk = PRIORITY_RISK[interaction.priority] || PRIORITY_RISK.medium;
    const sentimentPenalty = NEGATIVE_SENTIMENTS.has(interaction.sentiment) ? 0.2 : 0;
    weightedRisk += clamp(priorityRisk + sentimentPenalty, 0, 1);
  }

  return clamp(weightedRisk / interactions.length, 0, 1);
}

function computeOpportunity(interactions: CustomerInteraction[]): number {
  if (!interactions.length) return 0;

  let score = 0;
  for (const interaction of interactions) {
    const positivity = POSITIVE_SENTIMENTS.has(interaction.sentiment) ? 0.6 : 0;
    const salesSignal = interaction.tags.some((tag) => tag.includes('sales') || tag.includes('upgrade') || tag.includes('pricing'))
      || interaction.topics.some((topic) => topic.includes('sales') || topic.includes('plan') || topic.includes('pricing'));

    score += positivity + (salesSignal ? 0.5 : 0);
  }

  return clamp(score / interactions.length, 0, 1);
}

function buildEmbeddingText(profile: CustomerProfile): string {
  const summaries = profile.interactions
    .slice(-5)
    .map((interaction) => interaction.summaryText)
    .filter(Boolean)
    .join(' ');

  return [
    profile.displayName,
    profile.signal.topics.join(' '),
    profile.signal.tags.join(' '),
    profile.signal.categories.join(' '),
    profile.signal.intentTokens.join(' '),
    summaries,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function computeSharedSignalCount(profile: CustomerProfile, item: NormalizedHistoryItem): number {
  const sharedTopics = intersection(profile.signal.topics, item.topics).length;
  const sharedTags = intersection(profile.signal.tags, item.tags).length;
  return sharedTopics + sharedTags;
}

function resolveProfileId(item: NormalizedHistoryItem): string {
  if (item.contact.email) {
    return `cust-email-${hashString(item.contact.email)}`;
  }

  if (item.contact.phone) {
    return `cust-phone-${hashString(item.contact.phone)}`;
  }

  if (item.normalizedName && item.normalizedName !== 'unknown caller') {
    return `cust-name-${hashString(`${item.normalizedName}:${item.id}`)}`;
  }

  return `cust-anon-${hashString(item.id)}`;
}

function resolveProfileDisplayName(item: NormalizedHistoryItem, fallbackIndex: number): string {
  const callerName = normalizeWhitespace(item.callerName);
  if (!callerName || callerName.toLowerCase() === 'unknown caller') {
    return `Unknown Caller ${fallbackIndex}`;
  }
  return callerName;
}

function buildSimilarityBreakdown(signalA: CustomerSignalBundle, signalB: CustomerSignalBundle): SimilarityBreakdown {
  return {
    topics: jaccard(signalA.topics, signalB.topics),
    tags: jaccard(signalA.tags, signalB.tags),
    categories: jaccard(signalA.categories, signalB.categories),
    priorities: jaccard(signalA.priorities, signalB.priorities),
    sentiments: jaccard(signalA.sentiments, signalB.sentiments),
    intentTokens: jaccard(signalA.intentTokens, signalB.intentTokens),
  };
}

function deterministicScoreFromBreakdown(breakdown: SimilarityBreakdown): number {
  const weights = {
    topics: 3,
    tags: 3,
    categories: 2,
    intentTokens: 2,
    priorities: 1,
    sentiments: 1,
  };

  const weightedTotal =
    breakdown.topics * weights.topics +
    breakdown.tags * weights.tags +
    breakdown.categories * weights.categories +
    breakdown.intentTokens * weights.intentTokens +
    breakdown.priorities * weights.priorities +
    breakdown.sentiments * weights.sentiments;

  const denominator = weights.topics + weights.tags + weights.categories + weights.intentTokens + weights.priorities + weights.sentiments;

  if (!denominator) return 0;
  return weightedTotal / denominator;
}

function buildEvidence(profileA: CustomerProfile, profileB: CustomerProfile, breakdown: SimilarityBreakdown): string[] {
  const evidence: string[] = [];

  const sharedTopics = intersection(profileA.signal.topics, profileB.signal.topics).slice(0, 2);
  const sharedTags = intersection(profileA.signal.tags, profileB.signal.tags).slice(0, 2);
  const sharedIntent = intersection(profileA.signal.intentTokens, profileB.signal.intentTokens).slice(0, 2);

  if (sharedTopics.length) evidence.push(`Topics: ${sharedTopics.join(', ')}`);
  if (sharedTags.length) evidence.push(`Tags: ${sharedTags.join(', ')}`);
  if (sharedIntent.length) evidence.push(`Intent: ${sharedIntent.join(', ')}`);

  if (breakdown.categories > 0) {
    const sharedCategory = intersection(profileA.signal.categories, profileB.signal.categories)[0];
    if (sharedCategory) evidence.push(`Category overlap: ${sharedCategory}`);
  }

  if (!evidence.length) {
    evidence.push('General interaction-pattern similarity');
  }

  return evidence.slice(0, 5);
}

function rehydrateModel(model: CustomerGraphModel): CustomerGraphModel {
  return {
    ...model,
    profiles: model.profiles.map((profile) => ({
      ...profile,
      firstSeen: new Date(profile.firstSeen),
      lastSeen: new Date(profile.lastSeen),
      interactions: profile.interactions.map((interaction) => ({
        ...interaction,
        date: new Date(interaction.date),
      })),
    })),
  };
}

function getCacheStorageKey(cacheKey: string): string {
  return `${CACHE_KEY_PREFIX}:${cacheKey}`;
}

function getCachedModel(cacheKey: string): CustomerGraphModel | null {
  const now = Date.now();
  const inMemory = MEMORY_CACHE.get(cacheKey);

  if (inMemory && inMemory.expiresAt > now) {
    return inMemory.data;
  }

  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(getCacheStorageKey(cacheKey));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { expiresAt: number; data: CustomerGraphModel };
    if (!parsed?.expiresAt || parsed.expiresAt <= now || !parsed.data) {
      return null;
    }

    const hydrated = rehydrateModel(parsed.data);
    MEMORY_CACHE.set(cacheKey, { expiresAt: parsed.expiresAt, data: hydrated });
    return hydrated;
  } catch {
    return null;
  }
}

function setCachedModel(cacheKey: string, model: CustomerGraphModel, cacheTtlMs: number): void {
  const expiresAt = Date.now() + cacheTtlMs;
  MEMORY_CACHE.set(cacheKey, { expiresAt, data: model });

  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      getCacheStorageKey(cacheKey),
      JSON.stringify({ expiresAt, data: model }),
    );
  } catch {
    // Ignore storage quota and serialization errors.
  }
}

function buildCacheKey(
  callHistory: unknown[],
  filters: CustomerGraphFilters,
  options: GraphBuildOptions,
): string {
  const historySignature = callHistory
    .map((item, index) => {
      if (!isRecord(item)) return `idx:${index}`;
      const id = typeof item.id === 'string' ? item.id : `idx:${index}`;
      const dateValue = item.date;
      const date = parseDate(dateValue)?.toISOString() || 'invalid-date';
      return `${id}:${date}`;
    })
    .join('|');

  const filterSignature = [
    filters.startDate ? filters.startDate.toISOString() : 'none',
    filters.endDate ? filters.endDate.toISOString() : 'none',
    filters.interactionType,
    filters.minSimilarity.toFixed(2),
  ].join('|');

  const optionSignature = [
    options.maxNeighbors,
    options.semanticEnabled,
    options.minScore.toFixed(2),
  ].join('|');

  return hashString(`${historySignature}::${filterSignature}::${optionSignature}`);
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Timed out while computing semantic similarity')), timeoutMs);
    }),
  ]);
}

async function defaultEmbeddingProvider(text: string): Promise<number[]> {
  return await ragService.generateEmbedding(text);
}

export function normalizeHistoryItem(item: unknown): NormalizedHistoryItem | null {
  if (!isRecord(item)) return null;

  const summary = resolveSummaryFields(item.summary);
  const directSummaryText = typeof item.summaryText === 'string' ? item.summaryText : '';
  const summaryText = normalizeWhitespace(directSummaryText || summary.summaryText);

  const tags = toStringArray(item.tags).map(normalizeTag).filter(Boolean);
  const topics = unique([...summary.topics, ...toStringArray(item.topics).map(normalizeTag).filter(Boolean), ...tags]);

  const rawCallerName = typeof item.callerName === 'string' ? item.callerName : 'Unknown Caller';
  const callerName = normalizeWhitespace(rawCallerName) || 'Unknown Caller';

  const parsedDate = parseDate(item.date) || new Date(0);

  const idFromRecord = typeof item.id === 'string' && item.id.trim()
    ? item.id
    : `legacy-${hashString(`${callerName}-${parsedDate.toISOString()}-${summaryText}`)}`;

  const contact = resolveContact(item.extractedFields, summaryText);
  const intentTokens = takeTopByFrequency(tokenizeIntent(`${summaryText} ${topics.join(' ')} ${tags.join(' ')}`), 20);

  return {
    id: idFromRecord,
    callerName,
    normalizedName: normalizeName(callerName) || 'unknown caller',
    date: parsedDate,
    type: resolveType(item.type),
    priority: resolvePriority(item.priority),
    sentiment: summary.sentiment || (typeof item.sentiment === 'string' ? item.sentiment : 'neutral'),
    category: resolveCategory(item.category),
    summaryText,
    topics,
    tags,
    intentTokens,
    contact,
  };
}

export function buildCustomerProfiles(
  callHistory: unknown[],
  filters: CustomerGraphFilters,
): CustomerProfile[] {
  const normalizedHistory = callHistory
    .map((entry) => normalizeHistoryItem(entry))
    .filter((entry): entry is NormalizedHistoryItem => entry !== null)
    .filter((entry) => {
      if (filters.interactionType !== 'all' && entry.type !== filters.interactionType) return false;
      if (filters.startDate && entry.date < filters.startDate) return false;
      if (filters.endDate && entry.date > filters.endDate) return false;
      return true;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id));

  const profiles: CustomerProfile[] = [];
  const profileById = new Map<string, CustomerProfile>();
  const emailToProfile = new Map<string, string>();
  const phoneToProfile = new Map<string, string>();
  const nameToProfiles = new Map<string, string[]>();

  let unknownCounter = 1;

  for (const item of normalizedHistory) {
    let matchedProfile: CustomerProfile | undefined;

    if (item.contact.email) {
      const byEmail = emailToProfile.get(item.contact.email);
      if (byEmail) matchedProfile = profileById.get(byEmail);
    }

    if (!matchedProfile && item.contact.phone) {
      const byPhone = phoneToProfile.get(item.contact.phone);
      if (byPhone) matchedProfile = profileById.get(byPhone);
    }

    if (!matchedProfile && item.normalizedName !== 'unknown caller') {
      const candidates = nameToProfiles.get(item.normalizedName) || [];
      for (const candidateId of candidates) {
        const candidate = profileById.get(candidateId);
        if (!candidate) continue;

        if (computeSharedSignalCount(candidate, item) >= 2) {
          matchedProfile = candidate;
          break;
        }
      }
    }

    const interaction: CustomerInteraction = {
      id: item.id,
      date: item.date,
      type: item.type,
      priority: item.priority,
      sentiment: item.sentiment,
      category: item.category,
      summaryText: item.summaryText,
      topics: item.topics,
      tags: item.tags,
      contact: item.contact,
    };

    if (!matchedProfile) {
      const profileId = resolveProfileId(item);
      const profile: CustomerProfile = {
        id: profileId,
        displayName: resolveProfileDisplayName(item, unknownCounter),
        normalizedName: item.normalizedName,
        interactionCount: 1,
        firstSeen: item.date,
        lastSeen: item.date,
        contact: {
          ...(item.contact.email ? { email: item.contact.email } : {}),
          ...(item.contact.phone ? { phone: item.contact.phone } : {}),
        },
        interactions: [interaction],
        signal: {
          topics: item.topics,
          tags: item.tags,
          categories: [item.category.id],
          priorities: [item.priority],
          sentiments: [item.sentiment],
          intentTokens: item.intentTokens,
        },
        riskScore: clamp(PRIORITY_RISK[item.priority] || PRIORITY_RISK.medium, 0, 1),
        opportunityScore: POSITIVE_SENTIMENTS.has(item.sentiment) ? 0.6 : 0.2,
        embeddingText: '',
      };

      if (item.normalizedName === 'unknown caller') {
        unknownCounter += 1;
      }

      profiles.push(profile);
      profileById.set(profileId, profile);

      if (item.contact.email) emailToProfile.set(item.contact.email, profileId);
      if (item.contact.phone) phoneToProfile.set(item.contact.phone, profileId);
      if (item.normalizedName !== 'unknown caller') {
        const existingNames = nameToProfiles.get(item.normalizedName) || [];
        existingNames.push(profileId);
        nameToProfiles.set(item.normalizedName, unique(existingNames));
      }

      continue;
    }

    matchedProfile.interactions.push(interaction);
    matchedProfile.interactionCount = matchedProfile.interactions.length;
    if (item.date < matchedProfile.firstSeen) matchedProfile.firstSeen = item.date;
    if (item.date > matchedProfile.lastSeen) matchedProfile.lastSeen = item.date;

    if (!matchedProfile.contact.email && item.contact.email) {
      matchedProfile.contact.email = item.contact.email;
      emailToProfile.set(item.contact.email, matchedProfile.id);
    }
    if (!matchedProfile.contact.phone && item.contact.phone) {
      matchedProfile.contact.phone = item.contact.phone;
      phoneToProfile.set(item.contact.phone, matchedProfile.id);
    }

    if (
      (!matchedProfile.displayName || matchedProfile.displayName.startsWith('Unknown Caller'))
      && item.callerName
      && item.callerName.toLowerCase() !== 'unknown caller'
    ) {
      matchedProfile.displayName = item.callerName;
      matchedProfile.normalizedName = normalizeName(item.callerName);
    }

    if (matchedProfile.normalizedName && matchedProfile.normalizedName !== 'unknown caller') {
      const existingNames = nameToProfiles.get(matchedProfile.normalizedName) || [];
      existingNames.push(matchedProfile.id);
      nameToProfiles.set(matchedProfile.normalizedName, unique(existingNames));
    }
  }

  for (const profile of profiles) {
    profile.signal = buildSignalBundle(profile.interactions);
    profile.riskScore = computeProfileRisk(profile.interactions);
    profile.opportunityScore = computeOpportunity(profile.interactions);
    profile.embeddingText = buildEmbeddingText(profile);
  }

  return profiles;
}

export async function computeSimilarityEdges(
  profiles: CustomerProfile[],
  options: Partial<GraphBuildOptions> = {},
): Promise<SimilarityEdge[]> {
  const resolvedOptions: GraphBuildOptions = { ...DEFAULT_OPTIONS, ...options };
  if (profiles.length < 2) return [];

  let embeddingsByProfileId = new Map<string, number[]>();

  if (resolvedOptions.semanticEnabled) {
    try {
      const provider = resolvedOptions.embeddingProvider || defaultEmbeddingProvider;
      const pairs = await withTimeout(
        Promise.all(
          profiles.map(async (profile) => {
            const embedding = await provider(profile.embeddingText || profile.displayName);
            return [profile.id, embedding] as const;
          }),
        ),
        resolvedOptions.semanticTimeoutMs,
      );

      embeddingsByProfileId = new Map(pairs);
    } catch {
      embeddingsByProfileId = new Map();
    }
  }

  const scoredEdges: SimilarityEdge[] = [];

  for (let i = 0; i < profiles.length; i += 1) {
    for (let j = i + 1; j < profiles.length; j += 1) {
      const source = profiles[i];
      const target = profiles[j];

      const breakdown = buildSimilarityBreakdown(source.signal, target.signal);
      const deterministicScore = deterministicScoreFromBreakdown(breakdown);

      let semanticScore: number | undefined;
      const sourceEmbedding = embeddingsByProfileId.get(source.id);
      const targetEmbedding = embeddingsByProfileId.get(target.id);

      if (sourceEmbedding && targetEmbedding) {
        semanticScore = clamp((cosineSimilarity(sourceEmbedding, targetEmbedding) + 1) / 2, 0, 1);
      }

      const combinedScore = semanticScore === undefined
        ? deterministicScore
        : (0.6 * deterministicScore + 0.4 * semanticScore);

      if (combinedScore < resolvedOptions.minScore) continue;

      scoredEdges.push({
        id: `${source.id}__${target.id}`,
        source: source.id,
        target: target.id,
        score: clamp(combinedScore, 0, 1),
        deterministicScore: clamp(deterministicScore, 0, 1),
        ...(semanticScore !== undefined ? { semanticScore: clamp(semanticScore, 0, 1) } : {}),
        evidence: buildEvidence(source, target, breakdown),
        breakdown,
      });
    }
  }

  if (!scoredEdges.length) return [];

  const sorted = [...scoredEdges].sort((a, b) => b.score - a.score);
  const selected: SimilarityEdge[] = [];
  const degreeCount = new Map<string, number>();

  for (const edge of sorted) {
    const sourceDegree = degreeCount.get(edge.source) || 0;
    const targetDegree = degreeCount.get(edge.target) || 0;

    if (sourceDegree >= resolvedOptions.maxNeighbors || targetDegree >= resolvedOptions.maxNeighbors) {
      continue;
    }

    selected.push(edge);
    degreeCount.set(edge.source, sourceDegree + 1);
    degreeCount.set(edge.target, targetDegree + 1);
  }

  return selected;
}

export function clusterProfiles(
  profiles: CustomerProfile[],
  edges: SimilarityEdge[],
): CustomerCluster[] {
  if (!profiles.length) return [];

  const adjacency = new Map<string, string[]>();
  for (const profile of profiles) {
    adjacency.set(profile.id, []);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    adjacency.get(edge.target)?.push(edge.source);
  }

  const visited = new Set<string>();
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const clusters: CustomerCluster[] = [];

  let clusterIndex = 1;

  for (const profile of profiles) {
    if (visited.has(profile.id)) continue;

    const stack = [profile.id];
    const memberIds: string[] = [];

    while (stack.length) {
      const current = stack.pop();
      if (!current || visited.has(current)) continue;

      visited.add(current);
      memberIds.push(current);

      const neighbors = adjacency.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) stack.push(neighbor);
      }
    }

    const members = memberIds
      .map((id) => profileById.get(id))
      .filter((entry): entry is CustomerProfile => !!entry);

    const combinedTopics = takeTopByFrequency(members.flatMap((member) => member.signal.topics), 2);
    const combinedTags = takeTopByFrequency(members.flatMap((member) => member.signal.tags), 2);
    const sharedSignals = unique([...combinedTopics, ...combinedTags]).slice(0, 3);

    const riskScore = members.length
      ? clamp(members.reduce((acc, member) => acc + member.riskScore, 0) / members.length, 0, 1)
      : 0;

    const opportunityScore = members.length
      ? clamp(members.reduce((acc, member) => acc + member.opportunityScore, 0) / members.length, 0, 1)
      : 0;

    let label = `Cluster ${clusterIndex}`;
    if (sharedSignals.length) {
      label = sharedSignals.slice(0, 2).join(' · ');
    } else if (members.length === 1) {
      label = members[0].displayName;
    }

    clusters.push({
      id: `cluster-${clusterIndex}`,
      label,
      memberIds,
      memberCount: memberIds.length,
      riskScore,
      opportunityScore,
      sharedSignals,
    });

    clusterIndex += 1;
  }

  return clusters.sort((a, b) => b.memberCount - a.memberCount);
}

type CopilotFeatureKey =
  | 'risk'
  | 'opportunity'
  | 'negativeSentiment'
  | 'positiveSentiment'
  | 'neutralSentiment'
  | 'criticalPriority'
  | 'downwardMomentum'
  | 'upwardMomentum'
  | 'staleness'
  | 'recentActivity'
  | 'cohesion'
  | 'influence'
  | 'riskIntent'
  | 'upsellIntent'
  | 'reengageIntent'
  | 'highValue'
  | 'size'
  | 'riskInverse';

type CopilotFeatures = Record<CopilotFeatureKey, number>;

interface CopilotScoreResult {
  action: ClusterCopilotAction;
  score: number;
  contributions: Array<{ key: CopilotFeatureKey; value: number; contribution: number }>;
}

const COPILOT_WEIGHTS: Record<ClusterCopilotAction, Partial<Record<CopilotFeatureKey, number>>> = {
  save_at_risk: {
    risk: 0.3,
    negativeSentiment: 0.16,
    criticalPriority: 0.12,
    downwardMomentum: 0.13,
    riskIntent: 0.1,
    staleness: 0.09,
    size: 0.05,
    cohesion: 0.05,
  },
  upsell: {
    opportunity: 0.32,
    positiveSentiment: 0.14,
    upsellIntent: 0.17,
    upwardMomentum: 0.13,
    cohesion: 0.08,
    highValue: 0.08,
    influence: 0.05,
    recentActivity: 0.03,
  },
  re_engage: {
    staleness: 0.28,
    downwardMomentum: 0.2,
    neutralSentiment: 0.1,
    reengageIntent: 0.12,
    opportunity: 0.12,
    positiveSentiment: 0.04,
    recentActivity: 0.1,
    size: 0.04,
  },
  nurture: {
    recentActivity: 0.22,
    cohesion: 0.2,
    positiveSentiment: 0.18,
    opportunity: 0.16,
    riskInverse: 0.12,
    influence: 0.12,
  },
};

function scoreCopilotAction(
  action: ClusterCopilotAction,
  features: CopilotFeatures,
): CopilotScoreResult {
  const weights = COPILOT_WEIGHTS[action];
  let score = 0;
  const contributions: Array<{ key: CopilotFeatureKey; value: number; contribution: number }> = [];

  for (const [key, weight] of Object.entries(weights) as Array<[CopilotFeatureKey, number]>) {
    const value = clamp(features[key] || 0, 0, 1);
    const contribution = value * weight;
    score += contribution;
    contributions.push({ key, value, contribution });
  }

  contributions.sort((a, b) => b.contribution - a.contribution);

  return {
    action,
    score: clamp(score, 0, 1),
    contributions,
  };
}

function resolveCopilotRationale(
  action: ClusterCopilotAction,
  contributions: Array<{ key: CopilotFeatureKey; value: number; contribution: number }>,
  momentum: number,
  daysSinceLastInteraction: number,
): string[] {
  const reasons: string[] = [];

  for (const { key, value, contribution } of contributions) {
    if (contribution < 0.035) continue;

    switch (key) {
      case 'risk':
        reasons.push(`Risk pressure is elevated at ${formatPercent(value)} across this cluster.`);
        break;
      case 'opportunity':
        reasons.push(`Expansion potential is strong at ${formatPercent(value)} based on recent interactions.`);
        break;
      case 'negativeSentiment':
        reasons.push(`Negative sentiment concentration is high (${formatPercent(value)}), indicating churn risk.`);
        break;
      case 'positiveSentiment':
        reasons.push(`Positive sentiment remains healthy (${formatPercent(value)}), enabling proactive growth motions.`);
        break;
      case 'neutralSentiment':
        reasons.push(`Many interactions are neutral (${formatPercent(value)}), making reactivation messaging effective.`);
        break;
      case 'criticalPriority':
        reasons.push(`High-priority signals are frequent (${formatPercent(value)} of interactions).`);
        break;
      case 'downwardMomentum':
        reasons.push(`Momentum declined ${formatSignedPercent(momentum)} versus the prior 14-day window.`);
        break;
      case 'upwardMomentum':
        reasons.push(`Momentum improved ${formatSignedPercent(momentum)} in the latest 14-day window.`);
        break;
      case 'staleness':
        reasons.push(`Last touchpoint is ${formatDays(daysSinceLastInteraction)} ago, so urgency to act is rising.`);
        break;
      case 'recentActivity':
        reasons.push(`Recent activity intensity is ${formatPercent(value)}, giving a strong execution window.`);
        break;
      case 'cohesion':
        reasons.push(`Cluster cohesion is ${formatPercent(value)}, so one playbook can scale across members.`);
        break;
      case 'influence':
        reasons.push(`Network influence is ${formatPercent(value)}, so this cluster can amplify downstream outcomes.`);
        break;
      case 'riskIntent':
        reasons.push('Language signals show refund/cancellation/escalation intent across multiple members.');
        break;
      case 'upsellIntent':
        reasons.push('Pricing and upgrade intent terms are recurring, indicating commercial readiness.');
        break;
      case 'reengageIntent':
        reasons.push('Follow-up and reactivation intent terms suggest a re-engagement campaign will land well.');
        break;
      case 'highValue':
        reasons.push(`High-value member concentration is ${formatPercent(value)} within this segment.`);
        break;
      case 'size':
        reasons.push(`Cluster size (${formatPercent(value)} normalized) makes this action materially impactful.`);
        break;
      case 'riskInverse':
        reasons.push(`Risk is currently controlled (${formatPercent(value)} stable baseline).`);
        break;
      default:
        break;
    }

    if (reasons.length >= 3) break;
  }

  if (!reasons.length) {
    const fallbackByAction: Record<ClusterCopilotAction, string> = {
      save_at_risk: 'Signals indicate elevated retention risk that should be addressed immediately.',
      upsell: 'Signals indicate this cluster is likely to convert with value-led expansion.',
      re_engage: 'Signals indicate this cluster needs a structured reactivation motion.',
      nurture: 'Signals indicate this cluster should stay in a low-friction nurture stream.',
    };
    reasons.push(fallbackByAction[action]);
  }

  return reasons;
}

function buildCopilotPlaybook(action: ClusterCopilotAction, sharedSignals: string[]): string[] {
  const signalHint = sharedSignals[0] || 'primary cluster signal';

  if (action === 'save_at_risk') {
    return [
      `Route top-risk members to a retention queue in under 2 hours, keyed on "${signalHint}".`,
      'Send a resolution-first outreach with owner + ETA, then confirm value recovery path.',
      'Escalate unresolved accounts after one follow-up and monitor 7-day sentiment delta.',
      'Track save-rate, time-to-resolution, and repeat-contact reduction weekly.',
    ];
  }

  if (action === 'upsell') {
    return [
      `Prioritize members with pricing/feature intent, starting with "${signalHint}" narratives.`,
      'Run value-proven outreach: ROI proof, plan comparison, and frictionless upgrade path.',
      'Offer a 14-day pilot or scoped add-on to reduce decision friction.',
      'Track conversion rate, expansion ARR, and sales-cycle compression.',
    ];
  }

  if (action === 're_engage') {
    return [
      `Launch a reactivation sequence referencing "${signalHint}" and last known context.`,
      'Use a 3-step cadence: reminder, value recap, final incentive within 10 days.',
      'Push warm responders to assisted onboarding or success-call scheduling.',
      'Track reactivation rate, reply rate, and next-touch conversion.',
    ];
  }

  return [
    'Keep this segment on a low-friction nurture cadence with educational touchpoints.',
    `Refresh messaging around "${signalHint}" every 2 weeks based on new interactions.`,
    'Promote success stories and lightweight check-ins to preserve engagement.',
    'Track engagement consistency and migration into upsell-ready cohorts.',
  ];
}

function buildCopilotOutcome(
  action: ClusterCopilotAction,
  score: number,
): ClusterCopilotPlan['expectedOutcome'] {
  if (action === 'save_at_risk') {
    return {
      metric: 'retention',
      lift: clamp(0.06 + score * 0.18, 0.06, 0.26),
      windowDays: 21,
    };
  }

  if (action === 'upsell') {
    return {
      metric: 'revenue',
      lift: clamp(0.08 + score * 0.22, 0.08, 0.3),
      windowDays: 30,
    };
  }

  if (action === 're_engage') {
    return {
      metric: 'engagement',
      lift: clamp(0.1 + score * 0.2, 0.1, 0.3),
      windowDays: 14,
    };
  }

  return {
    metric: 'engagement',
    lift: clamp(0.05 + score * 0.12, 0.05, 0.18),
    windowDays: 28,
  };
}

export function computeClusterCopilotPlans(
  clusters: CustomerCluster[],
  profiles: CustomerProfile[],
  edges: SimilarityEdge[],
): CustomerCluster[] {
  if (!clusters.length) return clusters;

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const clusterByMemberId = new Map<string, string>();
  const degreeByProfileId = new Map<string, number>();
  const internalEdgesByCluster = new Map<string, SimilarityEdge[]>();

  for (const cluster of clusters) {
    for (const memberId of cluster.memberIds) {
      clusterByMemberId.set(memberId, cluster.id);
    }
    internalEdgesByCluster.set(cluster.id, []);
  }

  for (const edge of edges) {
    degreeByProfileId.set(edge.source, (degreeByProfileId.get(edge.source) || 0) + edge.score);
    degreeByProfileId.set(edge.target, (degreeByProfileId.get(edge.target) || 0) + edge.score);

    const sourceClusterId = clusterByMemberId.get(edge.source);
    const targetClusterId = clusterByMemberId.get(edge.target);
    if (sourceClusterId && sourceClusterId === targetClusterId) {
      internalEdgesByCluster.get(sourceClusterId)?.push(edge);
    }
  }

  const maxInfluence = Math.max(1, ...Array.from(degreeByProfileId.values()));
  const referenceTimestamp = Math.max(
    Date.now(),
    ...profiles.map((profile) => profile.lastSeen.getTime()).filter((value) => !Number.isNaN(value)),
  );

  return clusters.map((cluster) => {
    const members = cluster.memberIds
      .map((memberId) => profileById.get(memberId))
      .filter((profile): profile is CustomerProfile => !!profile);

    if (!members.length) {
      return cluster;
    }

    const allInteractions = members.flatMap((member) => member.interactions);
    const sentimentTotal = Math.max(1, allInteractions.length);
    const negativeSentimentRatio = allInteractions.filter((entry) => NEGATIVE_SENTIMENTS.has(entry.sentiment)).length / sentimentTotal;
    const positiveSentimentRatio = allInteractions.filter((entry) => POSITIVE_SENTIMENTS.has(entry.sentiment)).length / sentimentTotal;
    const neutralSentimentRatio = clamp(1 - negativeSentimentRatio - positiveSentimentRatio, 0, 1);
    const criticalPriorityRatio = allInteractions.filter((entry) => entry.priority === 'critical' || entry.priority === 'high').length / sentimentTotal;

    let recentCount = 0;
    let previousCount = 0;
    for (const interaction of allInteractions) {
      const ageDays = (referenceTimestamp - interaction.date.getTime()) / DAY_IN_MS;
      if (ageDays <= 14) {
        recentCount += 1;
      } else if (ageDays <= 28) {
        previousCount += 1;
      }
    }

    const momentum = clamp((recentCount - previousCount) / Math.max(1, previousCount + 1), -1, 1);
    const recentActivityNorm = clamp(recentCount / Math.max(1, members.length * 2), 0, 1);

    const latestSeenTimestamp = Math.max(...members.map((member) => member.lastSeen.getTime()));
    const daysSinceLastInteraction = Math.max(0, (referenceTimestamp - latestSeenTimestamp) / DAY_IN_MS);
    const staleness = clamp(daysSinceLastInteraction / 60, 0, 1);

    const signalUniverse = unique([
      ...members.flatMap((member) => member.signal.topics),
      ...members.flatMap((member) => member.signal.tags),
      ...members.flatMap((member) => member.signal.intentTokens),
    ]);

    const riskIntent = keywordSignalScore(signalUniverse, RISK_INTENT_HINTS);
    const upsellIntent = keywordSignalScore(signalUniverse, UPSELL_INTENT_HINTS);
    const reengageIntent = keywordSignalScore(signalUniverse, REENGAGE_INTENT_HINTS);
    const highValueRatio = members.filter((member) => member.opportunityScore >= 0.65).length / members.length;

    const internalEdges = internalEdgesByCluster.get(cluster.id) || [];
    const cohesion = average(internalEdges.map((edge) => edge.score));
    const influence = average(members.map((member) => (degreeByProfileId.get(member.id) || 0) / maxInfluence));
    const size = clamp(Math.log2(cluster.memberCount + 1) / 5, 0, 1);

    const features: CopilotFeatures = {
      risk: cluster.riskScore,
      opportunity: cluster.opportunityScore,
      negativeSentiment: negativeSentimentRatio,
      positiveSentiment: positiveSentimentRatio,
      neutralSentiment: neutralSentimentRatio,
      criticalPriority: criticalPriorityRatio,
      downwardMomentum: clamp(-momentum, 0, 1),
      upwardMomentum: clamp(momentum, 0, 1),
      staleness,
      recentActivity: recentActivityNorm,
      cohesion,
      influence,
      riskIntent,
      upsellIntent,
      reengageIntent,
      highValue: highValueRatio,
      size,
      riskInverse: clamp(1 - cluster.riskScore, 0, 1),
    };

    const results: CopilotScoreResult[] = [
      scoreCopilotAction('save_at_risk', features),
      scoreCopilotAction('upsell', features),
      scoreCopilotAction('re_engage', features),
      scoreCopilotAction('nurture', features),
    ].sort((a, b) => b.score - a.score);

    const top = results[0];
    const second = results[1];
    const softmaxTemperature = 0.23;
    const softmaxDenominator = results
      .map((entry) => Math.exp(entry.score / softmaxTemperature))
      .reduce((acc, value) => acc + value, 0);
    const topProbability = softmaxDenominator > 0
      ? Math.exp(top.score / softmaxTemperature) / softmaxDenominator
      : 0.5;

    const confidence = clamp(
      0.42 + topProbability * 0.42 + (top.score - second.score) * 0.24,
      0.42,
      0.97,
    );

    const scoreCard: ClusterCopilotScoreCard = {
      save_at_risk: results.find((entry) => entry.action === 'save_at_risk')?.score || 0,
      upsell: results.find((entry) => entry.action === 'upsell')?.score || 0,
      re_engage: results.find((entry) => entry.action === 're_engage')?.score || 0,
      nurture: results.find((entry) => entry.action === 'nurture')?.score || 0,
    };

    const rationale = resolveCopilotRationale(
      top.action,
      top.contributions,
      momentum,
      daysSinceLastInteraction,
    );

    const evidence: ClusterCopilotEvidenceMetric[] = [
      {
        id: 'risk',
        label: 'Risk pressure',
        value: clamp(cluster.riskScore, 0, 1),
        formattedValue: formatPercent(cluster.riskScore),
        direction: 'up',
      },
      {
        id: 'opportunity',
        label: 'Expansion potential',
        value: clamp(cluster.opportunityScore, 0, 1),
        formattedValue: formatPercent(cluster.opportunityScore),
        direction: 'up',
      },
      {
        id: 'momentum',
        label: '14-day momentum',
        value: clamp(Math.abs(momentum), 0, 1),
        formattedValue: formatSignedPercent(momentum),
        direction: momentum > 0 ? 'up' : momentum < 0 ? 'down' : 'neutral',
      },
      {
        id: 'staleness',
        label: 'Last interaction age',
        value: staleness,
        formattedValue: formatDays(daysSinceLastInteraction),
        direction: daysSinceLastInteraction > 21 ? 'up' : 'neutral',
      },
      {
        id: 'cohesion',
        label: 'Cluster cohesion',
        value: cohesion,
        formattedValue: formatPercent(cohesion),
        direction: 'up',
      },
    ];

    const expectedOutcome = buildCopilotOutcome(top.action, top.score);
    const summary = `${top.action.replaceAll('_', ' ')} · ${formatPercent(confidence)} confidence. ${rationale[0]}`;

    const copilot: ClusterCopilotPlan = {
      clusterId: cluster.id,
      primaryAction: top.action,
      secondaryAction: second?.action,
      confidence,
      scoreCard,
      rationale,
      playbook: buildCopilotPlaybook(top.action, cluster.sharedSignals),
      evidence,
      summary,
      expectedOutcome,
      algorithmVersion: COPILOT_ALGORITHM_VERSION,
    };

    return {
      ...cluster,
      copilot,
    };
  });
}

export async function buildGraphModel(
  callHistory: unknown[],
  filters: CustomerGraphFilters,
  options: Partial<GraphBuildOptions> = {},
): Promise<CustomerGraphModel> {
  const resolvedOptions: GraphBuildOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    minScore: clamp(filters.minSimilarity || options.minScore || DEFAULT_OPTIONS.minScore, 0, 1),
  };

  const cacheKey = buildCacheKey(callHistory, filters, resolvedOptions);

  if (resolvedOptions.cacheMode !== 'off' && resolvedOptions.cacheMode !== 'refresh') {
    const cached = getCachedModel(cacheKey);
    if (cached) return cached;
  }

  const profiles = buildCustomerProfiles(callHistory, filters);
  const edges = await computeSimilarityEdges(profiles, resolvedOptions);
  const clusters = clusterProfiles(profiles, edges);

  const stats = {
    totalCustomers: profiles.length,
    totalEdges: edges.length,
    totalClusters: clusters.length,
    highRiskClusters: clusters.filter((cluster) => cluster.riskScore >= 0.65).length,
    opportunityClusters: clusters.filter((cluster) => cluster.opportunityScore >= 0.65).length,
  };

  const model: CustomerGraphModel = {
    generatedAt: new Date().toISOString(),
    profiles,
    edges,
    clusters,
    stats,
  };

  if (resolvedOptions.cacheMode !== 'off') {
    setCachedModel(cacheKey, model, resolvedOptions.cacheTtlMs);
  }

  return model;
}
