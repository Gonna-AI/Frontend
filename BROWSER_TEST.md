# Browser Test for Railway Ollama

## Quick Test (Copy & Paste in Browser Console)

Open https://clerktree.com, press F12, go to Console, and paste:

```javascript
// Quick Railway Ollama Test
fetch('https://clerk-ollama-production.up.railway.app/health')
  .then(r => r.json())
  .then(d => console.log('✅ Health:', d))
  .catch(e => console.error('❌ Health Error:', e));

fetch('https://clerk-ollama-production.up.railway.app/api/tags')
  .then(r => {
    console.log('Status:', r.status);
    console.log('CORS Origin:', r.headers.get('access-control-allow-origin'));
    return r.json();
  })
  .then(d => {
    console.log('✅ Models:', d);
    if (d.models && d.models.length > 0) {
      console.log('📊 Model Names:', d.models.map(m => m.name));
    }
  })
  .catch(e => console.error('❌ API Error:', e));
```

## Expected Results

✅ **Health Check:**
```json
{"status":"ok","service":"ollama-cors-proxy"}
```

✅ **API Tags:**
```json
{
  "models": [
    {
      "name": "adrienbrault/nous-hermes2pro:Q4_K_M",
      "size": 4724461568,
      ...
    }
  ]
}
```

✅ **CORS Headers:**
- `access-control-allow-origin: https://clerktree.com`

## After Test

1. **Refresh the page** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check console** for:
   - `🔍 Checking Ollama availability...`
   - `✅ Local LLM available: adrienbrault/nous-hermes2pro:Q4_K_M`
   - `🔗 AI Chain: Gemini → Hermes-2-Pro → Smart Mock`

3. **If you see CORS errors:**
   - Wait 1-2 minutes (proxy might be restarting)
   - Check Railway dashboard for service status
   - Verify the service is "Active"

4. **If models list is empty:**
   - The model was just pulled, may need a moment
   - Try the test again in 30 seconds
   - Check Railway logs: `railway logs --service 3c446b2c-d779-4b63-b326-bc1a395e33cb`

