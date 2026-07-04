"""Structured extraction: raw document text -> {metadata, line_items[], clauses{}}.

One Groq call in JSON mode per document. This is the only place an LLM
touches the raw text — everything downstream (the diff) is deterministic.
"""

from __future__ import annotations

from typing import Any

from groq_client import complete_json

SYSTEM_PROMPT = """Du extrahierst strukturierte Daten aus deutschen Angeboten und Bestellungen \
im Maschinenbau. Antworte ausschließlich mit JSON in exakt diesem Schema:
{
  "metadata": {
    "doc_number": string | null,
    "customer": string | null,
    "payment_terms": string | null,
    "delivery_week": string | null,
    "incoterms": string | null
  },
  "line_items": [
    {
      "position_no": number,
      "article_no": string | null,
      "description": string,
      "qty": number,
      "unit_price": number,
      "delivery_date": string | null
    }
  ],
  "clauses": {
    "payment_terms": string | null,
    "delivery": string | null,
    "warranty": string | null,
    "penalties": string | null
  }
}
Erfinde keine Werte. Wenn ein Feld nicht im Dokument steht, setze null."""


def extract_document(raw_text: str) -> dict[str, Any]:
    return complete_json(SYSTEM_PROMPT, raw_text[:24000])
