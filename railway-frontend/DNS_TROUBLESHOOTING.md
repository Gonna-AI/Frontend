# 🔧 DNS Troubleshooting Guide

## ✅ DNS Records Are Correct!

Your DNS is resolving correctly:
- `ai.clerktree.com` → `271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com` ✅
- `tts.clerktree.com` → `271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com` ✅

## 🔴 Issue: Local DNS Cache

Your Mac's DNS cache might be stale. The DNS records are correct globally, but your local resolver hasn't updated.

## 🛠️ Solutions

### Solution 1: Flush DNS Cache (Recommended)

Run in Terminal:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

Then wait 30 seconds and test:
```bash
curl https://ai.clerktree.com/api/tags
```

### Solution 2: Test from Another Device

The DNS is working globally. Test from:
- Your phone (on WiFi or mobile data)
- Another computer
- Online DNS checker: https://dnschecker.org/#A/ai.clerktree.com

### Solution 3: Restart Network Services

```bash
# Restart network services
sudo ifconfig en0 down
sudo ifconfig en0 up

# Or restart your Mac
```

### Solution 4: Use Different DNS Server Temporarily

Change your Mac's DNS to Google DNS:
1. System Settings → Network → WiFi/Ethernet → Details → DNS
2. Add: `8.8.8.8` and `8.8.4.4`
3. Apply and test

### Solution 5: Wait It Out

DNS cache will eventually expire (usually 5-15 minutes). The records are correct, just wait.

## 🧪 Verify DNS is Working

Check from command line:
```bash
# Should show the tunnel CNAME
dig ai.clerktree.com

# Should resolve
nslookup ai.clerktree.com
```

If these work but `curl` doesn't, it's definitely a local DNS cache issue.

## ✅ Verify Tunnel is Running

```bash
./manage-tunnel.sh status
```

Should show: `✅ Tunnel is running`

## 🌐 Test from External Service

Use an online tool to verify the URLs work:
- https://dnschecker.org/#CNAME/ai.clerktree.com
- https://www.whatsmydns.net/#CNAME/ai.clerktree.com

If these show the correct CNAME, your DNS is working globally!

## 📝 Quick Test Script

```bash
#!/bin/bash
echo "Testing DNS resolution..."
dig +short ai.clerktree.com
echo ""
echo "Testing connectivity..."
curl -v https://ai.clerktree.com/api/tags 2>&1 | head -20
```

## 🎯 Most Likely Fix

**Just flush your DNS cache:**
```bash
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

Then wait 30 seconds and try again. This fixes 90% of DNS cache issues on macOS.

