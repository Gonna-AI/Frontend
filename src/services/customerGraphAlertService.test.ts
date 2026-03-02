import { beforeEach, describe, expect, it } from 'vitest';
import type { CustomerGraphModel, CustomerProfile } from '../types/customerGraph';
import {
  buildGraphAlertSnapshot,
  clearRealtimeGraphAlertSnapshot,
  detectRealtimeGraphAlerts,
  evaluateRealtimeGraphAlerts,
} from './customerGraphAlertService';

function createProfile(id: string, name: string): CustomerProfile {
  return {
    id,
    displayName: name,
    normalizedName: name.toLowerCase(),
    interactionCount: 1,
    firstSeen: new Date('2026-03-02T00:00:00.000Z'),
    lastSeen: new Date('2026-03-02T00:00:00.000Z'),
    contact: {},
    interactions: [
      {
        id: `int-${id}`,
        date: new Date('2026-03-02T00:00:00.000Z'),
        type: 'text',
        priority: 'medium',
        sentiment: 'neutral',
        category: { id: 'support', name: 'Support', color: 'blue', description: '' },
        summaryText: 'support follow up',
        topics: ['support'],
        tags: ['support'],
        contact: {},
      },
    ],
    signal: {
      topics: ['support'],
      tags: ['support'],
      categories: ['support'],
      priorities: ['medium'],
      sentiments: ['neutral'],
      intentTokens: ['support'],
    },
    riskScore: 0.35,
    opportunityScore: 0.45,
    embeddingText: 'support',
  };
}

function createModel(params: {
  generatedAt: string;
  riskScore: number;
  opportunityScore: number;
}): CustomerGraphModel {
  const profileA = createProfile('cust-1', 'Alice');
  const profileB = createProfile('cust-2', 'Bob');

  return {
    generatedAt: params.generatedAt,
    profiles: [profileA, profileB],
    edges: [
      {
        id: 'cust-1__cust-2',
        source: 'cust-1',
        target: 'cust-2',
        score: 0.72,
        deterministicScore: 0.72,
        evidence: ['Tags: support'],
        breakdown: {
          topics: 1,
          tags: 1,
          categories: 1,
          priorities: 1,
          sentiments: 1,
          intentTokens: 1,
        },
      },
    ],
    clusters: [
      {
        id: 'cluster-1',
        label: 'support',
        memberIds: ['cust-1', 'cust-2'],
        memberCount: 2,
        riskScore: params.riskScore,
        opportunityScore: params.opportunityScore,
        sharedSignals: ['support'],
      },
    ],
    stats: {
      totalCustomers: 2,
      totalEdges: 1,
      totalClusters: 1,
      highRiskClusters: params.riskScore >= 0.65 ? 1 : 0,
      opportunityClusters: params.opportunityScore >= 0.65 ? 1 : 0,
    },
  };
}

describe('customerGraphAlertService', () => {
  beforeEach(() => {
    clearRealtimeGraphAlertSnapshot();
  });

  it('returns no alerts without previous snapshot', () => {
    const current = createModel({
      generatedAt: '2026-03-02T10:00:00.000Z',
      riskScore: 0.42,
      opportunityScore: 0.55,
    });

    const alerts = detectRealtimeGraphAlerts(current, null);
    expect(alerts).toEqual([]);
  });

  it('detects risk spike alerts when cluster risk rises above threshold', () => {
    const previous = createModel({
      generatedAt: '2026-03-01T10:00:00.000Z',
      riskScore: 0.46,
      opportunityScore: 0.52,
    });
    const current = createModel({
      generatedAt: '2026-03-02T10:00:00.000Z',
      riskScore: 0.64,
      opportunityScore: 0.53,
    });

    const alerts = detectRealtimeGraphAlerts(current, buildGraphAlertSnapshot(previous));

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('risk_spike');
    expect(alerts[0].delta).toBeGreaterThanOrEqual(0.18);
    expect(alerts[0].clusterLabel).toBe('support');
  });

  it('detects new high-opportunity segment when threshold is crossed', () => {
    const previous = createModel({
      generatedAt: '2026-03-01T10:00:00.000Z',
      riskScore: 0.33,
      opportunityScore: 0.61,
    });
    const current = createModel({
      generatedAt: '2026-03-02T10:00:00.000Z',
      riskScore: 0.35,
      opportunityScore: 0.79,
    });

    const alerts = detectRealtimeGraphAlerts(current, buildGraphAlertSnapshot(previous));

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('new_high_opportunity_segment');
    expect(alerts[0].severity).toBe('positive');
    expect(alerts[0].currentValue).toBe(0.79);
  });

  it('persists snapshot and emits alerts on the next evaluation', () => {
    const baseline = createModel({
      generatedAt: '2026-03-02T08:00:00.000Z',
      riskScore: 0.42,
      opportunityScore: 0.62,
    });
    const next = createModel({
      generatedAt: '2026-03-02T12:00:00.000Z',
      riskScore: 0.65,
      opportunityScore: 0.73,
    });

    const firstRunAlerts = evaluateRealtimeGraphAlerts(baseline);
    const secondRunAlerts = evaluateRealtimeGraphAlerts(next);

    expect(firstRunAlerts).toEqual([]);
    expect(secondRunAlerts.some((alert) => alert.type === 'risk_spike')).toBe(true);
    expect(secondRunAlerts.some((alert) => alert.type === 'new_high_opportunity_segment')).toBe(true);
  });
});
