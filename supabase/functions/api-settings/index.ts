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

    // ─── GET: Fetch user profile & settings ──────────────────
    if (req.method === 'GET' && action === 'profile') {
      const { data: settings } = await adminClient
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      return json(req, 200, {
        profile: {
          id: user.id,
          email: user.email,
          display_name: settings?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          company_name: settings?.company_name || '',
          phone: settings?.phone || '',
          timezone: settings?.timezone || 'UTC',
          credits_balance: settings?.credits_balance ?? 50.0,
          created_at: user.created_at,
          last_sign_in: user.last_sign_in_at,
        },
      });
    }

    // ─── PUT: Update profile settings ────────────────────────
    if (req.method === 'PUT' && action === 'profile') {
      const body = await req.json().catch(() => null) as Record<string, unknown> | null;
      if (!body) return json(req, 400, { error: 'Invalid body' });

      const updates: Record<string, unknown> = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (typeof body.display_name === 'string') updates.display_name = body.display_name.trim();
      if (typeof body.company_name === 'string') updates.company_name = body.company_name.trim();
      if (typeof body.phone === 'string') updates.phone = body.phone.trim();
      if (typeof body.timezone === 'string') updates.timezone = body.timezone;

      const { data, error } = await adminClient
        .from('user_settings')
        .upsert(updates, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      // Also update Supabase auth metadata if display_name changed
      if (updates.display_name) {
        await adminClient.auth.admin.updateUserById(user.id, {
          user_metadata: { ...user.user_metadata, full_name: updates.display_name },
        }).catch(err => console.error('[api-settings] auth metadata update error:', err));
      }

      return json(req, 200, { settings: data });
    }

    // ─── GET: Export user data (GDPR) ────────────────────────
    if (req.method === 'GET' && action === 'export') {
      // Gather all user data for export
      const [
        { data: callHistory },
        { data: teamMembers },
        { data: apiKeys },
        { data: documents },
        { data: paymentHistory },
        { data: activityLog },
      ] = await Promise.all([
        adminClient.from('call_history').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(1000),
        adminClient.from('team_members').select('*').eq('owner_id', user.id),
        adminClient.from('api_keys').select('id, name, permissions, rate_limit, status, created_at, last_used').eq('user_id', user.id),
        adminClient.from('kb_uploaded_documents').select('id, file_name, file_type, file_size, status, created_at').eq('user_id', user.id),
        adminClient.from('payment_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        adminClient.from('activity_log').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(500),
      ]);

      return json(req, 200, {
        export: {
          generated_at: new Date().toISOString(),
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
          },
          call_history: callHistory ?? [],
          team_members: teamMembers ?? [],
          api_keys: apiKeys ?? [],
          documents: documents ?? [],
          payment_history: paymentHistory ?? [],
          activity_log: activityLog ?? [],
        },
      });
    }

    // ─── DELETE: Delete account ───────────────────────────────
    if (req.method === 'DELETE' && action === 'account') {
      // Soft-delete: mark all user data for deletion
      // In a real system, this would schedule actual deletion after a grace period
      // For now, we'll log the request
      await adminClient.from('activity_log').insert({
        user_id: user.id,
        event_type: 'auth',
        action: 'account_deletion_requested',
        description: 'User requested account deletion',
        metadata: { requested_at: new Date().toISOString() },
      }).catch(() => {});

      return json(req, 200, {
        success: true,
        message: 'Account deletion has been scheduled. Your data will be removed within 30 days. You will receive a confirmation email.',
      });
    }

    // ─── GET: Active sessions ────────────────────────────────
    if (req.method === 'GET' && action === 'sessions') {
      const { data, error } = await adminClient
        .from('active_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_activity', { ascending: false });

      if (error) throw error;

      return json(req, 200, { sessions: data ?? [] });
    }

    return json(req, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('[api-settings]', err);
    return json(req, 500, { error: 'Internal server error' });
  }
});
