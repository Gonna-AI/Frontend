-- supabase/migrations/add_google_workspace.sql
-- Adapts to the existing google_* tables while adding missing pieces.

-- Enable pgcrypto for AES-256 encryption of tokens
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── New tables ──────────────────────────────────────────────────────────────

-- CSRF state for OAuth flow (one-time use, auto-expires)
CREATE TABLE IF NOT EXISTS google_oauth_states (
  state      text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

ALTER TABLE google_oauth_states ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_only_oauth_states" ON google_oauth_states;
CREATE POLICY "service_only_oauth_states" ON google_oauth_states FOR ALL USING (false);

-- Drive files cache
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

ALTER TABLE google_drive_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_drive" ON google_drive_files;
CREATE POLICY "own_drive" ON google_drive_files FOR ALL USING (auth.uid() = user_id);

-- ─── Augment existing tables ─────────────────────────────────────────────────

-- google_tasks: add linked_history_id for call note linking
ALTER TABLE google_tasks ADD COLUMN IF NOT EXISTS linked_history_id text;

-- google_calendar_events: add meet_link
ALTER TABLE google_calendar_events ADD COLUMN IF NOT EXISTS meet_link text;

-- ─── Index ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS google_tasks_history_idx
  ON google_tasks(user_id, linked_history_id)
  WHERE linked_history_id IS NOT NULL;

-- ─── Cleanup helper ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM google_oauth_states WHERE expires_at < now();
$$;

-- ─── pgcrypto RPC helpers (called by edge functions via service role) ─────────
-- Works with the existing google_oauth_tokens table:
--   user_id, service, access_token, refresh_token, expires_at, scope, email

CREATE OR REPLACE FUNCTION get_google_tokens(p_user_id uuid)
RETURNS TABLE(access_token text, refresh_token text, expiry_at timestamptz, google_email text)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    pgp_sym_decrypt(t.access_token::bytea,  current_setting('app.google_enc_key')) AS access_token,
    pgp_sym_decrypt(t.refresh_token::bytea, current_setting('app.google_enc_key')) AS refresh_token,
    t.expires_at AS expiry_at,
    t.email AS google_email
  FROM google_oauth_tokens t
  WHERE t.user_id = p_user_id AND t.service = 'workspace'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION upsert_google_tokens(
  p_user_id      uuid,
  p_access_token  text,
  p_refresh_token text,
  p_expiry_at    timestamptz,
  p_scopes       text[],
  p_google_email text,
  p_avatar_url   text
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO google_oauth_tokens(user_id, service, access_token, refresh_token, expires_at, scope, email)
  VALUES (
    p_user_id,
    'workspace',
    pgp_sym_encrypt(p_access_token,  current_setting('app.google_enc_key'))::text,
    pgp_sym_encrypt(p_refresh_token, current_setting('app.google_enc_key'))::text,
    p_expiry_at,
    array_to_string(p_scopes, ' '),
    p_google_email
  )
  ON CONFLICT (user_id, service) DO UPDATE SET
    access_token  = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    expires_at    = EXCLUDED.expires_at,
    scope         = EXCLUDED.scope,
    email         = EXCLUDED.email,
    updated_at    = now();
$$;

CREATE OR REPLACE FUNCTION update_google_access_token(
  p_user_id      uuid,
  p_access_token text,
  p_expiry_at    timestamptz
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE google_oauth_tokens
  SET access_token = pgp_sym_encrypt(p_access_token, current_setting('app.google_enc_key'))::text,
      expires_at   = p_expiry_at,
      updated_at   = now()
  WHERE user_id = p_user_id AND service = 'workspace';
$$;

-- IMPORTANT: After applying this migration, run in Supabase SQL editor:
-- ALTER DATABASE postgres SET app.google_enc_key = '<your GOOGLE_TOKEN_ENC_KEY value>';
