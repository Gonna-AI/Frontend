import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
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
    const action = url.pathname.replace(/\/+$/, '').split('/').pop() || '';

    // ─── GET: List notifications ─────────────────────────────
    if (req.method === 'GET' && action === 'unread-count') {
      const { count, error } = await adminClient
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return json(req, 200, { count: count ?? 0 });
    }

    if (req.method === 'GET' && action === 'preferences') {
      const { data, error } = await adminClient
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Return defaults if no preferences exist
      if (!data) {
        return json(req, 200, {
          preferences: {
            email_low_credits: true, email_payment: true, email_team: true,
            email_weekly_report: false, push_calls: true, push_security: true, push_billing: true,
          },
        });
      }

      return json(req, 200, { preferences: data });
    }

    if (req.method === 'GET') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 100);
      const category = url.searchParams.get('category') || '';
      const unreadOnly = url.searchParams.get('unread') === 'true';

      let query = adminClient
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (category) query = query.eq('category', category);
      if (unreadOnly) query = query.eq('is_read', false);

      const { data, error } = await query;
      if (error) throw error;

      return json(req, 200, { notifications: data ?? [] });
    }

    // ─── POST: Create a notification ─────────────────────────
    if (req.method === 'POST' && action === 'create') {
      const body = await req.json().catch(() => null) as Record<string, unknown> | null;
      if (!body) return json(req, 400, { error: 'Invalid body' });

      const type = ['info', 'success', 'warning', 'error'].includes(body.type as string)
        ? (body.type as string) : 'info';
      const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : null;
      if (!title) return json(req, 400, { error: 'title is required' });

      const category = ['billing', 'team', 'security', 'calls', 'system'].includes(body.category as string)
        ? (body.category as string) : 'system';

      const { data, error } = await adminClient.from('notifications').insert({
        user_id: user.id,
        type,
        title,
        message: typeof body.message === 'string' ? body.message : '',
        category,
        action_url: typeof body.action_url === 'string' ? body.action_url : null,
        is_read: false,
      }).select().single();

      if (error) throw error;
      return json(req, 201, { notification: data });
    }

    // ─── POST: Mark as read ──────────────────────────────────
    if (req.method === 'POST' && action === 'mark-read') {
      const body = await req.json().catch(() => null) as Record<string, unknown> | null;
      const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : [];

      if (ids.length === 0) {
        // Mark all as read
        const { error } = await adminClient
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (error) throw error;
        return json(req, 200, { success: true, marked: 'all' });
      }

      const { error } = await adminClient
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .in('id', ids);

      if (error) throw error;
      return json(req, 200, { success: true, marked: ids.length });
    }

    // ─── PUT: Update notification preferences ────────────────
    if (req.method === 'PUT' && action === 'preferences') {
      const body = await req.json().catch(() => null) as Record<string, unknown> | null;
      if (!body) return json(req, 400, { error: 'Invalid body' });

      const prefs: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() };
      const boolFields = [
        'email_low_credits', 'email_payment', 'email_team', 'email_weekly_report',
        'push_calls', 'push_security', 'push_billing',
      ];

      for (const field of boolFields) {
        if (typeof body[field] === 'boolean') prefs[field] = body[field];
      }

      const { data, error } = await adminClient
        .from('notification_preferences')
        .upsert(prefs, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return json(req, 200, { preferences: data });
    }

    // ─── DELETE: Clear notifications ─────────────────────────
    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id');

      if (id) {
        const { error } = await adminClient
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Delete all read notifications
        const { error } = await adminClient
          .from('notifications')
          .delete()
          .eq('user_id', user.id)
          .eq('is_read', true);

        if (error) throw error;
      }

      return json(req, 200, { success: true });
    }

    return json(req, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('[api-notifications]', err);
    return json(req, 500, { error: 'Internal server error' });
  }
});
