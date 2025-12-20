# Fixed TTS Server Code

The TTS service is failing because it's trying to use `kokoro_onnx.cli` which doesn't exist. 
The package uses a Python API instead.

## The Fix

Replace the `generate_tts` function in your TTS service's `server.py` file with this version:

```python
def generate_tts(text: str, voice: str = "af_nova", speed: float = 1.0) -> Path:
    """Generate TTS audio file using Kokoro Python API."""
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro
    from pathlib import Path
    import hashlib
    
    # Create cache key
    cache_key = hashlib.md5(f"{text}_{voice}_{speed}".encode()).hexdigest()
    
    # Check cache
    if cache_key in audio_cache:
        cached_path = audio_cache[cache_key]
        if cached_path.exists():
            return cached_path
    
    # Generate output path
    output_path = OUTPUT_DIR / f"tts_{cache_key}.wav"
    
    # If file already exists, return it
    if output_path.exists():
        audio_cache[cache_key] = output_path
        return output_path
    
    try:
        # Initialize Kokoro TTS engine (cache it globally)
        if not hasattr(generate_tts, '_tts_engine'):
            generate_tts._tts_engine = Kokoro()
        
        # Synthesize speech using Python API
        audio = generate_tts._tts_engine.synthesize(text)
        
        # Save audio file (Kokoro uses 22050 Hz sample rate)
        sf.write(str(output_path), audio, 22050)
        
        if not output_path.exists():
            raise RuntimeError("TTS failed to generate audio file")
        
        # Cache the result
        audio_cache[cache_key] = output_path
        return output_path
        
    except Exception as e:
        raise RuntimeError(f"TTS generation failed: {str(e)}")
```

## Also update imports at the top of server.py

Add these imports at the top of your `server.py` file:

```python
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
```

## Remove the old subprocess code

Remove these lines from the `generate_tts` function:
- The `subprocess` call to `kokoro_onnx.cli`
- The `tempfile` creation for text files
- The `os.unlink(temp_file)` cleanup

## After updating

1. Commit and push the changes to your TTS service repository
2. Railway will automatically redeploy
3. The TTS service should work correctly
