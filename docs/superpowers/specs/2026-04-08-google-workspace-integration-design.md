# Google Workspace Integration Design

**Date:** 2026-04-08
**Project:** ClerkTree Frontend
**Google Cloud Project:** `lucid-authority-483307-k7`

---

## Overview

Integrate Google Calendar, Tasks, Gmail, Drive, and Contacts contextually into existing dashboard views. Users explicitly connect Google Workspace via a dedicated OAuth flow (separate from sign-in). All Google API calls are proxied through Supabase Edge Functions — the frontend never holds raw tokens.

---

## Architecture

### Auth Flow

1. User clicks "Connect Google Workspace" in **Settings → Connected Apps** (new tab).
2. Frontend calls `google-oauth-init` Edge Function, which builds a Google OAuth URL with all required scopes and returns it.
3. User is redirected to Google consent screen.
4. Google redirects to `/auth/google/callback` on the site.
5. `google-oauth-callback` Edge Function exchanges the auth code for `access_token` + `refresh_token`, stores them encrypted in `google_tokens` table, then redirects to `/dashboard?tab=settings&section=connected-apps`.
6. On subsequent calls, each Edge Function loads tokens from DB, auto-refreshes if `expiry_at < now()`, and updates the row.
7. Disconnect: `google-oauth-disconnect` revokes the token with Google and deletes the `google_tokens` row.

### OAuth Scopes (one consent screen)

```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/tasks
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/contacts.readonly
```

### Token Security

- `access_token` and `refresh_token` stored encrypted using `pgcrypto` (AES-256) in Supabase.
- Encryption key stored in Supabase Vault / env secret `GOOGLE_TOKEN_ENCRYPTION_KEY`.
- RLS enforces `auth.uid() = user_id` on all google_* tables.
- Tokens never sent to the frontend.

---

## Database — `add_google_workspace.sql`

Includes a temp table for OAuth state CSRF protection:

```sql
-- OAuth tokens per user
CREATE TABLE google_tokens (
  user_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,       -- encrypted
  refresh_token text NOT NULL,      -- encrypted
  expiry_at    timestamptz NOT NULL,
  scopes       text[] NOT NULL,
  email        text,                -- Google account email for display
  avatar_url   text,
  connected_at timestamptz DEFAULT now()
);

-- Cached Calendar events (synced on demand)
CREATE TABLE google_calendar_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id    text NOT NULL,
  title       text,
  description text,
  start_at    timestamptz,
  end_at      timestamptz,
  attendees   jsonb DEFAULT '[]',
  meet_link   text,
  calendar_id text DEFAULT 'primary',
  synced_at   timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Tasks used as notes (linked optionally to history entries)
CREATE TABLE google_tasks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  task_list_id     text NOT NULL,
  task_id          text NOT NULL,
  title            text,
  notes            text,
  due_at           timestamptz,
  completed        boolean DEFAULT false,
  linked_history_id text,           -- history entry ID this note belongs to
  synced_at        timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Drive files surfaced in Documents view
CREATE TABLE google_drive_files (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id       text NOT NULL,
  name          text,
  mime_type     text,
  web_view_link text,
  modified_at   timestamptz,
  synced_at     timestamptz DEFAULT now(),
  UNIQUE(user_id, file_id)
);

-- Temp table for OAuth CSRF state (one-time use, expires in 10 min)
CREATE TABLE google_oauth_states (
  state      text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- RLS
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_tokens" ON google_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_calendar" ON google_calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_tasks" ON google_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_drive" ON google_drive_files FOR ALL USING (auth.uid() = user_id);
```

---

## Edge Functions (7 new)

### Shared helper: `supabase/functions/_shared/google-client.ts`

Exports:
- `loadTokens(userId, supabase)` — fetch + decrypt tokens from DB
- `refreshIfExpired(tokens, supabase)` — call Google token endpoint if expired, update DB
- `googleFetch(url, tokens, options?)` — authenticated fetch to Google APIs

### `google-oauth-init`
- **POST** — reads user_id from JWT
- Signs a short-lived state token: `HMAC-SHA256(user_id + timestamp, STATE_SECRET)`, stores `{ user_id, state }` in a `google_oauth_states` temp table (expires in 10 min)
- Builds Google OAuth URL with all scopes + `access_type=offline&prompt=consent&state=<state_token>`
- Returns `{ url }` — frontend redirects user to it

### `google-oauth-callback`
- **GET** — receives `?code=...&state=...` from Google redirect (no JWT — this is a browser redirect)
- Looks up `state` in `google_oauth_states` temp table to recover `user_id`; deletes the row (one-time use)
- Rejects if state not found or expired (prevents CSRF)
- Exchanges code for tokens via Google token endpoint
- Encrypts and stores in `google_tokens` using recovered `user_id`
- Redirects to `/dashboard?tab=settings`

### `google-oauth-disconnect`
- **POST**
- Revokes token via `https://oauth2.googleapis.com/revoke`
- Deletes `google_tokens` row + all cached data for user
- Returns `{ success: true }`

