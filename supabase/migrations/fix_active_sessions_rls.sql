-- Fix active_sessions RLS: restrict writes to authenticated users only
-- Run this migration in your Supabase SQL Editor BEFORE going live

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can manage active sessions" ON active_sessions;

-- Add user_id column if not present (links sessions to auth.users)
ALTER TABLE active_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Allow anyone to READ active sessions (needed for dashboard global count)
-- The existing SELECT policy is fine, but recreate for clarity
DROP POLICY IF EXISTS "Anyone can view active sessions" ON active_sessions;
CREATE POLICY "Authenticated users can view active sessions"
ON active_sessions FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can INSERT their own sessions
CREATE POLICY "Users can insert own sessions"
ON active_sessions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Only authenticated users can UPDATE their own sessions
CREATE POLICY "Users can update own sessions"
ON active_sessions FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Only authenticated users can DELETE their own sessions
CREATE POLICY "Users can delete own sessions"
ON active_sessions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Allow anon users read-only access for public-facing session counts (optional)
CREATE POLICY "Anon can view active session counts"
ON active_sessions FOR SELECT
TO anon
USING (true);
