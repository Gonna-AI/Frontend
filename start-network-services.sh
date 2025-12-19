#!/bin/bash
# Start all services accessible on the local network

LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)

echo "🌐 Starting ClerkTree Services (Network Mode)"
echo "=============================================="
echo ""
echo "📍 Your Local IP: $LOCAL_IP"
echo ""

# Set Ollama to bind to all interfaces
export OLLAMA_HOST="0.0.0.0:11434"
export OLLAMA_ORIGINS="*"

# Kill existing Ollama and restart with network binding
echo "🔄 Restarting Ollama with network access..."
killall Ollama 2>/dev/null
sleep 2
OLLAMA_HOST="0.0.0.0:11434" OLLAMA_ORIGINS="*" /Applications/Ollama.app/Contents/MacOS/Ollama serve > /tmp/ollama.log 2>&1 &
sleep 3

# Load the model
echo "📦 Loading Hermes 2 Pro model..."
ollama run adrienbrault/nous-hermes2pro:Q4_K_M "" > /dev/null 2>&1 &

echo ""
echo "✅ Services configured for network access!"
echo ""
echo "📱 Access from your phone:"
echo "   Frontend:  http://$LOCAL_IP:5173"
echo "   Ollama:    http://$LOCAL_IP:11434"
echo "   TTS:       http://$LOCAL_IP:5001"
echo ""
echo "⚠️  Make sure your phone is on the same WiFi network!"
echo ""
echo "🔧 Next steps:"
echo "   1. The Vite dev server will auto-restart with --host"
echo "   2. Open http://$LOCAL_IP:5173 on your phone"
echo "   3. Test the /user or /demo-dashboard page"

