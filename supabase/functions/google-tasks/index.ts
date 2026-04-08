// supabase/functions/google-tasks/index.ts
// CRUD for Google Tasks used as call notes. Linked to call history entries.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  loadTokens, refreshIfExpired, googleFetch,
  corsHeadersFor, jsonRes,
} from "../_shared/google-client.ts";

const TASKS_BASE = "https://tasks.googleapis.com/tasks/v1";
const CLERKTREE_LIST = "ClerkTree Notes";

async function ensureTaskList(
  tokens: Awaited<ReturnType<typeof refreshIfExpired>>,
): Promise<string> {
  const res = await googleFetch(`${TASKS_BASE}/users/@me/lists`, tokens);
  const lists = res.ok ? ((await res.json()).items ?? []) : [];
  const existing = lists.find(
    (l: { title: string; id: string }) => l.title === CLERKTREE_LIST,
  );
  if (existing) return existing.id;

  const createRes = await googleFetch(`${TASKS_BASE}/users/@me/lists`, tokens, {
    method: "POST",
    body: JSON.stringify({ title: CLERKTREE_LIST }),
  });
  const created = await createRes.json();
  return created.id;
}

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

    // ━━━ GET: list tasks (filtered by historyId) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "GET") {
      const historyId = url.searchParams.get("historyId");
      let query = admin.from("google_tasks").select("*").eq("user_id", user.id);
      if (historyId) query = query.eq("linked_history_id", historyId);
      const { data: tasks } = await query.order("synced_at", { ascending: false });

      // Normalise to expected shape
      return jsonRes(req, 200, {
        tasks: (tasks ?? []).map(normTask),
      });
    }

    // ━━━ POST: create task ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "POST") {
      const body = await req.json();
      const listId = await ensureTaskList(fresh);
      const taskBody = {
        title: body.title ?? "Untitled Note",
        notes: body.notes ?? "",
        due: body.due ? new Date(body.due).toISOString() : undefined,
        status: "needsAction",
      };
      const gRes = await googleFetch(`${TASKS_BASE}/lists/${listId}/tasks`, fresh, {
        method: "POST",
        body: JSON.stringify(taskBody),
      });
      if (!gRes.ok) throw new Error(`Google Tasks API ${gRes.status}`);
      const created = await gRes.json();

      const { data: row } = await admin.from("google_tasks").insert({
        user_id: user.id,
        tasklist_id: listId,
        google_task_id: created.id,
        title: created.title,
        notes: created.notes ?? "",
        due: created.due ?? null,
        status: "needsAction",
        completed: false,
        linked_history_id: body.linkedHistoryId ?? null,
      }).select().single();

      return jsonRes(req, 201, { task: normTask(row) });
    }

    // ━━━ PATCH: update/complete task ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "PATCH") {
      const body = await req.json();
      const taskId = url.searchParams.get("taskId");
      if (!taskId) return jsonRes(req, 400, { error: "Missing taskId" });

      const { data: existing } = await admin.from("google_tasks")
        .select("tasklist_id")
        .eq("user_id", user.id).eq("google_task_id", taskId).single();
      if (!existing) return jsonRes(req, 404, { error: "Task not found" });

      const patchBody: Record<string, unknown> = {};
      if (body.title !== undefined) patchBody.title = body.title;
      if (body.notes !== undefined) patchBody.notes = body.notes;
      if (body.completed !== undefined) {
        patchBody.status = body.completed ? "completed" : "needsAction";
      }

      await googleFetch(
        `${TASKS_BASE}/lists/${existing.tasklist_id}/tasks/${taskId}`,
        fresh,
        { method: "PATCH", body: JSON.stringify(patchBody) },
      );

      const dbUpdate: Record<string, unknown> = {};
      if (body.title !== undefined) dbUpdate.title = body.title;
      if (body.notes !== undefined) dbUpdate.notes = body.notes;
      if (body.completed !== undefined) {
        dbUpdate.completed = body.completed;
        dbUpdate.status = body.completed ? "completed" : "needsAction";
      }

      const { data: updated } = await admin.from("google_tasks")
        .update(dbUpdate).eq("user_id", user.id).eq("google_task_id", taskId)
        .select().single();

      return jsonRes(req, 200, { task: normTask(updated) });
    }

    // ━━━ DELETE: remove task ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "DELETE") {
      const taskId = url.searchParams.get("taskId");
      if (!taskId) return jsonRes(req, 400, { error: "Missing taskId" });

      const { data: existing } = await admin.from("google_tasks")
        .select("tasklist_id")
        .eq("user_id", user.id).eq("google_task_id", taskId).single();
      if (!existing) return jsonRes(req, 404, { error: "Task not found" });

      await googleFetch(
        `${TASKS_BASE}/lists/${existing.tasklist_id}/tasks/${taskId}`,
        fresh,
        { method: "DELETE" },
      );
      await admin.from("google_tasks")
        .delete().eq("user_id", user.id).eq("google_task_id", taskId);
      return jsonRes(req, 200, { success: true });
    }

    return jsonRes(req, 404, { error: "Not found" });
  } catch (err) {
    console.error("[google-tasks]", err);
    return jsonRes(req, 500, { error: "Internal server error" });
  }
});

// Normalise DB row (uses google_task_id, tasklist_id) to frontend shape
function normTask(r: Record<string, unknown>) {
  return {
    id: r.id,
    task_id: r.google_task_id,
    task_list_id: r.tasklist_id,
    title: r.title,
    notes: r.notes,
    completed: r.completed ?? false,
    due_at: r.due ?? null,
    linked_history_id: r.linked_history_id ?? null,
    synced_at: r.synced_at,
  };
}
