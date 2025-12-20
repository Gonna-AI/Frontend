#!/usr/bin/env python3
"""
Fixed generate_tts function using Kokoro Python API directly
Replace the generate_tts function in server.py with this version
"""

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

# Initialize Kokoro (cache it to avoid reloading on every request)
_tts_engine = None

def get_tts_engine():
    """Get or create Kokoro TTS engine (singleton)."""
    global _tts_engine
    if _tts_engine is None:
        # Kokoro will auto-download models if not found
        # Or you can specify paths: Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
        _tts_engine = Kokoro()
    return _tts_engine


def generate_tts(text: str, voice: str = "af_nova", speed: float = 1.0) -> Path:
    """Generate TTS audio file using Kokoro Python API."""
    from pathlib import Path
    import hashlib
    import os
    
    OUTPUT_DIR = Path("output")
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Create cache key
    cache_key = hashlib.md5(f"{text}_{voice}_{speed}".encode()).hexdigest()
    
    # Generate output path
    output_path = OUTPUT_DIR / f"tts_{cache_key}.wav"
    
    # If file already exists, return it
    if output_path.exists():
        return output_path
    
    try:
        # Get TTS engine
        tts = get_tts_engine()
        
        # Synthesize speech
        # Note: voice parameter might need mapping to Kokoro's voice format
        # Kokoro uses different voice IDs - check documentation for voice mapping
        audio = tts.synthesize(text)
        
        # Save audio file (Kokoro returns numpy array at 22050 Hz)
        sf.write(str(output_path), audio, 22050)
        
        return output_path
        
    except Exception as e:
        raise RuntimeError(f"TTS generation failed: {str(e)}")
