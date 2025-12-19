# 🆓 Free Tunnel Alternatives (No Payment Required)

## Problem
Cloudflare Tunnel/Zero Trust requires a paid plan for permanent custom domains.

## Solution: Use Free Alternatives

---

## Option 1: ngrok (Recommended - Easiest)

### Setup Steps

1. **Sign up (Free)**:
   - Go to: https://dashboard.ngrok.com/signup
   - Create free account

2. **Install**:
   ```bash
   brew install ngrok
   ```

3. **Authenticate**:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   # Get token from: https://dashboard.ngrok.com/get-started/your-authtoken
   ```

4. **Start Tunnels**:
   ```bash
   # Terminal 1: Ollama
   ngrok http 11434 --domain=ai.clerktree.com
   
   # Terminal 2: TTS
   ngrok http 5000 --domain=tts.clerktree.com
   ```

### Free Tier Limits
- ✅ Custom domains (need to add in ngrok dashboard)
- ✅ Unlimited bandwidth
- ❌ URLs change on restart (unless you add custom domain)
- ✅ Free tier is sufficient for development

### Update Namecheap DNS
1. Go to Namecheap Dashboard
2. Advanced DNS
3. Update CNAME records:
   - `ai` → `ai.clerktree.com.ngrok.io` (or ngrok-provided domain)
   - `tts` → `tts.clerktree.com.ngrok.io`

---

## Option 2: localtunnel (No Signup)

### Setup Steps

1. **Install**:
   ```bash
   npm install -g localtunnel
   ```

2. **Start Tunnels**:
   ```bash
   # Terminal 1: Ollama
   lt --port 11434 --subdomain ai-clerktree
   
   # Terminal 2: TTS
   lt --port 5000 --subdomain tts-clerktree
   ```

### Pros/Cons
- ✅ No signup needed
- ✅ Completely free
- ❌ URLs change each restart
- ❌ Less reliable than ngrok
- ❌ Can't use custom domain easily

---

## Option 3: Serveo (SSH-based, Free)

### Setup Steps

```bash
# Terminal 1: Ollama
ssh -R ai.clerktree.com:80:localhost:11434 serveo.net

# Terminal 2: TTS
ssh -R tts.clerktree.com:80:localhost:5000 serveo.net
```

### Pros/Cons
- ✅ Free
- ✅ No installation
- ❌ Requires SSH
- ❌ Less reliable
- ❌ URLs may change

---

## Option 4: Deploy to Free Tier Cloud Services

### Option 4a: Railway (Free Tier)

1. **Sign up**: https://railway.app
2. **Deploy Ollama & TTS**:
   - Create new project
   - Deploy from GitHub
   - Get public URLs
3. **Point DNS**: Update Namecheap CNAME to Railway URLs

**Free Tier**:
- $5 credit/month
- Enough for small services

### Option 4b: Render (Free Tier)

1. **Sign up**: https://render.com
2. **Deploy services** as web services
3. **Get public URLs**
4. **Point DNS** to Render URLs

**Free Tier**:
- Services sleep after inactivity
- Good for development

### Option 4c: Fly.io (Free Tier)

1. **Sign up**: https://fly.io
2. **Deploy services**
3. **Get public URLs**
4. **Point DNS**

**Free Tier**:
- 3 shared VMs
- Good for small services

---

## Option 5: Use Your Own VPS (One-time Setup)

### Cheapest Options

1. **Hetzner** (€4/month ≈ $4.50)
   - Reliable
   - Good performance
   - European servers

2. **DigitalOcean** ($6/month)
   - Easy setup
   - Good documentation
   - $200 credit for new users

3. **Linode** ($5/month)
   - Simple
   - Good support

### Setup on VPS

```bash
# On VPS
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull adrienbrault/nous-hermes2pro:Q4_K_M

# Install TTS
git clone your-tts-service
cd tts-service
pip install -r requirements.txt
python server.py

# Point Namecheap DNS to VPS IP
# ai.clerktree.com → A record → VPS_IP
# tts.clerktree.com → A record → VPS_IP
```

---

## Quick Comparison

| Option | Cost | Setup Time | Permanent URLs | Reliability |
|--------|------|------------|----------------|-------------|
| **ngrok** | Free | 5 min | ⚠️ With custom domain | ⭐⭐⭐⭐ |
| **localtunnel** | Free | 2 min | ❌ No | ⭐⭐⭐ |
| **Railway** | Free tier | 15 min | ✅ Yes | ⭐⭐⭐⭐ |
| **Render** | Free tier | 15 min | ✅ Yes | ⭐⭐⭐ |
| **VPS** | $4-6/mo | 30 min | ✅ Yes | ⭐⭐⭐⭐⭐ |

---

## My Recommendation

**For immediate use (no payment)**:
1. **ngrok** - Easiest, most reliable free option
2. Add custom domains in ngrok dashboard
3. Update Namecheap DNS to point to ngrok domains

**For long-term (minimal cost)**:
1. **Hetzner VPS** ($4.50/month) - Best value
2. Deploy services once
3. Point DNS directly (no tunnel needed)

---

## Quick Start: ngrok Setup

```bash
# 1. Install
brew install ngrok

# 2. Sign up and get token
# https://dashboard.ngrok.com/get-started/your-authtoken

# 3. Authenticate
ngrok config add-authtoken YOUR_TOKEN

# 4. Start tunnels
ngrok http 11434 --domain=ai.clerktree.com
ngrok http 5000 --domain=tts.clerktree.com

# 5. Update Namecheap DNS to ngrok domains
```

---

**Next Steps**: Choose an option and I'll help you set it up!

