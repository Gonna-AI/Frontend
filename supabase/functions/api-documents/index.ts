import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── CORS ────────────────────────────────────────────────────────
const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const ALLOWED_ORIGINS = new Set([
  'https://clerktree.com',
  'https://www.clerktree.com',
  'https://clerktree.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://clerktree.com';
  return { ...corsBaseHeaders, 'Access-Control-Allow-Origin': allowedOrigin };
}

function jsonResponse(data: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

// ─── Embedding model (built-in, no external deps) ────────────────
const embeddingModel = new Supabase.ai.Session('gte-small');

// ─── Smart sentence-aware chunking ───────────────────────────────
function smartChunkText(text: string, maxWords = 300, overlapWords = 50): string[] {
  const sentences = text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) return [];

  const chunks: string[] = [];
  let currentSentences: string[] = [];
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length;

    if (currentWordCount + sentenceWords > maxWords && currentSentences.length > 0) {
      chunks.push(currentSentences.join(' '));

      const overlapSentences: string[] = [];
      let overlapCount = 0;
      for (let i = currentSentences.length - 1; i >= 0; i--) {
        const wc = currentSentences[i].split(/\s+/).length;
        if (overlapCount + wc > overlapWords) break;
        overlapSentences.unshift(currentSentences[i]);
        overlapCount += wc;
      }
      currentSentences = overlapSentences;
      currentWordCount = overlapCount;
    }

    currentSentences.push(sentence);
    currentWordCount += sentenceWords;
  }

  if (currentSentences.length > 0) {
    const final = currentSentences.join(' ');
    if (chunks.length === 0 || final !== chunks[chunks.length - 1]) {
      chunks.push(final);
    }
  }

  return chunks;
}

// ─── PDF text extraction ─────────────────────────────────────────
function extractTextFromPDF(bytes: Uint8Array): string {
  const raw = new TextDecoder('latin1').decode(bytes);
  const textParts: string[] = [];
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) textParts.push(tjMatch[1]);

    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(tjArrMatch[1])) !== null) textParts.push(strMatch[1]);
    }
  }

  if (textParts.length === 0) {
    return raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 50000);
  }

  return textParts.join(' ').replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\s+/g, ' ').trim();
}

