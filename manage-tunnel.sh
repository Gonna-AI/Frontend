#!/bin/bash
# Manage the permanent Cloudflare Tunnel for ClerkTree backend

TUNNEL_NAME="clerk-backend"

case "$1" in
  start)
    echo "🚀 Starting permanent Cloudflare Tunnel..."
    cloudflared tunnel run $TUNNEL_NAME > /tmp/cloudflared-tunnel.log 2>&1 &
    echo "✅ Tunnel started in background"
    echo "📝 Logs: /tmp/cloudflared-tunnel.log"
    echo ""
    echo "🌐 Permanent URLs:"
    echo "   🤖 AI:  https://ai.clerktree.com"
    echo "   🎤 TTS: https://tts.clerktree.com"
    ;;
  stop)
    echo "🛑 Stopping Cloudflare Tunnel..."
    killall cloudflared 2>/dev/null
    echo "✅ Tunnel stopped"
    ;;
  status)
    if pgrep -f "cloudflared tunnel run" > /dev/null; then
      echo "✅ Tunnel is running"
      echo ""
      echo "🌐 URLs:"
      echo "   🤖 AI:  https://ai.clerktree.com"
      echo "   🎤 TTS: https://tts.clerktree.com"
      echo ""
      echo "📝 Logs: tail -f /tmp/cloudflared-tunnel.log"
    else
      echo "❌ Tunnel is not running"
      echo "   Start it with: ./manage-tunnel.sh start"
    fi
    ;;
  restart)
    echo "🔄 Restarting tunnel..."
    killall cloudflared 2>/dev/null
    sleep 2
    cloudflared tunnel run $TUNNEL_NAME > /tmp/cloudflared-tunnel.log 2>&1 &
    echo "✅ Tunnel restarted"
    ;;
  logs)
    tail -f /tmp/cloudflared-tunnel.log
    ;;
  *)
    echo "Usage: $0 {start|stop|status|restart|logs}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the permanent tunnel"
    echo "  stop    - Stop the tunnel"
    echo "  status  - Check if tunnel is running"
    echo "  restart - Restart the tunnel"
    echo "  logs    - View tunnel logs"
    exit 1
    ;;
esac

