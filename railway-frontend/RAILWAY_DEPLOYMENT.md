# 🚂 Railway Deployment Guide - Step by Step

## Overview
Deploy Ollama (AI) and TTS services to Railway for permanent public URLs.

## Railway Free Tier
- ✅ $5 credit/month (enough for both services)
- ✅ Permanent URLs (your-domain.up.railway.app)
- ✅ Custom domains supported
- ✅ No credit card required for free tier

---

## Step 1: Sign Up for Railway

1. Go to: https://railway.app
2. Click "Start a New Project" or "Login"
3. Sign up with GitHub (recommended - easiest)
4. Authorize Railway to access your repositories

---

## Step 2: Deploy Ollama Service

### 2.1 Create New Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. If you haven't connected GitHub:
   - Click "Configure GitHub App"
   - Authorize Railway
   - Select repositories to give access

### 2.2 Deploy Ollama

**Option A: Use the railway-ollama directory I created**

1. Create a new repository on GitHub (or use existing)
2. Push the `railway-ollama` directory to GitHub
3. In Railway: New Project → Deploy from GitHub repo
4. Select your repository
5. Railway will auto-detect the Dockerfile

**Option B: Manual Setup**

1. In Railway: New Project → Empty Project
2. Click on the project → Settings → Source
3. Connect GitHub repo or upload files
4. Railway will build from Dockerfile

### 2.3 Configure Ollama

1. After deployment starts, go to **Settings** → **Variables**
2. No environment variables needed for basic setup

### 2.4 Pull the Model

Once deployed, you need to pull the Hermes 2 Pro model:

1. Go to Railway dashboard → Your Ollama service
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Click **"View Logs"**
5. In the logs, you'll see a shell option, or use Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Pull the model
railway run ollama pull adrienbrault/nous-hermes2pro:Q4_K_M
```

### 2.5 Get Ollama URL

1. In Railway dashboard → Your Ollama service
2. Click **"Settings"** → **"Networking"**
3. Copy the **Public Domain** (e.g., `ollama-production.up.railway.app`)
4. Or add custom domain: `ai.clerktree.com`

---

## Step 3: Deploy TTS Service

### 3.1 Create New Service

1. In Railway dashboard, click **"New"** → **"Service"**
2. Select **"Deploy from GitHub repo"**
3. Select your repository with `tts-service` directory
4. Railway will auto-detect the Dockerfile

### 3.2 Configure TTS

1. Go to **Settings** → **Variables**
2. No special variables needed (port is auto-set by Railway)

### 3.3 Get TTS URL

1. In Railway dashboard → Your TTS service
2. Click **"Settings"** → **"Networking"**
3. Copy the **Public Domain** (e.g., `tts-production.up.railway.app`)
4. Or add custom domain: `tts.clerktree.com`

---

## Step 4: Update Frontend Configuration

### 4.1 Update .env File

```bash
# In Frontend/.env
VITE_OLLAMA_URL=https://ai.clerktree.com
# Or use Railway URL: https://your-ollama-service.up.railway.app

VITE_TTS_API_URL=https://tts.clerktree.com
# Or use Railway URL: https://your-tts-service.up.railway.app
```

### 4.2 Update .env.production (for deployment)

```bash
VITE_OLLAMA_URL=https://ai.clerktree.com
VITE_TTS_API_URL=https://tts.clerktree.com
```

---

## Step 5: Set Up Custom Domains (Optional)

### 5.1 In Railway Dashboard

For each service (Ollama and TTS):

1. Go to **Settings** → **Networking**
2. Under **"Custom Domain"**, click **"Add Domain"**
3. Enter: `ai.clerktree.com` (for Ollama) or `tts.clerktree.com` (for TTS)
4. Railway will show you DNS records to add

### 5.2 Update Namecheap DNS

Railway will provide CNAME records. Add them in Namecheap:

1. Go to Namecheap → Domain List → clerktree.com → Advanced DNS
2. Add CNAME records:
   - `ai` → Railway-provided CNAME target
   - `tts` → Railway-provided CNAME target
3. Wait 5-15 minutes for DNS propagation

---

## Step 6: Verify Deployment

### 6.1 Test Ollama

```bash
curl https://ai.clerktree.com/api/tags
# Should return JSON with models
```

### 6.2 Test TTS

```bash
curl https://tts.clerktree.com/health
# Should return: {"status": "healthy", "service": "tts-api"}
```

---

## Cost Management

### Monitor Usage

1. Railway Dashboard → **Usage** tab
2. Track your $5 free credit usage
3. Both services should use ~$3-5/month total

### Optimize Costs

- **Ollama**: Uses most resources (~$2-3/month)
- **TTS**: Lightweight (~$1/month)
- If you exceed $5, Railway will pause services (won't charge)

---

## Troubleshooting

### Issue: Model Not Found

**Solution**: Pull the model after deployment:
```bash
railway run ollama pull adrienbrault/nous-hermes2pro:Q4_K_M
```

### Issue: Service Not Starting

**Check logs**:
1. Railway Dashboard → Your service → Deployments
2. Click latest deployment → View Logs
3. Look for errors

### Issue: Port Errors

**Solution**: Railway sets `PORT` env var automatically. The Dockerfile handles this.

### Issue: Custom Domain Not Working

**Check**:
1. DNS records are correct in Namecheap
2. Railway shows domain as "Active"
3. Wait 15-30 minutes for DNS propagation

---

## Quick Reference

### Railway CLI Commands

```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run command in service
railway run ollama pull MODEL_NAME

# Open service
railway open
```

### Important URLs

- **Railway Dashboard**: https://railway.app/dashboard
- **Ollama Service**: Check Railway dashboard for URL
- **TTS Service**: Check Railway dashboard for URL

---

## Next Steps After Deployment

1. ✅ Test both services are accessible
2. ✅ Update frontend `.env` files
3. ✅ Test frontend connects to Railway services
4. ✅ Set up custom domains (optional)
5. ✅ Monitor usage in Railway dashboard

---

**Need Help?** Check Railway docs: https://docs.railway.app

