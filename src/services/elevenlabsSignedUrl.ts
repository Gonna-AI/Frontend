import log from '../utils/logger';

const DEFAULT_SIGNED_URL_PATH = '/api/elevenlabs-signed-url';
const NETLIFY_FUNCTION_FALLBACK_PATH = '/.netlify/functions/elevenlabs-signed-url';

interface SignedUrlResponse {
  signed_url?: string;
  error?: string;
  details?: string;
}

function normalizeEndpoint(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

function getSignedUrlEndpoints(): string[] {
  const configuredEndpoint = import.meta.env.VITE_ELEVENLABS_SIGNED_URL_ENDPOINT?.trim();
  const candidates = [
    configuredEndpoint ? normalizeEndpoint(configuredEndpoint) : null,
    DEFAULT_SIGNED_URL_PATH,
    NETLIFY_FUNCTION_FALLBACK_PATH,
  ].filter((value): value is string => Boolean(value));

  return [...new Set(candidates)];
}

function getSignedUrlRequestBody(): Record<string, string> {
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID?.trim();
  return agentId ? { agentId } : {};
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => null) as SignedUrlResponse | null;
    if (data?.error) {
      return data.details ? `${data.error} (${data.details})` : data.error;
    }
  }

  const text = await response.text().catch(() => '');
  return text || `HTTP ${response.status}`;
}

export async function fetchElevenLabsSignedUrl(): Promise<string> {
  const endpoints = getSignedUrlEndpoints();
  const requestBody = getSignedUrlRequestBody();
  const errors: string[] = [];

  for (const endpoint of endpoints) {
    try {
      log.debug(`🔑 Fetching ElevenLabs signed URL from ${endpoint}...`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 404) {
        // Check if the 404 body contains an actual upstream error (old behavior)
        // vs. a genuine "endpoint not found".
        const body = await response.text().catch(() => '');
        if (body.includes('ElevenLabs') || body.includes('upstream')) {
          // This is an upstream error proxied through our function — don't try more endpoints
          throw new Error(`${endpoint}: ${body}`);
        }
        errors.push(`${endpoint}: HTTP 404`);
        continue;
      }

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response);
        throw new Error(`${endpoint}: ${errorMessage}`);
      }

      const data = await response.json() as SignedUrlResponse;
      if (!data.signed_url) {
        throw new Error(`${endpoint}: No signed_url in response`);
      }

      log.debug(`🔑 Signed URL obtained from ${endpoint}`);
      return data.signed_url;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
    }
  }

  throw new Error(
    `Failed to get ElevenLabs signed URL. Tried ${endpoints.join(', ')}. ` +
    `Last errors: ${errors.join(' | ')}. ` +
    'If production does not serve this Netlify function on the same origin, set VITE_ELEVENLABS_SIGNED_URL_ENDPOINT to the real backend endpoint.'
  );
}
