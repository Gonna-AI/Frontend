import {
    ClusterCopilotAction,
    ClusterCopilotPlan,
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
    ClusterCopilotEvidenceMetric,
    ClusterCopilotScoreCard,
} from './types.ts';

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
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const COPILOT_ALGORITHM_VERSION = 'cluster-copilot-groq-v1';

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

const RISK_INTENT_HINTS = ['refund', 'cancel', 'outage', 'downtime', 'complaint', 'escalation', 'frustrated', 'broken', 'chargeback', 'unresolved', 'churn', 'urgent'];
const UPSELL_INTENT_HINTS = ['upgrade', 'enterprise', 'premium', 'pricing', 'add-on', 'expansion', 'annual', 'plan', 'seat', 'bundle', 'feature', 'purchase'];
const REENGAGE_INTENT_HINTS = ['followup', 'follow-up', 'trial', 'inactive', 'reconnect', 'nudge', 'checkin', 'reminder', 'revisit', 'paused', 'cold', 'return'];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

function normalizeName(value: string): string {
    return normalizeWhitespace(value).toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function normalizeTag(value: string): string {
    return normalizeWhitespace(value).toLowerCase().replace(/[^a-z0-9\-\s]/g, '').trim();
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
    return value.filter((entry): entry is string => typeof entry === 'string').map((entry) => normalizeWhitespace(entry)).filter(Boolean);
}

function tokenizeIntent(text: string): string[] {
    if (!text) return [];
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).map((token) => token.trim()).filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function unique(values: string[]): string[] {
    return Array.from(new Set(values.filter(Boolean)));
}

function takeTopByFrequency(values: string[], limit: number): string[] {
    const counts = new Map<string, number>();
    for (const value of values) {
        counts.set(value, (counts.get(value) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([value]) => value);
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
    const normalized = values.map((value) => normalizeTag(value)).filter(Boolean);
    if (!normalized.length) return 0;
    let hits = 0;
    for (const hint of hints) {
        if (normalized.some((value) => value.includes(hint))) hits += 1;
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
    return `${Math.max(0, Math.round(value))}d`;
}

function resolveCategory(value: unknown): NormalizedCategory {
    if (!isRecord(value)) return DEFAULT_CATEGORY;
    return {
        id: typeof value.id === 'string' && value.id.trim() ? value.id : DEFAULT_CATEGORY.id,
        name: typeof value.name === 'string' && value.name.trim() ? value.name : DEFAULT_CATEGORY.name,
        color: typeof value.color === 'string' && value.color.trim() ? value.color : DEFAULT_CATEGORY.color,
        description: typeof value.description === 'string' ? value.description : DEFAULT_CATEGORY.description,
    };
}

function resolvePriority(value: unknown): 'critical' | 'high' | 'medium' | 'low' {
    if (value === 'critical' || value === 'high' || value === 'medium' || value === 'low') return value;
    return 'medium';
}

function resolveType(value: unknown): 'voice' | 'text' {
    return value === 'voice' ? 'voice' : 'text';
}

function resolveSummaryFields(summaryValue: unknown) {
    if (!isRecord(summaryValue)) return { summaryText: '', topics: [], sentiment: 'neutral' };
    const summaryText = typeof summaryValue.summaryText === 'string' ? summaryValue.summaryText : (typeof summaryValue.notes === 'string' ? summaryValue.notes : '');
    const topics = toStringArray(summaryValue.topics).map(normalizeTag).filter(Boolean);
    const sentiment = typeof summaryValue.sentiment === 'string' ? summaryValue.sentiment : 'neutral';
    return { summaryText: normalizeWhitespace(summaryText), topics, sentiment };
}

function resolveContact(extractedFieldsValue: unknown, summaryText: string) {
    let email: string | undefined;
    let phone: string | undefined;
    if (Array.isArray(extractedFieldsValue)) {
        for (const field of extractedFieldsValue) {
            if (!isRecord(field)) continue;
            const label = typeof field.label === 'string' ? field.label.toLowerCase() : '';
            const id = typeof field.id === 'string' ? field.id.toLowerCase() : '';
            const value = typeof field.value === 'string' ? field.value : '';
            if (!email && (label.includes('email') || id.includes('email') || label.includes('contact'))) email = normalizeEmail(value);
            if (!phone && (label.includes('phone') || label.includes('mobile') || id.includes('phone') || id.includes('mobile'))) phone = normalizePhone(value);
        }
    }
    if (!email && summaryText) {
        const emailMatch = summaryText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        if (emailMatch?.[0]) email = normalizeEmail(emailMatch[0]);
    }
    if (!phone && summaryText) {
        const phoneMatch = summaryText.match(/\\+?[0-9][0-9\\s\\-()]{6,}[0-9]/);
        if (phoneMatch?.[0]) phone = normalizePhone(phoneMatch[0]);
    }
    return { ...(email ? { email } : {}), ...(phone ? { phone } : {}) };
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
    const summaries = profile.interactions.slice(-5).map((interaction) => interaction.summaryText).filter(Boolean).join(' ');
    return [profile.displayName, profile.signal.topics.join(' '), profile.signal.tags.join(' '), profile.signal.categories.join(' '), profile.signal.intentTokens.join(' '), summaries].filter(Boolean).join(' ').trim();
}

function computeSharedSignalCount(profile: CustomerProfile, item: NormalizedHistoryItem): number {
    return intersection(profile.signal.topics, item.topics).length + intersection(profile.signal.tags, item.tags).length;
}

function resolveProfileId(item: NormalizedHistoryItem): string {
    if (item.contact.email) return `cust-email-${hashString(item.contact.email)}`;
    if (item.contact.phone) return `cust-phone-${hashString(item.contact.phone)}`;
    if (item.normalizedName && item.normalizedName !== 'unknown caller') return `cust-name-${hashString(`${item.normalizedName}:${item.id}`)}`;
    return `cust-anon-${hashString(item.id)}`;
}

function resolveProfileDisplayName(item: NormalizedHistoryItem, fallbackIndex: number): string {
    const callerName = normalizeWhitespace(item.callerName);
    if (!callerName || callerName.toLowerCase() === 'unknown caller') return `Unknown Caller ${fallbackIndex}`;
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
    const weights = { topics: 3, tags: 3, categories: 2, intentTokens: 2, priorities: 1, sentiments: 1 };
    const weightedTotal = breakdown.topics * weights.topics + breakdown.tags * weights.tags + breakdown.categories * weights.categories + breakdown.intentTokens * weights.intentTokens + breakdown.priorities * weights.priorities + breakdown.sentiments * weights.sentiments;
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
    if (!evidence.length) evidence.push('General interaction-pattern similarity');
    return evidence.slice(0, 5);
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
    const idFromRecord = typeof item.id === 'string' && item.id.trim() ? item.id : `legacy-${hashString(`${callerName}-${parsedDate.toISOString()}-${summaryText}`)}`;
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

export function buildCustomerProfiles(callHistory: unknown[], filters: CustomerGraphFilters): CustomerProfile[] {
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    const normalizedHistory = callHistory
        .map((entry) => normalizeHistoryItem(entry))
        .filter((entry): entry is NormalizedHistoryItem => entry !== null)
        .filter((entry) => {
            if (filters.interactionType !== 'all' && entry.type !== filters.interactionType) return false;
            if (startDate && entry.date < startDate) return false;
            if (endDate && entry.date > endDate) return false;
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
        if (item.contact.email) matchedProfile = profileById.get(emailToProfile.get(item.contact.email) || '');
        if (!matchedProfile && item.contact.phone) matchedProfile = profileById.get(phoneToProfile.get(item.contact.phone) || '');
        if (!matchedProfile && item.normalizedName !== 'unknown caller') {
            const candidates = nameToProfiles.get(item.normalizedName) || [];
            for (const candidateId of candidates) {
                const candidate = profileById.get(candidateId);
                if (candidate && computeSharedSignalCount(candidate, item) >= 2) {
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
                contact: { ...item.contact },
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
            if (item.normalizedName === 'unknown caller') unknownCounter += 1;
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
        if ((!matchedProfile.displayName || matchedProfile.displayName.startsWith('Unknown Caller')) && item.callerName && item.callerName.toLowerCase() !== 'unknown caller') {
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

export async function computeSimilarityEdges(profiles: CustomerProfile[], options: Partial<GraphBuildOptions> = {}): Promise<SimilarityEdge[]> {
    const resolvedOptions: GraphBuildOptions = { ...DEFAULT_OPTIONS, ...options };
    if (profiles.length < 2) return [];

    const scoredEdges: SimilarityEdge[] = [];
    for (let i = 0; i < profiles.length; i += 1) {
        for (let j = i + 1; j < profiles.length; j += 1) {
            const source = profiles[i];
            const target = profiles[j];
            const breakdown = buildSimilarityBreakdown(source.signal, target.signal);
            const deterministicScore = deterministicScoreFromBreakdown(breakdown);

            if (deterministicScore < resolvedOptions.minScore) continue;

            scoredEdges.push({
                id: `${source.id}__${target.id}`,
                source: source.id,
                target: target.id,
                score: clamp(deterministicScore, 0, 1),
                deterministicScore: clamp(deterministicScore, 0, 1),
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
        if (sourceDegree >= resolvedOptions.maxNeighbors || targetDegree >= resolvedOptions.maxNeighbors) continue;
        selected.push(edge);
        degreeCount.set(edge.source, sourceDegree + 1);
        degreeCount.set(edge.target, targetDegree + 1);
    }

    return selected;
}

export function clusterProfiles(profiles: CustomerProfile[], edges: SimilarityEdge[]): CustomerCluster[] {
    if (!profiles.length) return [];
    const adjacency = new Map<string, string[]>();
    for (const profile of profiles) adjacency.set(profile.id, []);
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

        const members = memberIds.map((id) => profileById.get(id)).filter((entry): entry is CustomerProfile => !!entry);
        const combinedTopics = takeTopByFrequency(members.flatMap((member) => member.signal.topics), 2);
        const combinedTags = takeTopByFrequency(members.flatMap((member) => member.signal.tags), 2);
        const sharedSignals = unique([...combinedTopics, ...combinedTags]).slice(0, 3);
        const riskScore = members.length ? clamp(members.reduce((acc, member) => acc + member.riskScore, 0) / members.length, 0, 1) : 0;
        const opportunityScore = members.length ? clamp(members.reduce((acc, member) => acc + member.opportunityScore, 0) / members.length, 0, 1) : 0;
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

// ---------------------------------------------------- //
// AI Processing specific to edge functions utilizing Groq
// ---------------------------------------------------- //
function normalizeAction(value: string | undefined): ClusterCopilotAction {
    const normalized = (value || '').toLowerCase().replace(/[\\s-]+/g, '_').trim();
    if (normalized === 'save_at_risk' || normalized === 'saveatrisk') return 'save_at_risk';
    if (normalized === 'upsell' || normalized === 'expand' || normalized === 'growth') return 'upsell';
    if (normalized === 're_engage' || normalized === 'reengage' || normalized === 'reactivate') return 're_engage';
    return 'nurture';
}

function normalizeMetric(value: string | undefined): 'retention' | 'revenue' | 'engagement' {
    const normalized = (value || '').toLowerCase().trim();
    if (normalized === 'retention') return 'retention';
    if (normalized === 'revenue' || normalized === 'arr') return 'revenue';
    return 'engagement';
}

function toUnitScore(value: unknown, fallback = 0): number {
    if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
    if (value > 1) return clamp(value / 100, 0, 1);
    if (value < 0) return 0;
    return clamp(value, 0, 1);
}

function toFormattedPercent(value: number): string {
    return `${Math.round(clamp(value, 0, 1) * 100)}%`;
}

function safeParseJSON(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const withoutFences = trimmed.replace(/^```json\\s*/i, '').replace(/^```\\s*/i, '').replace(/```$/i, '').trim();
    try { return JSON.parse(withoutFences); } catch {
        const start = withoutFences.indexOf('{');
        const end = withoutFences.lastIndexOf('}');
        if (start === -1 || end <= start) return null;
        try { return JSON.parse(withoutFences.slice(start, end + 1)); } catch { return null; }
    }
}

function summarizeMomentum(last14: number, previous14: number): number {
    if (last14 === 0 && previous14 === 0) return 0;
    return clamp((last14 - previous14) / Math.max(1, previous14 + 1), -1, 1);
}

function buildClusterContext(cluster: CustomerCluster, memberProfiles: CustomerProfile[]) {
    const now = Date.now();
    const allInteractions = memberProfiles.flatMap((member) => member.interactions);
    const sortedInteractions = [...allInteractions].sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastSeen = Math.max(...memberProfiles.map((member) => member.lastSeen.getTime()));
    const daysSinceLastInteraction = Math.max(0, Math.round((now - lastSeen) / (24 * 60 * 60 * 1000)));

    let last14DaysInteractions = 0; let previous14DaysInteractions = 0;
    let positive = 0; let neutral = 0; let negative = 0;

    for (const interaction of allInteractions) {
        const ageDays = (now - interaction.date.getTime()) / (24 * 60 * 60 * 1000);
        if (ageDays <= 14) last14DaysInteractions += 1;
        else if (ageDays <= 28) previous14DaysInteractions += 1;

        const sentiment = interaction.sentiment.toLowerCase();
        if (sentiment.includes('positive')) positive += 1;
        else if (sentiment.includes('negative') || sentiment.includes('urgent') || sentiment.includes('anxious') || sentiment.includes('angry')) negative += 1;
        else neutral += 1;
    }
    const sentimentTotal = Math.max(1, positive + neutral + negative);
    return {
        cluster: { ...cluster, riskScore: clamp(cluster.riskScore, 0, 1), opportunityScore: clamp(cluster.opportunityScore, 0, 1) },
        trends: { daysSinceLastInteraction, last14DaysInteractions, previous14DaysInteractions, momentumDelta: summarizeMomentum(last14DaysInteractions, previous14DaysInteractions), sentiment: { positive: clamp(positive / sentimentTotal, 0, 1), neutral: clamp(neutral / sentimentTotal, 0, 1), negative: clamp(negative / sentimentTotal, 0, 1) } },
        members: memberProfiles.sort((a, b) => b.interactionCount - a.interactionCount).slice(0, 10).map((member) => ({ id: member.id, name: member.displayName, interactionCount: member.interactionCount, riskScore: clamp(member.riskScore, 0, 1), opportunityScore: clamp(member.opportunityScore, 0, 1), lastSeen: member.lastSeen.toISOString(), topTopics: member.signal.topics.slice(0, 4), topTags: member.signal.tags.slice(0, 4) })),
        snippets: sortedInteractions.slice(0, 10).map((interaction) => ({ date: interaction.date.toISOString(), type: interaction.type, priority: interaction.priority, sentiment: interaction.sentiment, summaryText: interaction.summaryText.slice(0, 260) }))
    };
}

async function requestCopilotPlanFromAI(context: any, groqApiKey: string): Promise<ClusterCopilotPlan | null> {
    if (!groqApiKey) return null;
    const systemPrompt = `You are a revenue operations strategist. Analyze the given customer cluster context and output a SINGLE JSON object only.
Rules:
- Choose one primaryAction from: save_at_risk, upsell, re_engage, nurture
- secondaryAction can be one of those or omitted
- confidence, scoreCard values, expectedOutcome.lift must be 0..1
- scoreCard must include save_at_risk, upsell, re_engage, nurture
- rationale: 2-4 short factual bullets
- playbook: exactly 4 concrete execution steps
- summary: one sentence
- expectedOutcome.metric: retention|revenue|engagement
- expectedOutcome.windowDays: integer 7..60
- evidence: up to 5 entries with {id,label,value,formattedValue,direction(up|down|neutral)}`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: JSON.stringify(context) }],
                temperature: 0.35, max_tokens: 1500, top_p: 0.9, response_format: { type: 'json_object' }
            })
        });
        const resValue = await response.json();
        const content = resValue.choices?.[0]?.message?.content || '';
        const parsed = safeParseJSON(content);
        if (!parsed) return null;

        const primaryAction = normalizeAction(parsed.primaryAction);
        const secondaryAction = parsed.secondaryAction ? normalizeAction(parsed.secondaryAction) : undefined;
        const confidence = toUnitScore(parsed.confidence, 0.5);

        const scoreCard = {
            save_at_risk: toUnitScore(parsed.scoreCard?.save_at_risk, 0),
            upsell: toUnitScore(parsed.scoreCard?.upsell, 0),
            re_engage: toUnitScore(parsed.scoreCard?.re_engage, 0),
            nurture: toUnitScore(parsed.scoreCard?.nurture, 0),
        };

        const rationale = Array.isArray(parsed.rationale) ? parsed.rationale.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0).slice(0, 4) : [];
        const playbook = Array.isArray(parsed.playbook) ? parsed.playbook.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0).slice(0, 4) : [];
        const evidence = Array.isArray(parsed.evidence) ? parsed.evidence.filter((entry) => entry && typeof entry === 'object').slice(0, 5).map((entry, index) => {
            const value = toUnitScore(entry.value, 0);
            return { id: entry.id || `metric-${index + 1}`, label: entry.label || `Metric ${index + 1}`, value, formattedValue: entry.formattedValue || toFormattedPercent(value), direction: entry.direction === 'up' || entry.direction === 'down' ? entry.direction : 'neutral' as 'up' | 'down' | 'neutral' };
        }) : [];

        return {
            clusterId: context.cluster.id,
            primaryAction, ...(secondaryAction ? { secondaryAction } : {}), confidence, scoreCard,
            rationale: rationale.length ? rationale : ['AI generated recommendation from current cluster dynamics.'],
            playbook: playbook.length ? playbook : ['Review top members and prioritize outreach order.', 'Execute first-touch sequence with clear value proposition.', 'Escalate engaged responders into guided follow-up.', 'Measure outcomes and refine next cycle.'],
            evidence, summary: parsed.summary || 'AI recommendation generated from cluster context.',
            expectedOutcome: { metric: normalizeMetric(parsed.expectedOutcome?.metric), lift: toUnitScore(parsed.expectedOutcome?.lift, 0.12), windowDays: Math.round(clamp(Number(parsed.expectedOutcome?.windowDays) || 21, 7, 60)) },
            algorithmVersion: COPILOT_ALGORITHM_VERSION,
        };
    } catch (error) {
        console.error('Groq Copilot inference failed:', error);
        return null;
    }
}

export async function buildGraphModel(callHistory: unknown[], filters: CustomerGraphFilters, enrichWithAI: boolean, groqApiKey?: string): Promise<CustomerGraphModel> {
    const options: GraphBuildOptions = {
        ...DEFAULT_OPTIONS,
        minScore: clamp(filters.minSimilarity || DEFAULT_OPTIONS.minScore, 0, 1),
    };
    const profiles = buildCustomerProfiles(callHistory, filters);
    const edges = await computeSimilarityEdges(profiles, options);
    let clusters = clusterProfiles(profiles, edges);

    if (enrichWithAI && groqApiKey && clusters.length > 0) {
        const profileById = new Map(profiles.map(p => [p.id, p]));
        const aiEnrichedClusters = await Promise.all(clusters.map(async (cluster) => {
            const members = cluster.memberIds.map(id => profileById.get(id)).filter((p): p is CustomerProfile => !!p);
            if (members.length > 0) {
                const context = buildClusterContext(cluster, members);
                const copilot = await requestCopilotPlanFromAI(context, groqApiKey);
                if (copilot) return { ...cluster, copilot };
            }
            return cluster;
        }));
        clusters = aiEnrichedClusters;
    }

    const stats = {
        totalCustomers: profiles.length,
        totalEdges: edges.length,
        totalClusters: clusters.length,
        highRiskClusters: clusters.filter((cluster) => cluster.riskScore >= 0.65).length,
        opportunityClusters: clusters.filter((cluster) => cluster.opportunityScore >= 0.65).length,
    };

    return {
        generatedAt: new Date().toISOString(),
        profiles,
        edges,
        clusters,
        stats,
    };
}
