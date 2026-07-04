"""CPU embeddings for the RAG / project-memory copilot.

multilingual-e5-small: ~470MB, runs comfortably on a small CPU VPS, and
handles German text (unlike most English-only small embedding models).
E5 models expect a "query: " / "passage: " prefix convention.
"""

from __future__ import annotations

from functools import lru_cache

from config import EMBEDDING_MODEL


@lru_cache(maxsize=1)
def _model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(EMBEDDING_MODEL)


def embed_passage(text: str) -> list[float]:
    return _model().encode(f"passage: {text}", normalize_embeddings=True).tolist()


def embed_query(text: str) -> list[float]:
    return _model().encode(f"query: {text}", normalize_embeddings=True).tolist()
