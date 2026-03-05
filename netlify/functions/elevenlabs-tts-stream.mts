import type { Context, Config } from "@netlify/functions";

/**
 * ElevenLabs TTS Streaming Proxy
 *
 * Proxies requests to ElevenLabs' streaming TTS endpoint.
 * Returns chunked audio directly to the client for low-latency playback.
 */
export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey =
    Netlify.env.get("VITE_ELEVENLABS_API_KEY") ||
    Netlify.env.get("ELEVENLABS_API_KEY") ||
    process.env.VITE_ELEVENLABS_API_KEY ||
    process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    let text, voiceId, modelId, outputFormat;
    
    if (req.method === "POST") {
      const body = await req.json();
      text = body.text;
      voiceId = body.voiceId || "cgSgspJ2msm6clMCkdW9";
      modelId = body.modelId || "eleven_flash_v2_5";
      outputFormat = body.outputFormat || "mp3_22050_32";
    } else {
      text = url.searchParams.get("text");
      voiceId = url.searchParams.get("voiceId") || "cgSgspJ2msm6clMCkdW9";
      modelId = url.searchParams.get("modelId") || "eleven_flash_v2_5";
      outputFormat = url.searchParams.get("outputFormat") || "mp3_22050_32";
    }

    if (!text?.trim()) {
      return new Response(
        JSON.stringify({ error: "text is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call ElevenLabs streaming endpoint
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3&output_format=${outputFormat}`;

    const elResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!elResponse.ok) {
      const errorText = await elResponse.text();
      console.error("ElevenLabs stream error:", elResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: `ElevenLabs error: ${elResponse.status}`,
          details: errorText,
        }),
        { status: elResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the audio response directly back to the client
    return new Response(elResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("ElevenLabs stream proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config: Config = {
  path: "/api/elevenlabs-tts-stream",
};
