import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CustomerGraphView from './CustomerGraphView';
import type { CustomerGraphModel, CustomerProfile } from '../../types/customerGraph';
import { buildGraphModel } from '../../services/customerGraphService';

let mockCallHistory: unknown[] = [];

vi.mock('../../contexts/DemoCallContext', () => ({
  useDemoCall: () => ({
    callHistory: mockCallHistory,
  }),
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

vi.mock('../../services/customerGraphService', () => ({
  buildGraphModel: vi.fn(),
}));

function createProfile(name: string): CustomerProfile {
  return {
    id: 'cust-1',
    displayName: name,
    normalizedName: name.toLowerCase(),
    interactionCount: 2,
    firstSeen: new Date('2026-01-01T10:00:00.000Z'),
    lastSeen: new Date('2026-01-04T10:00:00.000Z'),
    contact: {},
    interactions: [
      {
        id: 'call-1',
        date: new Date('2026-01-01T10:00:00.000Z'),
        type: 'text',
        priority: 'medium',
        sentiment: 'neutral',
        category: { id: 'support', name: 'Support', color: 'blue', description: '' },
        summaryText: 'Support follow-up',
        topics: ['support'],
        tags: ['support'],
        contact: {},
      },
      {
        id: 'call-2',
        date: new Date('2026-01-04T10:00:00.000Z'),
        type: 'voice',
        priority: 'high',
        sentiment: 'positive',
        category: { id: 'support', name: 'Support', color: 'blue', description: '' },
        summaryText: 'Renewal support request',
        topics: ['renewal'],
        tags: ['renewal'],
        contact: {},
      },
    ],
    signal: {
      topics: ['support', 'renewal'],
      tags: ['support', 'renewal'],
      categories: ['support'],
      priorities: ['high', 'medium'],
      sentiments: ['neutral', 'positive'],
      intentTokens: ['support', 'renewal'],
    },
    riskScore: 0.44,
    opportunityScore: 0.61,
    embeddingText: 'support renewal',
  };
}

function createModel(profiles: CustomerProfile[]): CustomerGraphModel {
  return {
    generatedAt: new Date().toISOString(),
    profiles,
    edges: [],
    clusters: profiles.map((profile, index) => ({
      id: `cluster-${index + 1}`,
      label: `cluster-${index + 1}`,
      memberIds: [profile.id],
      memberCount: 1,
      riskScore: profile.riskScore,
      opportunityScore: profile.opportunityScore,
      sharedSignals: profile.signal.topics.slice(0, 2),
    })),
    stats: {
      totalCustomers: profiles.length,
      totalEdges: 0,
      totalClusters: profiles.length,
      highRiskClusters: 0,
      opportunityClusters: profiles.filter((profile) => profile.opportunityScore >= 0.65).length,
    },
  };
}

describe('CustomerGraphView', () => {
  beforeEach(() => {
    mockCallHistory = [];
    vi.clearAllMocks();
  });

  it('shows no-data empty state when graph has no profiles', async () => {
    vi.mocked(buildGraphModel).mockResolvedValue(createModel([]));

    render(<CustomerGraphView isDark={false} />);

    await waitFor(() => {
      expect(screen.getByText('customerGraph.empty.noDataTitle')).toBeInTheDocument();
    });
  });

  it('renders customer labels directly and hides optional toggles', async () => {
    vi.mocked(buildGraphModel).mockResolvedValue(createModel([createProfile('Alice Smith')]));

    render(<CustomerGraphView isDark={false} />);

    await waitFor(() => {
      expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0);
    });

    expect(screen.queryByText('customerGraph.controls.semantic')).not.toBeInTheDocument();
    expect(screen.queryByText('customerGraph.controls.anonymize')).not.toBeInTheDocument();
  });

  it('always requests semantic matching by default', async () => {
    vi.mocked(buildGraphModel).mockResolvedValue(createModel([createProfile('Alice Smith')]));

    render(<CustomerGraphView isDark={false} />);

    await waitFor(() => {
      expect(buildGraphModel).toHaveBeenCalled();
    });

    const call = vi.mocked(buildGraphModel).mock.calls[0];
    expect(call?.[2]).toMatchObject({ semanticEnabled: true });
  });
});
