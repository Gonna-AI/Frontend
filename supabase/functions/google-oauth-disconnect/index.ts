// supabase/functions/google-oauth-disconnect/index.ts
// Revokes Google tokens and clears all cached data for the user.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { loadTokens, refreshIfExpired, corsHeadersFor, jsonRes } from "../_shared/google-client.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeadersFor(req) });
  if (req.method !== "POST") return jsonRes(req, 405, { error: "Method not allowed" });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonRes(req, 401, { error: "Unauthorized" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return jsonRes(req, 401, { error: "Unauthorized" });

    const admin = createClient(supabaseUrl, serviceKey);

    // Load tokens and revoke with Google (best-effort)
    const tokens = await loadTokens(user.id, admin);
    if (tokens) {
      const fresh = await refreshIfExpired(tokens, admin).catch(() => tokens);
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${fresh.accessToken}`,
        { method: "POST" },
      ).catch(() => {});
    }

    // Delete token row + all cached data
    await Promise.all([
      admin.from("google_oauth_tokens")
        .delete().eq("user_id", user.id).eq("service", "workspace"),
      admin.from("google_calendar_events").delete().eq("user_id", user.id),
      admin.from("google_tasks").delete().eq("user_id", user.id),
      admin.from("google_drive_files").delete().eq("user_id", user.id),
    ]);

    return jsonRes(req, 200, { success: true });
  } catch (err) {
    console.error("[google-oauth-disconnect]", err);
    return jsonRes(req, 500, { error: "Internal server error" });
  }
});
