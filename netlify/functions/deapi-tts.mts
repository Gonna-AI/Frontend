import type { Context, Config } from "@netlify/functions";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Netlify.env.get("DEAPI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "DEAPI_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const {
      text,
      voice = "Vivian",
      speed = 1,
      lang = "English",
      format = "mp3",
      sample_rate = 24000,
    } = body;

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: "text is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const deapiResponse = await fetch(
      "https://api.deapi.ai/api/v1/client/txt2audio",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text,
          model: "Qwen3_TTS_12Hz_1_7B_CustomVoice",
          mode: "custom_voice",
          lang,
          speed,
          format,
          sample_rate,
          voice,
        }),
      }
    );

    if (!deapiResponse.ok) {
      const errorText = await deapiResponse.text();
      console.error("DeAPI error:", deapiResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: `DeAPI error: ${deapiResponse.status}`,
          details: errorText,
        }),
        { status: deapiResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // DeAPI returns JSON with an audio URL or base64 audio
    const responseData = await deapiResponse.json();

    // If the response contains an audio_url, fetch the audio and return it
    if (responseData.audio_url) {
      const audioResponse = await fetch(responseData.audio_url);
      if (!audioResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch audio from URL" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      const audioBlob = await audioResponse.arrayBuffer();
      return new Response(audioBlob, {
        status: 200,
        headers: {
          "Content-Type": `audio/${format}`,
          "Cache-Control": "no-cache",
        },
      });
    }

    // If response contains base64 audio data
    if (responseData.audio_base64 || responseData.data) {
      const base64Data = responseData.audio_base64 || responseData.data;
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return new Response(bytes, {
        status: 200,
        headers: {
          "Content-Type": `audio/${format}`,
          "Cache-Control": "no-cache",
        },
      });
    }

    // If DeAPI returns audio directly as binary
    // Return the raw response data for the frontend to handle
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DeAPI proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config: Config = {
  path: "/api/deapi-tts",
};
