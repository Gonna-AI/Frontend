// supabase/functions/google-gmail/index.ts
// Fetches recent Gmail thread snippets by contact email (read-only, no caching).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  loadTokens, refreshIfExpired, googleFetch,
  corsHeadersFor, jsonRes,
} from "../_shared/google-client.ts";

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

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
    const email = url.searchParams.get("email");
    const maxResults = url.searchParams.get("maxResults") ?? "5";

    if (!email) return jsonRes(req, 400, { error: "Missing email param" });

    const params = new URLSearchParams({
      q: `from:${email} OR to:${email}`,
      maxResults,
    });

    const listRes = await googleFetch(`${GMAIL_BASE}/threads?${params}`, fresh);
    if (!listRes.ok) {
      if (listRes.status === 401) return jsonRes(req, 403, { error: "reconnect_required" });
      throw new Error(`Gmail API ${listRes.status}`);
    }
    const listData = await listRes.json();
    const threads = listData.threads ?? [];

    // Fetch metadata only (no body) for each thread
    const threadDetails = await Promise.all(
      threads.map(async (t: { id: string }) => {
        const tRes = await googleFetch(
          `${GMAIL_BASE}/threads/${t.id}?format=metadata&metadataHeaders=Subject,From,To,Date`,
          fresh,
        );
        if (!tRes.ok) return null;
        const tData = await tRes.json();
        const msg = tData.messages?.[0];
        const headers: Record<string, string> = {};
        for (const h of (msg?.payload?.headers ?? [])) {
          headers[(h.name as string).toLowerCase()] = h.value as string;
        }
        return {
          id: t.id,
          subject: headers.subject ?? "(no subject)",
          from: headers.from ?? "",
          to: headers.to ?? "",
          date: headers.date ?? "",
          snippet: (tData.snippet as string) ?? "",
        };
      }),
    );

    return jsonRes(req, 200, {
      threads: threadDetails.filter(Boolean),
    });
  } catch (err) {
    console.error("[google-gmail]", err);
    return jsonRes(req, 500, { error: "Internal server error" });
  }
});
