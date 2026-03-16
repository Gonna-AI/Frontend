import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, OPTIONS',
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

    // ─── GET: Get user settings ─────────────────────────────────────
    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // If no settings exist, return defaults
      if (!data) {
        return jsonResponse(req, 200, {
          settings: {
            user_id: user.id,
            theme: 'dark',
            language: 'en',
            notifications_email: true,
            notifications_push: false,
            notifications_sms: false,
            privacy_profile_public: false,
            privacy_data_analytics: true,
            team_auto_add_members: false,
            api_rate_limit_alerts: true,
            call_recording_default: false,
            call_transcription_enabled: true,
          },
        });
      }

      return jsonResponse(req, 200, { settings: data });
    }

    // ─── PUT: Update user settings ──────────────────────────────────
    if (req.method === 'PUT') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

      // Validate settings
      const allowedFields = [
        'theme',
        'language',
        'notifications_email',
        'notifications_push',
        'notifications_sms',
        'privacy_profile_public',
        'privacy_data_analytics',
        'team_auto_add_members',
        'api_rate_limit_alerts',
        'call_recording_default',
        'call_transcription_enabled',
      ];

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const field of allowedFields) {
        if (field in body) {
          updateData[field] = body[field];
        }
      }

      // Check if settings exist
      const { data: existing } = await adminClient
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existing) {
        // Update existing
        result = await adminClient
          .from('user_settings')
          .update(updateData)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new
        result = await adminClient
          .from('user_settings')
          .insert({ user_id: user.id, ...updateData })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      return jsonResponse(req, 200, { settings: result.data });
    }

    return jsonResponse(req, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[user-settings] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
