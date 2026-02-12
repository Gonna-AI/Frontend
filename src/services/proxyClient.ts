/**
 * Proxy Client for ClerkTree AI Services
 * 
 * Routes all external API calls through a Supabase Edge Function
 * to keep API keys secure on the server side.
 */

import { supabase } from '../config/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PROXY_BASE = `${SUPABASE_URL}/functions/v1/api-proxy`;

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

/**
 * Make an authenticated POST request to the proxy edge function.
 * Returns the raw Response so callers can handle JSON or binary (audio) responses.
 */
export async function proxyFetch(
    route: ProxyRoute,
    body: unknown,
    options?: {
        signal?: AbortSignal;
        timeout?: number;
    }
): Promise<Response> {
    const token = await getAccessToken();

    // Create an abort controller for timeout if no external signal provided
    let controller: AbortController | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (options?.timeout && !options.signal) {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller!.abort(), options.timeout);
    }

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

        return response;
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
    options?: { signal?: AbortSignal; timeout?: number }
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
    options?: { signal?: AbortSignal; timeout?: number }
): Promise<Blob> {
    const response = await proxyFetch(route, body, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `Proxy request failed: ${response.status}`);
    }

    return response.blob();
}
