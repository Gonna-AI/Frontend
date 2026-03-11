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

    // ─── GET: List team members ──────────────────────────────
    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from('team_members')
        .select('*')
        .eq('owner_id', user.id)
        .order('invited_at', { ascending: false });

      if (error) throw error;

      return jsonResponse(req, 200, { members: data ?? [] });
    }

    // ─── POST: Invite a team member ─────────────────────────
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({})) as Record<string, unknown>;
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const role = body.role === 'admin' ? 'admin' : 'member';

      if (!email || !email.includes('@')) {
        return jsonResponse(req, 400, { error: 'Valid email is required.' });
      }

      // Prevent self-invite
      if (email === user.email) {
        return jsonResponse(req, 400, { error: 'You cannot invite yourself.' });
      }

      // Check for duplicate
      const { data: existing } = await adminClient
        .from('team_members')
        .select('id')
        .eq('owner_id', user.id)
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        return jsonResponse(req, 400, { error: 'This member has already been invited.' });
      }

      // Check team size limit (max 20 members)
      const { count } = await adminClient
        .from('team_members')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      if ((count ?? 0) >= 20) {
        return jsonResponse(req, 400, { error: 'Maximum of 20 team members per account.' });
      }

      const { data, error } = await adminClient
        .from('team_members')
        .insert({
          owner_id: user.id,
          email,
          role,
          status: 'pending',
          invited_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return jsonResponse(req, 201, { member: data });
    }

    // ─── DELETE: Remove a team member ────────────────────────
    if (req.method === 'DELETE') {
      const memberId = params.get('id');
      if (!memberId) {
        return jsonResponse(req, 400, { error: 'Missing member id.' });
      }

      const { error } = await adminClient
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('owner_id', user.id);

      if (error) throw error;

      return jsonResponse(req, 200, { success: true });
    }

    return jsonResponse(req, 404, { error: 'Not found' });

  } catch (error) {
    console.error('[api-team] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
