"""Kostencheck Copilot worker API.

Exposes the public document-intake endpoint a customer's ERP posts to,
plus a background job runner that walks pipeline_jobs through
parse -> extract -> diff -> generate. Runs as a systemd service on the
Oracle VPS (see DEPLOY.md) alongside the existing thd-pipeline service.
"""

from __future__ import annotations

import asyncio
import logging
import shutil
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import db
from config import POLL_INTERVAL_SECONDS, PORT
from pipeline import process_job

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kostencheck.main")

UPLOAD_DIR = Path("/var/lib/kostencheck/uploads")


async def _job_runner_loop() -> None:
    while True:
        job = db.claim_next_job()
        if job is None:
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
            continue
        await asyncio.get_event_loop().run_in_executor(None, process_job, job)


@asynccontextmanager
async def lifespan(app: FastAPI):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    task = asyncio.create_task(_job_runner_loop())
    yield
    task.cancel()


app = FastAPI(title="Kostencheck Copilot Worker", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _authenticate(x_api_key: str | None) -> dict:
    if not x_api_key:
        raise HTTPException(status_code=401, detail="missing X-API-Key")
    company = db.get_company_by_api_key(x_api_key)
    if company is None:
        raise HTTPException(status_code=401, detail="invalid API key")
    return company


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/v1/documents")
async def submit_document(
    file: UploadFile,
    kind: str,
    doc_number: str | None = None,
    x_api_key: str | None = Header(default=None),
) -> dict:
    """A customer's ERP posts an Angebot or Bestellung PDF here.

    curl -X POST https://<worker-host>/api/v1/documents \\
      -H "X-API-Key: <company api key>" \\
      -F "kind=bestellung" -F "doc_number=B-88431" -F "file=@bestellung.pdf"
    """
    if kind not in ("angebot", "bestellung"):
        raise HTTPException(status_code=422, detail="kind must be 'angebot' or 'bestellung'")

    company = _authenticate(x_api_key)

    dest = UPLOAD_DIR / f"{uuid.uuid4()}_{file.filename}"
    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    document_id = db.insert_document(company["id"], kind, doc_number, str(dest))
    job_id = db.enqueue_job(document_id, "parse")

    return {"document_id": document_id, "job_id": job_id, "status": "queued"}


@app.get("/api/v1/documents/{document_id}")
def get_document(document_id: str, x_api_key: str | None = Header(default=None)) -> dict:
    company = _authenticate(x_api_key)
    document = db.get_document(document_id)
    if document is None or document["company_id"] != company["id"]:
        raise HTTPException(status_code=404, detail="document not found")
    return document


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
