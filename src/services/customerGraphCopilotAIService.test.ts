import { describe, expect, it, vi } from 'vitest';
import { enrichGraphWithAICopilot } from './customerGraphCopilotAIService';
import type { CustomerGraphModel } from '../types/customerGraph';
import { proxyJSON } from './proxyClient';

vi.mock('../components/DemoCall/GroqSettings', () => ({
  getGroqSettings: () => ({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 1024,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPromptEnabled: true,
  }),
}));

vi.mock('./proxyClient', () => ({
  proxyJSON: vi.fn(),
  ProxyRoutes: {
    COMPLETIONS: 'completions',
    TTS: 'tts',
    TTS_ALT: 'tts-alt',
  },
}));

function buildModel(): CustomerGraphModel {
  return {
    generatedAt: '2026-03-02T00:00:00.000Z',
    profiles: [
      {
        id: 'cust-1',
        displayName: 'Alice',
        normalizedName: 'alice',
        interactionCount: 2,
        firstSeen: new Date('2026-01-01T10:00:00.000Z'),
        lastSeen: new Date('2026-01-15T10:00:00.000Z'),
        contact: {},
        interactions: [
          {
            id: 'call-1',
            date: new Date('2026-01-01T10:00:00.000Z'),
            type: 'voice',
            priority: 'high',
            sentiment: 'neutral',
            category: { id: 'support', name: 'Support', color: 'blue', description: '' },
            summaryText: 'Customer asked about renewal options',
            topics: ['renewal'],
            tags: ['pricing'],
            contact: {},
          },
          {
            id: 'call-2',
            date: new Date('2026-01-15T10:00:00.000Z'),
            type: 'text',
            priority: 'medium',
            sentiment: 'positive',
            category: { id: 'sales', name: 'Sales', color: 'green', description: '' },
            summaryText: 'Interested in upgrading plan',
            topics: ['upgrade'],
            tags: ['pricing'],
            contact: {},
          },
        ],
        signal: {
          topics: ['renewal', 'upgrade'],
          tags: ['pricing'],
          categories: ['support', 'sales'],
          priorities: ['high', 'medium'],
          sentiments: ['neutral', 'positive'],
          intentTokens: ['renewal', 'upgrade', 'pricing'],
        },
        riskScore: 0.45,
        opportunityScore: 0.72,
        embeddingText: 'alice renewal upgrade pricing',
      },
    ],
    edges: [],
    clusters: [
      {
        id: 'cluster-1',
        label: 'pricing',
        memberIds: ['cust-1'],
        memberCount: 1,
        riskScore: 0.45,
        opportunityScore: 0.72,
        sharedSignals: ['pricing'],
      },
    ],
    stats: {
      totalCustomers: 1,
      totalEdges: 0,
      totalClusters: 1,
      highRiskClusters: 0,
      opportunityClusters: 1,
    },
  };
}

describe('customerGraphCopilotAIService', () => {
  it('enriches clusters with ai copilot plans', async () => {
    vi.mocked(proxyJSON).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            primaryAction: 'upsell',
            secondaryAction: 'nurture',
            confidence: 0.82,
            scoreCard: {
              save_at_risk: 0.22,
              upsell: 0.84,
              re_engage: 0.31,
              nurture: 0.63,
            },
            rationale: ['High opportunity score and upgrade language detected'],
            playbook: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
            summary: 'Upsell is the strongest action for this cluster.',
            expectedOutcome: {
              metric: 'revenue',
              lift: 0.24,
              windowDays: 30,
            },
            evidence: [
              {
                id: 'opportunity',
                label: 'Opportunity',
                value: 0.72,
                formattedValue: '72%',
                direction: 'up',
              },
            ],
          }),
        },
      }],
    });

    const enriched = await enrichGraphWithAICopilot(buildModel());

    expect(enriched.clusters[0].copilot).toBeDefined();
    expect(enriched.clusters[0].copilot?.primaryAction).toBe('upsell');
    expect(enriched.clusters[0].copilot?.expectedOutcome.metric).toBe('revenue');
  });

  it('keeps cluster without copilot when ai returns invalid payload', async () => {
    vi.mocked(proxyJSON).mockResolvedValue({
      choices: [{
        message: {
          content: 'not valid json',
        },
      }],
    });

    const enriched = await enrichGraphWithAICopilot(buildModel());

    expect(enriched.clusters[0].copilot).toBeUndefined();
  });
});
