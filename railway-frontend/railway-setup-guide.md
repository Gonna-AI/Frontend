# 🚂 Railway Deployment Guide

## Overview
Deploy Ollama (AI) and TTS services to Railway's free tier for permanent public URLs.

## Railway Free Tier
- ✅ $5 credit/month (enough for small services)
- ✅ Permanent URLs
- ✅ No credit card required initially
- ✅ Easy deployment from GitHub

---

## Step 1: Sign Up for Railway

1. Go to: https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (easiest)
4. Authorize Railway to access your repos

---

## Step 2: Deploy Ollama Service

### Option A: Deploy from Docker (Recommended)

Railway can run Docker containers. We'll create a Dockerfile for Ollama.

### Option B: Use Railway's Ollama Template

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Or use Railway's template gallery

---

## Step 3: Deploy TTS Service

Deploy the TTS Flask service from your `tts-service` directory.

---

## Step 4: Get Public URLs

After deployment, Railway provides:
- `https://your-service-name.up.railway.app`
- Or custom domain: `https://ai.clerktree.com`

---

## Step 5: Update Namecheap DNS

Point your domain to Railway:
- `ai.clerktree.com` → Railway Ollama URL
- `tts.clerktree.com` → Railway TTS URL

---

## Quick Start Commands

```bash
# Install Railway CLI (optional, but helpful)
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

---

## Cost Estimate

- Ollama service: ~$2-3/month (uses GPU/CPU)
- TTS service: ~$1-2/month (lightweight)
- **Total: ~$3-5/month** (within free $5 credit!)

---

## Next Steps

I'll create the deployment files for you!

