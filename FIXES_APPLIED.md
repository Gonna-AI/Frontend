# Fixes Applied

## Issue 1: Unknown Caller in Call History

### Problem
After ending a call, the call history showed "Unknown Caller" even though the AI knew the caller's name during the conversation.

### Fixes Applied
1. **Enhanced `findCallerName` function**:
   - Added better logging to track name extraction
   - Improved pattern matching for name extraction from messages
   - Added checks for agent messages that might reference the caller's name
   - Filters out common false positives

2. **AI Summary Name Extraction**:
   - Updated Gemini summary to explicitly extract caller name using `extract_call_info` first
   - Updated Local LLM summary to extract caller name if mentioned
   - Both summaries now include caller name in the response

3. **Multi-source Name Resolution**:
   - The `endCall` function now checks:
     - Extracted fields from during the call
     - AI summary response (if name was extracted during summary)
     - Summary notes (pattern matching)
     - All call messages (pattern matching)
   - Uses the first valid name found

### Result
The system now tries multiple methods to extract and preserve the caller's name, ensuring it appears correctly in call history.

---

## Issue 2: Using Smart Mock Instead of Railway Backend

### Problem
The system was showing "Using Smart Mock" even though Railway backend services are deployed.

### Root Cause
The frontend (deployed on Netlify) doesn't have the Railway backend URLs configured in environment variables.

### Fixes Applied
1. **Better Error Logging**:
   - Added console logs showing which Ollama URL is being checked
   - Added error messages when connection fails
   - Added warnings when both Gemini and Local LLM are unavailable
   - Added helpful hints about setting environment variables

2. **Increased Timeout**:
   - Increased Ollama connection timeout from 3s to 5s for Railway (network latency)

### Action Required: Configure Netlify Environment Variables

You need to add the Railway backend URLs to your Netlify deployment:

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your `clerktree.com` site
3. Go to **Site Settings** → **Environment Variables**
4. Add these variables:

```
VITE_OLLAMA_URL=https://clerk-ollama-production.up.railway.app
VITE_TTS_API_URL=https://clerk-tts-production.up.railway.app
```

5. **Redeploy** your site (go to **Deploys** → **Trigger deploy** → **Deploy site**)

### Verify Railway URLs

Check your Railway dashboard to confirm the exact URLs:
- Ollama service: Should be something like `https://clerk-ollama-production.up.railway.app`
- TTS service: Should be something like `https://clerk-tts-production.up.railway.app`

### Testing

After redeploying, check the browser console:
- You should see: `✅ Local LLM available: adrienbrault/nous-hermes2pro:Q4_K_M`
- The AI Chain should show: `Gemini → Hermes-2-Pro → Smart Mock` (or just `Hermes-2-Pro → Smart Mock` if Gemini is unavailable)

If you still see "Using Smart Mock", check:
1. Railway services are running (check Railway dashboard)
2. URLs are correct in Netlify environment variables
3. Railway services are publicly accessible (not private)

---

## Summary

✅ **Caller Name Extraction**: Fixed - now extracts from multiple sources
✅ **Railway Backend**: Fixed - added better logging and error messages
⚠️ **Action Required**: Add Railway URLs to Netlify environment variables and redeploy

