/**
 * Tests for stats.ts statistical algorithms.
 * Run with: npm test -- stats
 */

import { describe, it, expect } from 'vitest';
import {
  tokenize,
  jaccard,
  termFrequency,
  topByFrequency,
  computeTagLift,
  computeCategoryFCR,
  computeKbGaps,
  findCallerHistory,
} from '../../supabase/functions/_shared/stats';

import type { CallRow } from '../../supabase/functions/_shared/stats';

// ─── tokenize ─────────────────────────────────────────────────────────────────

describe('tokenize', () => {
  it('tokenizes basic text', () => {
    const tokens = tokenize('Billing question about invoice');
    expect(tokens).toContain('billing');
    expect(tokens).toContain('question');
    expect(tokens).toContain('invoice');
    // "issue" is a stop word (too generic for topic analysis) — should not appear
    expect(tokenize('billing issue')).not.toContain('issue');
  });

  it('removes stopwords', () => {
    const tokens = tokenize('the customer is having a problem');
    expect(tokens).not.toContain('the');
    expect(tokens).not.toContain('is');
    expect(tokens).not.toContain('a');
    expect(tokens).toContain('having');
  });

  it('removes tokens shorter than 3 chars', () => {
    const tokens = tokenize('go do it now');
    expect(tokens).not.toContain('go');
    expect(tokens).not.toContain('do');
    expect(tokens).not.toContain('it');
    expect(tokens).toContain('now');
  });

  it('returns empty array for empty input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   ')).toEqual([]);
  });

  it('lowercases, strips punctuation, and splits hyphens', () => {
    const tokens = tokenize('REFUND! Requested, for: Product-Return.');
    expect(tokens).toContain('refund');
    expect(tokens).toContain('requested');
    // hyphens split into separate tokens
    expect(tokens).toContain('product');
    expect(tokens).toContain('return');
    // also verify hyphenated compound splits
    expect(tokenize('follow-up appointment')).toContain('follow');
    expect(tokenize('follow-up appointment')).toContain('appointment');
  });
});

// ─── jaccard ──────────────────────────────────────────────────────────────────

