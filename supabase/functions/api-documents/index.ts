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
]);

const EXTRA_ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

for (const origin of EXTRA_ALLOWED_ORIGINS) {
  DEFAULT_ALLOWED_ORIGINS.add(origin);
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  const headers: Record<string, string> = { ...corsBaseHeaders };
  if (DEFAULT_ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function jsonResponse(data: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(req ? getCorsHeaders(req) : corsBaseHeaders),
    },
  });
}

function getSupabaseClients(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';

  // Admin client for privileged operations
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  // User client scoped to authenticated user
  const userClient = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: authHeader } },
  });

  return { adminClient, userClient };
}

async function getUserId(req: Request): Promise<string | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

// ─── Extract text from a file stored in Supabase Storage ───────────
async function extractTextFromStorage(
  adminClient: ReturnType<typeof createClient>,
  storagePath: string,
  fileType: string,
): Promise<{ text: string; wordCount: number }> {
  // Download file from storage
  const { data, error } = await adminClient.storage
    .from('kb-documents')
    .download(storagePath);

  if (error || !data) {
    throw new Error(`Failed to download file: ${error?.message ?? 'No data'}`);
  }

  let text = '';

  if (['txt', 'md', 'csv'].includes(fileType)) {
    text = await data.text();
  } else if (fileType === 'pdf') {
    // For PDFs, use a basic text extraction approach
    // Read as array buffer and try to extract text content
    const arrayBuffer = await data.arrayBuffer();
    text = extractTextFromPDFBuffer(new Uint8Array(arrayBuffer));
  } else {
    // For other types, try reading as text
    text = await data.text();
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return { text, wordCount };
}

// Basic PDF text extraction (extracts raw text streams)
function extractTextFromPDFBuffer(bytes: Uint8Array): string {
  // Convert to string for parsing
  const raw = new TextDecoder('latin1').decode(bytes);
  const textParts: string[] = [];

  // Extract text between BT and ET markers (PDF text objects)
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];
    // Extract text from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(tjMatch[1]);
    }

    // Extract from TJ arrays
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const parts = tjArrMatch[1];
      const stringRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = stringRegex.exec(parts)) !== null) {
        textParts.push(strMatch[1]);
      }
    }
  }

  // If we couldn't extract structured text, try a fallback
  if (textParts.length === 0) {
    // Fallback: extract any readable text sequences
    const readable = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    return readable.replace(/\s+/g, ' ').trim().substring(0, 50000);
  }

  return textParts
    .join(' ')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Route Handler ─────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  try {
    const userId = await getUserId(req);
    if (!userId) {
      return jsonResponse({ error: 'Unauthorized' }, 401, req);
    }

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api-documents\/?/, '').replace(/^\//, '');
    const { adminClient, userClient } = getSupabaseClients(req);

    // ─── POST /extract-text ──────────────────────────────────────
    if (req.method === 'POST' && path === 'extract-text') {
      const body = await req.json();
      const { storagePath, fileType } = body;

      if (!storagePath || !fileType) {
        return jsonResponse({ error: 'storagePath and fileType are required' }, 400, req);
      }

      const result = await extractTextFromStorage(adminClient, storagePath, fileType);
      return jsonResponse(result, 200, req);
    }

    // ─── GET /documents ──────────────────────────────────────────
    if (req.method === 'GET' && (path === 'documents' || path === '')) {
      const { data, error } = await userClient
        .from('kb_uploaded_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return jsonResponse({ error: error.message }, 500, req);
      }

      return jsonResponse({ documents: data ?? [] }, 200, req);
    }

    // ─── GET /documents/:id/chunks ───────────────────────────────
    if (req.method === 'GET' && path.match(/^documents\/[^/]+\/chunks$/)) {
      const docId = path.split('/')[1];

      const { data, error } = await userClient
        .from('kb_documents')
        .select('id, content, metadata, chunk_index, created_at')
        .eq('document_id', docId)
        .eq('user_id', userId)
        .order('chunk_index', { ascending: true });

      if (error) {
        return jsonResponse({ error: error.message }, 500, req);
      }

      return jsonResponse({ chunks: data ?? [] }, 200, req);
    }

    // ─── DELETE /documents/:id ───────────────────────────────────
    if (req.method === 'DELETE' && path.match(/^documents\/[^/]+$/)) {
      const docId = path.split('/')[1];

      // Get document to find storage path
      const { data: doc, error: fetchErr } = await userClient
        .from('kb_uploaded_documents')
        .select('storage_path')
        .eq('id', docId)
        .eq('user_id', userId)
        .single();

      if (fetchErr || !doc) {
        return jsonResponse({ error: 'Document not found' }, 404, req);
      }

      // Delete chunks (cascade handles this, but be explicit)
      await adminClient
        .from('kb_documents')
        .delete()
        .eq('document_id', docId);

      // Delete from storage
      if (doc.storage_path) {
        await adminClient.storage
          .from('kb-documents')
          .remove([doc.storage_path]);
      }

      // Delete the parent document record
      const { error: delErr } = await userClient
        .from('kb_uploaded_documents')
        .delete()
        .eq('id', docId)
        .eq('user_id', userId);

      if (delErr) {
        return jsonResponse({ error: delErr.message }, 500, req);
      }

      return jsonResponse({ success: true }, 200, req);
    }

    return jsonResponse({ error: 'Not found' }, 404, req);

  } catch (err) {
    console.error('api-documents error:', err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      500,
      req,
    );
  }
});
