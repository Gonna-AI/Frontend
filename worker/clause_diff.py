"""Semantic clause-pair comparison — the one place an LLM adds real value.

Structured line items are diffed deterministically (diff_engine.py). Prose
clauses (payment terms, delivery, warranty, penalties) can't be diffed as
rows, so each quote/order pair is handed to Groq with a small, cheap prompt
asking specifically whether the *meaning* changed and how severe that is.
This is what catches "30 Tage netto" -> "60 Tage netto" buried in a
paragraph that a keyword diff would miss if the surrounding text changed.
"""

from __future__ import annotations

from typing import Any

from groq_client import complete_json

SYSTEM_PROMPT = """Du vergleichst zwei Vertragsklausel-Texte (Angebot vs. Bestellung) auf \
inhaltliche Änderungen, z.B. Zahlungsziel, Lieferbedingungen, Gewährleistung, Vertragsstrafen. \
Antworte ausschließlich mit JSON:
{
  "changed": boolean,
  "severity": "low" | "medium" | "high",
  "confidence": number,
  "description": string
}
"changed" ist nur true bei einer inhaltlichen Änderung, nicht bei reiner Umformulierung. \
"confidence" ist niedriger, wenn die Änderung im Fließtext versteckt ist statt klar hervorgehoben."""


def compare_clause(label: str, quote_text: str | None, order_text: str | None) -> dict[str, Any] | None:
    if not quote_text and not order_text:
        return None
    if quote_text == order_text:
        return None

    user_prompt = f"Klausel: {label}\nAngebot: {quote_text or '(nicht vorhanden)'}\nBestellung: {order_text or '(nicht vorhanden)'}"
    result = complete_json(SYSTEM_PROMPT, user_prompt)
    return result if result.get("changed") else None
