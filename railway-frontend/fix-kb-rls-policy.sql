-- Fix Knowledge Base Config RLS Policy
-- Run this in Supabase SQL Editor to allow anonymous users to save config

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow upsert knowledge base config" ON knowledge_base_config;
DROP POLICY IF EXISTS "Allow update knowledge base config" ON knowledge_base_config;

-- Create INSERT policy for anonymous users
CREATE POLICY "Allow upsert knowledge base config"
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

SELECT '✅ RLS policies updated! Anonymous users can now save knowledge base config.' as status;

