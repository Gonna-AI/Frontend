-- Active Sessions table for real-time tracking of ongoing calls/chats
-- This enables global sync - when someone in Australia starts a chat, 
-- the dashboard in USA sees it immediately

CREATE TABLE IF NOT EXISTS active_sessions (
    id TEXT PRIMARY KEY,
    session_type TEXT NOT NULL DEFAULT 'text', -- 'voice' or 'text'
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    caller_name TEXT,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'ended'
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active sessions (for dashboard visibility)
CREATE POLICY "Anyone can view active sessions"
ON active_sessions FOR SELECT
USING (true);

-- Allow anyone to insert/update/delete active sessions
CREATE POLICY "Anyone can manage active sessions"
ON active_sessions FOR ALL
USING (true)
WITH CHECK (true);

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE active_sessions;

-- Create index for quick queries
CREATE INDEX IF NOT EXISTS idx_active_sessions_status ON active_sessions(status);
CREATE INDEX IF NOT EXISTS idx_active_sessions_started_at ON active_sessions(started_at DESC);

-- Clean up old ended sessions (optional - can be run periodically)
-- DELETE FROM active_sessions WHERE status = 'ended' AND last_activity < NOW() - INTERVAL '1 hour';