describe('jaccard', () => {
  it('returns 1.0 for identical sets', () => {
    expect(jaccard(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(1.0);
  });

  it('returns 0 for completely disjoint sets', () => {
    expect(jaccard(['a', 'b'], ['c', 'd'])).toBe(0.0);
  });

  it('computes correct partial overlap', () => {
    // intersection={b}, union={a,b,c,d} → 1/4
    expect(jaccard(['a', 'b'], ['b', 'c', 'd'])).toBeCloseTo(0.25, 3);
  });

  it('returns 0 for both empty', () => {
    expect(jaccard([], [])).toBe(0);
  });

  it('returns 0 when one side is empty', () => {
    expect(jaccard(['a', 'b'], [])).toBe(0);
    expect(jaccard([], ['a', 'b'])).toBe(0);
  });

  it('deduplicates duplicates in input', () => {
    expect(jaccard(['a', 'a', 'b'], ['b', 'b', 'c'])).toBeCloseTo(
      jaccard(['a', 'b'], ['b', 'c']),
      4,
    );
  });
});

// ─── termFrequency / topByFrequency ───────────────────────────────────────────

describe('termFrequency', () => {
  it('counts occurrences correctly', () => {
    const freq = termFrequency(['a', 'b', 'a', 'c', 'a', 'b']);
    expect(freq.get('a')).toBe(3);
    expect(freq.get('b')).toBe(2);
    expect(freq.get('c')).toBe(1);
  });
});

describe('topByFrequency', () => {
  it('returns top N values sorted by frequency', () => {
    const top = topByFrequency(['billing', 'refund', 'billing', 'refund', 'refund', 'shipping'], 2);
    expect(top[0]).toBe('refund');
    expect(top[1]).toBe('billing');
    expect(top).toHaveLength(2);
  });
});

// ─── computeTagLift ───────────────────────────────────────────────────────────

function makeLiftCalls(): CallRow[] {
  const calls: CallRow[] = [];
  // 8 resolved with "billing"
  for (let i = 0; i < 8; i++) {
    calls.push({ id: `r-billing-${i}`, follow_up_required: false, summary: { topics: ['billing'], followUpRequired: false } });
  }
  // 8 unresolved with "refund"
  for (let i = 0; i < 8; i++) {
    calls.push({ id: `u-refund-${i}`, follow_up_required: true, summary: { topics: ['refund'], followUpRequired: true } });
  }
  // 2 resolved + 2 unresolved with "shipping"
  for (let i = 0; i < 2; i++) {
    calls.push({ id: `r-shipping-${i}`, follow_up_required: false, summary: { topics: ['shipping'] } });
    calls.push({ id: `u-shipping-${i}`, follow_up_required: true, summary: { topics: ['shipping'] } });
  }
  return calls;
}

describe('computeTagLift', () => {
  it('billing has lift > 1 (winning signal)', () => {
    const results = computeTagLift(makeLiftCalls());
    const billing = results.find(r => r.signal === 'billing');
    expect(billing).toBeDefined();
    expect(billing!.lift).toBeGreaterThan(1);
  });

  it('refund has lift < 1 (risk signal)', () => {
    const results = computeTagLift(makeLiftCalls());
    const refund = results.find(r => r.signal === 'refund');
    expect(refund).toBeDefined();
    expect(refund!.lift).toBeLessThan(1);
  });

  it('shipping lift is near 1 (neutral — equal split)', () => {
    const results = computeTagLift(makeLiftCalls());
    const shipping = results.find(r => r.signal === 'shipping');
    expect(shipping).toBeDefined();
    // 2/10 resolved vs 2/10 unresolved → equal rates → lift ≈ 1
    expect(shipping!.lift).toBeGreaterThan(0.5);
    expect(shipping!.lift).toBeLessThan(2.0);
  });

  it('is sorted descending by lift', () => {
    const results = computeTagLift(makeLiftCalls());
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].lift).toBeGreaterThanOrEqual(results[i + 1].lift);
    }
  });

  it('filters signals below minOcc', () => {
    const calls: CallRow[] = [
      { id: 'a', follow_up_required: false, summary: { topics: ['rare'] } },
      { id: 'b', follow_up_required: false, summary: { topics: ['common'] } },
      { id: 'c', follow_up_required: true, summary: { topics: ['common'] } },
      { id: 'd', follow_up_required: false, summary: { topics: ['common'] } },
    ];
    const results = computeTagLift(calls, 2);
    expect(results.find(r => r.signal === 'rare')).toBeUndefined();
    expect(results.find(r => r.signal === 'common')).toBeDefined();
  });

  it('handles empty input', () => {
    expect(computeTagLift([])).toEqual([]);
  });

  it('uses tags[] as well as summary.topics', () => {
    const calls: CallRow[] = [
      { id: 'a', follow_up_required: false, tags: ['from-tag'], summary: {} },
      { id: 'b', follow_up_required: false, tags: ['from-tag'], summary: {} },
      { id: 'c', follow_up_required: true, summary: {} },
    ];
    const results = computeTagLift(calls, 2);
    expect(results.find(r => r.signal === 'from-tag')).toBeDefined();
  });

  it('resolvedRate + unresolvedRate reflect true proportions', () => {
    // 4 resolved all with "test", 0 unresolved with "test"
    const calls: CallRow[] = [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `r${i}`, follow_up_required: false, summary: { topics: ['test'] }
      } as CallRow)),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `u${i}`, follow_up_required: true, summary: { topics: ['other'] }
      } as CallRow)),
    ];
    const results = computeTagLift(calls, 1);
    const test = results.find(r => r.signal === 'test');
    expect(test).toBeDefined();
    expect(test!.resolvedRate).toBeCloseTo(1.0, 2);   // 4/4
    expect(test!.unresolvedRate).toBeCloseTo(0.0, 2); // 0/4
  });
});

// ─── computeCategoryFCR ───────────────────────────────────────────────────────

