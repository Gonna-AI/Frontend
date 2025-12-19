#!/bin/bash
# Expose only backend services (Ollama + TTS) to the internet
# Frontend stays local and connects to public backend

echo "🌍 Exposing Backend Services to Internet"
echo "========================================="
echo ""

# Kill any existing cloudflared tunnels
killall cloudflared 2>/dev/null
sleep 2

echo "🚀 Starting Backend Tunnels..."
echo ""

# Start tunnel for Ollama (port 11434)
echo "🤖 Starting Ollama tunnel..."
cloudflared tunnel --url http://localhost:11434 > /tmp/cf-ollama.log 2>&1 &
sleep 3

# Start tunnel for TTS (port 5001)
echo "🎤 Starting TTS tunnel..."
cloudflared tunnel --url http://localhost:5001 > /tmp/cf-tts.log 2>&1 &
sleep 5

echo ""
echo "✅ Backend Tunnels Started!"
echo ""

# Extract URLs from logs
OLLAMA_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-ollama.log | head -1)
TTS_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-tts.log | head -1)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PUBLIC BACKEND URLS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🤖 Ollama AI:  $OLLAMA_URL"
echo "🎤 TTS:        $TTS_URL"
echo ""

# Update .env file
cd /Users/animesh/clekrtree/Frontend
cp .env .env.backup 2>/dev/null

# Update or add VITE_OLLAMA_URL
if grep -q "^VITE_OLLAMA_URL=" .env 2>/dev/null; then
    sed -i '' "s|VITE_OLLAMA_URL=.*|VITE_OLLAMA_URL=$OLLAMA_URL|g" .env
else
    echo "VITE_OLLAMA_URL=$OLLAMA_URL" >> .env
fi

# Update or add VITE_TTS_API_URL
if grep -q "^VITE_TTS_API_URL=" .env 2>/dev/null; then
    sed -i '' "s|VITE_TTS_API_URL=.*|VITE_TTS_API_URL=$TTS_URL|g" .env
else
    echo "VITE_TTS_API_URL=$TTS_URL" >> .env
fi

echo "✅ .env updated with public backend URLs!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 HOW TO TEST:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Frontend runs locally:"
echo "   http://localhost:5173"
echo ""
echo "2. Frontend will connect to public backend:"
echo "   • Ollama: $OLLAMA_URL"
echo "   • TTS:    $TTS_URL"
echo ""
echo "3. Test from your phone:"
echo "   • Use ngrok/cloudflare for frontend OR"
echo "   • Use same WiFi and access your Mac's IP"
echo ""
echo "🛑 To stop: killall cloudflared"
echo ""
echo "📝 Logs: /tmp/cf-ollama.log, /tmp/cf-tts.log"
echo ""

# Save URLs to file
cat > /Users/animesh/clekrtree/Frontend/BACKEND_URLS.txt << EOF
🌍 PUBLIC BACKEND URLS
======================

These services are accessible from anywhere in the world.
Your local frontend will connect to them.

🤖 OLLAMA AI:
$OLLAMA_URL

🎤 TTS SERVICE:
$TTS_URL

📱 FRONTEND (Local):
http://localhost:5173

✅ The frontend connects to public backend automatically.
🛑 To stop tunnels: killall cloudflared
📝 Logs: /tmp/cf-ollama.log, /tmp/cf-tts.log

Generated: $(date)
EOF

echo "📄 URLs saved to: BACKEND_URLS.txt"
echo ""

# Keep script running
echo "🔄 Tunnels active. Press Ctrl+C to stop."
echo ""

trap "echo ''; echo '🛑 Stopping tunnels...'; killall cloudflared; exit 0" INT
tail -f /dev/null

