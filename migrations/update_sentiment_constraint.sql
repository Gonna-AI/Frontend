-- Migration: Update sentiment check constraint to allow 10 sentiment types
-- Run this in Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE call_history DROP CONSTRAINT IF EXISTS call_history_sentiment_check;

-- Add the new constraint with all 10 sentiment types
ALTER TABLE call_history 
ADD CONSTRAINT call_history_sentiment_check 
CHECK (sentiment IN (
  'very_positive', 
  'positive', 
  'slightly_positive', 
  'neutral', 
  'mixed', 
  'slightly_negative', 
  'negative', 
  'very_negative', 
  'anxious', 
  'urgent'
));

-- Verify the constraint was updated
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'call_history_sentiment_check';
