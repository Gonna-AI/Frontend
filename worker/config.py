"""Environment configuration for the Kostencheck Copilot worker.

Loaded from a local .env file (see .env.example). Never commit real secrets.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()


def _require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


DATABASE_URL = _require("DATABASE_URL")
GROQ_API_KEY = _require("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "intfloat/multilingual-e5-small")
PORT = int(os.environ.get("PORT", "8200"))
POLL_INTERVAL_SECONDS = float(os.environ.get("POLL_INTERVAL_SECONDS", "3"))

# Browsers allowed to call the API cross-origin (comma separated). ERP systems post server to
# server and do not need CORS, so the default is just the website.
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "https://clerktree.com").split(",") if o.strip()]
MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_BYTES", str(25 * 1024 * 1024)))
