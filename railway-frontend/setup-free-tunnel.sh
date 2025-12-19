#!/bin/bash
# Free Tunnel Setup for ClerkTree Backend Services
# Uses ngrok (free tier) or localtunnel as alternatives

echo "🆓 Setting up Free Tunnel Alternative"
echo "===================================="
echo ""

# Check if ngrok is installed
if command -v ngrok &> /dev/null; then
    echo "✅ ngrok found"
    USE_NGROK=true
elif command -v localtunnel &> /dev/null; then
    echo "✅ localtunnel found"
    USE_NGROK=false
else
    echo "📦 Installing tunneling tools..."
    echo ""
    echo "Option 1: ngrok (recommended - easier to use)"
    echo "  Sign up: https://dashboard.ngrok.com/signup"
    echo "  Install: brew install ngrok"
    echo "  Auth: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    echo "Option 2: localtunnel (no signup needed)"
    echo "  Install: npm install -g localtunnel"
    echo ""
    exit 1
fi

# Stop Cloudflare Tunnel if running
echo ""
echo "🛑 Stopping Cloudflare Tunnel..."
killall cloudflared 2>/dev/null
sleep 2

if [ "$USE_NGROK" = true ]; then
    echo ""
    echo "🚀 Starting ngrok tunnels..."
    echo ""
    
    # Check if ngrok is authenticated
    if ! ngrok config check &>/dev/null; then
        echo "❌ ngrok not authenticated"
        echo "   Run: ngrok config add-authtoken YOUR_TOKEN"
        echo "   Get token from: https://dashboard.ngrok.com/get-started/your-authtoken"
        exit 1
    fi
    
    # Start Ollama tunnel
    echo "Starting Ollama tunnel (port 11434)..."
    ngrok http 11434 --domain=ai.clerktree.com > /tmp/ngrok-ollama.log 2>&1 &
    NGROK_OLLAMA_PID=$!
    sleep 3
    
    # Start TTS tunnel
    echo "Starting TTS tunnel (port 5000)..."
    ngrok http 5000 --domain=tts.clerktree.com > /tmp/ngrok-tts.log 2>&1 &
    NGROK_TTS_PID=$!
    sleep 3
    
    echo ""
    echo "✅ ngrok tunnels started"
    echo "   Ollama: https://ai.clerktree.com"
    echo "   TTS: https://tts.clerktree.com"
    echo ""
    echo "📝 Logs:"
    echo "   Ollama: tail -f /tmp/ngrok-ollama.log"
    echo "   TTS: tail -f /tmp/ngrok-tts.log"
    echo ""
    echo "⚠️  Note: Free ngrok requires custom domain setup"
    echo "   See: https://ngrok.com/docs/cloud-edge/modules/domains/"
    
else
    echo ""
    echo "🚀 Starting localtunnel..."
    echo ""
    
    # Start Ollama tunnel
    echo "Starting Ollama tunnel..."
    lt --port 11434 --subdomain ai-clerktree > /tmp/lt-ollama.log 2>&1 &
    LT_OLLAMA_PID=$!
    sleep 3
    
    # Start TTS tunnel
    echo "Starting TTS tunnel..."
    lt --port 5000 --subdomain tts-clerktree > /tmp/lt-tts.log 2>&1 &
    LT_TTS_PID=$!
    sleep 3
    
    echo ""
    echo "✅ localtunnel started"
    echo "   URLs will be shown in logs"
    echo ""
    echo "📝 Check logs for URLs:"
    echo "   Ollama: tail -f /tmp/lt-ollama.log"
    echo "   TTS: tail -f /tmp/lt-tts.log"
    echo ""
    echo "⚠️  Note: localtunnel URLs change each time"
    echo "   You'll need to update Namecheap DNS each restart"
fi

echo ""
echo "🧪 Test endpoints:"
echo "   curl https://ai.clerktree.com/api/tags"
echo "   curl https://tts.clerktree.com/health"
echo ""

