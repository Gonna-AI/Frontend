"""Speaks one article (a list of segments from src/utils/articleSpeech.ts) into an MP3.

Uses Kokoro (Apache-2.0, runs on a CPU, no account or API). The voice model is fetched once from the
project's GitHub releases into --models. Interview turns get the speaker's own voice; everything else
is read by the narrator.

    python synthesize.py --segments work/post.json --out public/journal/audio/post.mp3 --meta work/post.meta.json
"""
import argparse, json, subprocess, sys, urllib.request
from pathlib import Path

import numpy as np
from kokoro_onnx import Kokoro

RELEASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
MODEL, VOICES = "kokoro-v1.0.int8.onnx", "voices-v1.0.bin"
RATE = 24000
NARRATOR = "af_heart"
# Interview speakers by first name; anyone else cycles through the fallbacks.
SPEAKER_VOICES = {"Katharina": "af_heart", "Animesh": "am_michael", "Shobhit": "am_adam", "Kenshin": "am_eric", "Krishang": "am_liam"}
FALLBACKS = ["am_michael", "af_nicole", "am_adam", "af_sarah"]
# Seconds of silence before and after a segment, by kind.
PAUSE = {"title": (0.0, 1.0), "heading": (0.9, 0.5), "text": (0.0, 0.42), "note": (0.2, 0.5)}


def fetch(models: Path) -> Kokoro:
    models.mkdir(parents=True, exist_ok=True)
    for name in (MODEL, VOICES):
        target = models / name
        if not target.exists():
            print(f"downloading {name} …", file=sys.stderr)
            urllib.request.urlretrieve(RELEASE + name, target)
    return Kokoro(str(models / MODEL), str(models / VOICES))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--segments", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--meta", required=True, help="where to write {duration, bytes, chapters, starts}")
    ap.add_argument("--models", default=str(Path(__file__).parent / ".models"))
    ap.add_argument("--title", default="")
    ap.add_argument("--artist", default="ClerkTree")
    args = ap.parse_args()

    segments = json.loads(Path(args.segments).read_text())
    tts = fetch(Path(args.models))

    voices: dict[str, str] = {}
    def voice_for(speaker):
        if not speaker:
            return NARRATOR
        if speaker not in voices:
            voices[speaker] = SPEAKER_VOICES.get(speaker) or FALLBACKS[len(voices) % len(FALLBACKS)]
        return voices[speaker]

    chunks, starts, chapters, cursor = [], [], [], 0.0
    def add(samples):
        nonlocal cursor
        chunks.append(samples)
        cursor += len(samples) / RATE
    def silence(seconds):
        add(np.zeros(int(RATE * seconds), dtype=np.float32))

    for i, seg in enumerate(segments):
        before, after = PAUSE.get(seg["kind"], PAUSE["text"])
        if before and i:
            silence(before)
        starts.append(round(cursor, 2))
        if seg["kind"] == "heading" and seg.get("id"):
            chapters.append({"title": seg["text"], "id": seg["id"], "start": round(cursor, 2)})
        voice = voice_for(seg.get("speaker"))
        samples, _ = tts.create(seg["text"], voice=voice, speed=1.0, lang="en-us")
        add(samples.astype(np.float32))
        silence(after)
        print(f"  {i + 1}/{len(segments)} {cursor:6.0f}s", end="\r", file=sys.stderr)
    print(file=sys.stderr)

    audio = np.concatenate(chunks)
    # Gentle peak normalisation, so every article plays at a similar loudness.
    peak = float(np.max(np.abs(audio))) or 1.0
    pcm = (audio / peak * 0.89 * 32767).astype("<i2").tobytes()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(RATE), "-ac", "1", "-i", "-",
           "-codec:a", "libmp3lame", "-b:a", "48k", "-metadata", f"title={args.title}", "-metadata", f"artist={args.artist}",
           "-metadata", "album=ClerkTree Journal", "-id3v2_version", "3", str(out)]
    subprocess.run(cmd, input=pcm, check=True)
    Path(args.meta).write_text(json.dumps({
        "duration": round(len(audio) / RATE, 1), "bytes": out.stat().st_size, "chapters": chapters, "starts": starts,
    }))


if __name__ == "__main__":
    main()
