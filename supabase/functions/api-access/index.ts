import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

    // Authenticate user via their JWT
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    // Service role client for bypassing RLS on admin_codes / user_access
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const url = new URL(req.url);
    const isValidatePath = url.pathname.endsWith('/validate');

    // ─── GET /api-access — check if user already has access ──────────────────
    if (req.method === 'GET' && !isValidatePath) {
      const { data, error } = await adminClient
        .from('user_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .maybeSingle();

      if (error) throw error;

      return jsonResponse(req, 200, { hasAccess: !!data });
    }

    // ─── POST /api-access/validate — redeem an access code ───────────────────
    if (req.method === 'POST' && isValidatePath) {
      const body = await req.json().catch(() => ({})) as Record<string, unknown>;
      const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';

      if (!code) {
        return jsonResponse(req, 400, { error: 'Access code is required' });
      }

      // Check if user already has active access
      const { data: existingAccess } = await adminClient
        .from('user_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (existingAccess) {
        return jsonResponse(req, 200, { success: true });
      }

      // Look up the code in access_codes
      const { data: codeRow, error: codeError } = await adminClient
        .from('access_codes')
        .select('id, is_active, expires_at, max_uses, current_uses')
        .eq('code', code)
        .maybeSingle();

      if (codeError) throw codeError;

      if (!codeRow) {
        return jsonResponse(req, 200, { success: false, error: 'Invalid or expired access code' });
      }

      if (!codeRow.is_active) {
        return jsonResponse(req, 200, { success: false, error: 'Invalid or expired access code' });
      }

      if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
        return jsonResponse(req, 200, { success: false, error: 'Invalid or expired access code' });
      }

      if (codeRow.max_uses !== null && codeRow.current_uses >= codeRow.max_uses) {
        return jsonResponse(req, 200, { success: false, error: 'Invalid or expired access code' });
      }

      // Grant access — upsert in case user retries after a partial failure
      const { error: insertError } = await adminClient
        .from('user_access')
        .upsert(
          { user_id: user.id, access_code_id: codeRow.id, is_active: true },
          { onConflict: 'user_id' }
        );

      if (insertError) throw insertError;

      // Increment usage count
      const { error: updateError } = await adminClient
        .from('access_codes')
        .update({ current_uses: codeRow.current_uses + 1, updated_at: new Date().toISOString() })
        .eq('id', codeRow.id);

      if (updateError) console.error('[api-access] Failed to increment usage count:', updateError);

      return jsonResponse(req, 200, { success: true });
    }

    return jsonResponse(req, 404, { error: 'Not found' });

  } catch (error) {
    console.error('[api-access] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
