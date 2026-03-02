import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import CustomerGraphView from './CustomerGraphView';
import type { CustomerGraphAlert, CustomerGraphModel, CustomerProfile } from '../../types/customerGraph';
import { buildGraphModel } from '../../services/customerGraphService';
import { evaluateRealtimeGraphAlerts } from '../../services/customerGraphAlertService';

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

vi.mock('../../services/customerGraphAlertService', () => ({
  evaluateRealtimeGraphAlerts: vi.fn(() => []),
}));

function createProfile(id: string, name: string): CustomerProfile {
  return {
    id,
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
    vi.mocked(evaluateRealtimeGraphAlerts).mockReturnValue([]);
  });

  it('shows no-data empty state when graph has no profiles', async () => {
    vi.mocked(buildGraphModel).mockResolvedValue(createModel([]));

    render(<CustomerGraphView isDark={false} />);

    await waitFor(() => {
      expect(screen.getByText('customerGraph.empty.noDataTitle')).toBeInTheDocument();
    });
  });

  it('renders customer labels directly and hides optional toggles', async () => {
    vi.mocked(buildGraphModel).mockResolvedValue(createModel([createProfile('cust-1', 'Alice Smith')]));

    render(<CustomerGraphView isDark={false} />);

    await waitFor(() => {
      expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0);
    });

    expect(screen.queryByText('customerGraph.controls.semantic')).not.toBeInTheDocument();
    expect(screen.queryByText('customerGraph.controls.anonymize')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'customerGraph.controls.zoomOut' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'customerGraph.controls.zoomIn' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'customerGraph.controls.fitGraph' })).toBeInTheDocument();
  });

  it('always requests semantic matching by default', async () => {
    vi.mocked(buildGraphModel).mockResolvedValue(createModel([createProfile('cust-1', 'Alice Smith')]));

    render(<CustomerGraphView isDark={false} />);

    await waitFor(() => {
      expect(buildGraphModel).toHaveBeenCalled();
    });

    const call = vi.mocked(buildGraphModel).mock.calls[0];
    expect(call?.[2]).toMatchObject({ semanticEnabled: true });
  });

  it('clicking a cluster row focuses that cluster member in details', async () => {
    const alpha = createProfile('cust-1', 'Alice Smith');
    const beta = createProfile('cust-2', 'Bob Jones');

    vi.mocked(buildGraphModel).mockResolvedValue({
      ...createModel([alpha, beta]),
      clusters: [
        {
          id: 'cluster-1',
          label: 'cluster-1',
          memberIds: [alpha.id],
          memberCount: 1,
          riskScore: alpha.riskScore,
          opportunityScore: alpha.opportunityScore,
          sharedSignals: alpha.signal.topics.slice(0, 2),
        },
        {
          id: 'cluster-2',
          label: 'cluster-2',
          memberIds: [beta.id],
          memberCount: 1,
          riskScore: beta.riskScore,
          opportunityScore: beta.opportunityScore,
          sharedSignals: beta.signal.topics.slice(0, 2),
        },
      ],
    });

    render(<CustomerGraphView isDark={false} />);

    await waitFor(() => {
      expect(screen.getByText('cluster-2')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    const rowCell = within(table).getByText('cluster-2');
    fireEvent.click(rowCell);

    await waitFor(() => {
      expect(screen.getAllByText('Bob Jones').length).toBeGreaterThan(0);
    });
  });

  it('renders realtime trigger cards and focuses cluster when clicked', async () => {
    const alpha = createProfile('cust-1', 'Alice Smith');
    const beta = createProfile('cust-2', 'Bob Jones');
    const model = {
      ...createModel([alpha, beta]),
      clusters: [
        {
          id: 'cluster-1',
          label: 'support',
          memberIds: [alpha.id],
          memberCount: 1,
          riskScore: alpha.riskScore,
          opportunityScore: alpha.opportunityScore,
          sharedSignals: alpha.signal.topics.slice(0, 2),
        },
        {
          id: 'cluster-2',
          label: 'renewal',
          memberIds: [beta.id],
          memberCount: 1,
          riskScore: beta.riskScore,
          opportunityScore: beta.opportunityScore,
          sharedSignals: beta.signal.topics.slice(0, 2),
        },
      ],
    } satisfies CustomerGraphModel;

    const alerts: CustomerGraphAlert[] = [
      {
        id: 'alert-1',
        type: 'risk_spike',
        severity: 'warning',
        clusterId: 'cluster-2',
        clusterLabel: 'renewal',
        generatedAt: model.generatedAt,
        delta: 0.18,
        currentValue: 0.62,
        previousValue: 0.44,
      },
    ];

    vi.mocked(buildGraphModel).mockResolvedValue(model);
    vi.mocked(evaluateRealtimeGraphAlerts).mockReturnValue(alerts);

    render(<CustomerGraphView isDark={false} />);

    await waitFor(() => {
      expect(screen.getByText('customerGraph.alerts.title')).toBeInTheDocument();
      expect(screen.getByText('customerGraph.alerts.riskSpikeTitle')).toBeInTheDocument();
      expect(screen.getAllByText('renewal').length).toBeGreaterThan(0);
    });

    const alertButton = screen.getByText('customerGraph.alerts.riskSpikeTitle').closest('button');
    expect(alertButton).not.toBeNull();
    fireEvent.click(alertButton!);

    await waitFor(() => {
      expect(screen.getAllByText('Bob Jones').length).toBeGreaterThan(0);
    });
  });
});
