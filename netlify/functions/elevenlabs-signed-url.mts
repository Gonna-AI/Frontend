import type { Context, Config } from "@netlify/functions";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Netlify.env.get("VITE_ELEVENLABS_API_KEY") || Netlify.env.get("ELEVENLABS_API_KEY") || process.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Agent ID: accept from request body (for multi-client) or fall back to env var
  let agentId: string | undefined;
  try {
    const body = await req.json();
    agentId = body.agentId;
  } catch {
    // No body or invalid JSON — fall back to env var
  }

  if (!agentId) {
    agentId = Netlify.env.get("VITE_ELEVENLABS_AGENT_ID") || Netlify.env.get("ELEVENLABS_AGENT_ID") || process.env.VITE_ELEVENLABS_AGENT_ID || process.env.ELEVENLABS_AGENT_ID;
  }

  if (!agentId) {
    return new Response(
      JSON.stringify({ error: "ELEVENLABS_AGENT_ID not configured. Set it as an env var or pass agentId in the request body." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs signed URL error:", response.status, errorText);
      // Return 502 (Bad Gateway) instead of passing through ElevenLabs' status code.
      // This prevents a 404 from ElevenLabs (e.g. invalid agent ID) from looking
      // like the Netlify function itself is missing.
      const proxyStatus = response.status >= 400 && response.status < 500 ? 502 : response.status;
      return new Response(
        JSON.stringify({
          error: `ElevenLabs upstream error (HTTP ${response.status})`,
          details: errorText,
          hint: response.status === 404
            ? "The ElevenLabs agent ID may be invalid or deleted. Check ELEVENLABS_AGENT_ID env var."
            : undefined,
        }),
        { status: proxyStatus, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ signed_url: data.signed_url }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("ElevenLabs signed URL proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config: Config = {
  path: "/api/elevenlabs-signed-url",
};
