#!/bin/bash
# Expose ClerkTree services to the internet via Cloudflare Tunnel

echo "🌍 Exposing ClerkTree Services to the Internet"
echo "=============================================="
echo ""

# Kill any existing cloudflared tunnels
killall cloudflared 2>/dev/null

echo "🚀 Starting Cloudflare Tunnels..."
echo ""

# Start tunnel for Frontend (port 5173)
echo "📱 Frontend Tunnel..."
cloudflared tunnel --url http://localhost:5173 > /tmp/cf-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

# Start tunnel for Ollama (port 11434)
echo "🤖 Ollama Tunnel..."
cloudflared tunnel --url http://localhost:11434 > /tmp/cf-ollama.log 2>&1 &
OLLAMA_PID=$!
sleep 3

# Start tunnel for TTS (port 5001)
echo "🎤 TTS Tunnel..."
cloudflared tunnel --url http://localhost:5001 > /tmp/cf-tts.log 2>&1 &
TTS_PID=$!
sleep 5

echo ""
echo "✅ Tunnels Started!"
echo ""
echo "📋 Public URLs (extracting from logs):"
echo "========================================"
echo ""

# Extract URLs from logs
FRONTEND_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-frontend.log | head -1)
OLLAMA_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-ollama.log | head -1)
TTS_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-tts.log | head -1)

if [ -n "$FRONTEND_URL" ]; then
    echo "🌐 Frontend:  $FRONTEND_URL"
    echo "   (Open this on your phone to access the app)"
else
    echo "⏳ Frontend: Still starting... Check /tmp/cf-frontend.log"
fi

echo ""

if [ -n "$OLLAMA_URL" ]; then
    echo "🤖 Ollama:    $OLLAMA_URL"
    echo "   (Backend AI service - used by frontend)"
else
    echo "⏳ Ollama: Still starting... Check /tmp/cf-ollama.log"
fi

echo ""

if [ -n "$TTS_URL" ]; then
    echo "🎤 TTS:       $TTS_URL"
    echo "   (Text-to-Speech service - used by frontend)"
else
    echo "⏳ TTS: Still starting... Check /tmp/cf-tts.log"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Update your frontend .env file:"
echo ""
echo "   VITE_OLLAMA_URL=$OLLAMA_URL"
echo "   VITE_TTS_API_URL=$TTS_URL"
echo ""
echo "📱 Then open the Frontend URL on your phone!"
echo ""
echo "🛑 To stop tunnels: killall cloudflared"
echo ""
echo "📝 Tunnel logs:"
echo "   Frontend: /tmp/cf-frontend.log"
echo "   Ollama:   /tmp/cf-ollama.log"
echo "   TTS:      /tmp/cf-tts.log"
echo ""

# Keep script running and display URLs every 30 seconds
echo "🔄 Tunnels will stay active. Press Ctrl+C to stop."
echo ""

# Wait a bit more for URLs to stabilize
sleep 5

# Extract and display final URLs
FRONTEND_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-frontend.log | head -1)
OLLAMA_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-ollama.log | head -1)
TTS_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-tts.log | head -1)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📲 FINAL PUBLIC URLs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Frontend:  $FRONTEND_URL"
echo "Ollama:    $OLLAMA_URL"
echo "TTS:       $TTS_URL"
echo ""
echo "✅ Access from anywhere in the world!"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping tunnels...'; killall cloudflared; exit 0" INT
tail -f /dev/null

