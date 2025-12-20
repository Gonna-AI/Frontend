# Fix Railway TTS Service - Install Kokoro TTS

## Problem
The Railway TTS service is missing the `kokoro-onnx` Python package, causing TTS to fail and fall back to browser TTS.

Error message: `No module named kokoro_onnx.cli`

## Quick Fix (Recommended)

### Option 1: Install via Railway CLI (Temporary Fix)

1. **Link to your TTS service:**
   ```bash
   railway link
   # When prompted, select your TTS service project (e.g., "clerk-tts" or similar)
   ```

2. **Install the package:**
   ```bash
   railway run pip install kokoro-onnx soundfile
   ```

3. **Restart the service:**
   ```bash
   railway service restart
   ```

**Note:** This installs the package in the running container, but it may not persist after redeployments.

### Option 2: Update requirements.txt (Permanent Fix)

This is the recommended approach for a permanent fix:

Or if your TTS service has a requirements.txt file, add these lines to it:
```
kokoro-onnx>=1.0.0
soundfile>=0.12.0
```

Then redeploy the service, or install directly:
```bash
railway run pip install -r requirements.txt
```

### Step 3: Verify Installation

Test if the package is installed:
```bash
railway run python -c "import kokoro_onnx; print('Kokoro TTS installed successfully')"
```

### Step 4: Restart the Service

If the package was installed manually, restart the service:
```bash
railway service restart
```

Or trigger a redeploy from the Railway dashboard.

## Alternative: Update requirements.txt in TTS Service Repository

If you have access to the TTS service code repository:

1. Add to `requirements.txt`:
```
kokoro-onnx>=1.0.0
soundfile>=0.12.0
flask>=2.0.0
```

2. Commit and push to trigger Railway redeploy:
```bash
git add requirements.txt
git commit -m "Add kokoro-onnx dependency"
git push
```

## Verify TTS is Working

After installation, test the TTS service:
```bash
curl -X POST https://clerk-tts-production.up.railway.app/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "voice": "af_nova"}' \
  --output test-output.wav
```

If successful, you should get a WAV audio file back.
