# 🗄️ Supabase Database Setup Guide

## Overview

This guide will help you set up the Supabase database tables needed for ClerkTree's production deployment. The database stores:

1. **Knowledge Base Configuration** - AI prompts, personas, categories, priority rules
2. **Call History** - All call sessions with transcripts, summaries, and metadata

## Quick Setup

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project: `xlzwfkgurrrspcdyqele`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Schema Script

1. Open the file `supabase_schema.sql` in this directory
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify Tables Created

After running the script, verify the tables exist:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('knowledge_base_config', 'call_history');
```

You should see both tables listed.

### Step 4: Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('knowledge_base_config', 'call_history');
```

Both should show `rowsecurity = true`.

## Database Schema Details

### 1. `knowledge_base_config` Table

Stores the AI configuration that controls behavior:

- **id**: UUID (use 'default' for single config)
- **config**: JSONB containing all Knowledge Base settings
- **is_active**: Boolean flag for active configuration
- **created_at / updated_at**: Timestamps

**Structure:**
```json
{
  "systemPrompt": "...",
  "persona": "...",
  "greeting": "...",
  "contextFields": [...],
  "categories": [...],
  "priorityRules": [...],
  "customInstructions": [...],
  "responseGuidelines": "...",
  "selectedVoiceId": "..."
}
```

### 2. `call_history` Table

Stores all call sessions:

- **id**: Text ID (e.g., 'call-1234567890')
- **caller_name**: Name of the caller
- **date**: Call timestamp
- **duration**: Duration in seconds
- **messages**: JSONB array of CallMessage objects
- **extracted_fields**: JSONB array of ExtractedField objects
- **category**: JSONB CallCategory object
- **priority**: Text enum ('critical', 'high', 'medium', 'low')
- **tags**: Text array
- **summary**: JSONB CallSummary object
- **sentiment**: Text enum ('positive', 'neutral', 'negative')
- **follow_up_required**: Boolean

## Row Level Security (RLS)

The schema includes RLS policies:

- **Anonymous users** can:
  - Read active knowledge base config
  - Insert call history
  - Read all call history

- **Authenticated users** can:
  - Full access to all tables

- **Service role** can:
  - Bypass RLS (full admin access)

## Testing the Setup

### Test 1: Check Default Config

```sql
SELECT id, is_active, config->>'persona' as persona
FROM knowledge_base_config
WHERE id = 'default';
```

Should return the default configuration.

### Test 2: Insert Test Call

```sql
INSERT INTO call_history (
  id, caller_name, date, duration, messages, extracted_fields, 
  priority, tags, summary
) VALUES (
  'test-call-1',
  'Test User',
  NOW(),
  120,
  '[{"id": "msg-1", "speaker": "user", "text": "Hello", "timestamp": "2024-01-01T00:00:00Z"}]'::jsonb,
  '[]'::jsonb,
  'medium',
  ARRAY['test'],
  '{"mainPoints": ["Test call"], "sentiment": "neutral", "actionItems": [], "followUpRequired": false, "notes": ""}'::jsonb
);

SELECT * FROM call_history WHERE id = 'test-call-1';
```

### Test 3: Query Call Statistics

```sql
SELECT * FROM call_statistics;
```

Should show statistics view.

## Frontend Integration

The frontend code in `src/contexts/DemoCallContext.tsx` automatically:

1. **Loads** knowledge base from `knowledge_base_config` table on app start
2. **Saves** knowledge base changes to Supabase when "Save Config" is clicked
3. **Inserts** call history after each call ends
4. **Loads** call history on app start

### Fallback Behavior

If Supabase is unavailable, the app falls back to:
- `localStorage` for knowledge base
- `localStorage` for call history

This ensures the app works even if the database is temporarily unavailable.

## Troubleshooting

### Issue: "relation does not exist"

**Solution:** Make sure you ran the `supabase_schema.sql` script in the SQL Editor.

### Issue: "permission denied"

**Solution:** Check that RLS policies are created. Run:

```sql
SELECT * FROM pg_policies WHERE tablename IN ('knowledge_base_config', 'call_history');
```

### Issue: "duplicate key value violates unique constraint"

**Solution:** The default config already exists. This is fine - the `ON CONFLICT DO NOTHING` clause prevents errors.

### Issue: Frontend can't read/write data

**Solution:** 
1. Check your `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Verify the anon key has the correct permissions in Supabase Dashboard → Settings → API
3. Check browser console for specific error messages

## Maintenance

### Backup

Supabase automatically backs up your database, but you can also:

1. Go to **Database** → **Backups** in Supabase Dashboard
2. Create manual backups before major changes

### Cleanup Old Calls

To delete calls older than 90 days:

```sql
DELETE FROM call_history 
WHERE date < NOW() - INTERVAL '90 days';
```

### Update Knowledge Base

The frontend handles updates automatically, but you can manually update:

```sql
UPDATE knowledge_base_config
SET config = '{"systemPrompt": "..."}'::jsonb,
    updated_at = NOW()
WHERE id = 'default';
```

## Next Steps

After setting up the database:

1. ✅ Verify tables are created
2. ✅ Test inserting a call
3. ✅ Open the frontend and verify it loads data from Supabase
4. ✅ Make a test call and verify it saves to the database
5. ✅ Check that call history persists after page refresh

## Support

If you encounter issues:

1. Check Supabase Dashboard → Logs for errors
2. Check browser console for frontend errors
3. Verify environment variables in `.env`
4. Check RLS policies are enabled and correct

---

**Last Updated:** $(date)
**Schema Version:** 1.0

