import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── CORS ────────────────────────────────────────────────────────
const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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
  .map((o) => o.trim())
  .filter(Boolean);

for (const o of EXTRA_ALLOWED_ORIGINS) DEFAULT_ALLOWED_ORIGINS.add(o);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  if (DEFAULT_ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) return true;
    return url.protocol === 'https:' && (
      url.hostname === 'clerktree.com' || url.hostname.endsWith('.clerktree.com')
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
  return { ...corsBaseHeaders, 'Access-Control-Allow-Origin': allowedOrigin, 'Vary': 'Origin' };
}

function json(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

// ─── Main handler ────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (!isAllowedOrigin(req.headers.get('Origin'))) {
    return json(req, 403, { error: 'Origin not allowed' });
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const admin = createClient(supabaseUrl, serviceKey);

    // ━━━ GET: Load knowledge base config ━━━━━━━━━━━━━━━━━━━━━━━━
    // ?owner_id=<uuid> — works with or without auth (visitors can load an agent's public config)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const ownerId = url.searchParams.get('owner_id');
      if (!ownerId) return json(req, 400, { error: 'Missing owner_id' });

      const { data, error } = await admin
        .from('knowledge_base_config')
        .select('id, config, updated_at')
        .eq('id', ownerId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return json(req, 404, { error: 'Not found' });

      return json(req, 200, { id: data.id as string, config: data.config as Record<string, unknown>, updated_at: data.updated_at as string });
    }

    // ━━━ POST: Save knowledge base config (auth required) ━━━━━━━
    if (req.method === 'POST') {
      const authHeader = req.headers.get('Authorization') ?? '';
      if (!authHeader) return json(req, 401, { error: 'Unauthorized' });

      const anonClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authErr } = await anonClient.auth.getUser();
      if (authErr || !user) return json(req, 401, { error: 'Unauthorized' });

      const body = await req.json() as Record<string, unknown>;
      const config = body.config;
      if (!config) return json(req, 400, { error: 'Missing config' });

      const { data, error } = await admin
        .from('knowledge_base_config')
        .upsert({
          id: user.id,
          user_id: user.id,
          config,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select('id, config, updated_at')
        .single();

      if (error) throw error;

      return json(req, 200, {
        success: true,
        id: data.id as string,
        config: data.config as Record<string, unknown>,
        updated_at: data.updated_at as string,
      });
    }

    return json(req, 404, { error: 'Not found' });

  } catch (error) {
    console.error('[api-knowledge-base] error:', error);
    return json(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
