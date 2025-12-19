# 🔧 Cloudflare Tunnel Troubleshooting Guide

## Current Status

- ✅ Tunnel is running (process active)
- ✅ DNS resolves correctly (CNAME → Cloudflare Tunnel)
- ✅ Local services running (Ollama: 11434, TTS: 5000)
- ❌ Endpoints not accessible via public URLs

## Issues Found & Fixed

### 1. ✅ Fixed: TTS Port Mismatch
- **Issue**: Tunnel config had TTS on port 5001, but service runs on 5000
- **Fix**: Updated `~/.cloudflared/config.yml` to use port 5000
- **Status**: Config updated, tunnel restarted

## Common Issues & Solutions

### Issue 1: DNS Propagation Delay
**Symptom**: DNS resolves but endpoints don't work

**Solution**:
1. DNS can take 24-48 hours to fully propagate globally
2. Even if it resolves locally, other DNS servers may not have updated
3. Check from different locations: https://www.whatsmydns.net/#CNAME/ai.clerktree.com

**Test from different DNS servers**:
```bash
# Google DNS
dig ai.clerktree.com @8.8.8.8

# Cloudflare DNS
dig ai.clerktree.com @1.1.1.1

# Your ISP DNS
dig ai.clerktree.com
```

### Issue 2: Tunnel Not Connected to Cloudflare
**Symptom**: Tunnel process running but no connection

**Check**:
```bash
# View tunnel logs
tail -f /tmp/cloudflared-tunnel.log

# Look for:
# - "Connection established"
# - "Registered tunnel connection"
# - Any "ERR" or "error" messages
```

**Fix**:
1. Verify tunnel in Cloudflare Dashboard:
   - Go to: https://one.dash.cloudflare.com/
   - Navigate to: Zero Trust → Networks → Tunnels
   - Check if `clerk-backend` tunnel shows as "Healthy"

2. Re-authenticate if needed:
```bash
cloudflared tunnel login
```

### Issue 3: SSL/TLS Certificate Issues
**Symptom**: Connection fails with SSL errors

**Check**:
```bash
# Test with verbose SSL info
curl -v https://ai.clerktree.com/api/tags 2>&1 | grep -i ssl
```

**Fix**:
- Cloudflare Tunnel automatically handles SSL
- If issues persist, check Cloudflare Dashboard → SSL/TLS settings
- Ensure "Full" or "Full (strict)" mode is enabled

### Issue 4: Local Services Not Accessible
**Symptom**: Tunnel connects but can't reach localhost services

**Test locally**:
```bash
# Test Ollama
curl http://localhost:11434/api/tags

# Test TTS
curl http://localhost:5000/health
```

**Fix**:
- Ensure services are running on correct ports
- Check firewall isn't blocking localhost connections
- Verify tunnel config matches actual service ports

### Issue 5: Namecheap DNS Not Updated
**Symptom**: DNS doesn't resolve at all

**Check Namecheap DNS**:
1. Go to Namecheap Dashboard
2. Domain List → clerktree.com → Advanced DNS
3. Verify CNAME records:
   - `ai` → `271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com`
   - `tts` → `271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com`

**Fix**:
- If records are missing, add them
- TTL should be set to "Automatic" or lowest value (300 seconds)
- Wait 5-15 minutes after adding/updating records

## Step-by-Step Verification

### Step 1: Verify Tunnel Status
```bash
./manage-tunnel.sh status
# Should show: ✅ Tunnel is running
```

### Step 2: Check Tunnel Logs
```bash
tail -50 /tmp/cloudflared-tunnel.log
# Look for connection errors or warnings
```

### Step 3: Test Local Services
```bash
# Ollama
curl http://localhost:11434/api/tags

# TTS
curl http://localhost:5000/health
```

### Step 4: Verify DNS Resolution
```bash
# Should return: 271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com
dig +short ai.clerktree.com @8.8.8.8
dig +short tts.clerktree.com @8.8.8.8
```

### Step 5: Test Public Endpoints
```bash
# Should return HTTP 200 or valid JSON
curl https://ai.clerktree.com/api/tags
curl https://tts.clerktree.com/health
```

### Step 6: Check Cloudflare Dashboard
1. Go to: https://one.dash.cloudflare.com/
2. Zero Trust → Networks → Tunnels
3. Click on `clerk-backend` tunnel
4. Check:
   - Status: Should be "Healthy"
   - Connections: Should show active connections
   - Routes: Should list ai.clerktree.com and tts.clerktree.com

## Quick Fixes

### Restart Everything
```bash
# Stop tunnel
./manage-tunnel.sh stop

# Wait 5 seconds
sleep 5

# Start tunnel
./manage-tunnel.sh start

# Wait 10 seconds for connection
sleep 10

# Test
curl https://ai.clerktree.com/api/tags
```

### Recreate Tunnel (Last Resort)
If nothing works, you may need to recreate the tunnel:

```bash
# 1. Delete old tunnel
cloudflared tunnel delete clerk-backend

# 2. Create new tunnel
cloudflared tunnel create clerk-backend

# 3. Configure DNS in Cloudflare Dashboard
# 4. Update config.yml with new tunnel ID
# 5. Start tunnel
cloudflared tunnel run clerk-backend
```

## Expected Timeline

- **DNS Propagation**: 5 minutes to 48 hours (usually 15-30 minutes)
- **Tunnel Connection**: Immediate after restart
- **SSL Certificate**: Automatic, usually instant

## Still Not Working?

1. **Check Cloudflare Dashboard**:
   - Verify tunnel is registered and healthy
   - Check for any warnings or errors

2. **Test from Different Network**:
   - Try from your phone (different network)
   - Use online tools: https://www.uptrends.com/tools/uptime

3. **Contact Cloudflare Support**:
   - If tunnel shows as unhealthy in dashboard
   - If DNS is correct but still not working after 24 hours

## Current Configuration

- **Tunnel ID**: `271273d5-41b7-47c5-b737-395a0c30f0e2`
- **Tunnel Name**: `clerk-backend`
- **Config File**: `~/.cloudflared/config.yml`
- **Ollama**: `http://localhost:11434` → `ai.clerktree.com`
- **TTS**: `http://localhost:5000` → `tts.clerktree.com`

---

**Last Updated**: $(date)
**Status**: Tunnel running, DNS resolving, endpoints need verification

