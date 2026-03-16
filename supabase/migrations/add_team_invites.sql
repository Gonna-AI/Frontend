-- supabase/migrations/add_team_invites.sql
CREATE TABLE team_invites (
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

CREATE INDEX idx_team_invites_team ON team_invites(team_id);
CREATE INDEX idx_team_invites_code ON team_invites(invite_code);
CREATE INDEX idx_team_invites_status ON team_invites(status);

ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

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
