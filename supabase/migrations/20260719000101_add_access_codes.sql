-- ─── Admin Access Codes table ─────────────────────────────────────────────────
-- Stores valid access codes that admins can distribute to new users
CREATE TABLE IF NOT EXISTS admin_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ
);

-- Index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_admin_codes_code ON admin_codes(code);

-- RLS: only service role can read/write (no user-level access via RLS)
ALTER TABLE admin_codes ENABLE ROW LEVEL SECURITY;

-- ─── User Access table ────────────────────────────────────────────────────────
-- Records which users have been granted dashboard access (and with which code)
CREATE TABLE IF NOT EXISTS user_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_used TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_access_user ON user_access(user_id);

ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;
