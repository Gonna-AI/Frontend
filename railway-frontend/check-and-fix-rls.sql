-- Check and Fix Knowledge Base Config RLS Policies
-- Run this in Supabase SQL Editor

-- First, check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'knowledge_base_config';

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow upsert knowledge base config" ON knowledge_base_config;
DROP POLICY IF EXISTS "Allow update knowledge base config" ON knowledge_base_config;
DROP POLICY IF EXISTS "Allow insert knowledge base config" ON knowledge_base_config;

-- Create INSERT policy for anonymous users
CREATE POLICY "Allow insert knowledge base config"
  ON knowledge_base_config
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create UPDATE policy for anonymous users  
CREATE POLICY "Allow update knowledge base config"
  ON knowledge_base_config
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Verify policies were created
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'knowledge_base_config'
ORDER BY policyname;

SELECT '✅ RLS policies created! Anonymous users can now save/update knowledge base config.' as status;

