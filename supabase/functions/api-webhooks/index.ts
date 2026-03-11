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

// All subscribable events
const VALID_EVENTS = [
  'call.started', 'call.completed', 'call.failed',
  'payment.success', 'payment.failed',
  'team.member_invited', 'team.member_removed',
  'api_key.created', 'api_key.revoked',
  'document.processed', 'document.failed',
  'credit.low', 'credit.depleted',
  'rescue.triggered', 'rescue.completed',
] as const;

function generateSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return 'whsec_' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
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

    // ─── GET: List webhooks ──────────────────────────────────
    if (req.method === 'GET' && action === 'deliveries') {
      const webhookId = url.searchParams.get('webhook_id') || '';
      const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 100);

      let query = adminClient
        .from('webhook_deliveries')
        .select('*')
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false })
        .limit(limit);

      if (webhookId) query = query.eq('webhook_id', webhookId);

      const { data, error } = await query;
      if (error) throw error;

      return json(req, 200, { deliveries: data ?? [] });
    }

    if (req.method === 'GET' && action === 'events') {
      return json(req, 200, { events: VALID_EVENTS });
    }

    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mask secrets in response
      const webhooks = (data ?? []).map(w => ({
        ...w,
        secret: w.secret ? w.secret.substring(0, 10) + '...' : '',
      }));

      return json(req, 200, { webhooks });
    }

    // ─── POST: Create webhook ────────────────────────────────
    if (req.method === 'POST' && action === 'test') {
      const body = await req.json().catch(() => null) as Record<string, unknown> | null;
      const webhookId = typeof body?.id === 'string' ? body.id : '';
      if (!webhookId) return json(req, 400, { error: 'Missing webhook id' });

      const { data: webhook, error: fetchError } = await adminClient
        .from('webhooks')
        .select('*')
        .eq('id', webhookId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !webhook) return json(req, 404, { error: 'Webhook not found' });

      // Send test payload
      const testPayload = {
        event: 'test.ping',
        timestamp: new Date().toISOString(),
        data: { message: 'This is a test webhook delivery from ClerkTree.' },
      };

      let statusCode = 0;
      let responseText = '';
      let success = false;

      try {
        const resp = await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload),
          signal: AbortSignal.timeout(10000),
        });
        statusCode = resp.status;
        responseText = await resp.text().catch(() => '');
        success = resp.ok;
      } catch (e) {
        responseText = String(e);
      }

      // Log delivery
      await adminClient.from('webhook_deliveries').insert({
        webhook_id: webhookId,
        user_id: user.id,
        event: 'test.ping',
        payload: testPayload,
        status_code: statusCode,
        response: responseText.substring(0, 1000),
        success,
      }).catch(err => console.error('[api-webhooks] delivery log error:', err));

      return json(req, 200, { success, status_code: statusCode, response: responseText.substring(0, 500) });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => null) as Record<string, unknown> | null;
      if (!body) return json(req, 400, { error: 'Invalid body' });

      const webhookUrl = typeof body.url === 'string' ? body.url.trim() : '';
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const events = Array.isArray(body.events) ? body.events.filter(e => typeof e === 'string') : [];

      if (!webhookUrl) return json(req, 400, { error: 'URL is required' });
      if (!name) return json(req, 400, { error: 'Name is required' });
      if (events.length === 0) return json(req, 400, { error: 'At least one event is required' });

      try { new URL(webhookUrl); } catch { return json(req, 400, { error: 'Invalid URL format' }); }

      // Max 10 webhooks per user
      const { count } = await adminClient
        .from('webhooks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if ((count ?? 0) >= 10) {
        return json(req, 400, { error: 'Maximum 10 webhooks allowed' });
      }

      const secret = generateSecret();

      const { data, error } = await adminClient.from('webhooks').insert({
        user_id: user.id,
        url: webhookUrl,
        name,
        events,
        secret,
        is_active: true,
      }).select().single();

      if (error) throw error;

      // Return full secret only on creation
      return json(req, 201, { webhook: { ...data, secret } });
    }

    // ─── PUT: Update webhook ─────────────────────────────────
    if (req.method === 'PUT') {
      const body = await req.json().catch(() => null) as Record<string, unknown> | null;
      if (!body) return json(req, 400, { error: 'Invalid body' });

      const id = typeof body.id === 'string' ? body.id : '';
      if (!id) return json(req, 400, { error: 'Missing id' });

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (typeof body.url === 'string') updates.url = body.url.trim();
      if (typeof body.name === 'string') updates.name = body.name.trim();
      if (Array.isArray(body.events)) updates.events = body.events;
      if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;

      const { data, error } = await adminClient
        .from('webhooks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return json(req, 200, { webhook: { ...data, secret: data.secret?.substring(0, 10) + '...' } });
    }

    // ─── DELETE: Remove webhook ──────────────────────────────
    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id') || '';
      if (!id) return json(req, 400, { error: 'Missing id' });

      const { error } = await adminClient
        .from('webhooks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return json(req, 200, { success: true });
    }

    return json(req, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('[api-webhooks]', err);
    return json(req, 500, { error: 'Internal server error' });
  }
});
