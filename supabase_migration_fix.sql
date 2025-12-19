-- Migration script to fix the knowledge_base_config table
-- Run this if you already created the table with UUID id

-- Drop the existing table if it exists (WARNING: This will delete any existing data!)
DROP TABLE IF EXISTS knowledge_base_config CASCADE;

-- Recreate with TEXT id
CREATE TABLE knowledge_base_config (
  id TEXT PRIMARY KEY, -- Using TEXT to allow 'default' as ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Single row configuration (use id = 'default' or similar)
  config JSONB NOT NULL,
  
  -- Metadata
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_kb_config_active ON knowledge_base_config(is_active) WHERE is_active = true;

-- Re-enable RLS
ALTER TABLE knowledge_base_config ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Allow read active knowledge base config"
  ON knowledge_base_config
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Allow authenticated read knowledge base config"
  ON knowledge_base_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate trigger
CREATE TRIGGER update_kb_config_updated_at
  BEFORE UPDATE ON knowledge_base_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default config
INSERT INTO knowledge_base_config (id, config, is_active)
VALUES (
  'default',
  '{
    "systemPrompt": "You are an intelligent call agent for ClerkTree. Your role is to:\n1. Greet callers professionally and warmly\n2. Identify and collect relevant information from the conversation\n3. Categorize the call based on the caller''s needs\n4. Prioritize based on urgency and importance\n5. Provide helpful responses while gathering context\n\nAlways be empathetic, clear, and efficient in your communication.",
    "persona": "Professional, empathetic, and efficient AI assistant",
    "greeting": "Hello! Thank you for calling ClerkTree. How may I assist you today?",
    "contextFields": [
      {"id": "name", "name": "Caller Name", "description": "Full name of the caller", "required": true, "type": "text"},
      {"id": "contact", "name": "Contact Info", "description": "Phone or email for follow-up", "required": false, "type": "text"},
      {"id": "purpose", "name": "Call Purpose", "description": "Main reason for calling", "required": true, "type": "text"},
      {"id": "urgency", "name": "Urgency Level", "description": "How urgent is the matter", "required": false, "type": "select", "options": ["Not Urgent", "Somewhat Urgent", "Very Urgent", "Emergency"]}
    ],
    "categories": [
      {"id": "inquiry", "name": "General Inquiry", "color": "#3B82F6", "description": "General questions or information requests"},
      {"id": "support", "name": "Technical Support", "color": "#10B981", "description": "Technical issues or troubleshooting"},
      {"id": "billing", "name": "Billing", "color": "#F59E0B", "description": "Billing or payment questions"},
      {"id": "sales", "name": "Sales", "color": "#8B5CF6", "description": "Sales inquiries or product information"}
    ],
    "priorityRules": [
      "Mark as CRITICAL if the caller mentions emergency, system down, or immediate business impact",
      "Mark as HIGH if the issue affects multiple users or has a deadline",
      "Mark as MEDIUM for standard support requests",
      "Mark as LOW for general inquiries or informational requests"
    ],
    "customInstructions": [],
    "responseGuidelines": "Be professional, empathetic, and efficient. Gather all necessary information while being helpful.",
    "selectedVoiceId": "af_nova"
  }'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;

SELECT '✅ Migration complete! knowledge_base_config table recreated with TEXT id.' as status;

