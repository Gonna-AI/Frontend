# 🔄 Update Production Frontend to Use Railway Backend

## Current Setup

- ✅ **Frontend**: Deployed on Namecheap (clerktree.com) - **Keep as is**
- ✅ **Backend Services**: Deployed on Railway
  - Ollama: `https://clerk-ollama-production.up.railway.app`
  - TTS: `https://clerk-tts-production.up.railway.app`

## What You Need to Do

Update your existing frontend deployment to use Railway backend URLs instead of localhost.

---

## Step 1: Update Environment Variables

### If Using Netlify/Vercel/Cloudflare Pages

1. Go to your deployment platform dashboard
2. Find your `clerktree.com` project
3. Go to **Environment Variables** or **Settings → Environment**
4. Add/Update these variables:

```bash
VITE_OLLAMA_URL=https://clerk-ollama-production.up.railway.app
VITE_TTS_API_URL=https://clerk-tts-production.up.railway.app
VITE_SUPABASE_URL=https://xlzwfkgurrrspcdyqele.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsendma2d1cnJyc3BjZHlxZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjEwMDcsImV4cCI6MjA3ODkzNzAwN30.6uq0o5Vidu21UBEtjdOJGZEeH8-2unsyPpvnA49CxnM
```

5. **Redeploy** your site (this triggers a new build with new variables)

### If Using Static Hosting (Direct Upload)

1. Update `.env.production` file locally:
```bash
VITE_OLLAMA_URL=https://clerk-ollama-production.up.railway.app
VITE_TTS_API_URL=https://clerk-tts-production.up.railway.app
VITE_SUPABASE_URL=https://xlzwfkgurrrspcdyqele.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsendma2d1cnJyc3BjZHlxZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjEwMDcsImV4cCI6MjA3ODkzNzAwN30.6uq0o5Vidu21UBEtjdOJGZEeH8-2unsyPpvnA49CxnM
```

2. Rebuild:
```bash
npm run build
```

3. Upload the new `dist/` folder to your hosting

---

## Step 2: Verify Configuration

After updating, your frontend should connect to:
- ✅ Railway Ollama (instead of localhost:11434)
- ✅ Railway TTS (instead of localhost:5000)
- ✅ Supabase (already configured)

---

## Step 3: Test

1. Visit: `https://clerktree.com`
2. Go to Dashboard: `https://clerktree.com/demo-dashboard`
3. Test a call: `https://clerktree.com/user`
4. Verify:
   - AI responses work (connects to Railway Ollama)
   - TTS audio plays (connects to Railway TTS)
   - Call history saves (Supabase)

---

## Quick Reference

### Railway Backend URLs
```
Ollama: https://clerk-ollama-production.up.railway.app
TTS: https://clerk-tts-production.up.railway.app
```

### Environment Variables to Set
```bash
VITE_OLLAMA_URL=https://clerk-ollama-production.up.railway.app
VITE_TTS_API_URL=https://clerk-tts-production.up.railway.app
```

---

## Troubleshooting

### Issue: Services Not Connecting

**Check:**
1. Environment variables are set correctly
2. Site has been redeployed after updating variables
3. Railway services are running (check Railway dashboard)

### Issue: CORS Errors

Railway services should have CORS enabled. If you see CORS errors:
- Check Railway service logs
- Verify services are accessible: `curl https://clerk-ollama-production.up.railway.app/api/tags`

---

**Summary**: Just update your existing frontend's environment variables to point to Railway backend URLs, then redeploy!

