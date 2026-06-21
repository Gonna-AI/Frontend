import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildGraphModel } from './customerGraphService';
import type { CustomerGraphFilters, CustomerGraphModel } from '../types/customerGraph';

vi.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { supabase } from '../config/supabase';

const baseFilters: CustomerGraphFilters = {
  startDate: null,
  endDate: null,
  interactionType: 'all',
  minSimilarity: 0.58,
  anonymize: false,
};

const MOCK_TOKEN = 'mock-access-token';

function setMockSession() {
  vi.mocked(supabase.auth.getSession).mockResolvedValue({
    data: { session: { access_token: MOCK_TOKEN, user: { id: 'user-1' } } as never },
    error: null,
  });
}

function emptyModel(override: Partial<CustomerGraphModel> = {}): CustomerGraphModel {
  return {
    generatedAt: '2026-06-22T10:00:00.000Z',
    profiles: [],
    edges: [],
    clusters: [],
    stats: { totalCustomers: 0, totalEdges: 0, totalClusters: 0, highRiskClusters: 0, opportunityClusters: 0 },
    ...override,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('customerGraphService', () => {
  it('throws when there is no active session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(buildGraphModel([], baseFilters)).rejects.toThrow('Authentication required');
  });

  it('calls the edge function with the correct URL, method, and auth header', async () => {
    setMockSession();

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => emptyModel(),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await buildGraphModel([], baseFilters, { enrichWithAI: false });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toContain('/functions/v1/api-customer-graph');
    expect(init.method).toBe('POST');
    expect(init.headers['Authorization']).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('sends filters and enrichWithAI flag in the request body', async () => {
    setMockSession();

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => emptyModel(),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await buildGraphModel([], baseFilters, { enrichWithAI: true });

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.filters).toEqual(baseFilters);
    expect(body.enrichWithAI).toBe(true);
  });

  it('converts string date fields in profile responses to Date objects', async () => {
    setMockSession();

    const rawProfile = {
      id: 'prof-1',
      displayName: 'Alice',
      firstSeen: '2026-01-01T10:00:00.000Z',
      lastSeen: '2026-06-01T10:00:00.000Z',
      interactions: [{ date: '2026-01-15T10:00:00.000Z' }],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => emptyModel({ profiles: [rawProfile as never] }),
    }));

    const model = await buildGraphModel([], baseFilters);

    expect(model.profiles[0].firstSeen).toBeInstanceOf(Date);
    expect(model.profiles[0].lastSeen).toBeInstanceOf(Date);
    expect(model.profiles[0].interactions[0].date).toBeInstanceOf(Date);
  });

  it('throws with the API error message on a non-ok response', async () => {
    setMockSession();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid filter combination' }),
    }));

    await expect(buildGraphModel([], baseFilters)).rejects.toThrow('Invalid filter combination');
  });

  it('throws a generic message when the error response body is not JSON', async () => {
    setMockSession();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => { throw new SyntaxError('not json'); },
    }));

    await expect(buildGraphModel([], baseFilters)).rejects.toThrow('Failed to fetch customer graph');
  });

  it('defaults enrichWithAI to false when options are omitted', async () => {
    setMockSession();

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => emptyModel(),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await buildGraphModel([], baseFilters);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.enrichWithAI).toBe(false);
  });
});
