-- supabase/migrations/add_user_settings.sql
CREATE TABLE user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'en',
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_push BOOLEAN DEFAULT FALSE,
    notifications_sms BOOLEAN DEFAULT FALSE,
    privacy_profile_public BOOLEAN DEFAULT FALSE,
    privacy_data_analytics BOOLEAN DEFAULT TRUE,
    team_auto_add_members BOOLEAN DEFAULT FALSE,
    api_rate_limit_alerts BOOLEAN DEFAULT TRUE,
    call_recording_default BOOLEAN DEFAULT FALSE,
    call_transcription_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);
