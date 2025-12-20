#!/bin/bash
# Script to fix TTS server.py on Railway

echo "🔧 Fixing TTS server.py on Railway..."

# Link to TTS service
railway link -p clerk-tts

# Create the fixed generate_tts function
cat > /tmp/new_generate_tts.py << 'FIXEDCODE'
def generate_tts(text: str, voice: str = "af_nova", speed: float = 1.0) -> Path:
    """Generate TTS audio file using Kokoro Python API."""
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro
    from pathlib import Path
    import hashlib
    
    # Cache for TTS engine (module-level)
    if not hasattr(generate_tts, '_tts_engine'):
        generate_tts._tts_engine = None
    
    OUTPUT_DIR = Path("output")
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    cache_key = hashlib.md5(f"{text}_{voice}_{speed}".encode()).hexdigest()
    output_path = OUTPUT_DIR / f"tts_{cache_key}.wav"
    
    if output_path.exists():
        return output_path
    
    try:
        # Initialize TTS engine if needed
        if generate_tts._tts_engine is None:
            generate_tts._tts_engine = Kokoro()
        
        # Synthesize speech
        audio = generate_tts._tts_engine.synthesize(text)
        
        # Save audio (Kokoro uses 22050 Hz sample rate)
        sf.write(str(output_path), audio, 22050)
        
        return output_path
    except Exception as e:
        raise RuntimeError(f"TTS generation failed: {str(e)}")
FIXEDCODE

echo "✅ Fixed function created. Now updating server.py on Railway..."
echo "⚠️  Note: You'll need to update your TTS service repository with this fix for it to persist."
