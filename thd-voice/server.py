"""Sesame CSM-1B voice API for the ClerkTree THD showcase.

CPU inference on the ARM A1 box takes well past Netlify's ~26s proxy
timeout, so speech runs as async jobs: POST /api/speak returns a job id,
the client polls /api/jobs/{id}, then streams /api/audio/{id}.wav.

A single worker thread serializes generation — the model is not
thread-safe and the box has few cores anyway.
"""

from __future__ import annotations

import os
import queue
import threading
import time
import uuid
from pathlib import Path

import soundfile as sf
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# unsloth mirror is ungated; override with HF_MODEL_ID + HF_TOKEN for the
# official sesame/csm-1b repo.
MODEL_ID = os.environ.get("HF_MODEL_ID", "unsloth/csm-1b")
AUDIO_DIR = Path("/tmp/sesame-audio")
MAX_TEXT_CHARS = 280
MAX_KEPT_JOBS = 40
SAMPLE_RATE = 24_000

AUDIO_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="ClerkTree Sesame Voice API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

JOBS: dict[str, dict] = {}
JOB_QUEUE: "queue.Queue[str]" = queue.Queue()
MODEL_STATE = {"ready": False, "error": None, "loaded_at": None}


class SpeakRequest(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_TEXT_CHARS)
    speaker: int = Field(default=0, ge=0, le=1)


def _load_model():
    from transformers import AutoProcessor, CsmForConditionalGeneration

    dtype = getattr(torch, os.environ.get("MODEL_DTYPE", "bfloat16"))
    processor = AutoProcessor.from_pretrained(MODEL_ID)
    model = CsmForConditionalGeneration.from_pretrained(
        MODEL_ID, torch_dtype=dtype, low_cpu_mem_usage=True
    )
    model.eval()
    return processor, model


def _worker() -> None:
    try:
        processor, model = _load_model()
        MODEL_STATE.update(ready=True, loaded_at=time.time())
    except Exception as exc:  # startup failure must be visible via /health
        MODEL_STATE["error"] = f"{type(exc).__name__}: {exc}"
        return

    while True:
        job_id = JOB_QUEUE.get()
        job = JOBS.get(job_id)
        if not job:
            continue
        job.update(status="generating", started_at=time.time())
        try:
            conversation = [
                {"role": str(job["speaker"]), "content": [{"type": "text", "text": job["text"]}]}
            ]
            inputs = processor.apply_chat_template(
                conversation, tokenize=True, return_dict=True, return_tensors="pt"
            )
            with torch.no_grad():
                audio = model.generate(**inputs, output_audio=True, max_new_tokens=1024)
            waveform = audio[0].to(torch.float32).cpu().numpy()
            out_path = AUDIO_DIR / f"{job_id}.wav"
            sf.write(out_path, waveform, SAMPLE_RATE)
            job.update(
                status="done",
                finished_at=time.time(),
                duration_s=round(len(waveform) / SAMPLE_RATE, 2),
                generation_s=round(time.time() - job["started_at"], 1),
            )
        except Exception as exc:
            job.update(status="failed", error=f"{type(exc).__name__}: {exc}")
        _evict_old_jobs()


def _evict_old_jobs() -> None:
    done = [j for j in JOBS.values() if j["status"] in ("done", "failed")]
    for job in sorted(done, key=lambda j: j["created_at"])[: max(0, len(done) - MAX_KEPT_JOBS)]:
        JOBS.pop(job["id"], None)
        (AUDIO_DIR / f"{job['id']}.wav").unlink(missing_ok=True)


threading.Thread(target=_worker, daemon=True).start()


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok" if MODEL_STATE["ready"] else ("error" if MODEL_STATE["error"] else "loading"),
        "model": MODEL_ID,
        "error": MODEL_STATE["error"],
        "queued": JOB_QUEUE.qsize(),
    }


@app.post("/api/speak")
def speak(req: SpeakRequest) -> dict:
    if MODEL_STATE["error"]:
        raise HTTPException(status_code=503, detail=MODEL_STATE["error"])
    job_id = uuid.uuid4().hex[:12]
    JOBS[job_id] = {
        "id": job_id,
        "text": req.text,
        "speaker": req.speaker,
        "status": "queued" if MODEL_STATE["ready"] else "waiting_for_model",
        "created_at": time.time(),
        "queue_position": JOB_QUEUE.qsize(),
    }
    JOB_QUEUE.put(job_id)
    return {"job_id": job_id, "status": JOBS[job_id]["status"]}


@app.get("/api/jobs/{job_id}")
def job_status(job_id: str) -> dict:
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="unknown job")
    public = {k: v for k, v in job.items() if k != "text"}
    if job["status"] == "done":
        public["audio_url"] = f"/api/audio/{job_id}.wav"
    return public


@app.get("/api/audio/{job_id}.wav")
def audio(job_id: str) -> FileResponse:
    path = AUDIO_DIR / f"{job_id}.wav"
    if not path.exists():
        raise HTTPException(status_code=404, detail="audio not ready")
    return FileResponse(path, media_type="audio/wav")
