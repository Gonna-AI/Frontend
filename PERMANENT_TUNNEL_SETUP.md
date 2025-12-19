# 🌍 Permanent Cloudflare Tunnel Setup

## ✅ Setup Complete!

Your backend services now use **permanent URLs** instead of temporary ones.

## 📋 Permanent URLs

```
🤖 AI Service:  https://ai.clerktree.com
🎤 TTS Service: https://tts.clerktree.com
```

## 🔧 Configuration

### Tunnel Details
- **Tunnel Name**: `clerk-backend`
- **Tunnel ID**: `271273d5-41b7-47c5-b737-395a0c30f0e2`
- **Config File**: `~/.cloudflared/config.yml`
- **Credentials**: `~/.cloudflared/271273d5-41b7-47c5-b737-395a0c30f0e2.json`

### DNS Records (Auto-configured)
- `ai.clerktree.com` → CNAME → Tunnel
- `tts.clerktree.com` → CNAME → Tunnel

## 🚀 Managing the Tunnel

Use the management script:

```bash
# Start tunnel
./manage-tunnel.sh start

# Stop tunnel
./manage-tunnel.sh stop

# Check status
./manage-tunnel.sh status

# Restart tunnel
./manage-tunnel.sh restart

# View logs
./manage-tunnel.sh logs
```

## 📝 Environment Variables

Your `.env.production` file has been updated with permanent URLs:

```env
VITE_OLLAMA_URL=https://ai.clerktree.com
VITE_TTS_API_URL=https://tts.clerktree.com
```

## ⚙️ Cloudflare Pages Setup

Update your Cloudflare Pages environment variables:

1. Go to: **Cloudflare Dashboard → Pages → clerktree → Settings → Environment Variables**
2. Set:
   - `VITE_OLLAMA_URL` = `https://ai.clerktree.com`
   - `VITE_TTS_API_URL` = `https://tts.clerktree.com`
3. **Redeploy** your site

## ⏱️ DNS Propagation

DNS records may take **2-5 minutes** to propagate globally. The tunnel is running, but URLs might not work immediately.

## 🧪 Testing

Once DNS propagates, test:

```bash
# Test AI service
curl https://ai.clerktree.com/api/tags

# Test TTS service
curl https://tts.clerktree.com/health
```

## 🔒 Security

- ✅ HTTPS enabled (automatic with Cloudflare)
- ✅ Tunnel credentials stored securely
- ✅ No public IP exposure

## 🛑 To Stop Everything

```bash
./manage-tunnel.sh stop
# or
killall cloudflared
```

## 📚 Documentation

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Tunnel Management](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/)