describe('computeCategoryFCR', () => {
  const calls: CallRow[] = [
    { id: '1', category: 'billing', follow_up_required: false, duration: 120 },
    { id: '2', category: 'billing', follow_up_required: false, duration: 180 },
    { id: '3', category: 'billing', follow_up_required: true,  duration: 240 },
    { id: '4', category: 'shipping', follow_up_required: false, duration: 60 },
    { id: '5', category: 'shipping', follow_up_required: true,  duration: 90 },
  ];

  it('computes correct FCR and AHT for billing (2/3 resolved)', () => {
    const results = computeCategoryFCR(calls);
    const billing = results.find(r => r.category === 'billing');
    expect(billing).toBeDefined();
    expect(billing!.totalCalls).toBe(3);
    expect(billing!.resolvedCalls).toBe(2);
    expect(billing!.fcrRate).toBeCloseTo(2 / 3, 3);
    expect(billing!.avgDuration).toBe(180); // (120+180+240)/3
  });

  it('computes correct FCR for shipping (1/2 resolved)', () => {
    const results = computeCategoryFCR(calls);
    const shipping = results.find(r => r.category === 'shipping');
    expect(shipping).toBeDefined();
    expect(shipping!.fcrRate).toBeCloseTo(0.5, 3);
    expect(shipping!.avgDuration).toBe(75); // (60+90)/2
  });

  it('sorts by totalCalls descending', () => {
    const results = computeCategoryFCR(calls);
    expect(results[0].category).toBe('billing'); // 3 > 2
  });
});

// ─── computeKbGaps ────────────────────────────────────────────────────────────

describe('computeKbGaps', () => {
  it('flags uncovered topics as gaps', () => {
    const calls: CallRow[] = [
      { id: 'a', follow_up_required: true, summary: { topics: ['refund policy'], followUpRequired: true } },
      { id: 'b', follow_up_required: true, summary: { topics: ['refund policy'], followUpRequired: true } },
      { id: 'c', follow_up_required: true, summary: { topics: ['shipping tracking'], followUpRequired: true } },
      { id: 'd', follow_up_required: true, summary: { topics: ['shipping tracking'], followUpRequired: true } },
    ];
    const kbContents = [
      'Our shipping tracking system lets customers track orders in real time.',
    ];
    const result = computeKbGaps(calls, kbContents, 2, 0.3);

    // shipping tracking is covered → should NOT be in gaps
    expect(result.gaps.find(g => g.topic === 'shipping tracking')).toBeUndefined();
    // refund policy is not covered → SHOULD be a gap
    const gap = result.gaps.find(g => g.topic === 'refund policy');
    expect(gap).toBeDefined();
    expect(gap!.occurrences).toBe(2);
  });

  it('returns coverageScore=1 when all topics covered', () => {
    const calls: CallRow[] = [
      { id: 'a', follow_up_required: true, summary: { topics: ['billing invoice'] } },
      { id: 'b', follow_up_required: true, summary: { topics: ['billing invoice'] } },
    ];
    const kbContents = [
      'Billing and invoice management. All billing inquiries including invoice disputes.',
    ];
    const result = computeKbGaps(calls, kbContents, 2, 0.3);
    expect(result.gaps).toHaveLength(0);
    expect(result.coverageScore).toBe(1);
  });

  it('returns coverageScore=0 when nothing covered', () => {
    const calls: CallRow[] = [
      { id: 'a', follow_up_required: true, summary: { topics: ['quantum entanglement'] } },
      { id: 'b', follow_up_required: true, summary: { topics: ['quantum entanglement'] } },
    ];
    const kbContents = ['We offer refunds on purchases.'];
    const result = computeKbGaps(calls, kbContents, 2, 0.3);
    expect(result.coverageScore).toBe(0);
    expect(result.gaps).toHaveLength(1);
  });

  it('ignores resolved calls — only unresolved contribute to gaps', () => {
    const calls: CallRow[] = [
      // resolved — should be ignored
      { id: 'a', follow_up_required: false, summary: { topics: ['ignored topic'], followUpRequired: false } },
      { id: 'b', follow_up_required: false, summary: { topics: ['ignored topic'], followUpRequired: false } },
      // unresolved — should appear
      { id: 'c', follow_up_required: true, summary: { topics: ['uncovered issue'], followUpRequired: true } },
      { id: 'd', follow_up_required: true, summary: { topics: ['uncovered issue'], followUpRequired: true } },
    ];
    const kbContents = ['Information about returns and exchanges.'];
    const result = computeKbGaps(calls, kbContents, 2, 0.3);
    expect(result.gaps.find(g => g.topic === 'ignored topic')).toBeUndefined();
    expect(result.gaps.find(g => g.topic === 'uncovered issue')).toBeDefined();
  });

  it('gaps are sorted by occurrences descending', () => {
    const calls: CallRow[] = [
      ...Array.from({ length: 5 }, (_, i) => ({ id: `a${i}`, follow_up_required: true, summary: { topics: ['rare gap'] } } as CallRow)),
      ...Array.from({ length: 10 }, (_, i) => ({ id: `b${i}`, follow_up_required: true, summary: { topics: ['frequent gap'] } } as CallRow)),
    ];
    const result = computeKbGaps(calls, [], 2, 0.3);
    expect(result.gaps[0].topic).toBe('frequent gap');
    expect(result.gaps[0].occurrences).toBe(10);
  });
});

