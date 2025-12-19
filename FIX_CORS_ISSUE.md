# Fixing CORS and 502 Errors

## Issues Found

1. **CORS Error**: `Origin https://clerktree.com is not allowed by Access-Control-Allow-Origin`
2. **502 Bad Gateway**: Railway Ollama service returning 502
3. **Gemini API Key**: Your API key was reported as leaked (needs replacement)

## Solution: CORS Proxy for Ollama

I've created a CORS proxy wrapper for your Railway Ollama service. This will:
- Add CORS headers to allow requests from `clerktree.com`
- Proxy all requests to Ollama
- Handle errors gracefully

## Files Updated

In `railway-ollama/`:
- `Dockerfile` - Now includes Node.js and CORS proxy
- `cors-proxy.js` - Express server with CORS support
- `start.sh` - Starts both Ollama and proxy
- `package.json` - Dependencies
- `railway.json` - Updated start command

## Deployment Steps

### 1. Commit and Push Changes
```bash
cd railway-ollama
git add .
git commit -m "Add CORS proxy for Ollama"
git push
```

### 2. Redeploy on Railway
Railway should auto-detect the changes and redeploy. If not:
1. Go to Railway dashboard
2. Select your Ollama service
3. Click "Redeploy" or wait for auto-deploy

### 3. Verify Deployment
After deployment, test:
```bash
# Health check
curl https://clerk-ollama-production.up.railway.app/health

# Should return: {"status":"ok","service":"ollama-cors-proxy"}
```

### 4. Test from Browser
On `clerktree.com`, open console and run:
```javascript
fetch('https://clerk-ollama-production.up.railway.app/api/tags')
  .then(r => r.json())
  .then(d => console.log('✅ OK:', d))
  .catch(e => console.error('❌ Error:', e));
```

## Gemini API Key Issue

Your Gemini API key was reported as leaked. You need to:

1. **Generate a new API key**:
   - Go to https://aistudio.google.com/app/apikey
   - Create a new API key
   - **DO NOT** commit it to GitHub

2. **Update in Netlify**:
   - Go to Netlify → Site Settings → Environment Variables
   - Update `VITE_GEMINI_API_KEY` with the new key
   - Redeploy the site

## After Fixes

Once both are fixed, you should see in the browser console:
```
✅ Local LLM available: adrienbrault/nous-hermes2pro:Q4_K_M
🔗 AI Chain: Gemini → Hermes-2-Pro → Smart Mock
```

Instead of:
```
🔗 AI Chain: Smart Mock
```

## Troubleshooting

### If CORS errors persist:
1. Check Railway service logs
2. Verify the proxy is running: `curl https://your-url/health`
3. Check that `clerktree.com` is in the allowed origins list

### If 502 errors persist:
1. Check Railway service status
2. Verify Ollama is running inside container
3. Check Railway logs for errors
4. Make sure the model is pulled: `railway run ollama list`

### If service won't start:
1. Check Railway build logs
2. Verify all dependencies are in `package.json`
3. Check that `start.sh` has execute permissions

