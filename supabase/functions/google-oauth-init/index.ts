// supabase/functions/google-oauth-init/index.ts
// Generates a Google OAuth URL with all workspace scopes + CSRF state token.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeadersFor, jsonRes } from "../_shared/google-client.ts";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/contacts.readonly",
  "email",
  "profile",
].join(" ");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeadersFor(req) });
  }
  if (req.method !== "POST") return jsonRes(req, 405, { error: "Method not allowed" });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonRes(req, 401, { error: "Unauthorized" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return jsonRes(req, 401, { error: "Unauthorized" });

    const admin = createClient(supabaseUrl, serviceKey);

    // Generate a cryptographically random CSRF state token
    const stateBytes = new Uint8Array(24);
    crypto.getRandomValues(stateBytes);
    const state = btoa(String.fromCharCode(...stateBytes))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

    // Store state in DB (expires in 10 min by default)
    const { error: stateErr } = await admin
      .from("google_oauth_states")
      .insert({ state, user_id: user.id });
    if (stateErr) throw new Error(`State insert failed: ${stateErr.message} (code: ${stateErr.code})`);

    // Opportunistically clean up expired states.
    // NOTE: supabase-js rpc() returns a PostgrestFilterBuilder (thenable, no .catch);
    // we must await inside a try/catch to swallow errors.
    try {
      await admin.rpc("cleanup_expired_oauth_states");
    } catch { /* non-fatal */ }

    const redirectUri = Deno.env.get("GOOGLE_REDIRECT_URI")
      ?? `${supabaseUrl}/functions/v1/google-oauth-callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPES,
      access_type: "offline",
      prompt: "consent", // always return refresh_token
      state,
    });

    return jsonRes(req, 200, {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[google-oauth-init]", msg);
    return jsonRes(req, 500, { error: "Internal server error", detail: msg });
  }
});
