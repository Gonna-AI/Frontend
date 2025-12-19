# 🌐 Namecheap DNS Setup for Cloudflare Tunnel

Since your main domain `clerktree.com` is managed by Namecheap, you need to add CNAME records there.

## 📋 DNS Records to Add in Namecheap

Go to: **Namecheap Dashboard → Domain List → clerktree.com → Advanced DNS**

### Add These Two CNAME Records:

#### 1. AI Service Subdomain
```
Type:    CNAME
Host:    ai
Value:   271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com
TTL:     3600 (or Auto)
```

#### 2. TTS Service Subdomain
```
Type:    CNAME
Host:    tts
Value:   271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com
TTL:     3600 (or Auto)
```

## 📝 Step-by-Step Instructions

1. **Login to Namecheap**
   - Go to https://www.namecheap.com
   - Login to your account

2. **Navigate to DNS Settings**
   - Click **Domain List** from the left menu
   - Find **clerktree.com** and click **Manage**
   - Go to the **Advanced DNS** tab

3. **Add First CNAME Record (AI)**
   - Click **Add New Record**
   - Select **CNAME Record**
   - **Host**: `ai`
   - **Value**: `271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com`
   - **TTL**: `3600` or `Automatic`
   - Click **Save**

4. **Add Second CNAME Record (TTS)**
   - Click **Add New Record** again
   - Select **CNAME Record**
   - **Host**: `tts`
   - **Value**: `271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com`
   - **TTL**: `3600` or `Automatic`
   - Click **Save**

## ⏱️ DNS Propagation

After adding the records:
- **Wait 5-15 minutes** for DNS to propagate
- DNS changes can take up to 48 hours globally, but usually work within 15 minutes

## 🧪 Testing

Once DNS propagates, test the URLs:

```bash
# Test AI service
curl https://ai.clerktree.com/api/tags

# Test TTS service
curl https://tts.clerktree.com/health
```

## ✅ Expected Result

After DNS propagates:
- ✅ `https://ai.clerktree.com` → Your local Ollama service
- ✅ `https://tts.clerktree.com` → Your local TTS service

## 🔧 Troubleshooting

### If URLs don't work after 15 minutes:

1. **Check DNS propagation:**
   ```bash
   dig ai.clerktree.com
   dig tts.clerktree.com
   ```
   Should show: `271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com`

2. **Verify tunnel is running:**
   ```bash
   ./manage-tunnel.sh status
   ```

3. **Check tunnel logs:**
   ```bash
   ./manage-tunnel.sh logs
   ```

## 📚 Important Notes

- The CNAME target (`271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com`) is permanent
- You only need to add these DNS records once
- The tunnel must be running on your Mac for the services to work
- Keep your Mac online and the tunnel running

## 🚀 After DNS is Set Up

Update your Cloudflare Pages (or wherever your frontend is hosted) environment variables:

```
VITE_OLLAMA_URL=https://ai.clerktree.com
VITE_TTS_API_URL=https://tts.clerktree.com
```

Then your production site will use the permanent backend URLs!

