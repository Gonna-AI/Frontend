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

    // ─── GET: List actions (from playbook templates) ─────────────────
    if (req.method === 'GET') {
      // Fetch playbook templates - each recommended action becomes an action
      const { data: playbooks, error: playbookError } = await adminClient
        .from('playbook_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (playbookError) throw playbookError;

      // Transform recommended_actions from playbooks into actions
      const actions = [];
      for (const playbook of playbooks || []) {
        for (const action of playbook.recommended_actions || []) {
          actions.push({
            id: `${playbook.id}-${action}`,
            name: action,
            playbook_id: playbook.id,
            playbook_name: playbook.name,
            source: 'playbook',
            created_at: playbook.created_at,
          });
        }
      }

      return jsonResponse(req, 200, { actions });
    }

    return jsonResponse(req, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[actions] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