### `google-calendar`
- **GET** — list events (params: `start`, `end`, `maxResults`)
- **POST** — create event (body: title, start, end, attendees, description)
- **DELETE** — delete event (param: `eventId`)
- Syncs results to `google_calendar_events` cache table
- Reads from cache if last sync < 5 min ago

### `google-tasks`
- **GET** — list tasks (param: optional `historyId` to filter linked tasks)
- **POST** — create task (body: title, notes, due, linkedHistoryId)
- **PATCH** — update/complete task
- **DELETE** — delete task
- Syncs to `google_tasks` table

### `google-drive`
- **GET** — list files (params: `query`, `pageToken`, `mimeType`)
- Returns paginated file list with `webViewLink`
- Syncs to `google_drive_files` cache

### `google-gmail`
- **GET** — list recent threads by contact email (param: `email`, `maxResults=5`)
- Returns thread snippet, subject, date, from — no body content
- Not cached (always fresh)

---

## Frontend Integration Points

### 1. Settings → new "Connected Apps" tab

New tab added to `SettingsView.tsx` alongside existing `profile | notifications | security | data` tabs.

Shows:
- Google connection card: avatar, email, scopes list, "Connected" badge
- "Connect Google Workspace" button (if not connected) → calls `google-oauth-init`, redirects
- "Disconnect" button (if connected) → calls `google-oauth-disconnect`

### 2. History View — Task/Notes panel

Each history entry gets a collapsible "Notes & Tasks" section at the bottom.

- Fetches tasks linked to that `historyId` from `google-tasks` edge function
- Inline "Add note" form → creates Google Task with `linkedHistoryId`
- Shows task title, notes, due date, completion checkbox
- Falls back gracefully if Google not connected (shows "Connect Google to add notes" prompt)

### 3. Monitor View — "Today's Schedule" widget

New widget pinned at top of Monitor view.

- Fetches today's events from `google-calendar` (start=today 00:00, end=today 23:59)
- Shows time, title, attendees count, Google Meet link button
- "View all" → opens a mini calendar popup showing the week
- If not connected: widget hidden (or shows connect prompt depending on user preference)

### 4. Documents View — "Google Drive" tab

New tab added to `DocumentsView.tsx` alongside existing document list.

- Fetches files from `google-drive` edge function
- Search bar filters by filename
- File cards show name, type icon, last modified, "Open in Drive" link
- Pagination support via `pageToken`

### 5. Customer Graph / Pre-Call Brief — Recent Emails

Pre-call brief panel (already showing top callers) gets a "Recent Emails" section.

- When a customer's email is known, calls `google-gmail?email=<customer_email>`
- Shows last 5 email thread snippets: subject, date, direction (sent/received)
- Collapsed by default, expandable

### 6. Analytics View — Meetings KPI card

New KPI card in the analytics grid:

- Pulls from `google_calendar_events` cache for current month range
- Shows: total meetings, avg duration, busiest day
- Sparkline trend (meetings per week)

---

## New Frontend Files

```
src/hooks/useGoogleWorkspace.ts       — connection status, connect/disconnect actions
src/components/Google/
  ConnectedAppsCard.tsx               — Settings tab UI
  TodayScheduleWidget.tsx             — Monitor view widget
  TasksPanel.tsx                      — History entry notes/tasks panel
  DriveFileBrowser.tsx                — Documents view Drive tab
  GmailThreads.tsx                    — Pre-call brief email section
src/pages/AuthGoogleCallback.tsx      — handles /auth/google/callback redirect
```

---

## New Route

`/auth/google/callback` → `AuthGoogleCallback.tsx`

This page receives `?code=` from Google, calls `google-oauth-callback` edge function (passing the code), shows a loading spinner, then redirects to dashboard on success.

---

## Google Cloud Console Setup

In project `lucid-authority-483307-k7`:
1. Enable APIs: Calendar API, Tasks API, Gmail API, Drive API, People API
2. OAuth 2.0 Client ID (Web application type):
   - Authorized redirect URIs: `https://<your-domain>/auth/google/callback`
3. OAuth consent screen: add all 5 scopes listed above
4. Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as Supabase secrets

---

## Error Handling

- If `google_tokens` row missing → frontend shows "Connect Google" prompt in each widget, never throws
- If Google API returns 401 → Edge Function attempts one token refresh; if that fails, marks tokens as invalid in DB, returns `{ error: 'reconnect_required' }`
- Frontend `useGoogleWorkspace` hook watches for `reconnect_required` and shows a banner in Settings
- Rate limits (429) → return cached data with `{ stale: true }` flag, frontend shows "last synced X min ago"

---

## Out of Scope (v1)

- Google Meet video embedding
- Google Sheets / Docs editing in-app
- Two-way Gmail (send emails)
- Google Calendar event editing from Monitor widget (create only, not edit)
- Push notifications from Google (webhooks/watch — can be v2)
