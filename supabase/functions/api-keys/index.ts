import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const DEFAULT_ALLOWED_ORIGINS = new Set<string>([
  'https://clerktree.com',
  'https://www.clerktree.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://clerktree.netlify.app',
]);

const EXTRA_ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

for (const origin of EXTRA_ALLOWED_ORIGINS) {
  DEFAULT_ALLOWED_ORIGINS.add(origin);
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  if (DEFAULT_ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    if (isLocalhost) return true;
    return url.protocol === 'https:' && (
      url.hostname === 'clerktree.com' ||
      url.hostname.endsWith('.clerktree.com')
    );
  } catch {
    return false;
  }
}

function corsHeadersFor(req: Request): Record<string, string> {
  const requestOrigin = req.headers.get('Origin');
  const allowedOrigin = requestOrigin && isAllowedOrigin(requestOrigin)
    ? requestOrigin
    : 'https://clerktree.com';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
  };
}

function jsonResponse(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

// Generate a secure API token: ct_<random hex>
function generateApiToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `ct_${hex}`;
}

// Mask token for display: show first 7 + last 4 chars
function maskToken(token: string): string {
  if (token.length <= 11) return token;
  return token.slice(0, 7) + '...' + token.slice(-4);
}

Deno.serve(async (req: Request) => {
  if (!isAllowedOrigin(req.headers.get('Origin'))) {
    return jsonResponse(req, 403, { error: 'Origin not allowed' });
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    // Authenticate user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const url = new URL(req.url);
    const params = url.searchParams;

    // ─── GET: List API keys ──────────────────────────────────
    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from('user_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mask tokens in response
      const keys = (data ?? []).map((k: Record<string, unknown>) => ({
        ...k,
        token: maskToken(k.token as string),
      }));

      return jsonResponse(req, 200, { keys });
    }

    // ─── POST: Create new API key ────────────────────────────
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({})) as Record<string, unknown>;
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const permissions = Array.isArray(body.permissions) ? body.permissions : ['voice', 'text'];
      const rateLimit = typeof body.rate_limit === 'number' ? Math.min(Math.max(body.rate_limit, 10), 10000) : 100;

      if (name.length < 3) {
        return jsonResponse(req, 400, { error: 'Key name must be at least 3 characters.' });
      }

      // Check key count limit (max 10 per user)
      const { count } = await adminClient
        .from('user_api_keys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if ((count ?? 0) >= 10) {
        return jsonResponse(req, 400, { error: 'Maximum of 10 active API keys per account.' });
      }

      const token = generateApiToken();

      const { data, error } = await adminClient
        .from('user_api_keys')
        .insert({
          user_id: user.id,
          name,
          token,
          permissions,
          rate_limit: rateLimit,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Return the full token only on creation (never again)
      return jsonResponse(req, 201, { key: data });
    }

    // ─── DELETE: Revoke an API key ───────────────────────────
    if (req.method === 'DELETE') {
      const keyId = params.get('id');
      if (!keyId) {
        return jsonResponse(req, 400, { error: 'Missing key id.' });
      }

      const { error } = await adminClient
        .from('user_api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user.id);

      if (error) throw error;

      return jsonResponse(req, 200, { success: true });
    }

    return jsonResponse(req, 404, { error: 'Not found' });

  } catch (error) {
    console.error('[api-keys] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
