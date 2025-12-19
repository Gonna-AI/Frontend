# 🌐 Production Deployment Guide

## ✅ Deployment Complete!

Your frontend is now deployed to Railway and accessible worldwide!

### Current Status

- ✅ **Frontend**: Deployed to Railway
- ✅ **Backend Services**: Deployed to Railway
- ⏳ **Custom Domain**: Setting up `clerktree.com`

---

## 🌐 Service URLs

### Frontend
- **Railway URL**: `https://clerk-frontend-production.up.railway.app`
- **Custom Domain**: `clerktree.com` (DNS setup in progress)

### Backend Services
- **Ollama (AI)**: `https://clerk-ollama-production.up.railway.app`
- **TTS**: `https://clerk-tts-production.up.railway.app`

---

## 📝 Setting Up Custom Domain (clerktree.com)

### Step 1: Get DNS Records from Railway

1. Go to Railway Dashboard:
   - https://railway.com/project/5ae57ae3-cafb-4816-b02c-6d29a5d69130
2. Click on your frontend service
3. Go to **Settings** → **Networking** → **Custom Domain**
4. Add domain: `clerktree.com`
5. Railway will show you DNS records (CNAME or A record)

### Step 2: Update Namecheap DNS

1. Go to Namecheap Dashboard
2. Domain List → `clerktree.com` → **Advanced DNS**
3. **Remove** old A/CNAME records for `@` (root domain)
4. **Add** Railway's DNS record:
   - If CNAME: `@` → Railway's CNAME target
   - If A record: `@` → Railway's IP address
5. Save changes

### Step 3: Wait for DNS Propagation

- Usually takes 5-15 minutes
- Can take up to 48 hours globally (rare)
- Check status: https://www.whatsmydns.net/#A/clerktree.com

### Step 4: Test

Once DNS propagates:
- Visit: `https://clerktree.com`
- Should see your deployed frontend
- Test dashboard: `https://clerktree.com/demo-dashboard`
- Test user call: `https://clerktree.com/user`

---

## 🔧 Environment Variables

The frontend is configured with these production environment variables:

```bash
VITE_OLLAMA_URL=https://clerk-ollama-production.up.railway.app
VITE_TTS_API_URL=https://clerk-tts-production.up.railway.app
VITE_SUPABASE_URL=https://xlzwfkgurrrspcdyqele.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These are set in Railway dashboard → Your service → Variables.

---

## 🚀 Updating the Deployment

### After Making Changes

1. **Make changes** to your code
2. **Push to GitHub** (if connected)
3. **Or redeploy manually**:
   ```bash
   cd Frontend/railway-frontend
   railway up
   ```

### Update Environment Variables

```bash
cd Frontend/railway-frontend
railway variables set VITE_OLLAMA_URL=NEW_URL
railway up  # Redeploys with new variables
```

---

## 🧪 Testing Production

### Test Frontend
```bash
curl https://clerk-frontend-production.up.railway.app
# Or after DNS: curl https://clerktree.com
```

### Test Backend Services
```bash
# Ollama
curl https://clerk-ollama-production.up.railway.app/api/tags

# TTS
curl https://clerk-tts-production.up.railway.app/health
```

### Test from Mobile (Anywhere in World)

1. Open browser on phone
2. Go to: `https://clerktree.com` (after DNS setup)
3. Or use Railway URL: `https://clerk-frontend-production.up.railway.app`
4. Test all features

---

## 📊 Railway Dashboards

- **Frontend**: https://railway.com/project/5ae57ae3-cafb-4816-b02c-6d29a5d69130
- **Ollama**: https://railway.com/project/f166c437-9667-4133-aee1-a9fc025af164
- **TTS**: https://railway.com/project/9b206913-1755-436f-9275-6f754a785381

---

## 💰 Cost Estimate

- **Frontend**: ~$1-2/month
- **Ollama**: ~$2-3/month
- **TTS**: ~$1/month
- **Total**: ~$4-6/month (within $5 free credit!)

---

## 🔍 Troubleshooting

### Issue: Domain Not Working

**Check DNS**:
```bash
dig clerktree.com @8.8.8.8
# Should show Railway's IP or CNAME
```

**Check Railway**:
- Dashboard → Service → Settings → Networking
- Verify domain is "Active" and verified

### Issue: Services Not Connecting

**Check Environment Variables**:
- Railway Dashboard → Service → Variables
- Verify all `VITE_*` variables are set

**Check Build Logs**:
- Railway Dashboard → Service → Deployments
- Click latest deployment → View Logs

### Issue: Frontend Shows Old Version

**Redeploy**:
```bash
cd Frontend/railway-frontend
railway up
```

---

## ✅ Deployment Checklist

- [x] Frontend deployed to Railway
- [x] Backend services deployed to Railway
- [x] Environment variables configured
- [ ] Custom domain (clerktree.com) DNS updated
- [ ] Domain verified in Railway
- [ ] Test from mobile/anywhere
- [ ] All features working

---

**Your site is now accessible worldwide!** 🌍

Once DNS propagates, anyone can access `https://clerktree.com` from anywhere in the world.

