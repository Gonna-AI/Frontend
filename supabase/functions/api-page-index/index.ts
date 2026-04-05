import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── CORS ─────────────────────────────────────────────────────────────────────
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
  .split(',').map((o) => o.trim()).filter(Boolean);
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
  } catch { return false; }
}

function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  const allowed = origin && isAllowedOrigin(origin) ? origin : 'https://clerktree.com';
  return { ...corsBaseHeaders, 'Access-Control-Allow-Origin': allowed, 'Vary': 'Origin' };
}

function json(req: Request, status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

function getRequiredEnv(name: string): string {
  const v = Deno.env.get(name)?.trim();
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// ─── Auth verification ────────────────────────────────────────────────────────
async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const supabase = createClient(
    getRequiredEnv('SUPABASE_URL'),
    getRequiredEnv('SUPABASE_ANON_KEY'),
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (!isAllowedOrigin(req.headers.get('Origin'))) {
    return json(req, 403, { error: 'Origin not allowed' });
  }
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeadersFor(req) });
  }

  // All routes require authentication
  const user = await verifyAuth(req);
  if (!user) return json(req, 401, { error: 'Unauthorized' });

  const url = new URL(req.url);
  // Path format: /functions/v1/api-page-index/<action>
  const parts = url.pathname.split('/').filter(Boolean);
  // parts: ["functions", "v1", "api-page-index", ...rest]
  const actionIndex = parts.indexOf('api-page-index');
  const action = actionIndex >= 0 ? parts[actionIndex + 1] : undefined;

  try {
    // ── POST /doc — submit document for indexing ──────────────────────────────
    if (req.method === 'POST' && action === 'doc') {
      const pageIndexKey = getRequiredEnv('PAGEINDEX_API_KEY');
      const contentType = req.headers.get('content-type') ?? '';

      let body: BodyInit;
      let extraHeaders: Record<string, string> = {};

      if (contentType.includes('multipart/form-data')) {
        // Forward multipart as raw bytes to preserve boundary integrity
        body = await req.arrayBuffer();
        extraHeaders['Content-Type'] = contentType;
      } else {
        body = await req.text();
        extraHeaders['Content-Type'] = 'application/json';
      }

      const upstream = await fetch('https://api.pageindex.ai/doc/', {
        method: 'POST',
        headers: { 'api_key': pageIndexKey, ...extraHeaders },
        body,
      });
      const data = await upstream.json();
      return json(req, upstream.status, data);
    }

    // ── GET /doc/:docId — get tree or OCR status ──────────────────────────────
    if (req.method === 'GET' && action === 'doc') {
      const docId = parts[actionIndex + 2];
      if (!docId) return json(req, 400, { error: 'Missing docId' });

      const pageIndexKey = getRequiredEnv('PAGEINDEX_API_KEY');
      const params = new URLSearchParams();
      for (const [k, v] of url.searchParams) params.set(k, v);

      const upstream = await fetch(
        `https://api.pageindex.ai/doc/${docId}/?${params.toString()}`,
        { headers: { 'api_key': pageIndexKey } }
      );
      const data = await upstream.json();
      return json(req, upstream.status, data);
    }

    // ── POST /chat — chat with Groq using document context ────────────────────
    if (req.method === 'POST' && action === 'chat') {
      const groqKey = getRequiredEnv('GROQ_API_KEY');
      const body = await req.json();

      const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await upstream.json();
      return json(req, upstream.status, data);
    }

    return json(req, 404, { error: 'Not found' });
  } catch (err) {
    console.error('[api-page-index] error:', err);
    return json(req, 500, { error: 'Internal server error' });
  }
});
