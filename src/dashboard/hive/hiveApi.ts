/**
 * Hive API client for the dashboard.
 *
 * Only `GET /v1/health` exists on the Hive API today, so that is the only real call. Everything
 * else is served from placeholder.ts through the same function signatures the real endpoints
 * will use. When an endpoint ships, replace the body of its function here and leave the page alone.
 *
 * Set VITE_HIVE_API_URL (for example https://api.example.com) to point the health check at an
 * API. It is a public value: never put a key or token in it. Without it the page shows the
 * placeholder state and makes no network request.
 */
import { placeholderOverview, type HiveOverview } from './placeholder';

export type HiveApiState = 'unconfigured' | 'checking' | 'online' | 'offline';

const base = (import.meta.env.VITE_HIVE_API_URL as string | undefined)?.replace(/\/+$/, '');

/** Real call. Resolves to the API state; never throws. */
export async function fetchHiveHealth(signal?: AbortSignal): Promise<Exclude<HiveApiState, 'checking'>> {
  if (!base) return 'unconfigured';
  try {
    const res = await fetch(`${base}/v1/health`, { signal, headers: { Accept: 'application/json' } });
    if (!res.ok) return 'offline';
    const body = (await res.json()) as { status?: string };
    return body.status === 'ok' ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
}

/**
 * Placeholder until the telemetry, alarm, asset-graph and work-order endpoints exist.
 * The real version will call them with the signed-in user's session and return the same shape.
 */
export async function fetchHiveOverview(): Promise<HiveOverview> {
  return placeholderOverview;
}
