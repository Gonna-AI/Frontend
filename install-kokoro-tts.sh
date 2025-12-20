#!/bin/bash

# Script to install kokoro-onnx on Railway TTS service
# Usage: ./install-kokoro-tts.sh

echo "🔧 Installing Kokoro TTS on Railway..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Install it with: npm i -g @railway/cli"
    exit 1
fi

echo "📦 Installing kokoro-onnx package..."
railway run pip install kokoro-onnx soundfile

if [ $? -eq 0 ]; then
    echo "✅ Package installed successfully!"
    echo ""
    echo "🔄 Restarting service..."
    railway service restart
    
    echo ""
    echo "✅ Done! The TTS service should now work with Kokoro TTS."
    echo "💡 Note: If the package doesn't persist after restart, add it to requirements.txt"
else
    echo "❌ Installation failed. Make sure you're linked to the correct Railway service."
    echo "💡 Run: railway link (and select your TTS service)"
fi
