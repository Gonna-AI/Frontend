-- supabase/migrations/add_playbook_templates.sql
CREATE TABLE playbook_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_keywords TEXT[] DEFAULT '{}',
    recommended_actions TEXT[] DEFAULT '{}',
    success_indicators TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT CHECK (source IN ('ai_generated', 'manual', 'system')),
    call_analysis_date_range tsrange,
    confidence_score FLOAT DEFAULT 0.75,
    UNIQUE(user_id, name)
);

CREATE INDEX idx_playbook_templates_user ON playbook_templates(user_id);
CREATE INDEX idx_playbook_templates_created ON playbook_templates(created_at DESC);

-- Enable RLS
ALTER TABLE playbook_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playbooks"
    ON playbook_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own playbooks"
    ON playbook_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playbooks"
    ON playbook_templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playbooks"
    ON playbook_templates FOR DELETE
    USING (auth.uid() = user_id);
