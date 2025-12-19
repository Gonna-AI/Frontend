-- ClerkTree Database Schema
-- Run this in your Supabase SQL Editor to create all necessary tables

-- ============================================
-- 1. KNOWLEDGE BASE CONFIG TABLE
-- ============================================
-- Stores the AI configuration (system prompt, persona, categories, etc.)
CREATE TABLE IF NOT EXISTS knowledge_base_config (
  id TEXT PRIMARY KEY, -- Using TEXT to allow 'default' as ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Single row configuration (use id = 'default' or similar)
  config JSONB NOT NULL,
  
  -- Metadata
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_kb_config_active ON knowledge_base_config(is_active) WHERE is_active = true;

-- ============================================
-- 2. CALL HISTORY TABLE
-- ============================================
-- Stores all call sessions with full details
CREATE TABLE IF NOT EXISTS call_history (
  id TEXT PRIMARY KEY, -- Using text ID from frontend (e.g., 'call-1234567890')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Call metadata
  caller_name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- Duration in seconds
  
  -- Call content
  messages JSONB NOT NULL, -- Array of CallMessage objects
  extracted_fields JSONB NOT NULL, -- Array of ExtractedField objects
  category JSONB, -- CallCategory object (nullable)
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  tags TEXT[] DEFAULT '{}',
  
  -- Summary
  summary JSONB NOT NULL, -- CallSummary object
  
  -- Analytics fields
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  follow_up_required BOOLEAN DEFAULT false
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_call_history_date ON call_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_call_history_priority ON call_history(priority);
CREATE INDEX IF NOT EXISTS idx_call_history_caller ON call_history(caller_name);
CREATE INDEX IF NOT EXISTS idx_call_history_category ON call_history USING GIN (category);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE knowledge_base_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;

-- Knowledge Base Config Policies
-- Allow anonymous users to read active config
CREATE POLICY "Allow read active knowledge base config"
  ON knowledge_base_config
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Allow anonymous users to upsert (for frontend to save config)
CREATE POLICY "Allow upsert knowledge base config"
  ON knowledge_base_config
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update knowledge base config"
  ON knowledge_base_config
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read all configs
CREATE POLICY "Allow authenticated read knowledge base config"
  ON knowledge_base_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to do everything (for admin operations)
-- Service role bypasses RLS by default, but we can be explicit

-- Call History Policies
-- Allow anonymous users to insert their own calls
CREATE POLICY "Allow insert call history"
  ON call_history
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read all call history (for dashboard)
CREATE POLICY "Allow read call history"
  ON call_history
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated full access call history"
  ON call_history
  FOR ALL
  TO authenticated
  USING (true);

-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on knowledge_base_config
CREATE TRIGGER update_kb_config_updated_at
  BEFORE UPDATE ON knowledge_base_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. INITIAL DATA
-- ============================================

-- Insert default knowledge base config if none exists
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

-- ============================================
-- 6. HELPER VIEWS (Optional - for analytics)
-- ============================================

-- View for call statistics
CREATE OR REPLACE VIEW call_statistics AS
SELECT 
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE priority = 'critical') as critical_calls,
  COUNT(*) FILTER (WHERE priority = 'high') as high_calls,
  COUNT(*) FILTER (WHERE priority = 'medium') as medium_calls,
  COUNT(*) FILTER (WHERE priority = 'low') as low_calls,
  AVG(duration) as avg_duration,
  SUM(duration) as total_duration,
  COUNT(*) FILTER (WHERE follow_up_required = true) as follow_ups_required
FROM call_history;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables created: knowledge_base_config, call_history';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '📈 Analytics view created: call_statistics';
END $$;
