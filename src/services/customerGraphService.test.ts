import { describe, expect, it } from 'vitest';
import {
  buildCustomerProfiles,
  buildGraphModel,
  computeSimilarityEdges,
  normalizeHistoryItem,
} from './customerGraphService';
import type { CustomerGraphFilters } from '../types/customerGraph';

const baseFilters: CustomerGraphFilters = {
  startDate: null,
  endDate: null,
  interactionType: 'all',
  minSimilarity: 0.58,
  anonymize: false,
};

describe('customerGraphService', () => {
  it('normalizes legacy summary data safely', () => {
    const normalized = normalizeHistoryItem({
      id: 'legacy-1',
      callerName: 'Alice',
      date: '2026-02-10T12:00:00.000Z',
      type: 'text',
      tags: ['Billing'],
      summary: {
        notes: 'Needs billing plan update',
      },
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.summaryText).toBe('Needs billing plan update');
    expect(normalized?.topics).toContain('billing');
    expect(normalized?.priority).toBe('medium');
    expect(normalized?.category.id).toBe('uncategorized');
  });

  it('handles malformed legacy records without throwing', () => {
    const normalized = normalizeHistoryItem({
      callerName: '',
      date: 'not-a-real-date',
      summary: null,
      tags: null,
      extractedFields: null,
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.date.toISOString()).toBe('1970-01-01T00:00:00.000Z');
    expect(normalized?.callerName).toBe('Unknown Caller');
    expect(normalized?.tags).toEqual([]);
  });

  it('merges customer profiles by email', () => {
    const profiles = buildCustomerProfiles([
      {
        id: 'call-1',
        callerName: 'Alice Johnson',
        date: '2026-02-01T10:00:00.000Z',
        type: 'voice',
        tags: ['billing', 'upgrade'],
        summary: { summaryText: 'Please email me at alice@example.com', topics: ['billing', 'upgrade'] },
        extractedFields: [{ id: 'email', label: 'Email', value: 'alice@example.com' }],
      },
      {
        id: 'call-2',
        callerName: 'A. Johnson',
        date: '2026-02-05T11:00:00.000Z',
        type: 'text',
        tags: ['pricing', 'billing'],
        summary: { summaryText: 'Following up on pricing', topics: ['pricing', 'billing'] },
        extractedFields: [{ id: 'contact', label: 'Contact email', value: 'alice@example.com' }],
      },
    ], baseFilters);

    expect(profiles).toHaveLength(1);
    expect(profiles[0].interactionCount).toBe(2);
    expect(profiles[0].contact.email).toBe('alice@example.com');
  });

  it('does not over-merge name-only profiles without signal overlap', () => {
    const profiles = buildCustomerProfiles([
      {
        id: 'call-3',
        callerName: 'Jordan Smith',
        date: '2026-02-01T09:00:00.000Z',
        tags: ['refund'],
        summary: { summaryText: 'Need refund on invoice', topics: ['refund'] },
      },
      {
        id: 'call-4',
        callerName: 'Jordan Smith',
        date: '2026-02-03T09:00:00.000Z',
        tags: ['onboarding'],
        summary: { summaryText: 'Question about onboarding process', topics: ['onboarding'] },
      },
    ], baseFilters);

    expect(profiles).toHaveLength(2);
  });

  it('falls back to deterministic similarity when semantic provider fails', async () => {
    const profiles = buildCustomerProfiles([
      {
        id: 'call-5',
        callerName: 'Mira Patel',
        date: '2026-02-01T09:00:00.000Z',
        tags: ['billing', 'invoice', 'renewal'],
        summary: { summaryText: 'invoice billing renewal request', topics: ['billing', 'renewal'] },
      },
      {
        id: 'call-6',
        callerName: 'Sam Lee',
        date: '2026-02-04T09:00:00.000Z',
        tags: ['billing', 'invoice', 'renewal'],
        summary: { summaryText: 'billing renewal invoice plan', topics: ['billing', 'renewal'] },
      },
    ], {
      ...baseFilters,
      minSimilarity: 0.2,
    });

    const edges = await computeSimilarityEdges(profiles, {
      minScore: 0.2,
      semanticEnabled: true,
      embeddingProvider: async () => {
        throw new Error('semantic unavailable');
      },
    });

    expect(edges.length).toBeGreaterThan(0);
    expect(edges[0].deterministicScore).toBeGreaterThan(0);
    expect(edges[0].semanticScore).toBeUndefined();
  });

  it('builds graph model safely for mixed date shapes', async () => {
    const model = await buildGraphModel([
      {
        id: 'call-7',
        callerName: 'Nova',
        date: new Date('2026-01-01T10:00:00.000Z'),
        tags: ['support'],
        summary: { summaryText: 'support needed', topics: ['support'] },
      },
      {
        id: 'call-8',
        callerName: '',
        date: '2026-01-03T10:00:00.000Z',
        tags: ['support'],
        summary: { notes: 'support follow-up' },
      },
      {
        id: 'call-9',
        callerName: 'Unknown',
        date: 'invalid-date-here',
      },
    ], {
      ...baseFilters,
      minSimilarity: 0.2,
    }, {
      semanticEnabled: false,
      cacheMode: 'off',
    });

    expect(model.stats.totalCustomers).toBeGreaterThanOrEqual(2);
    expect(model.profiles.length).toBe(model.stats.totalCustomers);
  });
});
