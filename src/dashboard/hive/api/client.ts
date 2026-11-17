/**
 * The HIVE API client of the dashboard. Every screen reaches the API through this file, so attaching the real
 * backend is a change here and in the resource definitions, never in a screen.
 *
 * Base URL: `VITE_HIVE_API_URL` when set, otherwise `/hive-api`, a same-origin proxy (netlify.toml in production,
 * vite.config.ts in development) to the HIVE API. Same-origin means no CORS and no API host in the bundle.
 *
 * Credentials: none yet. The HIVE API accepts a bearer API key or a user session token; a key must never be put
 * into a browser bundle, so credentialed calls wait for a user token (`setHiveToken`) from the sign-in flow.
 * Until then only the public operations are called (health, readiness, the OpenAPI and AsyncAPI documents).
 */

export const HIVE_API_VERSION = '2026-11-01';

const BASE = ((import.meta.env.VITE_HIVE_API_URL as string | undefined) ?? '/hive-api').replace(/\/+$/, '');

let tokenProvider: (() => string | null | Promise<string | null>) | null = null;

/** Called by the sign-in flow once HIVE user sessions exist. */
export function setHiveToken(provider: typeof tokenProvider) {
  tokenProvider = provider;
}

export function hasHiveCredentials(): boolean {
  return tokenProvider !== null;
}

/** A problem response of the HIVE API (application/problem+json). */
export class HiveProblem extends Error {
  constructor(
    public status: number,
    public code: string,
    public title: string,
    public detail?: string,
    public requestId?: string,
  ) {
    super(`${status} ${code}: ${detail ?? title}`);
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** Makes a create or action safe to retry. */
  idempotencyKey?: string;
  /** The version (ETag) the client read, for updates. */
  ifMatch?: string;
  signal?: AbortSignal;
  /** Public operations need no credentials. */
  public?: boolean;
}

export async function hiveRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(BASE + path, window.location.origin);
  for (const [k, v] of Object.entries(opts.query ?? {})) if (v !== undefined) url.searchParams.set(k, String(v));
  const headers: Record<string, string> = { Accept: 'application/json', 'Hive-Version': HIVE_API_VERSION };
  if (!opts.public) {
    const token = tokenProvider ? await tokenProvider() : null;
    if (!token) throw new HiveProblem(401, 'unauthenticated', 'Not connected', 'This dashboard is not connected to a HIVE tenant yet.');
    headers.Authorization = `Bearer ${token}`;
  }
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;
  if (opts.ifMatch) headers['If-Match'] = opts.ifMatch;

  const res = await fetch(url.toString(), {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    signal: opts.signal,
    credentials: 'omit',
  });
  if (!res.ok) {
    let p: { code?: string; title?: string; detail?: string; request_id?: string } = {};
    try {
      p = await res.json();
    } catch {
      /* not a problem document */
    }
    throw new HiveProblem(res.status, p.code ?? 'unavailable', p.title ?? res.statusText, p.detail, p.request_id ?? res.headers.get('Hive-Request-Id') ?? undefined);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ---------- the public operations, live today ---------- */

export interface HiveHealth {
  status: 'ok' | 'unavailable';
}

export interface HiveStatus {
  reachable: boolean;
  /** Liveness: the process answers. */
  live: boolean;
  /** Readiness: its database answers too. */
  ready: boolean;
  version?: string;
  operations?: number;
  events?: number;
  checkedAt: Date;
  latencyMs?: number;
}

async function timed<T>(fn: () => Promise<T>): Promise<[T | null, number]> {
  const t0 = performance.now();
  try {
    const v = await fn();
    return [v, Math.round(performance.now() - t0)];
  } catch {
    return [null, Math.round(performance.now() - t0)];
  }
}

interface OpenApiDoc {
  info?: { version?: string };
  paths?: Record<string, Record<string, unknown>>;
}

let docCache: Promise<OpenApiDoc | null> | null = null;
/** The public OpenAPI document of the latest released version (cached for the page's lifetime). */
export function fetchOpenApi(): Promise<OpenApiDoc | null> {
  docCache ??= hiveRequest<OpenApiDoc>('/v1/openapi.json', { public: true }).catch(() => {
    docCache = null;
    return null;
  });
  return docCache;
}

export async function fetchHiveStatus(signal?: AbortSignal): Promise<HiveStatus> {
  const [health, latencyMs] = await timed(() => hiveRequest<HiveHealth>('/v1/health', { public: true, signal }));
  if (!health) return { reachable: false, live: false, ready: false, checkedAt: new Date(), latencyMs };
  const [ready] = await timed(async () => {
    const r = await fetch(`${BASE}/readyz`, { signal, credentials: 'omit' });
    return r.ok;
  });
  const doc = await fetchOpenApi();
  let operations: number | undefined;
  if (doc?.paths) operations = Object.values(doc.paths).reduce((n, item) => n + Object.keys(item).filter((m) => ['get', 'post', 'put', 'patch', 'delete'].includes(m)).length, 0);
  return { reachable: true, live: health.status === 'ok', ready: Boolean(ready), version: doc?.info?.version, operations, checkedAt: new Date(), latencyMs };
}
