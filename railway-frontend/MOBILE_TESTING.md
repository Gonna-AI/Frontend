# 📱 Mobile Testing Guide

## Quick Setup

### Step 1: Ensure Frontend is Running

```bash
cd /Users/animesh/clekrtree/Frontend
npm run dev
```

The dev server should show:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://YOUR_IP:5173/
```

### Step 2: Find Your Local IP

**On Mac:**
```bash
ipconfig getifaddr en0
# Or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Common IPs:**
- Usually: `192.168.1.x` or `192.168.0.x`
- Or: `10.0.0.x`

### Step 3: Connect Mobile to Same WiFi

1. Make sure your phone is on the **same WiFi network** as your Mac
2. Open browser on phone
3. Go to: `http://YOUR_IP:5173`

**Example:**
- If your Mac IP is `192.168.1.100`
- Mobile URL: `http://192.168.1.100:5173`

---

## Testing on Mobile

### Test 1: Access Dashboard

1. Open mobile browser
2. Go to: `http://YOUR_IP:5173/demo-dashboard`
3. Should see the dashboard

### Test 2: Test User Call Page

1. Go to: `http://YOUR_IP:5173/user`
2. Click "Start Call"
3. Grant microphone permission
4. Speak into phone
5. Should see transcription and AI responses

### Test 3: Verify Railway Services

The frontend should automatically connect to:
- **Ollama**: `https://clerk-ollama-production.up.railway.app`
- **TTS**: `https://clerk-tts-production.up.railway.app`

These are public URLs, so they work from anywhere (including mobile).

---

## Troubleshooting

### Issue: Can't Access from Mobile

**Solution 1: Check Firewall**
```bash
# Allow incoming connections on port 5173
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /Applications/Google\ Chrome.app
```

**Solution 2: Check Vite Config**
Make sure `vite.config.ts` has:
```typescript
server: {
  host: true  // Allows network access
}
```

**Solution 3: Use ngrok for Public Access**
If same WiFi doesn't work:
```bash
# Install ngrok
brew install ngrok

# Start tunnel
ngrok http 5173

# Use ngrok URL on mobile (works from anywhere)
```

### Issue: Services Not Working on Mobile

**Check:**
1. Railway services are deployed and running
2. Frontend `.env` has correct Railway URLs
3. Restart frontend dev server after updating `.env`

### Issue: Microphone Not Working

**On Mobile:**
1. Grant browser microphone permission
2. Use HTTPS (if using ngrok) - required for microphone
3. Try different browser (Chrome, Safari, Firefox)

---

## Testing Checklist

- [ ] Frontend accessible on mobile (`http://YOUR_IP:5173`)
- [ ] Dashboard loads (`/demo-dashboard`)
- [ ] User call page loads (`/user`)
- [ ] Microphone permission granted
- [ ] Speech recognition works
- [ ] AI responds (connects to Railway Ollama)
- [ ] TTS plays audio (connects to Railway TTS)
- [ ] Call history saves
- [ ] Knowledge Base changes work

---

## Alternative: Use ngrok for Public Access

If you want to test from anywhere (not just same WiFi):

```bash
# Install ngrok
brew install ngrok

# Login (if not done)
ngrok config add-authtoken YOUR_TOKEN

# Start tunnel
ngrok http 5173

# Use the ngrok URL on mobile (e.g., https://abc123.ngrok-free.app)
```

**Benefits:**
- Works from anywhere (not just same WiFi)
- HTTPS (required for microphone)
- Public URL you can share

**Note:** Free ngrok URLs change on restart. For permanent URL, need paid plan or use Railway for frontend too.

---

## Quick Test Commands

```bash
# Get your IP
ipconfig getifaddr en0

# Test from mobile browser
# http://YOUR_IP:5173/demo-dashboard

# Check if services are accessible
curl https://clerk-ollama-production.up.railway.app/api/tags
curl https://clerk-tts-production.up.railway.app/health
```

---

## Production Deployment

For production (public access), you have options:

1. **Deploy Frontend to Railway/Netlify/Vercel**
   - Push to GitHub
   - Connect to Railway/Netlify/Vercel
   - Auto-deploys on push
   - Public URL: `https://your-frontend.up.railway.app`

2. **Use Your Domain**
   - Point `clerktree.com` to frontend
   - Backend services already on Railway

3. **Keep Current Setup**
   - Frontend: Local dev server (for development)
   - Backend: Railway (public, works from anywhere)

---

**Current Setup:**
- ✅ Backend services: Railway (public, accessible from mobile)
- ⚠️ Frontend: Local dev server (needs same WiFi or ngrok)

**For Production:** Deploy frontend to Railway/Netlify for public access!