// ─── Main handler ────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    // Auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) return jsonResponse({ error: 'Unauthorized' }, 401, cors);

    const admin = createClient(supabaseUrl, serviceKey);

    // Routing
    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    const secondLast = parts[parts.length - 2] || '';

    // ━━━ POST /process-document ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Full server-side pipeline: extract → chunk → embed → store
    if (req.method === 'POST' && last === 'process-document') {
      const body = await req.json();
      const { documentId, storagePath, fileType, fileName, kbId } = body as {
        documentId: string;
        storagePath: string;
        fileType: string;
        fileName: string;
        kbId: string;
      };

      if (!documentId || !storagePath || !fileType || !kbId) {
        return jsonResponse({ error: 'Missing required fields' }, 400, cors);
      }

      // 1. Download from storage
      const { data: fileData, error: dlErr } = await admin.storage
        .from('kb-documents')
        .download(storagePath);

      if (dlErr || !fileData) {
        await admin.from('kb_uploaded_documents').update({
          status: 'error',
          error_message: `Download failed: ${dlErr?.message ?? 'No data'}`,
        }).eq('id', documentId);
        return jsonResponse({ error: `Download failed: ${dlErr?.message}` }, 500, cors);
      }

      // 2. Extract text
      let text = '';
      if (['txt', 'md', 'csv'].includes(fileType)) {
        text = await fileData.text();
      } else if (fileType === 'pdf') {
        const buf = await fileData.arrayBuffer();
        text = extractTextFromPDF(new Uint8Array(buf));
      } else {
        text = await fileData.text();
      }

      if (!text || text.trim().length === 0) {
        await admin.from('kb_uploaded_documents').update({
          status: 'error',
          error_message: 'No text content could be extracted',
        }).eq('id', documentId);
        return jsonResponse({ error: 'No text content extracted' }, 422, cors);
      }

      // 3. Chunk
      const chunks = smartChunkText(text, 300, 50);
      const totalTokens = text.split(/\s+/).length;

      // 4. Embed + store each chunk
      let storedCount = 0;
      for (let i = 0; i < chunks.length; i++) {
        try {
          const embedding = await embeddingModel.run(chunks[i], {
            mean_pool: true,
            normalize: true,
          });

          const { error: insertErr } = await admin
            .from('kb_documents')
            .insert({
              kb_id: kbId,
              content: chunks[i],
              metadata: {
                source: fileName,
                document_id: documentId,
                chunk_index: i,
                total_chunks: chunks.length,
              },
              embedding: JSON.stringify(embedding),
              user_id: user.id,
              document_id: documentId,
              chunk_index: i,
            });

          if (insertErr) {
            console.error(`Chunk ${i} insert failed:`, insertErr.message);
          } else {
            storedCount++;
          }
        } catch (embedErr) {
          console.error(`Chunk ${i} embedding failed:`, embedErr);
        }
      }

      // 5. Update document status
      const status = storedCount > 0 ? 'ready' : 'error';
      const errorMsg = storedCount === 0 ? 'Failed to store any chunks' : null;

      await admin.from('kb_uploaded_documents').update({
        status,
        error_message: errorMsg,
        chunk_count: storedCount,
        total_tokens: totalTokens,
        updated_at: new Date().toISOString(),
      }).eq('id', documentId);

      return jsonResponse({
        success: true,
        status,
        chunk_count: storedCount,
        total_chunks: chunks.length,
        total_tokens: totalTokens,
      }, 200, cors);
    }

    // ━━━ POST /extract-text (legacy) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === 'POST' && last === 'extract-text') {
      const body = await req.json();
      const { storagePath, fileType } = body as { storagePath: string; fileType: string };
      if (!storagePath || !fileType) return jsonResponse({ error: 'storagePath and fileType required' }, 400, cors);

      const { data: fileData, error: dlErr } = await admin.storage.from('kb-documents').download(storagePath);
      if (dlErr || !fileData) return jsonResponse({ error: `Download failed: ${dlErr?.message}` }, 500, cors);

      let text = '';
      if (['txt', 'md', 'csv'].includes(fileType)) {
        text = await fileData.text();
      } else if (fileType === 'pdf') {
        const buf = await fileData.arrayBuffer();
        text = extractTextFromPDF(new Uint8Array(buf));
      } else {
        text = await fileData.text();
      }

      return jsonResponse({ text, wordCount: text.split(/\s+/).filter(Boolean).length }, 200, cors);
    }

    // ━━━ GET documents list ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === 'GET' && (last === 'documents' || last === 'api-documents')) {
      const { data, error } = await admin.from('kb_uploaded_documents')
        .select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) return jsonResponse({ error: error.message }, 500, cors);
      return jsonResponse({ documents: data ?? [] }, 200, cors);
    }

    // ━━━ GET chunks ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === 'GET' && last === 'chunks') {
      const docId = secondLast;
      if (!docId) return jsonResponse({ error: 'Document ID required' }, 400, cors);
      const { data, error } = await admin.from('kb_documents')
        .select('id, content, metadata, chunk_index, created_at')
        .eq('document_id', docId).eq('user_id', user.id)
        .order('chunk_index', { ascending: true });
      if (error) return jsonResponse({ error: error.message }, 500, cors);
      return jsonResponse({ chunks: data ?? [] }, 200, cors);
    }

    // ━━━ DELETE document ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === 'DELETE' && last !== 'documents' && secondLast === 'documents') {
      const docId = last;
      const { data: doc } = await admin.from('kb_uploaded_documents')
        .select('storage_path').eq('id', docId).eq('user_id', user.id).single();
      if (!doc) return jsonResponse({ error: 'Document not found' }, 404, cors);

      await admin.from('kb_documents').delete().eq('document_id', docId);
      if (doc.storage_path) await admin.storage.from('kb-documents').remove([doc.storage_path]);
      const { error: delErr } = await admin.from('kb_uploaded_documents')
        .delete().eq('id', docId).eq('user_id', user.id);
      if (delErr) return jsonResponse({ error: delErr.message }, 500, cors);
      return jsonResponse({ success: true }, 200, cors);
    }

    return jsonResponse({ error: 'Not found' }, 404, cors);

  } catch (err) {
    console.error('api-documents error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  }
});
