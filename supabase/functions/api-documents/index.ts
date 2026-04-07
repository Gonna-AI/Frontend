import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── CORS ────────────────────────────────────────────────────────
const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, PATCH, OPTIONS',
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

// ─── Embedding model (lazy-init to avoid 546 boot crash) ─────────
let _embeddingModel: any = null;

function getEmbeddingModel() {
  if (!_embeddingModel) {
    if (typeof (globalThis as any).Supabase === 'undefined' || !(globalThis as any).Supabase?.ai?.Session) {
      throw new Error(
        'Supabase AI runtime is not available. Ensure the edge function is deployed to a project that supports Supabase.ai.',
      );
    }
    _embeddingModel = new (globalThis as any).Supabase.ai.Session('gte-small');
  }
  return _embeddingModel;
}

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

// ─── PDF text extraction (multi-strategy) ────────────────────────
function extractTextFromPDF(bytes: Uint8Array): string {
  const raw = new TextDecoder('latin1').decode(bytes);

  const textParts: string[] = [];
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];

    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const decoded = decodePdfString(tjMatch[1]);
      if (decoded.trim()) textParts.push(decoded);
    }

    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      const words: string[] = [];
      while ((strMatch = strRegex.exec(tjArrMatch[1])) !== null) {
        const decoded = decodePdfString(strMatch[1]);
        if (decoded.trim()) words.push(decoded);
      }
      if (words.length > 0) textParts.push(words.join(''));
    }
  }

  const btEtText = textParts.join(' ').replace(/\s+/g, ' ').trim();
  if (btEtText.length > 50 && isReadableText(btEtText)) {
    return btEtText;
  }

  const streamTexts = extractFromStreams(raw);
  if (streamTexts.length > 50 && isReadableText(streamTexts)) {
    return streamTexts;
  }

  const asciiRuns: string[] = [];
  const asciiRegex = /[\x20-\x7E]{4,}/g;
  let asciiMatch;
  while ((asciiMatch = asciiRegex.exec(raw)) !== null) {
    const run = asciiMatch[0].trim();
    if (run.length > 3 && !isPdfOperator(run)) {
      asciiRuns.push(run);
    }
  }

  const asciiText = asciiRuns.join(' ').replace(/\s+/g, ' ').trim();
  if (asciiText.length > 20) {
    return asciiText.substring(0, 50000);
  }

  return '';
}

function decodePdfString(s: string): string {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function isReadableText(text: string): boolean {
  if (!text || text.length === 0) return false;
  let printable = 0;
  let letters = 0;
  for (let i = 0; i < Math.min(text.length, 500); i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x20 && code <= 0x7E) printable++;
    if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) letters++;
  }
  const sampleLen = Math.min(text.length, 500);
  return (printable / sampleLen) > 0.8 && (letters / sampleLen) > 0.2;
}

function isPdfOperator(text: string): boolean {
  const operators = [
    'endobj', 'endstream', 'stream', 'xref', 'trailer', 'startxref',
    '/Type', '/Pages', '/Page', '/Font', '/Catalog', '/Length',
    '/Filter', '/FlateDecode', '/Subtype', '/BaseFont',
  ];
  return operators.some((op) => text.startsWith(op) || text === op);
}

