import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const ALLOWED_ORIGINS = new Set([
  'https://clerktree.com', 'https://www.clerktree.com',
  'https://clerktree.netlify.app',
  'http://localhost:5173', 'http://127.0.0.1:5173',
]);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://clerktree.com';
  return { ...corsBaseHeaders, 'Access-Control-Allow-Origin': allowedOrigin };
}

function json(req: Request, status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return json(req, 401, { error: 'Unauthorized' });

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json(req, 401, { error: 'Unauthorized' });

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const url = new URL(req.url);

    // ─── GET: List activity log entries ──────────────────────
    if (req.method === 'GET') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 200);
      const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);
      const eventType = url.searchParams.get('type') || '';
      const search = url.searchParams.get('search') || '';
      const startDate = url.searchParams.get('start') || '';
      const endDate = url.searchParams.get('end') || '';

      let query = adminClient
        .from('activity_log')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (eventType) query = query.eq('event_type', eventType);
      if (search) query = query.ilike('description', `%${search}%`);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data, error, count } = await query;
      if (error) throw error;

      return json(req, 200, { activities: data ?? [], count: count ?? 0 });
    }

    // ─── POST: Log a new activity entry ──────────────────────
    if (req.method === 'POST') {
      const body = await req.json().catch(() => null) as Record<string, unknown> | null;
      if (!body) return json(req, 400, { error: 'Invalid body' });

      const eventType = typeof body.event_type === 'string' ? body.event_type : 'system';
      const action = typeof body.action === 'string' ? body.action : '';
      const description = typeof body.description === 'string' ? body.description : '';
      const metadata = (body.metadata && typeof body.metadata === 'object') ? body.metadata : {};

      if (!action) return json(req, 400, { error: 'Action is required' });

      const { data, error } = await adminClient.from('activity_log').insert({
        user_id: user.id,
        event_type: eventType,
        action,
        description,
        metadata,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null,
        user_agent: req.headers.get('user-agent') || null,
      }).select().single();

      if (error) throw error;

      return json(req, 201, { activity: data });
    }

    return json(req, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('[api-activity-log]', err);
    return json(req, 500, { error: 'Internal server error' });
  }
});