// ─── findCallerHistory ────────────────────────────────────────────────────────

function makeCallerCalls(): CallRow[] {
  return [
    {
      id: 'c1',
      caller_name: 'Alice Smith',
      date: '2026-03-20T10:00:00Z',
      category: 'billing',
      sentiment: 'negative',
      follow_up_required: true,
      duration: 240,
      summary: {
        sentiment: 'negative',
        followUpRequired: true,
        actionItems: [{ text: 'Send invoice copy' }, { text: 'Escalate to manager' }],
      },
    },
    {
      id: 'c2',
      caller_name: 'Alice Smith',
      date: '2026-03-15T14:00:00Z',
      category: 'billing',
      sentiment: 'neutral',
      follow_up_required: false,
      duration: 120,
      summary: { sentiment: 'neutral', followUpRequired: false, actionItems: [] },
    },
    {
      id: 'other',
      caller_name: 'Bob Jones',
      date: '2026-03-18T09:00:00Z',
      category: 'shipping',
      follow_up_required: false,
      summary: { sentiment: 'positive' },
    },
  ];
}

describe('findCallerHistory', () => {
  it('recognizes returning caller', () => {
    const result = findCallerHistory(makeCallerCalls(), 'Alice Smith');
    expect(result.isReturning).toBe(true);
    expect(result.totalCalls).toBe(2);
  });

  it('returns calls in most-recent-first order', () => {
    const result = findCallerHistory(makeCallerCalls(), 'Alice Smith');
    expect(result.lastCalls[0].date).toBe('2026-03-20T10:00:00Z');
    expect(result.lastCalls[1].date).toBe('2026-03-15T14:00:00Z');
  });

  it('extracts open action items from unresolved calls only', () => {
    const result = findCallerHistory(makeCallerCalls(), 'Alice Smith');
    expect(result.openActionItems).toContain('Send invoice copy');
    expect(result.openActionItems).toContain('Escalate to manager');
    expect(result.openActionItems).toHaveLength(2);
  });

  it('does not include other callers data', () => {
    const result = findCallerHistory(makeCallerCalls(), 'Alice Smith');
    for (const call of result.lastCalls) {
      expect(call.category).not.toBe('shipping');
    }
  });

  it('returns isReturning=false for unknown caller', () => {
    const result = findCallerHistory(makeCallerCalls(), 'Charlie Unknown');
    expect(result.isReturning).toBe(false);
    expect(result.totalCalls).toBe(0);
    expect(result.lastCalls).toHaveLength(0);
  });

  it('matches caller name case-insensitively', () => {
    const result = findCallerHistory(makeCallerCalls(), 'alice smith');
    expect(result.isReturning).toBe(true);
    expect(result.totalCalls).toBe(2);
  });

  it('riskFlag=high when 2+ recent calls have negative sentiment', () => {
    const calls: CallRow[] = [
      { id: '1', caller_name: 'Dan', date: '2026-03-20T10:00:00Z', follow_up_required: true,  summary: { sentiment: 'negative' } },
      { id: '2', caller_name: 'Dan', date: '2026-03-19T10:00:00Z', follow_up_required: true,  summary: { sentiment: 'negative' } },
      { id: '3', caller_name: 'Dan', date: '2026-03-18T10:00:00Z', follow_up_required: false, summary: { sentiment: 'positive' } },
    ];
    expect(findCallerHistory(calls, 'Dan').riskFlag).toBe('high');
  });

  it('riskFlag=none when all recent calls positive', () => {
    const calls: CallRow[] = [
      { id: '1', caller_name: 'Eve', date: '2026-03-20T10:00:00Z', follow_up_required: false, summary: { sentiment: 'positive' } },
      { id: '2', caller_name: 'Eve', date: '2026-03-19T10:00:00Z', follow_up_required: false, summary: { sentiment: 'positive' } },
    ];
    expect(findCallerHistory(calls, 'Eve').riskFlag).toBe('none');
  });

  it('treats "Unknown Caller" as a new caller', () => {
    const result = findCallerHistory(makeCallerCalls(), 'Unknown Caller');
    expect(result.isReturning).toBe(false);
  });
});
