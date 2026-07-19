-- The original team-members migration did not include a teams parent table.
-- Add the small parent model and compatibility columns before invites.
CREATE TABLE IF NOT EXISTS teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL DEFAULT 'Default team',
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS team_invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    invite_code TEXT NOT NULL UNIQUE,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('active', 'expired', 'used')) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_team_invites_team ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_code ON team_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);

ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view team invites" ON team_invites;
DROP POLICY IF EXISTS "Team members can create invites" ON team_invites;

CREATE POLICY "Users can view team invites"
    ON team_invites FOR SELECT
    USING (created_by = auth.uid() OR used_by = auth.uid());

CREATE POLICY "Team members can create invites"
    ON team_invites FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = team_invites.team_id
            AND team_members.user_id = auth.uid()
        )
    );