function extractFromStreams(raw: string): string {
  const parts: string[] = [];
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let m;
  while ((m = streamRegex.exec(raw)) !== null) {
    const streamData = m[1];
    const textRegex = /[\x20-\x7E]{5,}/g;
    let tm;
    while ((tm = textRegex.exec(streamData)) !== null) {
      const run = tm[0].trim();
      if (run.length > 4 && !isPdfOperator(run)) {
        parts.push(run);
      }
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

async function cleanExtractedTextWithGroq(rawText: string, fileName: string): Promise<string> {
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey || rawText.length < 20) return rawText;
  if (isReadableText(rawText)) return rawText;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a document text extractor. The user will provide garbled text extracted from a PDF. Extract and reconstruct ALL readable information. Return ONLY the cleaned text, no explanations. Preserve structure like headings, lists, contact info, dates.',
          },
          {
            role: 'user',
            content: `File: ${fileName}\n\nExtracted text (may be garbled):\n${rawText.substring(0, 8000)}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) return rawText;
    const data = await response.json();
    const cleaned = data.choices?.[0]?.message?.content;
    return cleaned && cleaned.length > 20 ? cleaned : rawText;
  } catch {
    return rawText;
  }
}

// ─── Main handler ────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const admin = createClient(supabaseUrl, serviceKey);

    // Routing helpers
    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    const secondLast = parts[parts.length - 2] || '';

    // ━━━ POST /search — Vector similarity search (no auth required) ━━━
    // Accepts text query, generates embedding server-side, returns matching chunks.
    if (req.method === 'POST' && last === 'search') {
      const body = await req.json();
      const { query, kb_id, limit = 3, threshold = 0.70 } = body as {
        query: string; kb_id: string; limit?: number; threshold?: number;
      };
      if (!query || !kb_id) return jsonResponse({ error: 'query and kb_id required' }, 400, cors);

      const embeddingResult = await getEmbeddingModel().run(query, { mean_pool: true, normalize: true });
      const queryEmbedding = Array.isArray(embeddingResult)
        ? embeddingResult
        : Array.from(embeddingResult as Iterable<number>);

      const { data, error } = await admin.rpc('match_kb_documents', {
        query_embedding: queryEmbedding,
        match_kb_id: kb_id,
        match_threshold: threshold,
        match_count: limit,
      });

      if (error) throw error;
      return jsonResponse({ results: (data ?? []).map((d: any) => d.content) }, 200, cors);
    }

    // ━━━ GET /latest-pageindex — Get latest PageIndex doc (no auth required) ━━━
    // ?kb_id=<uuid>&name=<optional-filename-filter>
    if (req.method === 'GET' && last === 'latest-pageindex') {
      const kbId = url.searchParams.get('kb_id');
      const docName = url.searchParams.get('name');
      if (!kbId) return jsonResponse({ error: 'kb_id required' }, 400, cors);

      let query = admin
        .from('kb_uploaded_documents')
        .select('*')
        .eq('kb_id', kbId);

      if (docName && docName.trim()) {
        query = query.ilike('file_name', `%${docName.trim()}%`);
      } else {
        query = query.not('pageindex_doc_id', 'is', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1);
      if (error) throw error;
      return jsonResponse({ document: data && data.length > 0 ? data[0] : null }, 200, cors);
    }

    // ─── All routes below require authentication ──────────────────
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) return jsonResponse({ error: 'Unauthorized' }, 401, cors);

    // ━━━ POST /store-chunk — Store a single text chunk with server-side embedding ━━━
    if (req.method === 'POST' && last === 'store-chunk') {
      const body = await req.json();
      const { kb_id, content, metadata } = body as {
        kb_id: string; content: string; metadata?: Record<string, unknown>;
      };
      if (!kb_id || !content) return jsonResponse({ error: 'kb_id and content required' }, 400, cors);

      const embeddingResult = await getEmbeddingModel().run(content, { mean_pool: true, normalize: true });
      const embedding = Array.isArray(embeddingResult)
        ? embeddingResult
        : Array.from(embeddingResult as Iterable<number>);

      const { error } = await admin.from('kb_documents').insert({
        kb_id,
        content,
        metadata: metadata ?? {},
        embedding,
        user_id: user.id,
      });

      if (error) throw error;
      return jsonResponse({ success: true }, 200, cors);
    }

    // ━━━ POST /process-document — Full server-side pipeline ━━━━━━━
    // If documentId is not provided, the record is created here.
    // Returns the final document record.
    if (req.method === 'POST' && last === 'process-document') {
      const body = await req.json();
      const { documentId, storagePath, fileType, fileName, kbId, pageIndexDocId, file_size } = body as {
        documentId?: string;
        storagePath: string;
        fileType: string;
        fileName: string;
        kbId: string;
        pageIndexDocId?: string;
        file_size?: number;
      };

      if (!storagePath || !fileType || !kbId) {
        return jsonResponse({ error: 'storagePath, fileType, and kbId are required' }, 400, cors);
      }

      // Create the document record if not pre-created by the caller
      let docId = documentId;
      if (!docId) {
        const { data: newDoc, error: createErr } = await admin
          .from('kb_uploaded_documents')
          .insert({
            user_id: user.id,
            kb_id: kbId,
            file_name: fileName,
            file_type: fileType,
            file_size: file_size ?? 0,
            storage_path: storagePath,
            status: 'processing',
            ...(pageIndexDocId ? { pageindex_doc_id: pageIndexDocId } : {}),
          })
          .select()
          .single();

        if (createErr || !newDoc) {
          return jsonResponse({ error: `Record creation failed: ${createErr?.message ?? 'No data'}` }, 500, cors);
        }
        docId = newDoc.id;
      }

      // 1. Download from storage
      const { data: fileData, error: dlErr } = await admin.storage
        .from('kb-documents')
        .download(storagePath);

      if (dlErr || !fileData) {
        await admin.from('kb_uploaded_documents').update({
          status: 'error',
          error_message: `Download failed: ${dlErr?.message ?? 'No data'}`,
        }).eq('id', docId);
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
        }).eq('id', docId);
        return jsonResponse({ error: 'No text content extracted' }, 422, cors);
      }

      // 3. Chunk
      const chunks = smartChunkText(text, 300, 50);
      const totalTokens = text.split(/\s+/).length;

      // 4. Embed + store each chunk
      let storedCount = 0;
      for (let i = 0; i < chunks.length; i++) {
        try {
          const embeddingResult = await getEmbeddingModel().run(chunks[i], {
            mean_pool: true,
            normalize: true,
          });

          const embedding = Array.isArray(embeddingResult)
            ? embeddingResult
            : Array.from(embeddingResult as Iterable<number>);

          const { error: insertErr } = await admin
            .from('kb_documents')
            .insert({
              kb_id: kbId,
              content: chunks[i],
              metadata: {
                source: fileName,
                document_id: docId,
                chunk_index: i,
                total_chunks: chunks.length,
              },
              embedding,
              user_id: user.id,
              document_id: docId,
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
      }).eq('id', docId);

      const { data: finalDoc } = await admin
        .from('kb_uploaded_documents')
        .select('*')
        .eq('id', docId)
        .single();

      return jsonResponse({
        success: true,
        status,
        document: finalDoc ?? null,
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

    // ━━━ GET /documents — List user's documents ━━━━━━━━━━━━━━━━━━
    if (req.method === 'GET' && (last === 'documents' || last === 'api-documents')) {
      const { data, error } = await admin.from('kb_uploaded_documents')
        .select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) return jsonResponse({ error: error.message }, 500, cors);
      return jsonResponse({ documents: data ?? [] }, 200, cors);
    }

    // ━━━ GET /{docId}/chunks — Fetch chunks for a document ━━━━━━━
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

    // ━━━ PATCH /documents/:id — Update document metadata ━━━━━━━━━
    // Supports: pageindex_doc_id, status, error_message
    if (req.method === 'PATCH' && secondLast === 'documents') {
      const docId = last;
      const body = await req.json() as Record<string, unknown>;

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.pageindex_doc_id !== undefined) updates.pageindex_doc_id = body.pageindex_doc_id;
      if (body.status !== undefined) updates.status = body.status;
      if (body.error_message !== undefined) updates.error_message = body.error_message;

      if (Object.keys(updates).length === 1) {
        return jsonResponse({ error: 'No updatable fields provided' }, 400, cors);
      }

      const { error } = await admin
        .from('kb_uploaded_documents')
        .update(updates)
        .eq('id', docId)
        .eq('user_id', user.id);

      if (error) throw error;
      return jsonResponse({ success: true }, 200, cors);
    }

    // ━━━ DELETE /documents/:id — Delete document and chunks ━━━━━━
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
