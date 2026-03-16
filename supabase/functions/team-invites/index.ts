import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function corsHeadersFor(req: Request): Record<string, string> {
  const requestOrigin = req.headers.get('Origin');
  const allowedOrigin = requestOrigin?.includes('localhost') || requestOrigin?.includes('127.0.0.1')
    ? requestOrigin
    : 'https://clerktree.com';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
  };
}

function jsonResponse(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 24; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req: Request) => {
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

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // ─── POST: Create new invite link ───────────────────────────────
    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const teamId = body.team_id as string;
      const daysValid = typeof body.days_valid === 'number' ? body.days_valid : 7;

      if (!teamId) {
        return jsonResponse(req, 400, { error: 'team_id required' });
      }

      // Verify user is team member
      const { data: member, error: memberError } = await adminClient
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !member) {
        return jsonResponse(req, 403, { error: 'Not a team member' });
      }

      const inviteCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysValid);

      const { data, error } = await adminClient
        .from('team_invites')
        .insert({
          team_id: teamId,
          invite_code: inviteCode,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      const inviteUrl = `${req.headers.get('origin')}/join/${inviteCode}`;

      return jsonResponse(req, 201, {
        invite: data,
        invite_url: inviteUrl,
      });
    }

    // ─── GET: List invites for team ─────────────────────────────────
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const teamId = url.searchParams.get('team_id');

      if (!teamId) {
        return jsonResponse(req, 400, { error: 'team_id required' });
      }

      const { data, error } = await adminClient
        .from('team_invites')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return jsonResponse(req, 200, { invites: data || [] });
    }

    // ─── DELETE: Revoke invite link ────────────────────────────────
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const inviteId = url.searchParams.get('id');

      if (!inviteId) {
        return jsonResponse(req, 400, { error: 'id required' });
      }

      const { error } = await adminClient
        .from('team_invites')
        .update({ status: 'expired' })
        .eq('id', inviteId)
        .eq('created_by', user.id);

      if (error) throw error;

      return jsonResponse(req, 200, { success: true });
    }

    return jsonResponse(req, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[team-invites] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
