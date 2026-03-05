import type { Context, Config } from "@netlify/functions";

const DEAPI_BASE = "https://api.deapi.ai/api/v1/client";
const POLL_INTERVAL_MS = 800;
const MAX_POLL_ATTEMPTS = 30; // 30 * 800ms = 24s max wait

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

    const authHeader = `Bearer ${apiKey}`;

    // Step 1: Submit TTS job
    const submitResponse = await fetch(`${DEAPI_BASE}/txt2audio`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader,
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
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error("DeAPI submit error:", submitResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `DeAPI submit error: ${submitResponse.status}`, details: errorText }),
        { status: submitResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const submitData = await submitResponse.json();
    const requestId = submitData?.data?.request_id;

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: "No request_id returned from DeAPI" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`DeAPI job submitted: ${requestId}`);

    // Step 2: Poll for completion
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const statusResponse = await fetch(
        `${DEAPI_BASE}/request-status/${requestId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: authHeader,
          },
        }
      );

      if (!statusResponse.ok) {
        console.warn(`DeAPI poll error (attempt ${attempt + 1}):`, statusResponse.status);
        continue;
      }

      const statusData = await statusResponse.json();
      const status = statusData?.data?.status;

      if (status === "done") {
        const resultUrl = statusData.data.result_url;
        if (!resultUrl) {
          return new Response(
            JSON.stringify({ error: "DeAPI returned done but no result_url" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        // Step 3: Fetch the audio file and return it
        const audioResponse = await fetch(resultUrl);
        if (!audioResponse.ok) {
          return new Response(
            JSON.stringify({ error: "Failed to fetch audio from result URL" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        const audioBuffer = await audioResponse.arrayBuffer();
        console.log(`DeAPI audio ready: ${audioBuffer.byteLength} bytes`);

        return new Response(audioBuffer, {
          status: 200,
          headers: {
            "Content-Type": `audio/${format}`,
            "Cache-Control": "no-cache",
          },
        });
      }

      if (status === "error") {
        return new Response(
          JSON.stringify({ error: "DeAPI TTS generation failed", details: statusData }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // status is "pending" or "processing" — keep polling
      console.log(`DeAPI status: ${status} (attempt ${attempt + 1}/${MAX_POLL_ATTEMPTS})`);
    }

    // Timed out waiting
    return new Response(
      JSON.stringify({ error: "DeAPI TTS timed out waiting for result" }),
      { status: 504, headers: { "Content-Type": "application/json" } }
    );
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
