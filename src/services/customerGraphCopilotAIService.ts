import { getGroqSettings } from '../components/DemoCall/GroqSettings';
import type {
  ClusterCopilotAction,
  ClusterCopilotPlan,
  CustomerCluster,
  CustomerGraphModel,
  CustomerInteraction,
  CustomerProfile,
} from '../types/customerGraph';
import { proxyJSON, ProxyRoutes } from './proxyClient';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface CopilotAIPlanRaw {
  primaryAction?: string;
  secondaryAction?: string;
  confidence?: number;
  scoreCard?: Partial<Record<string, number>>;
  rationale?: string[];
  playbook?: string[];
  summary?: string;
  expectedOutcome?: {
    metric?: string;
    lift?: number;
    windowDays?: number;
  };
  evidence?: Array<{
    id?: string;
    label?: string;
    value?: number;
    formattedValue?: string;
    direction?: string;
  }>;
}

interface ClusterContextPayload {
  cluster: {
    id: string;
    label: string;
    memberCount: number;
    riskScore: number;
    opportunityScore: number;
    sharedSignals: string[];
  };
  trends: {
    daysSinceLastInteraction: number;
    last14DaysInteractions: number;
    previous14DaysInteractions: number;
    momentumDelta: number;
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  members: Array<{
    id: string;
    name: string;
    interactionCount: number;
    riskScore: number;
    opportunityScore: number;
    lastSeen: string;
    topTopics: string[];
    topTags: string[];
  }>;
  snippets: Array<{
    date: string;
    type: 'voice' | 'text';
    priority: string;
    sentiment: string;
    summaryText: string;
  }>;
}

export interface AIInsightProgress {
  completed: number;
  total: number;
}

export interface EnrichGraphWithAIOptions {
  onProgress?: (progress: AIInsightProgress) => void;
  timeoutMs?: number;
}

const AI_ALGORITHM_VERSION = 'cluster-copilot-groq-v1';
const MAX_PLAYBOOK_STEPS = 4;
const MAX_RATIONALE_POINTS = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeAction(value: string | undefined): ClusterCopilotAction {
  const normalized = (value || '').toLowerCase().replace(/[\s-]+/g, '_').trim();
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

function safeParseJSON(raw: string): CopilotAIPlanRaw | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withoutFences = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(withoutFences) as CopilotAIPlanRaw;
  } catch {
    const start = withoutFences.indexOf('{');
    const end = withoutFences.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(withoutFences.slice(start, end + 1)) as CopilotAIPlanRaw;
    } catch {
      return null;
    }
  }
}

function summarizeMomentum(last14: number, previous14: number): number {
  if (last14 === 0 && previous14 === 0) return 0;
  return clamp((last14 - previous14) / Math.max(1, previous14 + 1), -1, 1);
}

function buildClusterContext(
  cluster: CustomerCluster,
  memberProfiles: CustomerProfile[],
): ClusterContextPayload {
  const now = Date.now();
  const allInteractions = memberProfiles.flatMap((member) => member.interactions);
  const sortedInteractions = [...allInteractions].sort((a, b) => b.date.getTime() - a.date.getTime());
  const lastSeen = Math.max(...memberProfiles.map((member) => member.lastSeen.getTime()));
  const daysSinceLastInteraction = Math.max(0, Math.round((now - lastSeen) / (24 * 60 * 60 * 1000)));

  let last14DaysInteractions = 0;
  let previous14DaysInteractions = 0;
  let positive = 0;
  let neutral = 0;
  let negative = 0;

  for (const interaction of allInteractions) {
    const ageDays = (now - interaction.date.getTime()) / (24 * 60 * 60 * 1000);
    if (ageDays <= 14) {
      last14DaysInteractions += 1;
    } else if (ageDays <= 28) {
      previous14DaysInteractions += 1;
    }

    const sentiment = interaction.sentiment.toLowerCase();
    if (sentiment.includes('positive')) {
      positive += 1;
    } else if (
      sentiment.includes('negative')
      || sentiment.includes('urgent')
      || sentiment.includes('anxious')
      || sentiment.includes('angry')
    ) {
      negative += 1;
    } else {
      neutral += 1;
    }
  }

  const sentimentTotal = Math.max(1, positive + neutral + negative);

  return {
    cluster: {
      id: cluster.id,
      label: cluster.label,
      memberCount: cluster.memberCount,
      riskScore: clamp(cluster.riskScore, 0, 1),
      opportunityScore: clamp(cluster.opportunityScore, 0, 1),
      sharedSignals: cluster.sharedSignals,
    },
    trends: {
      daysSinceLastInteraction,
      last14DaysInteractions,
      previous14DaysInteractions,
      momentumDelta: summarizeMomentum(last14DaysInteractions, previous14DaysInteractions),
      sentiment: {
        positive: clamp(positive / sentimentTotal, 0, 1),
        neutral: clamp(neutral / sentimentTotal, 0, 1),
        negative: clamp(negative / sentimentTotal, 0, 1),
      },
    },
    members: memberProfiles
      .sort((a, b) => b.interactionCount - a.interactionCount)
      .slice(0, 10)
      .map((member) => ({
        id: member.id,
        name: member.displayName,
        interactionCount: member.interactionCount,
        riskScore: clamp(member.riskScore, 0, 1),
        opportunityScore: clamp(member.opportunityScore, 0, 1),
        lastSeen: member.lastSeen.toISOString(),
        topTopics: member.signal.topics.slice(0, 4),
        topTags: member.signal.tags.slice(0, 4),
      })),
    snippets: sortedInteractions
      .slice(0, 10)
      .map((interaction: CustomerInteraction) => ({
        date: interaction.date.toISOString(),
        type: interaction.type,
        priority: interaction.priority,
        sentiment: interaction.sentiment,
        summaryText: interaction.summaryText.slice(0, 260),
      })),
  };
}

