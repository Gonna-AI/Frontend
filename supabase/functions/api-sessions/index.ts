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
/** Parses a JSON object body; anything else is an empty object, so handlers answer 400 instead of crashing. */
async function readBody(req: Request): Promise<Record<string, unknown>> {
  const body = await req.json().catch(() => null);
  return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}

function isSessionId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 128;
}

function cleanText(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
}

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
    const authHeader = req.headers.get('Authorization') ?? '';

    // ━━━ GET — List active sessions ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Unauthenticated: returns only session_type counts (no PII) for global display.
    // Authenticated: also cleans up stale sessions and returns full session data.
    if (req.method === 'GET') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      // Check authentication (optional for GET)
      let isAuthenticated = false;
      let callerId = '';
      if (authHeader) {
        const anonClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user: reqUser } } = await anonClient.auth.getUser();
        isAuthenticated = !!reqUser;
        callerId = reqUser?.id ?? '';
      }

      if (isAuthenticated) {
        // Authenticated: clean up stale sessions, then return full list
        // Only the caller's own sessions: this runs with the service role, so scoping is up to us.
        await admin
          .from('active_sessions')
          .delete()
          .eq('user_id', callerId)
          .eq('status', 'active')
          .lt('last_activity', fiveMinutesAgo);

        const { data, error } = await admin
          .from('active_sessions')
          .select('*')
          .eq('user_id', callerId)
          .eq('status', 'active')
          .order('started_at', { ascending: false });

        if (error) throw error;

        return json(req, 200, { sessions: data ?? [] });
      } else {
        // Unauthenticated: return only session_type for global count display (no PII)
        const { data, error } = await admin
          .from('active_sessions')
          .select('session_type')
          .eq('status', 'active')
          .gte('last_activity', fiveMinutesAgo);

        if (error) throw error;

        return json(req, 200, { sessions: data ?? [] });
      }
    }

    // POST routes require authentication
    if (!authHeader) return json(req, 401, { error: 'Unauthorized' });

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) return json(req, 401, { error: 'Unauthorized' });

    // Route by URL path: /start, /heartbeat, /end
    const url = new URL(req.url);
    const action = url.pathname.replace(/\/+$/, '').split('/').pop() || '';

    // ━━━ POST /start — Register a new active session ━━━━━━━━━━
    if (req.method === 'POST' && action === 'start') {
      const body = await readBody(req);
      const sessionId = body.id;
      if (!isSessionId(sessionId)) return json(req, 400, { error: 'Missing or invalid session id' });

      // An id that already belongs to another user must never be taken over.
      const { data: existing } = await admin.from('active_sessions').select('user_id').eq('id', sessionId).maybeSingle();
      if (existing && existing.user_id !== user.id) return json(req, 403, { error: 'Forbidden' });

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
          caller_name: cleanText(body.caller_name, 200),
          user_agent: cleanText(body.user_agent, 400),
          message_count: 0,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      return json(req, 201, { success: true, session: data });
    }

    // ━━━ POST /heartbeat — Update session last_activity ━━━━━━━
    if (req.method === 'POST' && action === 'heartbeat') {
      const body = await readBody(req);
      const sessionId = body.id;
      if (!isSessionId(sessionId)) return json(req, 400, { error: 'Missing or invalid session id' });

      const updates: Record<string, unknown> = {
        last_activity: new Date().toISOString(),
      };

      // Optionally update message count and caller name if provided
      if (typeof body.message_count === 'number' && Number.isInteger(body.message_count) && body.message_count >= 0) {
        updates.message_count = body.message_count;
      }
      const callerName = cleanText(body.caller_name, 200);
      if (callerName) updates.caller_name = callerName;

      const { error } = await admin
        .from('active_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      return json(req, 200, { success: true });
    }

    // ━━━ POST /end — Mark session as ended ━━━━━━━━━━━━━━━━━━━━
    if (req.method === 'POST' && action === 'end') {
      const body = await readBody(req);
      const sessionId = body.id;
      if (!isSessionId(sessionId)) return json(req, 400, { error: 'Missing or invalid session id' });

      // Delete the session row outright so the real-time subscription
      // fires a DELETE event for all listeners (dashboard, monitor, etc.)
      const { error } = await admin
        .from('active_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      return json(req, 200, { success: true });
    }

    return json(req, 404, { error: 'Not found' });

  } catch (error) {
    console.error('[api-sessions] error:', error);
    return json(req, 500, {
      error: 'Internal server error',
    });
  }
});
