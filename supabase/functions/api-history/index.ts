import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── CORS ────────────────────────────────────────────────────────
const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
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

    // ━━━ GET: Fetch call history ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100', 10), 500);
      const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);

      const { data, error } = await admin
        .from('call_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return json(req, 200, { history: data ?? [], count: data?.length ?? 0 });
    }

    // ━━━ POST: Create new call history entry ━━━━━━━━━━━━━━━━━━━
    // Called immediately when a call ends (with placeholder summary)
    if (req.method === 'POST') {
      const body = await req.json() as Record<string, unknown>;

      // Validate required fields
      const id = body.id as string;
      if (!id) return json(req, 400, { error: 'Missing call id' });

      const record = {
        id,
        caller_name: body.caller_name ?? 'Unknown Caller',
        date: body.date ?? new Date().toISOString(),
        duration: typeof body.duration === 'number' ? body.duration : 0,
        type: body.type === 'voice' ? 'voice' : 'text',
        messages: body.messages ?? [],
        extracted_fields: body.extracted_fields ?? [],
        category: body.category ?? null,
        priority: body.priority ?? 'medium',
        tags: body.tags ?? [],
        summary: body.summary ?? {},
        sentiment: body.sentiment ?? 'neutral',
        follow_up_required: body.follow_up_required ?? false,
        user_id: user.id,
        agent_id: body.agent_id ?? user.id,
      };

      // Upsert to handle potential race conditions (call end + summary update)
      const { data, error } = await admin
        .from('call_history')
        .upsert(record, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      return json(req, 201, { success: true, call: data });
    }

    // ━━━ PUT: Update call history (summary, tags, etc.) ━━━━━━━━
    // Called after AI summary generation completes
    if (req.method === 'PUT') {
      const body = await req.json() as Record<string, unknown>;
      const id = body.id as string;
      if (!id) return json(req, 400, { error: 'Missing call id' });

      // Build update payload - only include fields that were provided
      const updates: Record<string, unknown> = {};

      if (body.caller_name !== undefined) updates.caller_name = body.caller_name;
      if (body.date !== undefined) updates.date = body.date;
      if (body.duration !== undefined) updates.duration = body.duration;
      if (body.type !== undefined) updates.type = body.type;
      if (body.messages !== undefined) updates.messages = body.messages;
      if (body.extracted_fields !== undefined) updates.extracted_fields = body.extracted_fields;
      if (body.category !== undefined) updates.category = body.category;
      if (body.priority !== undefined) updates.priority = body.priority;
      if (body.tags !== undefined) updates.tags = body.tags;
      if (body.summary !== undefined) updates.summary = body.summary;
      if (body.sentiment !== undefined) updates.sentiment = body.sentiment;
      if (body.follow_up_required !== undefined) updates.follow_up_required = body.follow_up_required;

      if (Object.keys(updates).length === 0) {
        return json(req, 400, { error: 'No fields to update' });
      }

      const { data, error } = await admin
        .from('call_history')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        // If record doesn't exist yet (race condition), upsert instead
        if (error.code === 'PGRST116') {
          const fullRecord = {
            id,
            caller_name: body.caller_name ?? 'Unknown Caller',
            date: body.date ?? new Date().toISOString(),
            duration: body.duration ?? 0,
            type: body.type ?? 'text',
            messages: body.messages ?? [],
            extracted_fields: body.extracted_fields ?? [],
            category: body.category ?? null,
            priority: body.priority ?? 'medium',
            tags: body.tags ?? [],
            summary: body.summary ?? {},
            sentiment: body.sentiment ?? 'neutral',
            follow_up_required: body.follow_up_required ?? false,
            user_id: user.id,
            agent_id: body.agent_id ?? user.id,
          };

          const { data: upsertData, error: upsertErr } = await admin
            .from('call_history')
            .upsert(fullRecord, { onConflict: 'id' })
            .select()
            .single();

          if (upsertErr) throw upsertErr;
          return json(req, 200, { success: true, call: upsertData });
        }
        throw error;
      }

      return json(req, 200, { success: true, call: data });
    }

    // ━━━ DELETE: Remove a call history entry ━━━━━━━━━━━━━━━━━━━
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      if (!id) return json(req, 400, { error: 'Missing call id' });

      const { error } = await admin
        .from('call_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return json(req, 200, { success: true });
    }

    return json(req, 404, { error: 'Not found' });

  } catch (error) {
    console.error('[api-history] error:', error);
    return json(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
