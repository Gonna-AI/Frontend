# 🚀 Update Netlify to Use Railway Backend

## ✅ Found Your Setup

- **Repository**: https://github.com/Gonna-AI/Frontend
- **Deployment Platform**: **Netlify**
- **Domain**: clerktree.com
- **Backend Services**: Railway (already deployed)

---

## 📝 Step-by-Step: Update Environment Variables

### Step 1: Access Netlify Dashboard

1. Go to: https://app.netlify.com
2. Login to your account
3. Find your site (should be connected to `clerktree.com`)

### Step 2: Add Environment Variables

1. Click on your site
2. Go to **Site Settings** (gear icon or Settings in sidebar)
3. Click **Environment Variables** (under Build & Deploy)
4. Click **Add a variable** or **Edit variables**

### Step 3: Add These Variables

Click **Add variable** for each:

**Variable 1:**
- **Key**: `VITE_OLLAMA_URL`
- **Value**: `https://clerk-ollama-production.up.railway.app`
- **Scopes**: Select **All scopes** (or Production)

**Variable 2:**
- **Key**: `VITE_TTS_API_URL`
- **Value**: `https://clerk-tts-production.up.railway.app`
- **Scopes**: Select **All scopes** (or Production)

**Variable 3 (if not already set):**
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://xlzwfkgurrrspcdyqele.supabase.co`
- **Scopes**: Select **All scopes**

**Variable 4 (if not already set):**
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsendma2d1cnJyc3BjZHlxZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjEwMDcsImV4cCI6MjA3ODkzNzAwN30.6uq0o5Vidu21UBEtjdOJGZEeH8-2unsyPpvnA49CxnM`
- **Scopes**: Select **All scopes**

### Step 4: Save and Redeploy

1. Click **Save** after adding all variables
2. Go to **Deploys** tab
3. Click **Trigger deploy** → **Deploy site**
4. Wait for deployment to complete (usually 1-2 minutes)

---

## ✅ After Deployment

Your site at `https://clerktree.com` will now:
- ✅ Connect to Railway Ollama for AI responses
- ✅ Connect to Railway TTS for text-to-speech
- ✅ Work worldwide from any device

---

## 🧪 Test After Deployment

1. Visit: `https://clerktree.com/demo-dashboard`
2. Test a call: `https://clerktree.com/user`
3. Verify:
   - AI responds (Railway Ollama)
   - TTS plays audio (Railway TTS)
   - Everything works!

---

## 🔍 Verify Variables Are Set

After redeploy, you can verify in Netlify:
1. Site Settings → Environment Variables
2. Should see all 4 variables listed
3. Check that values are correct

---

## 📋 Quick Reference

### Railway Backend URLs
```
Ollama: https://clerk-ollama-production.up.railway.app
TTS: https://clerk-tts-production.up.railway.app
```

### Netlify Dashboard
- Main: https://app.netlify.com
- Your Site: Find site connected to clerktree.com
- Environment Variables: Site Settings → Environment Variables

---

## 🆘 Troubleshooting

### Issue: Variables Not Working

**Check:**
1. Variables are saved in Netlify
2. Site has been redeployed after adding variables
3. Variable names start with `VITE_` (required for Vite)
4. No typos in variable names or values

### Issue: Services Not Connecting

**Check:**
1. Railway services are running (check Railway dashboard)
2. Test Railway URLs directly:
   ```bash
   curl https://clerk-ollama-production.up.railway.app/api/tags
   curl https://clerk-tts-production.up.railway.app/health
   ```

### Issue: Old Version Still Showing

**Solution:**
1. Clear browser cache
2. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Or test in incognito/private window

---

**That's it!** Once you add the variables and redeploy, your site will use Railway backend services. 🚀

