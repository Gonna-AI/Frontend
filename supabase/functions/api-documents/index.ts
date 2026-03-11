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

// ─── Embedding model (lazy-init to avoid 546 boot crash) ─────────
// Creating a Supabase.ai.Session at module scope crashes the function
// if the AI runtime isn't available, producing a 546 before any
// request is handled.  Deferring to first use fixes this.
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
// Strategy 1: BT/ET blocks (works for simple PDFs)
// Strategy 2: Decompress FlateDecode streams, then extract text
// Strategy 3: Raw printable ASCII extraction + Groq cleanup
function extractTextFromPDF(bytes: Uint8Array): string {
  const raw = new TextDecoder('latin1').decode(bytes);

  // Strategy 1: Standard BT/ET text operator extraction
  const textParts: string[] = [];
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];

    // Tj operator: (text) Tj
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const decoded = decodePdfString(tjMatch[1]);
      if (decoded.trim()) textParts.push(decoded);
    }

    // TJ operator: [(text) kern (text)] TJ
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

  // If we got meaningful text from BT/ET, use it
  const btEtText = textParts.join(' ').replace(/\s+/g, ' ').trim();
  if (btEtText.length > 50 && isReadableText(btEtText)) {
    return btEtText;
  }

  // Strategy 2: Try to decompress FlateDecode streams and extract text
  const streamTexts = extractFromStreams(raw);
  if (streamTexts.length > 50 && isReadableText(streamTexts)) {
    return streamTexts;
  }

  // Strategy 3: Extract all printable ASCII runs (last resort)
  // This captures text content that's embedded in the PDF but not in standard text operators
  const asciiRuns: string[] = [];
  const asciiRegex = /[\x20-\x7E]{4,}/g;
  let asciiMatch;
  while ((asciiMatch = asciiRegex.exec(raw)) !== null) {
    const run = asciiMatch[0].trim();
    // Filter out PDF operators and binary noise
    if (run.length > 3 && !isPdfOperator(run)) {
      asciiRuns.push(run);
    }
  }

  const asciiText = asciiRuns.join(' ').replace(/\s+/g, ' ').trim();
  if (asciiText.length > 20) {
    return asciiText.substring(0, 50000);
  }

  // Nothing extracted
  return '';
}

// Decode PDF escape sequences
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

// Check if extracted text is actually readable (not garbled binary)
function isReadableText(text: string): boolean {
  if (!text || text.length === 0) return false;
  // Count printable ASCII characters vs total
  let printable = 0;
  let letters = 0;
  for (let i = 0; i < Math.min(text.length, 500); i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x20 && code <= 0x7E) printable++;
    if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) letters++;
  }
  const sampleLen = Math.min(text.length, 500);
  // At least 80% printable and 20% letters
  return (printable / sampleLen) > 0.8 && (letters / sampleLen) > 0.2;
}

// Filter out PDF structural keywords
function isPdfOperator(text: string): boolean {
  const operators = [
    'endobj', 'endstream', 'stream', 'xref', 'trailer', 'startxref',
    '/Type', '/Pages', '/Page', '/Font', '/Catalog', '/Length',
    '/Filter', '/FlateDecode', '/Subtype', '/BaseFont',
  ];
  return operators.some((op) => text.startsWith(op) || text === op);
}

// Try to extract readable text from PDF stream objects
function extractFromStreams(raw: string): string {
  const parts: string[] = [];

  // Find stream...endstream blocks and try to extract ASCII text from them
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let m;
  while ((m = streamRegex.exec(raw)) !== null) {
    const streamData = m[1];
    // Extract printable ASCII runs from stream data
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

// ─── Groq-powered text cleanup for garbled PDF extractions ───────
async function cleanExtractedTextWithGroq(rawText: string, fileName: string): Promise<string> {
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey || rawText.length < 20) return rawText;

  // Only clean if text seems garbled
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
          const embeddingResult = await getEmbeddingModel().run(chunks[i], {
            mean_pool: true,
            normalize: true,
          });

          // Ensure embedding is a plain array (not a stringified JSON)
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
                document_id: documentId,
                chunk_index: i,
                total_chunks: chunks.length,
              },
              embedding,
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
