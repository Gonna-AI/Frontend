# How to Check Netlify Environment Variables

Since Netlify CLI is not installed, here are alternative ways to check:

## Method 1: Netlify Dashboard (Easiest)
1. Go to https://app.netlify.com
2. Select your site (clerktree.com)
3. Go to **Site Settings** → **Environment Variables**
4. Check if these are set:
   - `VITE_OLLAMA_URL`
   - `VITE_TTS_API_URL`
   - `VITE_GEMINI_API_KEY`

## Method 2: Browser Console Diagnostic
1. Open your deployed site: https://clerktree.com
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for these logs on page load:
   - `🔍 Checking Ollama availability...`
   - `✅ Local LLM available` or `❌ Ollama connection failed`

## Method 3: Test Page
1. Deploy the test page: `test-railway-connection.html`
2. Visit: `https://clerktree.com/test-railway-connection.html`
3. It will show all environment variables and test connections

## Method 4: Check Build Logs
1. Go to Netlify Dashboard → Deploys
2. Click on latest deploy
3. Check "Build log" for environment variable values (they're shown during build)

## Common Issues:
- **Variables not set**: Add them in Netlify → Site Settings → Environment Variables
- **Wrong URLs**: Check Railway dashboard for correct service URLs
- **CORS errors**: Railway services need to allow requests from clerktree.com
- **Service down**: Check Railway dashboard to see if services are running
