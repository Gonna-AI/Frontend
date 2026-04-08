// supabase/functions/google-drive/index.ts
// Lists Google Drive files with search + pagination. Caches to google_drive_files.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  loadTokens, refreshIfExpired, googleFetch,
  corsHeadersFor, jsonRes,
} from "../_shared/google-client.ts";

const DRIVE_BASE = "https://www.googleapis.com/drive/v3";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeadersFor(req) });
  if (req.method !== "GET") return jsonRes(req, 405, { error: "Method not allowed" });

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
    const tokens = await loadTokens(user.id, admin);
    if (!tokens) return jsonRes(req, 403, { error: "Google not connected" });
    const fresh = await refreshIfExpired(tokens, admin);

    const url = new URL(req.url);
    const query = url.searchParams.get("query") ?? "";
    const pageToken = url.searchParams.get("pageToken") ?? "";
    const mimeType = url.searchParams.get("mimeType") ?? "";

    const qParts = ["trashed = false"];
    if (query) qParts.push(`name contains '${query.replace(/'/g, "\\'")}'`);
    if (mimeType) qParts.push(`mimeType = '${mimeType}'`);

    const params = new URLSearchParams({
      q: qParts.join(" and "),
      fields: "nextPageToken,files(id,name,mimeType,webViewLink,modifiedTime)",
      pageSize: "30",
      orderBy: "modifiedTime desc",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const gRes = await googleFetch(`${DRIVE_BASE}/files?${params}`, fresh);
    if (!gRes.ok) {
      if (gRes.status === 401) return jsonRes(req, 403, { error: "reconnect_required" });
      throw new Error(`Google Drive API ${gRes.status}`);
    }
    const gData = await gRes.json();

    const files = (gData.files ?? []).map((f: Record<string, string>) => ({
      user_id: user.id,
      file_id: f.id,
      name: f.name,
      mime_type: f.mimeType,
      web_view_link: f.webViewLink,
      modified_at: f.modifiedTime,
      synced_at: new Date().toISOString(),
    }));

    if (files.length > 0) {
      await admin.from("google_drive_files")
        .upsert(files, { onConflict: "user_id,file_id" });
    }

    return jsonRes(req, 200, {
      files,
      nextPageToken: gData.nextPageToken ?? null,
    });
  } catch (err) {
    console.error("[google-drive]", err);
    return jsonRes(req, 500, { error: "Internal server error" });
  }
});
