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
  'https://clerktree.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  const allowedOrigin = origin && DEFAULT_ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://clerktree.com';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
  };
}

function jsonResponse(data: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ─── Extract text from a PDF binary buffer ──────────────────────
function extractTextFromPDFBuffer(bytes: Uint8Array): string {
  const raw = new TextDecoder('latin1').decode(bytes);
  const textParts: string[] = [];

  // Extract text between BT and ET markers (PDF text objects)
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];

    // Tj operator: (text) Tj
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(tjMatch[1]);
    }

    // TJ operator: [(text) ...] TJ
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const stringRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = stringRegex.exec(tjArrMatch[1])) !== null) {
        textParts.push(strMatch[1]);
      }
    }
  }

  // Fallback: extract readable ASCII sequences
  if (textParts.length === 0) {
    return raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 50000);
  }

  return textParts
    .join(' ')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Main handler ────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Authenticate user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Path routing — use last segment(s) to determine action
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const last = pathParts[pathParts.length - 1] || '';
    const secondLast = pathParts[pathParts.length - 2] || '';

    // ─── POST extract-text ────────────────────────────────────
    if (req.method === 'POST' && last === 'extract-text') {
      const body = await req.json();
      const { storagePath, fileType } = body as { storagePath: string; fileType: string };

      if (!storagePath || !fileType) {
        return jsonResponse({ error: 'storagePath and fileType are required' }, 400, corsHeaders);
      }

      // Download file from Supabase Storage
      const { data: fileData, error: dlError } = await adminClient.storage
        .from('kb-documents')
        .download(storagePath);

      if (dlError || !fileData) {
        return jsonResponse({ error: `Download failed: ${dlError?.message ?? 'No data'}` }, 500, corsHeaders);
      }

      let text = '';
      if (['txt', 'md', 'csv'].includes(fileType)) {
        text = await fileData.text();
      } else if (fileType === 'pdf') {
        const arrayBuffer = await fileData.arrayBuffer();
        text = extractTextFromPDFBuffer(new Uint8Array(arrayBuffer));
      } else {
        text = await fileData.text();
      }

      const wordCount = text.split(/\s+/).filter(Boolean).length;
      return jsonResponse({ text, wordCount }, 200, corsHeaders);
    }

    // ─── GET chunks for a document ───────────────────────────
    if (req.method === 'GET' && last === 'chunks') {
      const docId = secondLast; // path: .../documents/{docId}/chunks
      if (!docId) {
        return jsonResponse({ error: 'Document ID required' }, 400, corsHeaders);
      }

      const { data, error } = await adminClient
        .from('kb_documents')
        .select('id, content, metadata, chunk_index, created_at')
        .eq('document_id', docId)
        .eq('user_id', user.id)
        .order('chunk_index', { ascending: true });

      if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
      return jsonResponse({ chunks: data ?? [] }, 200, corsHeaders);
    }

    // ─── DELETE a document ────────────────────────────────────
    if (req.method === 'DELETE' && last !== 'documents' && secondLast === 'documents') {
      const docId = last; // path: .../documents/{docId}

      const { data: doc } = await adminClient
        .from('kb_uploaded_documents')
        .select('storage_path')
        .eq('id', docId)
        .eq('user_id', user.id)
        .single();

      if (!doc) return jsonResponse({ error: 'Document not found' }, 404, corsHeaders);

      // Delete chunks
      await adminClient.from('kb_documents').delete().eq('document_id', docId);

      // Delete from storage
      if (doc.storage_path) {
        await adminClient.storage.from('kb-documents').remove([doc.storage_path]);
      }

      // Delete parent record
      const { error: delErr } = await adminClient
        .from('kb_uploaded_documents')
        .delete()
        .eq('id', docId)
        .eq('user_id', user.id);

      if (delErr) return jsonResponse({ error: delErr.message }, 500, corsHeaders);
      return jsonResponse({ success: true }, 200, corsHeaders);
    }

    // ─── GET documents list ───────────────────────────────────
    if (req.method === 'GET' && (last === 'documents' || last === 'api-documents')) {
      const { data, error } = await adminClient
        .from('kb_uploaded_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
      return jsonResponse({ documents: data ?? [] }, 200, corsHeaders);
    }

    return jsonResponse({ error: 'Not found', path: url.pathname }, 404, corsHeaders);

  } catch (err) {
    console.error('api-documents error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  }
});
