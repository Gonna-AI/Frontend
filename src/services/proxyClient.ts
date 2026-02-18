/**
 * Proxy Client for ClerkTree AI Services
 * 
 * Routes all external API calls through a Supabase Edge Function
 * to keep API keys secure on the server side.
 * 
 * Includes retry with exponential backoff for transient failures.
 */

import { supabase } from '../config/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PROXY_BASE = `${SUPABASE_URL}/functions/v1/api-proxy`;

/** Default retry configuration */
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

/**
 * Available proxy routes (generic names — no provider details exposed)
 */
export const ProxyRoutes = {
    /** Chat completions (LLM responses) */
    COMPLETIONS: 'completions',
    /** Text-to-speech synthesis (English) */
    TTS: 'tts',
    /** Text-to-speech synthesis (alternate/German) */
    TTS_ALT: 'tts-alt',
} as const;

export type ProxyRoute = (typeof ProxyRoutes)[keyof typeof ProxyRoutes];

/**
 * Get the current Supabase access token for authenticated proxy calls.
 */
async function getAccessToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('Not authenticated — please sign in');
    }
    return session.access_token;
}

/** Sleep utility for retry delays */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Check if a status code is retryable */
function isRetryableStatus(status: number): boolean {
    return status === 429 || status >= 500;
}

/**
 * Make an authenticated POST request to the proxy edge function.
 * Includes retry with exponential backoff for 429 and 5xx errors.
 * Returns the raw Response so callers can handle JSON or binary (audio) responses.
 */
export async function proxyFetch(
    route: ProxyRoute,
    body: unknown,
    options?: {
        signal?: AbortSignal;
        timeout?: number;
        maxRetries?: number;
    }
): Promise<Response> {
    // Fail fast if offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('You appear to be offline. Please check your connection.');
    }

    const token = await getAccessToken();
    const maxRetries = options?.maxRetries ?? MAX_RETRIES;

    // Create an abort controller for timeout if no external signal provided
    let controller: AbortController | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (options?.timeout && !options.signal) {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller!.abort(), options.timeout);
    }

    try {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(`${PROXY_BASE}/${route}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                    signal: options?.signal || controller?.signal,
                });

                // If rate limited, respect Retry-After header
                if (response.status === 429 && attempt < maxRetries) {
                    const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
                    console.warn(`[proxyClient] Rate limited on /${route}, retrying in ${retryAfter}s (attempt ${attempt + 1}/${maxRetries})`);
                    await sleep(retryAfter * 1000);
                    continue;
                }

                // Retry on server errors with exponential backoff
                if (isRetryableStatus(response.status) && attempt < maxRetries) {
                    const delay = BASE_DELAY_MS * Math.pow(2, attempt);
                    console.warn(`[proxyClient] Server error ${response.status} on /${route}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                    await sleep(delay);
                    continue;
                }

                return response;
            } catch (err) {
                // Don't retry if the request was intentionally aborted
                if (err instanceof DOMException && err.name === 'AbortError') {
                    throw err;
                }

                // Retry network errors with backoff
                if (attempt < maxRetries) {
                    const delay = BASE_DELAY_MS * Math.pow(2, attempt);
                    console.warn(`[proxyClient] Network error on /${route}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}):`, err);
                    await sleep(delay);
                    continue;
                }
                throw err;
            }
        }

        // Should not reach here, but TypeScript needs it
        throw new Error('Max retries exceeded');
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

/**
 * Convenience: POST to proxy and parse as JSON.
 * Throws on non-OK responses.
 */
export async function proxyJSON<T = unknown>(
    route: ProxyRoute,
    body: unknown,
    options?: { signal?: AbortSignal; timeout?: number; maxRetries?: number }
): Promise<T> {
    const response = await proxyFetch(route, body, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `Proxy request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

/**
 * Convenience: POST to proxy and get back a Blob (for audio responses).
 * Throws on non-OK responses.
 */
export async function proxyBlob(
    route: ProxyRoute,
    body: unknown,
    options?: { signal?: AbortSignal; timeout?: number; maxRetries?: number }
): Promise<Blob> {
    const response = await proxyFetch(route, body, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `Proxy request failed: ${response.status}`);
    }

    return response.blob();
}
