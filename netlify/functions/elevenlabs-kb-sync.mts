import type { Context, Config } from "@netlify/functions";

const EL_BASE = "https://api.elevenlabs.io/v1";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export default async (req: Request, _context: Context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  // Read env vars
  const apiKey =
    Netlify.env.get("ELEVENLABS_API_KEY") ||
    Netlify.env.get("VITE_ELEVENLABS_API_KEY") ||
    process.env.ELEVENLABS_API_KEY ||
    process.env.VITE_ELEVENLABS_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const agentId =
    Netlify.env.get("ELEVENLABS_AGENT_ID") ||
    Netlify.env.get("VITE_ELEVENLABS_AGENT_ID") ||
    process.env.ELEVENLABS_AGENT_ID ||
    process.env.VITE_ELEVENLABS_AGENT_ID;

  if (!agentId) {
    return new Response(
      JSON.stringify({
        error:
          "ELEVENLABS_AGENT_ID not configured. Set it as an env var.",
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const supabaseUrl =
    Netlify.env.get("VITE_SUPABASE_URL") ||
    Netlify.env.get("SUPABASE_URL") ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL;

  if (!supabaseUrl) {
    return new Response(
      JSON.stringify({ error: "SUPABASE_URL not configured" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const supabaseServiceKey =
    Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Netlify.env.get("VITE_SUPABASE_SERVICE_ROLE_KEY") ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  // Parse request body
  let kbId: string | undefined;
  try {
    const body = await req.json();
    kbId = body.kbId;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid or missing JSON body" }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!kbId) {
    return new Response(
      JSON.stringify({ error: "Missing required field: kbId" }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    // Step 1: Fetch all chunks for this kbId from Supabase
    const supabaseRes = await fetch(
      `${supabaseUrl}/rest/v1/kb_documents?kb_id=eq.${encodeURIComponent(kbId)}&select=content,chunk_index&order=chunk_index.asc`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!supabaseRes.ok) {
      const errorText = await supabaseRes.text();
      throw new Error(
        `Supabase fetch failed (HTTP ${supabaseRes.status}): ${errorText}`
      );
    }

    const chunks: { content: string; chunk_index: number }[] =
      await supabaseRes.json();

    // Step 2: Fetch current agent config to find existing KB item IDs
    const agentRes = await fetch(`${EL_BASE}/convai/agents/${agentId}`, {
      headers: { "xi-api-key": apiKey },
    });

    if (!agentRes.ok) {
      const errorText = await agentRes.text();
      throw new Error(
        `Failed to fetch ElevenLabs agent config (HTTP ${agentRes.status}): ${errorText}`
      );
    }

    const agentData = await agentRes.json();
    const existingKbItems: { id: string }[] =
      agentData?.conversation_config?.agent?.prompt?.knowledge_base ?? [];

    // Step 3: Delete all existing KB items from the agent
    for (const item of existingKbItems) {
      const delRes = await fetch(
        `${EL_BASE}/convai/agents/${agentId}/knowledge-base/${item.id}`,
        {
          method: "DELETE",
          headers: { "xi-api-key": apiKey },
        }
      );
      if (!delRes.ok) {
        const errorText = await delRes.text();
        throw new Error(
          `Failed to delete KB item ${item.id} (HTTP ${delRes.status}): ${errorText}`
        );
      }
    }

    // Step 4: If no chunks, return early
    if (chunks.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, chunks_synced: 0 }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // Step 5: Combine all chunks into one text blob
    const combinedText = chunks.map((c) => c.content).join("\n\n");

    // Step 6: Upload combined text as a new KB document to ElevenLabs
    const textBlob = new Blob([combinedText], { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", textBlob, `kb-${kbId}.txt`);
    formData.append("name", `kb-${kbId}`);

    const uploadRes = await fetch(`${EL_BASE}/convai/knowledge-base`, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(
        `Failed to upload KB document to ElevenLabs (HTTP ${uploadRes.status}): ${errorText}`
      );
    }

    const uploadData = await uploadRes.json();
    const kbDocId: string = uploadData.id;

    // Step 7: Attach the new KB doc to the agent
    const patchRes = await fetch(`${EL_BASE}/convai/agents/${agentId}`, {
      method: "PATCH",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            prompt: {
              knowledge_base: [{ type: "file", id: kbDocId }],
            },
          },
        },
      }),
    });

    if (!patchRes.ok) {
      const errorText = await patchRes.text();
      throw new Error(
        `Failed to attach KB document to ElevenLabs agent (HTTP ${patchRes.status}): ${errorText}`
      );
    }

    return new Response(
      JSON.stringify({ ok: true, chunks_synced: chunks.length, kb_doc_id: kbDocId }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("elevenlabs-kb-sync error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
};

export const config: Config = {
  path: "/api/elevenlabs-kb-sync",
};
