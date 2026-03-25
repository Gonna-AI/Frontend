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

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) return json(req, 401, { error: 'Unauthorized' });

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) return json(req, 401, { error: 'Unauthorized' });

    const admin = createClient(supabaseUrl, serviceKey);

    // Route by URL path: /start, /heartbeat, /end
    const url = new URL(req.url);
    const action = url.pathname.replace(/\/+$/, '').split('/').pop() || '';

    // ━━━ POST /start — Register a new active session ━━━━━━━━━━
    if (req.method === 'POST' && action === 'start') {
      const body = await req.json() as Record<string, unknown>;
      const sessionId = body.id as string;
      if (!sessionId) return json(req, 400, { error: 'Missing session id' });

      const sessionType = body.session_type === 'voice' ? 'voice' : 'text';
      const startedAt = typeof body.started_at === 'string' ? body.started_at : new Date().toISOString();

      // Upsert: if session already exists (e.g. page reload), just update it
      const { data, error } = await admin
        .from('active_sessions')
        .upsert({
          id: sessionId,
          user_id: user.id,
          session_type: sessionType,
          started_at: startedAt,
          status: 'active',
          last_activity: new Date().toISOString(),
          caller_name: (body.caller_name as string) || null,
          user_agent: (body.user_agent as string) || null,
          message_count: 0,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      return json(req, 201, { success: true, session: data });
    }

    // ━━━ POST /heartbeat — Update session last_activity ━━━━━━━
    if (req.method === 'POST' && action === 'heartbeat') {
      const body = await req.json() as Record<string, unknown>;
      const sessionId = body.id as string;
      if (!sessionId) return json(req, 400, { error: 'Missing session id' });

      const updates: Record<string, unknown> = {
        last_activity: new Date().toISOString(),
      };

      // Optionally update message count and caller name if provided
      if (typeof body.message_count === 'number') {
        updates.message_count = body.message_count;
      }
      if (typeof body.caller_name === 'string' && body.caller_name) {
        updates.caller_name = body.caller_name;
      }

      const { error } = await admin
        .from('active_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;

      return json(req, 200, { success: true });
    }

    // ━━━ POST /end — Mark session as ended ━━━━━━━━━━━━━━━━━━━━
    if (req.method === 'POST' && action === 'end') {
      const body = await req.json() as Record<string, unknown>;
      const sessionId = body.id as string;
      if (!sessionId) return json(req, 400, { error: 'Missing session id' });

      // Delete the session row outright so the real-time subscription
      // fires a DELETE event for all listeners (dashboard, monitor, etc.)
      const { error } = await admin
        .from('active_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      return json(req, 200, { success: true });
    }

    // ━━━ GET — List active sessions (for dashboard/monitor) ━━━
    if (req.method === 'GET') {
      // Clean up stale sessions older than 5 minutes with no heartbeat
      const staleThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      await admin
        .from('active_sessions')
        .delete()
        .eq('status', 'active')
        .lt('last_activity', staleThreshold);

      const { data, error } = await admin
        .from('active_sessions')
        .select('*')
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) throw error;

      return json(req, 200, { sessions: data ?? [] });
    }

    return json(req, 404, { error: 'Not found' });

  } catch (error) {
    console.error('[api-sessions] error:', error);
    return json(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
