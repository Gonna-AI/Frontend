# Google Workspace Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Google Calendar, Tasks, Gmail, Drive, and Contacts contextually into existing ClerkTree dashboard views via a dedicated OAuth flow and Supabase Edge Function proxies.

**Architecture:** Users connect Google Workspace explicitly via a "Connect Google" button in Settings → Connected Apps (new tab). A CSRF-safe OAuth flow stores encrypted tokens in Supabase. All Google API calls are proxied through 7 new Supabase Edge Functions — the frontend never sees raw tokens. Google features are woven contextually into existing views (Monitor, History, Documents, Customer Graph, Analytics).

**Tech Stack:** Deno Edge Functions (jsr:@supabase/supabase-js@2), Google REST APIs (Calendar v3, Tasks v1, Gmail v1, Drive v3, People v1), React + TypeScript (Vitest), Supabase Postgres (pgcrypto AES-256), React Query (already installed via @tanstack/react-query).

---

## File Map

### New Edge Functions
- `supabase/functions/google-oauth-init/index.ts` — generates OAuth URL + state token
- `supabase/functions/google-oauth-callback/index.ts` — exchanges code → tokens, stores in DB
- `supabase/functions/google-oauth-disconnect/index.ts` — revokes + clears tokens
- `supabase/functions/google-calendar/index.ts` — CRUD for Calendar events
- `supabase/functions/google-tasks/index.ts` — CRUD for Tasks (notes layer)
- `supabase/functions/google-drive/index.ts` — list Drive files
- `supabase/functions/google-gmail/index.ts` — read Gmail threads by contact email
- `supabase/functions/_shared/google-client.ts` — shared token loader, refresher, fetch helper

### New Migration
- `supabase/migrations/add_google_workspace.sql`

### New Frontend Files
- `src/hooks/useGoogleWorkspace.ts` — connection status, connect/disconnect, per-service fetch helpers
- `src/components/Google/ConnectedAppsCard.tsx` — Settings tab UI card
- `src/components/Google/TodayScheduleWidget.tsx` — Monitor view calendar widget
- `src/components/Google/TasksPanel.tsx` — History entry notes/tasks panel
- `src/components/Google/DriveFileBrowser.tsx` — Documents view Drive tab
- `src/components/Google/GmailThreads.tsx` — Pre-call brief email section
- `src/pages/AuthGoogleCallback.tsx` — handles /auth/google/callback redirect

### Modified Files
- `src/App.tsx` — add `/auth/google/callback` route
- `src/components/DashboardViews/SettingsView.tsx` — add `'connected-apps'` tab
- `src/components/DashboardViews/MonitorView.tsx` — add TodayScheduleWidget at top
- `src/components/DashboardViews/DocumentsView.tsx` — add Google Drive tab
- `src/components/DashboardViews/AnalyticsView.tsx` — add Meetings KPI card

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/add_google_workspace.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/add_google_workspace.sql

-- Enable pgcrypto for AES-256 encryption of tokens
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Temp table for OAuth CSRF state (one-time use, auto-expires)
CREATE TABLE IF NOT EXISTS google_oauth_states (
  state      text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- OAuth tokens per user (one row per user)
CREATE TABLE IF NOT EXISTS google_tokens (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token  text NOT NULL,   -- AES-256 encrypted
  refresh_token text NOT NULL,   -- AES-256 encrypted
  expiry_at     timestamptz NOT NULL,
  scopes        text[] NOT NULL DEFAULT '{}',
  google_email  text,            -- Google account email for display
  avatar_url    text,
  connected_at  timestamptz NOT NULL DEFAULT now()
);

-- Cached Calendar events (synced on demand, stale after 5 min)
CREATE TABLE IF NOT EXISTS google_calendar_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id    text NOT NULL,
  title       text,
  description text,
  start_at    timestamptz,
  end_at      timestamptz,
  attendees   jsonb NOT NULL DEFAULT '[]',
  meet_link   text,
  calendar_id text NOT NULL DEFAULT 'primary',
  synced_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Tasks used as notes (optionally linked to call history entries)
CREATE TABLE IF NOT EXISTS google_tasks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_list_id      text NOT NULL,
  task_id           text NOT NULL,
  title             text,
  notes             text,
  due_at            timestamptz,
  completed         boolean NOT NULL DEFAULT false,
  linked_history_id text,        -- call_history.id this note is attached to
  synced_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Drive files surfaced in Documents view
CREATE TABLE IF NOT EXISTS google_drive_files (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id       text NOT NULL,
  name          text,
  mime_type     text,
  web_view_link text,
  modified_at   timestamptz,
  synced_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, file_id)
);

-- RLS: every table locked to the owning user
ALTER TABLE google_oauth_states    ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_tokens          ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_files     ENABLE ROW LEVEL SECURITY;

-- google_oauth_states: service role only (no user-facing RLS needed)
CREATE POLICY "service_only_oauth_states" ON google_oauth_states
  FOR ALL USING (false);  -- edge functions use service role key, bypassing RLS

CREATE POLICY "own_tokens"   ON google_tokens          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_calendar" ON google_calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_tasks"    ON google_tasks           FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_drive"    ON google_drive_files     FOR ALL USING (auth.uid() = user_id);

-- Index for fast task lookup by linked history entry
CREATE INDEX IF NOT EXISTS google_tasks_history_idx
  ON google_tasks(user_id, linked_history_id)
  WHERE linked_history_id IS NOT NULL;

-- Auto-clean expired OAuth states (runs via pg_cron or next startup)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM google_oauth_states WHERE expires_at < now();
$$;
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use the MCP tool `apply_migration` with the SQL above, or run:
```bash
supabase db push
```
Expected: migration applies cleanly, 5 new tables visible in Supabase dashboard.

- [ ] **Step 3: Set required Supabase secrets**

In Supabase dashboard → Settings → Edge Function Secrets, add:
```
GOOGLE_CLIENT_ID       = <from Google Cloud Console OAuth 2.0 client>
GOOGLE_CLIENT_SECRET   = <from Google Cloud Console OAuth 2.0 client>
GOOGLE_TOKEN_ENC_KEY   = <random 32-char string, e.g. openssl rand -hex 16>
SITE_URL               = https://clerktree.com   (or your dev URL)
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/add_google_workspace.sql
git commit -m "feat: add google workspace DB tables and RLS"
```

---

## Task 2: Shared Google Client Helper

**Files:**
- Create: `supabase/functions/_shared/google-client.ts`

`★ Insight ─────────────────────────────────────`
The shared helper pattern used in this codebase (see `_shared/notify.ts`) is Deno's equivalent of an internal library. Because Deno resolves imports by URL/path and edge functions are isolated, this shared file gets copied into each function's bundle at deploy time — not shared at runtime.
`─────────────────────────────────────────────────`

- [ ] **Step 1: Write the shared google-client helper**

```typescript
// supabase/functions/_shared/google-client.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiryAt: Date;
  userId: string;
}

const ENC_KEY = () => Deno.env.get("GOOGLE_TOKEN_ENC_KEY") ?? "";
const CLIENT_ID = () => Deno.env.get("GOOGLE_CLIENT_ID") ?? "";
const CLIENT_SECRET = () => Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "";

// AES-256-CBC encrypt via pgcrypto — we store/retrieve via SQL, not JS crypto.
// These helpers just wrap the DB encrypt/decrypt calls.

export async function loadTokens(
  userId: string,
  admin: SupabaseClient,
): Promise<GoogleTokens | null> {
  // Use pgp_sym_decrypt to decrypt tokens stored by pgp_sym_encrypt
  const { data, error } = await admin.rpc("get_google_tokens", {
    p_user_id: userId,
  });
  if (error || !data) return null;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiryAt: new Date(data.expiry_at),
    userId,
  };
}

export async function storeTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiryAt: Date,
  scopes: string[],
  googleEmail: string,
  avatarUrl: string,
  admin: SupabaseClient,
): Promise<void> {
  const { error } = await admin.rpc("upsert_google_tokens", {
    p_user_id: userId,
    p_access_token: accessToken,
    p_refresh_token: refreshToken,
    p_expiry_at: expiryAt.toISOString(),
    p_scopes: scopes,
    p_google_email: googleEmail,
    p_avatar_url: avatarUrl,
  });
  if (error) throw new Error(`Failed to store tokens: ${error.message}`);
}

export async function refreshIfExpired(
  tokens: GoogleTokens,
  admin: SupabaseClient,
): Promise<GoogleTokens> {
  // Give a 60-second buffer before actual expiry
  if (tokens.expiryAt.getTime() - Date.now() > 60_000) return tokens;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID(),
      client_secret: CLIENT_SECRET(),
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Token refresh failed: ${json.error}`);

  const newTokens: GoogleTokens = {
    accessToken: json.access_token,
    refreshToken: tokens.refreshToken, // refresh_token not always returned
    expiryAt: new Date(Date.now() + json.expires_in * 1000),
    userId: tokens.userId,
  };

  // Update in DB
  await admin.rpc("update_google_access_token", {
    p_user_id: tokens.userId,
    p_access_token: newTokens.accessToken,
    p_expiry_at: newTokens.expiryAt.toISOString(),
  });

  return newTokens;
}

