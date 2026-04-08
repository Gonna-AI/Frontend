// supabase/functions/google-calendar/index.ts
// GET: list events (cached, 5min TTL), POST: create event, DELETE: remove event.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  loadTokens, refreshIfExpired, googleFetch,
  corsHeadersFor, jsonRes,
} from "../_shared/google-client.ts";

const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeadersFor(req) });

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

    // ━━━ GET: list events ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "GET") {
      const start = url.searchParams.get("start") ?? new Date().toISOString();
      const end = url.searchParams.get("end") ??
        new Date(Date.now() + 7 * 86_400_000).toISOString();
      const maxResults = url.searchParams.get("maxResults") ?? "25";

      // Check cache (5 min TTL)
      const { data: cached } = await admin
        .from("google_calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", start)
        .lte("start_time", end)
        .order("start_time");

      const cacheAge = cached?.length
        ? Date.now() - new Date(cached[0].synced_at).getTime()
        : Infinity;

      if (cacheAge < 5 * 60_000) {
        // Normalise to frontend-expected shape
        return jsonRes(req, 200, {
          events: normaliseEvents(cached ?? []),
          source: "cache",
        });
      }

      // Fetch from Google Calendar API
      const params = new URLSearchParams({
        timeMin: start,
        timeMax: end,
        maxResults,
        singleEvents: "true",
        orderBy: "startTime",
      });
      const gRes = await googleFetch(
        `${CALENDAR_BASE}/calendars/primary/events?${params}`,
        fresh,
      );
      if (!gRes.ok) {
        if (gRes.status === 401) return jsonRes(req, 403, { error: "reconnect_required" });
        throw new Error(`Google Calendar API ${gRes.status}`);
      }
      const gData = await gRes.json();
      const now = new Date().toISOString();

      const rows = (gData.items ?? []).map((e: Record<string, unknown>) => {
        const eStart = e.start as Record<string, string> | undefined;
        const eEnd = e.end as Record<string, string> | undefined;
        const conf = e.conferenceData as Record<string, unknown> | undefined;
        const entryPoints = conf?.entryPoints as Record<string, string>[] | undefined;
        return {
          user_id: user.id,
          google_event_id: e.id,
          title: e.summary ?? "",
          description: e.description ?? "",
          start_time: eStart?.dateTime ?? eStart?.date ?? null,
          end_time: eEnd?.dateTime ?? eEnd?.date ?? null,
          attendees: e.attendees ?? [],
          meet_link: entryPoints?.[0]?.uri ?? null,
          html_link: e.htmlLink ?? null,
          status: e.status ?? "confirmed",
          calendar_id: "primary",
          synced_at: now,
        };
      });

      if (rows.length > 0) {
        await admin.from("google_calendar_events")
          .upsert(rows, { onConflict: "user_id,google_event_id" });
      }

      return jsonRes(req, 200, { events: normaliseEvents(rows), source: "google" });
    }

    // ━━━ POST: create event ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "POST") {
      const body = await req.json();
      const eventBody = {
        summary: body.title,
        description: body.description ?? "",
        start: { dateTime: body.start, timeZone: body.timeZone ?? "UTC" },
        end: { dateTime: body.end, timeZone: body.timeZone ?? "UTC" },
        attendees: (body.attendees ?? []).map((email: string) => ({ email })),
        conferenceData: body.addMeet
          ? { createRequest: { requestId: crypto.randomUUID() } }
          : undefined,
      };
      const gRes = await googleFetch(
        `${CALENDAR_BASE}/calendars/primary/events?conferenceDataVersion=1`,
        fresh,
        { method: "POST", body: JSON.stringify(eventBody) },
      );
      if (!gRes.ok) throw new Error(`Google Calendar API ${gRes.status}`);
      const created = await gRes.json();
      return jsonRes(req, 201, { event: created });
    }

    // ━━━ DELETE: remove event ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "DELETE") {
      const eventId = url.searchParams.get("eventId");
      if (!eventId) return jsonRes(req, 400, { error: "Missing eventId" });
      const gRes = await googleFetch(
        `${CALENDAR_BASE}/calendars/primary/events/${eventId}`,
        fresh,
        { method: "DELETE" },
      );
      if (!gRes.ok && gRes.status !== 410) throw new Error(`Google Calendar API ${gRes.status}`);
      await admin.from("google_calendar_events")
        .delete().eq("user_id", user.id).eq("google_event_id", eventId);
      return jsonRes(req, 200, { success: true });
    }

    return jsonRes(req, 404, { error: "Not found" });
  } catch (err) {
    console.error("[google-calendar]", err);
    return jsonRes(req, 500, { error: "Internal server error" });
  }
});

// Normalise DB row to a consistent frontend shape regardless of source
function normaliseEvents(rows: Record<string, unknown>[]) {
  return rows.map((r) => ({
    id: r.id,
    event_id: r.google_event_id,
    title: r.title,
    description: r.description,
    start_at: r.start_time,
    end_at: r.end_time,
    attendees: r.attendees ?? [],
    meet_link: r.meet_link ?? null,
    synced_at: r.synced_at,
  }));
}
