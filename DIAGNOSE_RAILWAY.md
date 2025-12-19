# Diagnosing Railway Connection Issues

## Quick Diagnostic Steps

### Step 1: Check Browser Console
1. Open https://clerktree.com
2. Open DevTools (F12) → Console
3. Look for these messages on page load:
   ```
   🔍 Checking Ollama availability...
      URL: [should show Railway URL]
      Env Var: [should show if env var is set]
   ```

### Step 2: Test Railway URLs Directly
Open these URLs in your browser to test if Railway services are accessible:

**Ollama Service:**
```
https://clerk-ollama-production.up.railway.app/api/tags
```

**TTS Service:**
```
https://clerk-tts-production.up.railway.app/health
```

**Expected Results:**
- Ollama: Should return JSON with `{"models": [...]}`
- TTS: Should return JSON with health status

### Step 3: Check Netlify Environment Variables
1. Go to https://app.netlify.com
2. Select your site
3. **Site Settings** → **Environment Variables**
4. Verify these exact variable names (case-sensitive):
   - `VITE_OLLAMA_URL` (not `OLLAMA_URL`)
   - `VITE_TTS_API_URL` (not `TTS_API_URL`)
   - `VITE_GEMINI_API_KEY`

### Step 4: Check Railway Service Status
1. Go to https://railway.app
2. Check if both services are "Active"
3. Check the service URLs (they might be different than expected)

### Step 5: Common Issues & Fixes

#### Issue: "Env Var: NOT SET (using default)"
**Fix:** Environment variable is not set in Netlify
- Go to Netlify → Site Settings → Environment Variables
- Add `VITE_OLLAMA_URL` with your Railway URL
- **Redeploy** the site (important!)

#### Issue: "Failed to fetch" or CORS error
**Fix:** Railway service needs CORS headers
- Check Railway service logs
- Ensure Railway service allows requests from `clerktree.com`

#### Issue: "HTTP 404" or "Application not found"
**Fix:** Railway service URL is wrong
- Check Railway dashboard for correct URL
- Update Netlify environment variable
- Redeploy

#### Issue: "Connection timeout"
**Fix:** Railway service might be sleeping
- Check Railway dashboard - service should be "Active"
- First request after inactivity might be slow (cold start)

### Step 6: Verify After Fix
After updating environment variables and redeploying:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check console again
4. Should see: `✅ Local LLM available: adrienbrault/nous-hermes2pro:Q4_K_M`

## Test Script
Copy and paste this in your browser console on clerktree.com:

```javascript
// Quick diagnostic
console.log('Ollama URL:', import.meta.env.VITE_OLLAMA_URL || 'NOT SET');
console.log('TTS URL:', import.meta.env.VITE_TTS_API_URL || 'NOT SET');

// Test Ollama
fetch(import.meta.env.VITE_OLLAMA_URL + '/api/tags')
  .then(r => r.json())
  .then(d => console.log('✅ Ollama OK:', d))
  .catch(e => console.error('❌ Ollama Error:', e));
```
