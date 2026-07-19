-- Add 'type' column to call_history table to distinguish between voice calls and text chats
-- Run this migration in your Supabase SQL Editor

-- Add the type column with a default value of 'text' for backwards compatibility
ALTER TABLE public.call_history 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text' CHECK (type IN ('voice', 'text'));

-- Update existing records to have 'text' as the default type
UPDATE public.call_history SET type = 'text' WHERE type IS NULL;

-- Make the column NOT NULL after updating existing records
ALTER TABLE public.call_history 
ALTER COLUMN type SET NOT NULL;

-- Add a comment to explain the column
COMMENT ON COLUMN public.call_history.type IS 'Type of conversation: voice (voice call) or text (text chat)';