async function requestCopilotPlanFromAI(
  context: ClusterContextPayload,
  timeoutMs: number,
): Promise<ClusterCopilotPlan | null> {
  const settings = getGroqSettings();

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
- evidence: up to 5 entries with {id,label,value,formattedValue,direction(up|down|neutral)}
No markdown, no explanation, JSON only.`;

  const response = await proxyJSON<ChatCompletionResponse>(
    ProxyRoutes.COMPLETIONS,
    {
      model: settings.model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: JSON.stringify(context),
        },
      ],
      temperature: Math.min(settings.temperature, 0.35),
      top_p: settings.topP,
      max_tokens: Math.min(Math.max(settings.maxTokens, 900), 1500),
    },
    { timeout: timeoutMs },
  );

  const content = response.choices?.[0]?.message?.content || '';
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

  const rationale = Array.isArray(parsed.rationale)
    ? parsed.rationale.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0).slice(0, MAX_RATIONALE_POINTS)
    : [];

  const playbook = Array.isArray(parsed.playbook)
    ? parsed.playbook.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0).slice(0, MAX_PLAYBOOK_STEPS)
    : [];

  const evidence = Array.isArray(parsed.evidence)
    ? parsed.evidence
      .filter((entry) => entry && typeof entry === 'object')
      .slice(0, 5)
      .map((entry, index) => {
        const value = toUnitScore(entry.value, 0);
        return {
          id: entry.id || `metric-${index + 1}`,
          label: entry.label || `Metric ${index + 1}`,
          value,
          formattedValue: entry.formattedValue || toFormattedPercent(value),
          direction: entry.direction === 'up' || entry.direction === 'down' ? entry.direction : 'neutral',
        };
      })
    : [];

  return {
    clusterId: context.cluster.id,
    primaryAction,
    ...(secondaryAction ? { secondaryAction } : {}),
    confidence,
    scoreCard,
    rationale: rationale.length ? rationale : ['AI generated recommendation from current cluster dynamics.'],
    playbook: playbook.length ? playbook : [
      'Review top members and prioritize outreach order.',
      'Execute first-touch sequence with clear value proposition.',
      'Escalate engaged responders into guided follow-up.',
      'Measure outcomes and refine next cycle.',
    ],
    evidence,
    summary: parsed.summary || 'AI recommendation generated from cluster context.',
    expectedOutcome: {
      metric: normalizeMetric(parsed.expectedOutcome?.metric),
      lift: toUnitScore(parsed.expectedOutcome?.lift, 0.12),
      windowDays: Math.round(clamp(Number(parsed.expectedOutcome?.windowDays) || 21, 7, 60)),
    },
    algorithmVersion: AI_ALGORITHM_VERSION,
  };
}

export async function enrichGraphWithAICopilot(
  model: CustomerGraphModel,
  options: EnrichGraphWithAIOptions = {},
): Promise<CustomerGraphModel> {
  if (!model.clusters.length) return model;

  const timeoutMs = options.timeoutMs ?? 45000;
  const profileById = new Map(model.profiles.map((profile) => [profile.id, profile]));
  const total = model.clusters.length;
  let completed = 0;

  const clustersWithCopilot: CustomerCluster[] = [];

  for (const cluster of model.clusters) {
    const members = cluster.memberIds
      .map((memberId) => profileById.get(memberId))
      .filter((profile): profile is CustomerProfile => !!profile);

    let copilot: ClusterCopilotPlan | undefined;
    if (members.length > 0) {
      const context = buildClusterContext(cluster, members);
      copilot = (await requestCopilotPlanFromAI(context, timeoutMs)) || undefined;
    }

    clustersWithCopilot.push({
      ...cluster,
      ...(copilot ? { copilot } : {}),
    });

    completed += 1;
    options.onProgress?.({ completed, total });
  }

  return {
    ...model,
    clusters: clustersWithCopilot,
  };
}
