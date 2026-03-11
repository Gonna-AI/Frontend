-- ─── API Keys table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    permissions TEXT[] NOT NULL DEFAULT ARRAY['voice', 'text'],
    rate_limit INTEGER NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_token ON api_keys(token);

-- RLS for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
    ON api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
    ON api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
    ON api_keys FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
    ON api_keys FOR UPDATE
    USING (auth.uid() = user_id);

-- ─── Team Members table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending')),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_owner ON team_members(owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_unique ON team_members(owner_id, email);

-- RLS for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their team members"
    ON team_members FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert team members"
    ON team_members FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete team members"
    ON team_members FOR DELETE
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update team members"
    ON team_members FOR UPDATE
    USING (auth.uid() = owner_id);
