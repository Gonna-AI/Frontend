# ✅ Verify DNS Setup in Namecheap

## 🔍 Quick Check

**Go to Namecheap and verify the DNS records exist:**

1. Login to Namecheap: https://www.namecheap.com
2. Go to **Domain List** → **clerktree.com** → **Manage**
3. Click **Advanced DNS** tab
4. Look for these **TWO CNAME records**:

### Required Records:

```
Record 1:
Type: CNAME
Host: ai
Value: 271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com
TTL: Automatic (or 3600)

Record 2:
Type: CNAME
Host: tts
Value: 271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com
TTL: Automatic (or 3600)
```

## ❓ If Records Are Missing

**Add them now:**

1. Click **Add New Record**
2. Select **CNAME Record**
3. Enter:
   - **Host**: `ai`
   - **Value**: `271273d5-41b7-47c5-b737-395a0c30f0e2.cfargotunnel.com`
   - **TTL**: `Automatic`
4. Click **Save** (green checkmark)
5. Repeat for `tts` subdomain

## ⏱️ After Adding Records

- Wait **5-15 minutes** for DNS propagation
- Test from your phone: `https://ai.clerktree.com/api/tags`
- Should return JSON with your Ollama models

## 🧪 Test Commands

Once DNS propagates, test:

```bash
# From your Mac
curl https://ai.clerktree.com/api/tags

# From your phone browser
https://ai.clerktree.com/api/tags
```

## 🔴 If Still Not Working

1. **Verify tunnel is running:**
   ```bash
   ./manage-tunnel.sh status
   ```

2. **Check tunnel logs:**
   ```bash
   ./manage-tunnel.sh logs
   ```

3. **Verify local services are running:**
   ```bash
   curl http://localhost:11434/api/tags  # Ollama
   curl http://localhost:5001/health    # TTS
   ```

## 📝 Common Issues

### Issue: "Server can't be found"
- **Cause**: DNS records not in Namecheap
- **Fix**: Add the CNAME records (see above)

### Issue: "Connection timeout"
- **Cause**: Tunnel not running
- **Fix**: `./manage-tunnel.sh start`

### Issue: "404 Not Found"
- **Cause**: Tunnel running but service not running
- **Fix**: Start Ollama and TTS services

