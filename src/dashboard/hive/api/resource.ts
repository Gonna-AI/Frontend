import { useCallback, useEffect, useRef, useState } from 'react';

import { hasHiveCredentials, hiveRequest, HiveProblem } from './client';

/** A record shown by the dashboard. Every HIVE object has an `id` with its type prefix. */
export type Row = { id: string } & Record<string, unknown>;

/**
 * One HIVE resource as the dashboard uses it: where it lives in the API, which operations read and change it,
 * and the placeholder records shown until the API is attached. The names are the catalog's: `object` and
 * `path` are the resource row, `list` and `get` are operationIds.
 */
export interface ResourceDef<T extends Row = Row> {
  object: string;
  /** The collection path, e.g. `/v1/work-orders`. */
  path: string;
  /** The module that owns the resource (catalog owner), for tracing a screen to the backend. */
  owner: string;
  list: string;
  get?: string;
  /** Placeholder records in the shape the API will return. */
  fixture: T[];
  /** Reads the rows from a public operation (no credentials), e.g. the published OpenAPI document. */
  loadPublic?: (signal: AbortSignal) => Promise<T[]>;
  /** Maps an API object to the row the screen draws, when the shapes differ. */
  fromApi?: (o: Record<string, unknown>) => T;
}

export type Source = 'live' | 'placeholder';

export interface ResourceState<T extends Row> {
  rows: T[];
  source: Source;
  loading: boolean;
  error?: HiveProblem;
  /** Applies a change on this page (an action before the API takes it). */
  update: (id: string, patch: Partial<T>) => void;
  add: (row: T) => void;
  remove: (id: string) => void;
  reload: () => void;
}

/**
 * Reads a resource: from the API when the dashboard holds HIVE credentials, otherwise the placeholder records.
 * A failing call keeps the placeholder visible and reports the problem, so a screen never goes blank.
 */
export function useResource<T extends Row>(def: ResourceDef<T>): ResourceState<T> {
  const [rows, setRows] = useState<T[]>(def.fixture);
  const [source, setSource] = useState<Source>('placeholder');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HiveProblem | undefined>();
  const [tick, setTick] = useState(0);
  const defRef = useRef(def);
  defRef.current = def;

  useEffect(() => {
    setRows(def.fixture);
    setSource('placeholder');
    setError(undefined);
    const ctrl = new AbortController();
    if (def.loadPublic) {
      setLoading(true);
      def
        .loadPublic(ctrl.signal)
        .then((rs) => {
          if (rs.length) {
            setRows(rs);
            setSource('live');
          }
        })
        .catch(() => {
          /* the placeholder rows stay */
        })
        .finally(() => setLoading(false));
      return () => ctrl.abort();
    }
    if (!hasHiveCredentials()) return undefined;
    setLoading(true);
    hiveRequest<{ data: Record<string, unknown>[] }>(def.path, { query: { limit: 100 }, signal: ctrl.signal })
      .then((page) => {
        const map = defRef.current.fromApi ?? ((o: Record<string, unknown>) => o as T);
        setRows(page.data.map(map));
        setSource('live');
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(e instanceof HiveProblem ? e : new HiveProblem(0, 'unavailable', String(e)));
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
    // def.path identifies the resource; the fixture is static per definition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.path, tick]);

  const update = useCallback((id: string, patch: Partial<T>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r))), []);
  const add = useCallback((row: T) => setRows((rs) => [row, ...rs]), []);
  const remove = useCallback((id: string) => setRows((rs) => rs.filter((r) => r.id !== id)), []);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { rows, source, loading, error, update, add, remove, reload };
}

/** A new ID in HIVE's format (prefix + 26 lowercase base32 characters), for records created on this page. */
export function newId(prefix: string): string {
  const alphabet = '0123456789abcdefghjkmnpqrstvwxyz';
  let s = '01m7';
  for (let i = 0; i < 22; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}_${s}`;
}