export async function googleFetch(
  url: string,
  tokens: GoogleTokens,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

// Build the standard CORS + json helpers (same pattern as api-history)
export const CORS_HEADERS = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

export function jsonResponse(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
```

- [ ] **Step 2: Add the pgcrypto SQL helper functions to the migration**

Append this to `supabase/migrations/add_google_workspace.sql` (or create a second migration `add_google_token_helpers.sql`):

```sql
-- Helper RPC functions used by the google-client shared helper.
-- These run with SECURITY DEFINER so edge functions (service role) can call them.

CREATE OR REPLACE FUNCTION get_google_tokens(p_user_id uuid)
RETURNS TABLE(access_token text, refresh_token text, expiry_at timestamptz)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    pgp_sym_decrypt(access_token::bytea,  current_setting('app.google_enc_key')) AS access_token,
    pgp_sym_decrypt(refresh_token::bytea, current_setting('app.google_enc_key')) AS refresh_token,
    expiry_at
  FROM google_tokens
  WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION upsert_google_tokens(
  p_user_id     uuid,
  p_access_token  text,
  p_refresh_token text,
  p_expiry_at   timestamptz,
  p_scopes      text[],
  p_google_email text,
  p_avatar_url  text
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO google_tokens(user_id, access_token, refresh_token, expiry_at, scopes, google_email, avatar_url)
  VALUES (
    p_user_id,
    pgp_sym_encrypt(p_access_token,  current_setting('app.google_enc_key'))::text,
    pgp_sym_encrypt(p_refresh_token, current_setting('app.google_enc_key'))::text,
    p_expiry_at,
    p_scopes,
    p_google_email,
    p_avatar_url
  )
  ON CONFLICT (user_id) DO UPDATE SET
    access_token  = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    expiry_at     = EXCLUDED.expiry_at,
    scopes        = EXCLUDED.scopes,
    google_email  = EXCLUDED.google_email,
    avatar_url    = EXCLUDED.avatar_url;
$$;

CREATE OR REPLACE FUNCTION update_google_access_token(
  p_user_id     uuid,
  p_access_token text,
  p_expiry_at   timestamptz
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE google_tokens
  SET access_token = pgp_sym_encrypt(p_access_token, current_setting('app.google_enc_key'))::text,
      expiry_at    = p_expiry_at
  WHERE user_id = p_user_id;
$$;

-- Set the encryption key as a DB setting (loaded from environment at runtime)
-- In production: set via ALTER DATABASE ... SET app.google_enc_key = '...';
-- or use Supabase Vault. For dev, set it manually:
-- ALTER DATABASE postgres SET app.google_enc_key = 'your-32-char-key';
```

- [ ] **Step 3: Apply the helper functions migration and commit**

```bash
git add supabase/migrations/add_google_workspace.sql supabase/functions/_shared/google-client.ts
git commit -m "feat: add google client shared helper and DB token functions"
```

---

## Task 3: google-oauth-init Edge Function

**Files:**
- Create: `supabase/functions/google-oauth-init/index.ts`

- [ ] **Step 1: Write the function**

```typescript
// supabase/functions/google-oauth-init/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { CORS_HEADERS, jsonResponse } from "../_shared/google-client.ts";

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
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed" });

  try {
    const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
    const anonKey      = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const clientId     = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const siteUrl      = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

    // Authenticate caller
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse(401, { error: "Unauthorized" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return jsonResponse(401, { error: "Unauthorized" });

    const admin = createClient(supabaseUrl, serviceKey);

    // Generate a cryptographically random state token (CSRF protection)
    const stateBytes = new Uint8Array(24);
    crypto.getRandomValues(stateBytes);
    const state = btoa(String.fromCharCode(...stateBytes))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

    // Store state in DB (expires in 10 min — enforced by DB default)
    const { error: stateErr } = await admin
      .from("google_oauth_states")
      .insert({ state, user_id: user.id });
    if (stateErr) throw stateErr;

    // Clean up expired states opportunistically
    await admin.rpc("cleanup_expired_oauth_states").catch(() => {});

    const redirectUri = `${siteUrl}/auth/google/callback`;

    const params = new URLSearchParams({
      client_id:     clientId,
      redirect_uri:  redirectUri,
      response_type: "code",
      scope:         SCOPES,
      access_type:   "offline",
      prompt:        "consent",   // always get refresh_token
      state,
    });

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    return jsonResponse(200, { url: oauthUrl });

  } catch (err) {
    console.error("[google-oauth-init]", err);
    return jsonResponse(500, { error: "Internal server error" });
  }
});
```

- [ ] **Step 2: Verify manually with curl (after deploy)**

```bash
# Get a valid JWT first from your Supabase session
curl -X POST https://<project>.supabase.co/functions/v1/google-oauth-init \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json"
# Expected: { "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/google-oauth-init/
git commit -m "feat: add google-oauth-init edge function"
```

---

## Task 4: google-oauth-callback Edge Function

**Files:**
- Create: `supabase/functions/google-oauth-callback/index.ts`

`★ Insight ─────────────────────────────────────`
This function is unusual compared to the other edge functions: it's called by a browser redirect from Google, not by the frontend with a JWT. So it can't use `auth.getUser()` — it recovers the user identity from the state parameter stored in DB during Task 3. This one-time-use state pattern is the standard OAuth CSRF defense.
`─────────────────────────────────────────────────`

- [ ] **Step 1: Write the function**

```typescript
// supabase/functions/google-oauth-callback/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { storeTokens } from "../_shared/google-client.ts";

Deno.serve(async (req: Request) => {
  // This is a browser redirect — always GET, no CORS needed
  const url       = new URL(req.url);
  const code      = url.searchParams.get("code");
  const state     = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const clientId    = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
  const siteUrl     = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

  const admin = createClient(supabaseUrl, serviceKey);

  const redirectToSettings = (err?: string) => {
    const dest = err
      ? `${siteUrl}/dashboard?tab=settings&google_error=${encodeURIComponent(err)}`
      : `${siteUrl}/dashboard?tab=settings&google_connected=1`;
    return Response.redirect(dest, 302);
  };

  if (errorParam) return redirectToSettings(errorParam);
  if (!code || !state) return redirectToSettings("missing_params");

  // Validate state (CSRF check + recover user_id)
  const { data: stateRow, error: stateErr } = await admin
    .from("google_oauth_states")
    .select("user_id, expires_at")
    .eq("state", state)
    .single();

  if (stateErr || !stateRow) return redirectToSettings("invalid_state");
  if (new Date(stateRow.expires_at) < new Date()) {
    await admin.from("google_oauth_states").delete().eq("state", state);
    return redirectToSettings("state_expired");
  }

  // Consume state (one-time use)
  await admin.from("google_oauth_states").delete().eq("state", state);

  const redirectUri = `${siteUrl}/auth/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  redirectUri,
      grant_type:    "authorization_code",
    }),
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) return redirectToSettings("token_exchange_failed");

  // Fetch Google profile (email + avatar)
  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokenJson.access_token}` } },
  );
  const profile = profileRes.ok ? await profileRes.json() : {};

  const scopes = (tokenJson.scope ?? "").split(" ").filter(Boolean);
  const expiryAt = new Date(Date.now() + (tokenJson.expires_in ?? 3600) * 1000);

  try {
    await storeTokens(
      stateRow.user_id,
      tokenJson.access_token,
      tokenJson.refresh_token ?? "",
      expiryAt,
      scopes,
      profile.email ?? "",
      profile.picture ?? "",
      admin,
    );
  } catch (err) {
    console.error("[google-oauth-callback] store failed:", err);
    return redirectToSettings("store_failed");
  }

  return redirectToSettings();
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/google-oauth-callback/
git commit -m "feat: add google-oauth-callback edge function"
```

---

## Task 5: google-oauth-disconnect Edge Function

**Files:**
- Create: `supabase/functions/google-oauth-disconnect/index.ts`

- [ ] **Step 1: Write the function**

```typescript
// supabase/functions/google-oauth-disconnect/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { loadTokens, refreshIfExpired, CORS_HEADERS, jsonResponse } from "../_shared/google-client.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed" });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse(401, { error: "Unauthorized" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return jsonResponse(401, { error: "Unauthorized" });

    const admin = createClient(supabaseUrl, serviceKey);

    // Load and revoke the token with Google (best-effort — don't fail if gone)
    const tokens = await loadTokens(user.id, admin);
    if (tokens) {
      const fresh = await refreshIfExpired(tokens, admin).catch(() => tokens);
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${fresh.accessToken}`,
        { method: "POST" },
      ).catch(() => {});
    }

    // Delete all cached Google data for this user
    await Promise.all([
      admin.from("google_tokens").delete().eq("user_id", user.id),
      admin.from("google_calendar_events").delete().eq("user_id", user.id),
      admin.from("google_tasks").delete().eq("user_id", user.id),
      admin.from("google_drive_files").delete().eq("user_id", user.id),
    ]);

    return jsonResponse(200, { success: true });
  } catch (err) {
    console.error("[google-oauth-disconnect]", err);
    return jsonResponse(500, { error: "Internal server error" });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/google-oauth-disconnect/
git commit -m "feat: add google-oauth-disconnect edge function"
```

---

## Task 6: google-calendar Edge Function

**Files:**
- Create: `supabase/functions/google-calendar/index.ts`

- [ ] **Step 1: Write the function**

```typescript
// supabase/functions/google-calendar/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  loadTokens, refreshIfExpired, googleFetch,
  CORS_HEADERS, jsonResponse,
} from "../_shared/google-client.ts";

const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse(401, { error: "Unauthorized" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return jsonResponse(401, { error: "Unauthorized" });

    const admin = createClient(supabaseUrl, serviceKey);

    const tokens = await loadTokens(user.id, admin);
    if (!tokens) return jsonResponse(403, { error: "Google not connected" });
    const fresh = await refreshIfExpired(tokens, admin);

    const url = new URL(req.url);

    // ━━━ GET: list events ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "GET") {
      const start      = url.searchParams.get("start") ?? new Date().toISOString();
      const end        = url.searchParams.get("end")   ?? new Date(Date.now() + 7 * 86400_000).toISOString();
      const maxResults = url.searchParams.get("maxResults") ?? "25";

      // Check cache freshness (5 min)
      const { data: cached } = await admin
        .from("google_calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_at", start)
        .lte("start_at", end)
        .order("start_at");

      const cacheAge = cached?.length
        ? Date.now() - new Date(cached[0].synced_at).getTime()
        : Infinity;

      if (cacheAge < 5 * 60_000) {
        return jsonResponse(200, { events: cached, source: "cache" });
      }

      // Fetch from Google
      const params = new URLSearchParams({
        timeMin:    start,
        timeMax:    end,
        maxResults,
        singleEvents: "true",
        orderBy:    "startTime",
      });
      const gRes = await googleFetch(`${CALENDAR_BASE}/calendars/primary/events?${params}`, fresh);
      if (!gRes.ok) {
        if (gRes.status === 401) return jsonResponse(403, { error: "reconnect_required" });
        throw new Error(`Google API ${gRes.status}`);
      }
      const gData = await gRes.json();
      const events = (gData.items ?? []).map((e: Record<string, unknown>) => ({
        user_id:     user.id,
        event_id:    e.id,
        title:       e.summary ?? "",
        description: e.description ?? "",
        start_at:    (e.start as Record<string, string>)?.dateTime ?? (e.start as Record<string, string>)?.date,
        end_at:      (e.end   as Record<string, string>)?.dateTime ?? (e.end   as Record<string, string>)?.date,
        attendees:   e.attendees ?? [],
        meet_link:   (e.conferenceData as Record<string, unknown>)?.entryPoints
          ? ((e.conferenceData as Record<string, unknown>).entryPoints as Record<string, string>[])[0]?.uri ?? null
          : null,
        calendar_id: "primary",
        synced_at:   new Date().toISOString(),
      }));

      // Upsert cache
      if (events.length > 0) {
        await admin.from("google_calendar_events")
          .upsert(events, { onConflict: "user_id,event_id" });
      }

      return jsonResponse(200, { events, source: "google" });
    }

    // ━━━ POST: create event ━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "POST") {
      const body = await req.json();
      const eventBody = {
        summary:     body.title,
        description: body.description ?? "",
        start:       { dateTime: body.start, timeZone: body.timeZone ?? "UTC" },
        end:         { dateTime: body.end,   timeZone: body.timeZone ?? "UTC" },
        attendees:   (body.attendees ?? []).map((email: string) => ({ email })),
        conferenceData: body.addMeet ? { createRequest: { requestId: crypto.randomUUID() } } : undefined,
      };
      const gRes = await googleFetch(
        `${CALENDAR_BASE}/calendars/primary/events?conferenceDataVersion=1`,
        fresh,
        { method: "POST", body: JSON.stringify(eventBody) },
      );
      if (!gRes.ok) throw new Error(`Google API ${gRes.status}`);
      const created = await gRes.json();
      return jsonResponse(201, { event: created });
    }

    // ━━━ DELETE: remove event ━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "DELETE") {
      const eventId = url.searchParams.get("eventId");
      if (!eventId) return jsonResponse(400, { error: "Missing eventId" });
      const gRes = await googleFetch(
        `${CALENDAR_BASE}/calendars/primary/events/${eventId}`,
        fresh,
        { method: "DELETE" },
      );
      if (!gRes.ok && gRes.status !== 410) throw new Error(`Google API ${gRes.status}`);
      await admin.from("google_calendar_events")
        .delete().eq("user_id", user.id).eq("event_id", eventId);
      return jsonResponse(200, { success: true });
    }

    return jsonResponse(404, { error: "Not found" });
  } catch (err) {
    console.error("[google-calendar]", err);
    return jsonResponse(500, { error: "Internal server error" });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/google-calendar/
git commit -m "feat: add google-calendar edge function"
```

---

## Task 7: google-tasks Edge Function

**Files:**
- Create: `supabase/functions/google-tasks/index.ts`

- [ ] **Step 1: Write the function**

```typescript
// supabase/functions/google-tasks/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  loadTokens, refreshIfExpired, googleFetch,
  CORS_HEADERS, jsonResponse,
} from "../_shared/google-client.ts";

const TASKS_BASE = "https://tasks.googleapis.com/tasks/v1";
const CLERKTREE_LIST_TITLE = "ClerkTree Notes";

async function ensureTaskList(tokens: Awaited<ReturnType<typeof refreshIfExpired>>): Promise<string> {
  // Find or create the ClerkTree Notes task list
  const listsRes = await googleFetch(`${TASKS_BASE}/users/@me/lists`, tokens);
  const lists = listsRes.ok ? (await listsRes.json()).items ?? [] : [];
  const existing = lists.find((l: { title: string; id: string }) => l.title === CLERKTREE_LIST_TITLE);
  if (existing) return existing.id;

  const createRes = await googleFetch(`${TASKS_BASE}/users/@me/lists`, tokens, {
    method: "POST",
    body: JSON.stringify({ title: CLERKTREE_LIST_TITLE }),
  });
  const created = await createRes.json();
  return created.id;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse(401, { error: "Unauthorized" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return jsonResponse(401, { error: "Unauthorized" });

    const admin  = createClient(supabaseUrl, serviceKey);
    const tokens = await loadTokens(user.id, admin);
    if (!tokens) return jsonResponse(403, { error: "Google not connected" });
    const fresh = await refreshIfExpired(tokens, admin);

    const url = new URL(req.url);

    // ━━━ GET: list tasks (optionally filtered by historyId) ━━━
    if (req.method === "GET") {
      const historyId = url.searchParams.get("historyId");
      let query = admin.from("google_tasks").select("*").eq("user_id", user.id);
      if (historyId) query = query.eq("linked_history_id", historyId);
      const { data: tasks } = await query.order("synced_at", { ascending: false });
      return jsonResponse(200, { tasks: tasks ?? [] });
    }

    // ━━━ POST: create task ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "POST") {
      const body       = await req.json();
      const listId     = await ensureTaskList(fresh);
      const taskBody = {
        title: body.title ?? "Untitled Note",
        notes: body.notes ?? "",
        due:   body.due ? new Date(body.due).toISOString() : undefined,
        status: "needsAction",
      };
      const gRes = await googleFetch(`${TASKS_BASE}/lists/${listId}/tasks`, fresh, {
        method: "POST",
        body: JSON.stringify(taskBody),
      });
      if (!gRes.ok) throw new Error(`Google Tasks API ${gRes.status}`);
      const created = await gRes.json();

      const { data: row } = await admin.from("google_tasks").insert({
        user_id:           user.id,
        task_list_id:      listId,
        task_id:           created.id,
        title:             created.title,
        notes:             created.notes ?? "",
        due_at:            created.due ?? null,
        completed:         false,
        linked_history_id: body.linkedHistoryId ?? null,
      }).select().single();

      return jsonResponse(201, { task: row });
    }

    // ━━━ PATCH: update/complete task ━━━━━━━━━━━━━━━━━━━
    if (req.method === "PATCH") {
      const body   = await req.json();
      const taskId = url.searchParams.get("taskId");
      if (!taskId) return jsonResponse(400, { error: "Missing taskId" });

      const { data: existing } = await admin.from("google_tasks")
        .select("task_list_id").eq("user_id", user.id).eq("task_id", taskId).single();
      if (!existing) return jsonResponse(404, { error: "Task not found" });

      const patchBody: Record<string, unknown> = {};
      if (body.title     !== undefined) patchBody.title  = body.title;
      if (body.notes     !== undefined) patchBody.notes  = body.notes;
      if (body.completed !== undefined) patchBody.status = body.completed ? "completed" : "needsAction";

      await googleFetch(
        `${TASKS_BASE}/lists/${existing.task_list_id}/tasks/${taskId}`,
        fresh,
        { method: "PATCH", body: JSON.stringify(patchBody) },
      );

      const dbUpdate: Record<string, unknown> = {};
      if (body.title     !== undefined) dbUpdate.title     = body.title;
      if (body.notes     !== undefined) dbUpdate.notes     = body.notes;
      if (body.completed !== undefined) dbUpdate.completed = body.completed;

      const { data: updated } = await admin.from("google_tasks")
        .update(dbUpdate).eq("user_id", user.id).eq("task_id", taskId)
        .select().single();

      return jsonResponse(200, { task: updated });
    }

    // ━━━ DELETE: remove task ━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (req.method === "DELETE") {
      const taskId = url.searchParams.get("taskId");
      if (!taskId) return jsonResponse(400, { error: "Missing taskId" });

      const { data: existing } = await admin.from("google_tasks")
        .select("task_list_id").eq("user_id", user.id).eq("task_id", taskId).single();
      if (!existing) return jsonResponse(404, { error: "Task not found" });

      await googleFetch(
        `${TASKS_BASE}/lists/${existing.task_list_id}/tasks/${taskId}`,
        fresh,
        { method: "DELETE" },
      );
      await admin.from("google_tasks").delete().eq("user_id", user.id).eq("task_id", taskId);
      return jsonResponse(200, { success: true });
    }

    return jsonResponse(404, { error: "Not found" });
  } catch (err) {
    console.error("[google-tasks]", err);
    return jsonResponse(500, { error: "Internal server error" });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/google-tasks/
git commit -m "feat: add google-tasks edge function"
```

---

## Task 8: google-drive Edge Function

**Files:**
- Create: `supabase/functions/google-drive/index.ts`

- [ ] **Step 1: Write the function**

```typescript
// supabase/functions/google-drive/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  loadTokens, refreshIfExpired, googleFetch,
  CORS_HEADERS, jsonResponse,
} from "../_shared/google-client.ts";

const DRIVE_BASE = "https://www.googleapis.com/drive/v3";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "GET") return jsonResponse(405, { error: "Method not allowed" });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse(401, { error: "Unauthorized" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return jsonResponse(401, { error: "Unauthorized" });

    const admin  = createClient(supabaseUrl, serviceKey);
    const tokens = await loadTokens(user.id, admin);
    if (!tokens) return jsonResponse(403, { error: "Google not connected" });
    const fresh = await refreshIfExpired(tokens, admin);

    const url        = new URL(req.url);
    const query      = url.searchParams.get("query") ?? "";
    const pageToken  = url.searchParams.get("pageToken") ?? "";
    const mimeType   = url.searchParams.get("mimeType") ?? "";

    // Build Drive files.list query
    const qParts = ["trashed = false"];
    if (query)    qParts.push(`name contains '${query.replace(/'/g, "\\'")}'`);
    if (mimeType) qParts.push(`mimeType = '${mimeType}'`);

    const params = new URLSearchParams({
      q:        qParts.join(" and "),
      fields:   "nextPageToken,files(id,name,mimeType,webViewLink,modifiedTime)",
      pageSize: "30",
      orderBy:  "modifiedTime desc",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const gRes = await googleFetch(`${DRIVE_BASE}/files?${params}`, fresh);
    if (!gRes.ok) {
      if (gRes.status === 401) return jsonResponse(403, { error: "reconnect_required" });
      throw new Error(`Google Drive API ${gRes.status}`);
    }
    const gData = await gRes.json();

    // Upsert to cache (only current page)
    const files = (gData.files ?? []).map((f: Record<string, string>) => ({
      user_id:       user.id,
      file_id:       f.id,
      name:          f.name,
      mime_type:     f.mimeType,
      web_view_link: f.webViewLink,
      modified_at:   f.modifiedTime,
      synced_at:     new Date().toISOString(),
    }));
    if (files.length > 0) {
      await admin.from("google_drive_files")
        .upsert(files, { onConflict: "user_id,file_id" });
    }

    return jsonResponse(200, {
      files,
      nextPageToken: gData.nextPageToken ?? null,
    });
  } catch (err) {
    console.error("[google-drive]", err);
    return jsonResponse(500, { error: "Internal server error" });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/google-drive/
git commit -m "feat: add google-drive edge function"
```

---

## Task 9: google-gmail Edge Function

**Files:**
- Create: `supabase/functions/google-gmail/index.ts`

- [ ] **Step 1: Write the function**

```typescript
// supabase/functions/google-gmail/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  loadTokens, refreshIfExpired, googleFetch,
  CORS_HEADERS, jsonResponse,
} from "../_shared/google-client.ts";

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "GET") return jsonResponse(405, { error: "Method not allowed" });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse(401, { error: "Unauthorized" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return jsonResponse(401, { error: "Unauthorized" });

    const admin  = createClient(supabaseUrl, serviceKey);
    const tokens = await loadTokens(user.id, admin);
    if (!tokens) return jsonResponse(403, { error: "Google not connected" });
    const fresh = await refreshIfExpired(tokens, admin);

    const url        = new URL(req.url);
    const email      = url.searchParams.get("email");
    const maxResults = url.searchParams.get("maxResults") ?? "5";

    if (!email) return jsonResponse(400, { error: "Missing email param" });

    // List threads matching this contact's email
    const params = new URLSearchParams({
      q:          `from:${email} OR to:${email}`,
      maxResults,
      labelIds:   "INBOX",
    });
    const listRes = await googleFetch(`${GMAIL_BASE}/threads?${params}`, fresh);
    if (!listRes.ok) {
      if (listRes.status === 401) return jsonResponse(403, { error: "reconnect_required" });
      throw new Error(`Gmail API ${listRes.status}`);
    }
    const listData = await listRes.json();
    const threads = listData.threads ?? [];

    // Fetch snippet for each thread (metadata only — no body)
    const threadDetails = await Promise.all(
      threads.map(async (t: { id: string }) => {
        const tRes = await googleFetch(
          `${GMAIL_BASE}/threads/${t.id}?format=metadata&metadataHeaders=Subject,From,To,Date`,
          fresh,
        );
        if (!tRes.ok) return null;
        const tData = await tRes.json();
        const msg   = tData.messages?.[0];
        const headers: Record<string, string> = {};
        for (const h of (msg?.payload?.headers ?? [])) {
          headers[h.name.toLowerCase()] = h.value;
        }
        return {
          id:       t.id,
          subject:  headers.subject ?? "(no subject)",
          from:     headers.from    ?? "",
          to:       headers.to      ?? "",
          date:     headers.date    ?? "",
          snippet:  tData.snippet   ?? "",
        };
      }),
    );

    return jsonResponse(200, {
      threads: threadDetails.filter(Boolean),
    });
  } catch (err) {
    console.error("[google-gmail]", err);
    return jsonResponse(500, { error: "Internal server error" });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/google-gmail/
git commit -m "feat: add google-gmail edge function"
```

---

## Task 10: Google Callback Page + Route

**Files:**
- Create: `src/pages/AuthGoogleCallback.tsx`
- Modify: `src/App.tsx` (add route + lazy import)

- [ ] **Step 1: Create the callback page**

```tsx
// src/pages/AuthGoogleCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthGoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The google-oauth-callback edge function handles the actual token exchange
    // and redirects here (or directly to dashboard). This page is the redirect_uri
    // registered in Google Cloud Console: /auth/google/callback
    //
    // The edge function redirects to /dashboard?tab=settings&google_connected=1
    // or /dashboard?tab=settings&google_error=<reason>.
    // So this page should rarely be shown — it's only hit if the user lands here
    // directly (e.g., bookmarked) or if the edge function redirect fails.

    const googleConnected = searchParams.get('google_connected');
    const googleError     = searchParams.get('google_error');

    if (googleConnected) {
      navigate('/dashboard?tab=settings&google_connected=1', { replace: true });
      return;
    }
    if (googleError) {
      setError(decodeURIComponent(googleError));
      setTimeout(() => navigate('/dashboard?tab=settings', { replace: true }), 3000);
      return;
    }

    // No params — just redirect to dashboard settings
    navigate('/dashboard?tab=settings', { replace: true });
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 text-sm">Google connection failed: {error}</p>
          <p className="text-white/40 text-xs">Redirecting back…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Connecting Google Workspace…</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the route to App.tsx**

In `src/App.tsx`, after the existing `AuthCallback` lazy import line (line ~39):

```tsx
const AuthGoogleCallback = lazyWithRetry(() => import('./pages/AuthGoogleCallback'), 'AuthGoogleCallback');
```

And after the existing `/auth/callback` route (line ~78):

```tsx
<Route path="/auth/google/callback" element={<AuthGoogleCallback />} />
```

- [ ] **Step 3: Write a vitest smoke test**

```typescript
// src/pages/AuthGoogleCallback.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthGoogleCallback from './AuthGoogleCallback';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('AuthGoogleCallback', () => {
  it('shows connecting spinner when no params', () => {
    render(
      <MemoryRouter initialEntries={['/auth/google/callback']}>
        <Routes>
          <Route path="/auth/google/callback" element={<AuthGoogleCallback />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Connecting Google Workspace/i)).toBeTruthy();
  });

  it('shows error message on google_error param', () => {
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?google_error=token_exchange_failed']}>
        <Routes>
          <Route path="/auth/google/callback" element={<AuthGoogleCallback />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/token_exchange_failed/i)).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run the test**

```bash
npx vitest run src/pages/AuthGoogleCallback.test.tsx
```
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AuthGoogleCallback.tsx src/pages/AuthGoogleCallback.test.tsx src/App.tsx
git commit -m "feat: add Google OAuth callback page and route"
```

---

## Task 11: useGoogleWorkspace Hook

**Files:**
- Create: `src/hooks/useGoogleWorkspace.ts`

`★ Insight ─────────────────────────────────────`
This hook acts as the single gateway between the frontend and all 7 Google edge functions. By centralizing the `supabase.auth.getSession()` call and the edge function base URL here, every component avoids repeating that boilerplate — the same pattern used in `SettingsView.tsx`'s `apiCall` callback but promoted to a reusable hook.
`─────────────────────────────────────────────────`

- [ ] **Step 1: Write the hook**

```typescript
// src/hooks/useGoogleWorkspace.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export interface GoogleConnectionInfo {
  connected: boolean;
  googleEmail: string | null;
  avatarUrl: string | null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('No session');
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

async function googleApiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = await authHeaders();
  return fetch(`${FN_BASE}/${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });
}

export function useGoogleWorkspace() {
  const [connection, setConnection] = useState<GoogleConnectionInfo>({
    connected: false,
    googleEmail: null,
    avatarUrl: null,
  });
  const [loading, setLoading] = useState(true);
  const [reconnectRequired, setReconnectRequired] = useState(false);

  // Check if Google is connected by looking for token metadata in DB
  const checkConnection = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data } = await supabase
        .from('google_tokens')
        .select('google_email, avatar_url')
        .eq('user_id', session.user.id)
        .maybeSingle();

      setConnection({
        connected: !!data,
        googleEmail: data?.google_email ?? null,
        avatarUrl: data?.avatar_url ?? null,
      });
    } catch {
      // ignore — not connected
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkConnection(); }, [checkConnection]);

  const connect = useCallback(async () => {
    const res = await googleApiFetch('google-oauth-init', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }, []);

  const disconnect = useCallback(async () => {
    await googleApiFetch('google-oauth-disconnect', { method: 'POST' });
    setConnection({ connected: false, googleEmail: null, avatarUrl: null });
    setReconnectRequired(false);
  }, []);

  // Generic fetch helper used by feature components
  const gFetch = useCallback(async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<unknown> => {
    const res = await googleApiFetch(endpoint, options);
    const json = await res.json().catch(() => ({}));
    if (json?.error === 'reconnect_required') {
      setReconnectRequired(true);
      throw new Error('reconnect_required');
    }
    if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status})`);
    return json;
  }, []);

  return {
    connection,
    loading,
    reconnectRequired,
    connect,
    disconnect,
    gFetch,
    refetchConnection: checkConnection,
  };
}
```

- [ ] **Step 2: Write a unit test**

```typescript
// src/hooks/useGoogleWorkspace.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGoogleWorkspace } from './useGoogleWorkspace';

// Mock supabase
vi.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'tok', user: { id: 'uid-1' } } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }),
  },
}));

describe('useGoogleWorkspace', () => {
  it('starts with connected=false when no token row exists', async () => {
    const { result } = renderHook(() => useGoogleWorkspace());
    // Wait for async checkConnection
    await new Promise(r => setTimeout(r, 0));
    expect(result.current.connection.connected).toBe(false);
  });
});
```

- [ ] **Step 3: Run test**

```bash
npx vitest run src/hooks/useGoogleWorkspace.test.ts
```
Expected: 1 test passes.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGoogleWorkspace.ts src/hooks/useGoogleWorkspace.test.ts
git commit -m "feat: add useGoogleWorkspace hook"
```

---

## Task 12: Settings → Connected Apps Tab

**Files:**
- Create: `src/components/Google/ConnectedAppsCard.tsx`
- Modify: `src/components/DashboardViews/SettingsView.tsx`

- [ ] **Step 1: Create ConnectedAppsCard.tsx**

```tsx
// src/components/Google/ConnectedAppsCard.tsx
import { useState } from 'react';
import { Loader2, Link2Off, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

export default function ConnectedAppsCard({ isDark }: { isDark: boolean }) {
  const { connection, loading, reconnectRequired, connect, disconnect } = useGoogleWorkspace();
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    await connect(); // redirects away — connecting stays true
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try { await disconnect(); } finally { setDisconnecting(false); }
  };

  return (
    <div className={cn(
      'rounded-xl border p-5 space-y-4',
      isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-black/10',
    )}>
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Google logo */}
        <div className={cn('p-2 rounded-lg', isDark ? 'bg-white/5' : 'bg-gray-50')}>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>
        <div>
          <h3 className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-gray-900')}>
            Google Workspace
          </h3>
          <p className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-400')}>
            Calendar, Tasks, Gmail, Drive, Contacts
          </p>
        </div>
        {!loading && connection.connected && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Connected
          </span>
        )}
      </div>

      {/* Reconnect banner */}
      {reconnectRequired && (
        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Your Google session expired. Please reconnect to restore access.
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking connection…
        </div>
      ) : connection.connected ? (
        <div className="space-y-3">
          {/* Account info */}
          <div className="flex items-center gap-3">
            {connection.avatarUrl && (
              <img src={connection.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className={cn('text-sm', isDark ? 'text-white/70' : 'text-gray-700')}>
              {connection.googleEmail}
            </span>
          </div>
          {/* Scopes list */}
          <div className="flex flex-wrap gap-1.5">
            {['Calendar', 'Tasks', 'Gmail (read)', 'Drive (read)', 'Contacts'].map(s => (
              <span key={s} className={cn(
                'text-[11px] px-2 py-0.5 rounded-full border',
                isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-50 border-gray-200 text-gray-500',
              )}>{s}</span>
            ))}
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className={cn(
              'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50',
              isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100',
            )}
          >
            {disconnecting
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Link2Off className="w-3 h-3" />}
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className={cn('text-xs leading-relaxed', isDark ? 'text-white/50' : 'text-gray-500')}>
            Connect your Google account to see your calendar in Monitor, attach notes to calls via Tasks, browse Drive files in Documents, and view email history in Pre-Call Brief.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className={cn(
              'flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50',
              isDark
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-black text-white hover:bg-gray-800',
            )}
          >
            {connecting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
            Connect Google Workspace
            {!connecting && <ExternalLink className="w-3 h-3 opacity-50" />}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add the 'connected-apps' tab to SettingsView.tsx**

In `src/components/DashboardViews/SettingsView.tsx`, change line 58:

```tsx
// Before:
type SettingsTab = 'profile' | 'notifications' | 'security' | 'data';

// After:
type SettingsTab = 'profile' | 'notifications' | 'security' | 'data' | 'connected-apps';
```

Add import at top of file:
```tsx
import ConnectedAppsCard from '../Google/ConnectedAppsCard';
```

In the tab bar (find the tabs rendering section — look for the `['profile', 'notifications', 'security', 'data']` map or equivalent buttons), add:

```tsx
{ id: 'connected-apps', label: 'Connected Apps' }
```

Add the tab panel (after the `data` tab panel content, before the closing tag):

```tsx
{activeTab === 'connected-apps' && (
  <div className="space-y-6 max-w-xl">
    <div>
      <h3 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
        Connected Apps
      </h3>
      <p className={cn('text-sm mt-1', isDark ? 'text-white/50' : 'text-gray-500')}>
        Manage third-party integrations connected to your account.
      </p>
    </div>
    <ConnectedAppsCard isDark={isDark} />
  </div>
)}
```

Also handle the `?tab=settings&google_connected=1` URL param to auto-switch to the connected-apps tab on redirect. Add this inside the component:

```tsx
// At the top of SettingsView, after existing imports:
import { useSearchParams } from 'react-router-dom';

// Inside the component, after useState declarations:
const [searchParams] = useSearchParams();
useEffect(() => {
  if (searchParams.get('google_connected') === '1') {
    setActiveTab('connected-apps');
  }
}, [searchParams]);
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Google/ConnectedAppsCard.tsx src/components/DashboardViews/SettingsView.tsx
git commit -m "feat: add Connected Apps settings tab with Google Workspace card"
```

---

## Task 13: Monitor View — Today's Schedule Widget

**Files:**
- Create: `src/components/Google/TodayScheduleWidget.tsx`
- Modify: `src/components/DashboardViews/MonitorView.tsx`

- [ ] **Step 1: Create TodayScheduleWidget.tsx**

```tsx
// src/components/Google/TodayScheduleWidget.tsx
import { useState, useEffect, useCallback } from 'react';
import { Calendar, Video, Users, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

interface CalendarEvent {
  id: string;
  event_id: string;
  title: string;
  start_at: string;
  end_at: string;
  attendees: { email: string; displayName?: string }[];
  meet_link: string | null;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TodayScheduleWidget({ isDark }: { isDark: boolean }) {
  const { connection, gFetch } = useGoogleWorkspace();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const fetchTodayEvents = useCallback(async () => {
    if (!connection.connected) return;
    setLoading(true);
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const data = await gFetch(
        `google-calendar?start=${start.toISOString()}&end=${end.toISOString()}&maxResults=10`,
      ) as { events: CalendarEvent[] };
      setEvents(data.events ?? []);
    } catch {
      // silently fail — widget is non-critical
    } finally {
      setLoading(false);
    }
  }, [connection.connected, gFetch]);

  useEffect(() => { fetchTodayEvents(); }, [fetchTodayEvents]);

  if (!connection.connected) return null;

  return (
    <div className={cn(
      'rounded-xl border p-4 mb-6',
      isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-black/10',
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className={cn('w-4 h-4', isDark ? 'text-blue-400' : 'text-blue-500')} />
          <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
            Today's Schedule
          </span>
          {events.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
              {events.length}
            </span>
          )}
        </div>
        <button onClick={() => setExpanded(e => !e)} className={cn('text-xs', isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700')}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        loading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white/40" />
            <span className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-400')}>Loading…</span>
          </div>
        ) : events.length === 0 ? (
          <p className={cn('text-xs py-2', isDark ? 'text-white/30' : 'text-gray-400')}>
            No events scheduled for today.
          </p>
        ) : (
          <div className="space-y-2">
            {events.map(event => (
              <div key={event.event_id} className={cn(
                'flex items-start gap-3 p-2.5 rounded-lg',
                isDark ? 'bg-white/[0.03]' : 'bg-gray-50',
              )}>
                <div className="text-right min-w-[60px]">
                  <div className={cn('text-xs font-medium', isDark ? 'text-white/70' : 'text-gray-700')}>
                    {formatTime(event.start_at)}
                  </div>
                  <div className={cn('text-[10px]', isDark ? 'text-white/30' : 'text-gray-400')}>
                    {formatTime(event.end_at)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium truncate', isDark ? 'text-white' : 'text-gray-900')}>
                    {event.title}
                  </p>
                  {event.attendees.length > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-white/30" />
                      <span className={cn('text-[10px]', isDark ? 'text-white/30' : 'text-gray-400')}>
                        {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                {event.meet_link && (
                  <a
                    href={event.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors shrink-0"
                  >
                    <Video className="w-3 h-3" />
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add widget to MonitorView.tsx**

At the top of `src/components/DashboardViews/MonitorView.tsx`, add import:
```tsx
import TodayScheduleWidget from '../Google/TodayScheduleWidget';
```

Inside the component's return JSX, add `<TodayScheduleWidget isDark={isDark} />` as the first element inside the outermost `<div>` (before the stats cards grid).

- [ ] **Step 3: Commit**

```bash
git add src/components/Google/TodayScheduleWidget.tsx src/components/DashboardViews/MonitorView.tsx
git commit -m "feat: add today's schedule widget to monitor view"
```

---

## Task 14: History View — Tasks/Notes Panel

**Files:**
- Create: `src/components/Google/TasksPanel.tsx`

> Note: Identify where individual history entries are rendered in your History view component (`src/components/DashboardViews/` — check for the component that maps over call history rows). Add `<TasksPanel historyId={entry.id} isDark={isDark} />` at the bottom of each entry card.

- [ ] **Step 1: Create TasksPanel.tsx**

```tsx
// src/components/Google/TasksPanel.tsx
import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Square, Plus, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

interface Task {
  id: string;
  task_id: string;
  title: string;
  notes: string;
  completed: boolean;
  due_at: string | null;
}

export default function TasksPanel({
  historyId,
  isDark,
}: {
  historyId: string;
  isDark: boolean;
}) {
  const { connection, gFetch } = useGoogleWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!connection.connected || !expanded) return;
    setLoading(true);
    try {
      const data = await gFetch(`google-tasks?historyId=${historyId}`) as { tasks: Task[] };
      setTasks(data.tasks ?? []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [connection.connected, expanded, historyId, gFetch]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const data = await gFetch('google-tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, notes: newNotes, linkedHistoryId: historyId }),
      }) as { task: Task };
      setTasks(prev => [data.task, ...prev]);
      setNewTitle('');
      setNewNotes('');
      setShowForm(false);
    } catch { /* silent */ } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const data = await gFetch(`google-tasks?taskId=${task.task_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !task.completed }),
      }) as { task: Task };
      setTasks(prev => prev.map(t => t.task_id === task.task_id ? data.task : t));
    } catch { /* silent */ }
  };

  const deleteTask = async (task: Task) => {
    try {
      await gFetch(`google-tasks?taskId=${task.task_id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.task_id !== task.task_id));
    } catch { /* silent */ }
  };

  if (!connection.connected) return null;

  return (
    <div className={cn('mt-3 border-t pt-3', isDark ? 'border-white/5' : 'border-gray-100')}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={cn(
          'flex items-center gap-2 text-xs font-medium transition-colors',
          isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600',
        )}
      >
        <CheckSquare className="w-3.5 h-3.5" />
        Notes & Tasks {tasks.length > 0 && `(${tasks.length})`}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {loading ? (
            <div className="flex items-center gap-1.5 py-1">
              <Loader2 className="w-3 h-3 animate-spin text-white/30" />
              <span className={cn('text-xs', isDark ? 'text-white/30' : 'text-gray-400')}>Loading…</span>
            </div>
          ) : (
            <>
              {tasks.map(task => (
                <div key={task.task_id} className="flex items-start gap-2 group">
                  <button onClick={() => toggleTask(task)} className="mt-0.5 shrink-0">
                    {task.completed
                      ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      : <Square className={cn('w-3.5 h-3.5', isDark ? 'text-white/30' : 'text-gray-400')} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs',
                      task.completed && 'line-through opacity-50',
                      isDark ? 'text-white/70' : 'text-gray-700',
                    )}>{task.title}</p>
                    {task.notes && (
                      <p className={cn('text-[10px] mt-0.5', isDark ? 'text-white/30' : 'text-gray-400')}>
                        {task.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ))}

              {showForm ? (
                <div className={cn('rounded-lg p-2 space-y-1.5 border', isDark ? 'bg-white/[0.03] border-white/10' : 'bg-gray-50 border-gray-200')}>
                  <input
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Note title…"
                    className={cn(
                      'w-full text-xs bg-transparent outline-none',
                      isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400',
                    )}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                  />
                  <input
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="Details (optional)…"
                    className={cn(
                      'w-full text-xs bg-transparent outline-none',
                      isDark ? 'text-white/60 placeholder-white/20' : 'text-gray-600 placeholder-gray-300',
                    )}
                  />
                  <div className="flex gap-2 pt-0.5">
                    <button
                      onClick={addTask}
                      disabled={adding || !newTitle.trim()}
                      className="text-[10px] px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
                    >
                      {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                    </button>
                    <button
                      onClick={() => { setShowForm(false); setNewTitle(''); setNewNotes(''); }}
                      className={cn('text-[10px] px-2.5 py-1 rounded-md', isDark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] transition-colors',
                    isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600',
                  )}
                >
                  <Plus className="w-3 h-3" />
                  Add note
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Find and modify the history entry card component**

Search for where call history entries are rendered:
```bash
grep -r "call_history\|caller_name\|historyId\|history\.map\|entries\.map" src/components/DashboardViews/ --include="*.tsx" -l
```

Open that file. At the bottom of each history entry card JSX (inside the `.map()` callback), add:
```tsx
import TasksPanel from '../Google/TasksPanel';

// Inside the map, at the bottom of each entry card:
<TasksPanel historyId={entry.id} isDark={isDark} />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Google/TasksPanel.tsx src/components/DashboardViews/  # whichever history file was modified
git commit -m "feat: add notes/tasks panel to history entries"
```

---

## Task 15: Documents View — Google Drive Tab

**Files:**
- Create: `src/components/Google/DriveFileBrowser.tsx`
- Modify: `src/components/DashboardViews/DocumentsView.tsx`

- [ ] **Step 1: Create DriveFileBrowser.tsx**

```tsx
// src/components/Google/DriveFileBrowser.tsx
import { useState, useEffect, useCallback } from 'react';
import { Search, ExternalLink, Loader2, FileText, Image, Table, Presentation, File } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

interface DriveFile {
  file_id: string;
  name: string;
  mime_type: string;
  web_view_link: string;
  modified_at: string;
}

const MIME_ICONS: Record<string, React.ReactNode> = {
  'application/vnd.google-apps.document':     <FileText className="w-4 h-4 text-blue-400" />,
  'application/vnd.google-apps.spreadsheet':  <Table className="w-4 h-4 text-emerald-400" />,
  'application/vnd.google-apps.presentation': <Presentation className="w-4 h-4 text-orange-400" />,
  'image/':                                    <Image className="w-4 h-4 text-purple-400" />,
};

function mimeIcon(mime: string): React.ReactNode {
  for (const [key, icon] of Object.entries(MIME_ICONS)) {
    if (mime.startsWith(key)) return icon;
  }
  return <File className="w-4 h-4 text-white/40" />;
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function DriveFileBrowser({ isDark }: { isDark: boolean }) {
  const { connection, gFetch } = useGoogleWorkspace();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const fetchFiles = useCallback(async (q = '', pageToken = '') => {
    if (!connection.connected) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ query: q });
      if (pageToken) params.set('pageToken', pageToken);
      const data = await gFetch(`google-drive?${params}`) as {
        files: DriveFile[];
        nextPageToken: string | null;
      };
      setFiles(prev => pageToken ? [...prev, ...data.files] : data.files);
      setNextPageToken(data.nextPageToken ?? null);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [connection.connected, gFetch]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFiles([]);
    fetchFiles(query);
  };

  if (!connection.connected) {
    return (
      <div className={cn('py-8 text-center text-sm', isDark ? 'text-white/30' : 'text-gray-400')}>
        Connect Google in Settings → Connected Apps to browse Drive files.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className={cn(
          'flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm',
          isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200',
        )}>
          <Search className={cn('w-4 h-4 shrink-0', isDark ? 'text-white/30' : 'text-gray-400')} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Drive files…"
            className={cn('flex-1 bg-transparent outline-none text-sm', isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400')}
          />
        </div>
        <button type="submit" className={cn(
          'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
          isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black text-white hover:bg-gray-800',
        )}>Search</button>
      </form>

      {loading && files.length === 0 ? (
        <div className="flex items-center gap-2 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-white/40" />
          <span className={cn('text-sm', isDark ? 'text-white/40' : 'text-gray-400')}>Loading Drive files…</span>
        </div>
      ) : files.length === 0 ? (
        <p className={cn('py-4 text-sm text-center', isDark ? 'text-white/30' : 'text-gray-400')}>No files found.</p>
      ) : (
        <>
          <div className="space-y-1.5">
            {files.map(file => (
              <div key={file.file_id} className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-colors group',
                isDark
                  ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                  : 'bg-white border-gray-100 hover:bg-gray-50',
              )}>
                {mimeIcon(file.mime_type)}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', isDark ? 'text-white/80' : 'text-gray-800')}>
                    {file.name}
                  </p>
                  <p className={cn('text-xs', isDark ? 'text-white/30' : 'text-gray-400')}>
                    {relativeDate(file.modified_at)}
                  </p>
                </div>
                <a
                  href={file.web_view_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg',
                    isDark ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
              </div>
            ))}
          </div>
          {nextPageToken && (
            <button
              onClick={() => fetchFiles(query, nextPageToken)}
              disabled={loading}
              className={cn(
                'w-full py-2 text-sm rounded-xl border transition-colors disabled:opacity-50',
                isDark ? 'border-white/10 text-white/50 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50',
              )}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add Google Drive tab to DocumentsView.tsx**

Open `src/components/DashboardViews/DocumentsView.tsx`. Find the tab state and add a `'drive'` tab:

```tsx
// Add import at top:
import DriveFileBrowser from '../Google/DriveFileBrowser';

// Find the existing tab type (e.g. type DocumentTab = 'documents' | ...) and add 'drive':
// type DocumentTab = 'documents' | 'drive';  // (exact existing tabs vary)

// In the tab bar, add a new tab button:
<button
  onClick={() => setActiveTab('drive')}
  className={cn(/* same styles as other tab buttons */,
    activeTab === 'drive' && /* active styles */
  )}
>
  Google Drive
</button>

// In the tab panel area, add:
{activeTab === 'drive' && <DriveFileBrowser isDark={isDark} />}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Google/DriveFileBrowser.tsx src/components/DashboardViews/DocumentsView.tsx
git commit -m "feat: add Google Drive browser to Documents view"
```

---

## Task 16: Pre-Call Brief — Gmail Threads

**Files:**
- Create: `src/components/Google/GmailThreads.tsx`
- Modify: `src/components/DemoCall/PreCallBrief.tsx`

- [ ] **Step 1: Create GmailThreads.tsx**

```tsx
// src/components/Google/GmailThreads.tsx
import { useState, useEffect, useCallback } from 'react';
import { Mail, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

interface EmailThread {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

function formatDate(dateStr: string): string {
  try { return new Date(dateStr).toLocaleDateString(); } catch { return dateStr; }
}

export default function GmailThreads({
  contactEmail,
  isDark,
}: {
  contactEmail: string;
  isDark: boolean;
}) {
  const { connection, gFetch } = useGoogleWorkspace();
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchThreads = useCallback(async () => {
    if (!connection.connected || !contactEmail || !expanded) return;
    setLoading(true);
    try {
      const data = await gFetch(
        `google-gmail?email=${encodeURIComponent(contactEmail)}&maxResults=5`,
      ) as { threads: EmailThread[] };
      setThreads(data.threads ?? []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [connection.connected, contactEmail, expanded, gFetch]);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  if (!connection.connected || !contactEmail) return null;

  return (
    <div className={cn('mt-3 border-t pt-3', isDark ? 'border-white/5' : 'border-gray-100')}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={cn(
          'flex items-center gap-2 text-xs font-medium transition-colors w-full',
          isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600',
        )}
      >
        <Mail className="w-3.5 h-3.5" />
        Recent Emails
        {expanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-white/30" />
              <span className={cn('text-xs', isDark ? 'text-white/30' : 'text-gray-400')}>Loading…</span>
            </div>
          ) : threads.length === 0 ? (
            <p className={cn('text-xs', isDark ? 'text-white/30' : 'text-gray-400')}>
              No recent emails with {contactEmail}.
            </p>
          ) : (
            threads.map(thread => (
              <div key={thread.id} className={cn(
                'p-2.5 rounded-lg border',
                isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100',
              )}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={cn('text-xs font-medium truncate', isDark ? 'text-white/80' : 'text-gray-800')}>
                    {thread.subject}
                  </p>
                  <span className={cn('text-[10px] shrink-0', isDark ? 'text-white/30' : 'text-gray-400')}>
                    {formatDate(thread.date)}
                  </span>
                </div>
                <p className={cn('text-[10px] truncate', isDark ? 'text-white/30' : 'text-gray-500')}>
                  {thread.from}
                </p>
                <p className={cn('text-[10px] mt-1 line-clamp-2', isDark ? 'text-white/40' : 'text-gray-500')}>
                  {thread.snippet}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add GmailThreads to PreCallBrief.tsx**

Open `src/components/DemoCall/PreCallBrief.tsx`. Find where the caller's contact info is rendered and identify the variable holding the caller's email. Add:

```tsx
// Top of file:
import GmailThreads from '../Google/GmailThreads';

// At the bottom of the pre-call brief panel JSX (after the existing sections):
<GmailThreads contactEmail={caller?.email ?? ''} isDark={isDark} />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Google/GmailThreads.tsx src/components/DemoCall/PreCallBrief.tsx
git commit -m "feat: add Gmail thread history to pre-call brief"
```

---

## Task 17: Analytics View — Meetings KPI Card

**Files:**
- Modify: `src/components/DashboardViews/AnalyticsView.tsx`

- [ ] **Step 1: Add the MeetingsKpiCard component inside AnalyticsView.tsx**

```tsx
// Add import at top of AnalyticsView.tsx:
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

// Add this component definition before AnalyticsView's export:
function MeetingsKpiCard({ isDark }: { isDark: boolean }) {
  const { connection, gFetch } = useGoogleWorkspace();
  const [stats, setStats] = useState<{
    total: number;
    avgMinutes: number;
    busiestDay: string;
  } | null>(null);

  useEffect(() => {
    if (!connection.connected) return;
    const start = new Date();
    start.setDate(1); start.setHours(0,0,0,0);
    const end = new Date();
    gFetch(`google-calendar?start=${start.toISOString()}&end=${end.toISOString()}&maxResults=100`)
      .then((data: unknown) => {
        const events = (data as { events: { start_at: string; end_at: string }[] }).events ?? [];
        if (!events.length) { setStats({ total: 0, avgMinutes: 0, busiestDay: '—' }); return; }
        const totalMs = events.reduce((sum, e) =>
          sum + (new Date(e.end_at).getTime() - new Date(e.start_at).getTime()), 0);
        const dayCounts: Record<string, number> = {};
        events.forEach(e => {
          const day = new Date(e.start_at).toLocaleDateString('en-US', { weekday: 'short' });
          dayCounts[day] = (dayCounts[day] ?? 0) + 1;
        });
        const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
        setStats({
          total: events.length,
          avgMinutes: Math.round(totalMs / events.length / 60_000),
          busiestDay,
        });
      }).catch(() => {});
  }, [connection.connected, gFetch]);

  if (!connection.connected || !stats) return null;

  return (
    <div className={cn(
      'p-5 sm:p-8 rounded-2xl border flex flex-col justify-between min-h-[160px] sm:h-[220px] relative overflow-hidden',
      isDark ? 'bg-[#09090B] border-blue-500/20' : 'bg-white border-black/10',
    )}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[80px] opacity-20 pointer-events-none bg-blue-500" />
      <div className="relative z-10">
        <p className={cn('text-sm font-medium mb-1', isDark ? 'text-white/50' : 'text-gray-500')}>
          Meetings This Month
        </p>
        <p className={cn('text-4xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
          {stats.total}
        </p>
      </div>
      <div className="relative z-10 space-y-0.5">
        <p className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-400')}>
          Avg {stats.avgMinutes} min · Busiest: {stats.busiestDay}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add MeetingsKpiCard to the KPI grid**

Inside the `AnalyticsView` component's return JSX, find the grid of KPI cards (the `StatsCard` components). Add `<MeetingsKpiCard isDark={isDark} />` as the next card in the grid.

- [ ] **Step 3: Commit**

```bash
git add src/components/DashboardViews/AnalyticsView.tsx
git commit -m "feat: add meetings KPI card to analytics view"
```

---

## Task 18: Deploy Edge Functions

- [ ] **Step 1: Deploy all 7 new edge functions**

```bash
supabase functions deploy google-oauth-init
supabase functions deploy google-oauth-callback
supabase functions deploy google-oauth-disconnect
supabase functions deploy google-calendar
supabase functions deploy google-tasks
supabase functions deploy google-drive
supabase functions deploy google-gmail
```

Expected: each completes with "Function deployed successfully".

- [ ] **Step 2: Verify secrets are set**

```bash
supabase secrets list
# Expected output includes: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_TOKEN_ENC_KEY, SITE_URL
```

- [ ] **Step 3: Set DB encryption key**

Run this in Supabase SQL editor (replace `your-key` with the same value as `GOOGLE_TOKEN_ENC_KEY`):
```sql
ALTER DATABASE postgres SET app.google_enc_key = 'your-key';
```

- [ ] **Step 4: Add redirect URI to Google Cloud Console**

In Google Cloud Console → `lucid-authority-483307-k7` → APIs & Credentials → OAuth 2.0 Client IDs:
- Add Authorized redirect URI: `https://clerktree.com/auth/google/callback`
- Add (for dev): `http://localhost:5173/auth/google/callback`

- [ ] **Step 5: Enable required Google APIs**

In Google Cloud Console → APIs & Services → Library, enable:
- Google Calendar API
- Tasks API
- Gmail API
- Google Drive API
- People API (for Contacts)

- [ ] **Step 6: End-to-end test**

1. Log in to ClerkTree
2. Go to Settings → Connected Apps
3. Click "Connect Google Workspace"
4. Consent on Google screen
5. Verify redirect back to Settings with "Connected" badge showing your Google email
6. Go to Monitor → verify Today's Schedule widget appears
7. Go to Documents → verify Google Drive tab appears
8. Go to a History entry → verify "Notes & Tasks" section appears
9. Go to Settings → Connected Apps → click Disconnect → verify badge disappears

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: complete Google Workspace integration — calendar, tasks, drive, gmail"
```

---

## Self-Review: Spec Coverage Check

| Spec Section | Covered in Task |
|---|---|
| Auth flow (OAuth init, callback, state CSRF) | Tasks 3, 4 |
| Disconnect + revoke | Task 5 |
| google_tokens encrypted storage | Tasks 1, 2 |
| google_calendar_events cache | Tasks 1, 6 |
| google_tasks (notes) with history link | Tasks 1, 7, 14 |
| google_drive_files cache | Tasks 1, 8, 15 |
| Gmail threads (no cache, always fresh) | Task 9, 16 |
| /auth/google/callback route | Task 10 |
| useGoogleWorkspace hook | Task 11 |
| Settings → Connected Apps tab | Task 12 |
| Monitor → Today's Schedule | Task 13 |
| History → Notes & Tasks panel | Task 14 |
| Documents → Drive tab | Task 15 |
| Pre-Call Brief → Gmail threads | Task 16 |
| Analytics → Meetings KPI | Task 17 |
| Edge function deploy | Task 18 |
| Google Cloud Console setup | Task 18 |
| Error: reconnect_required banner | Task 11 (useGoogleWorkspace) |
| Error: graceful no-connect state | All frontend components |
