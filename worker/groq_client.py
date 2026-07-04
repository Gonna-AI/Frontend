"""Thin wrapper around the Groq chat completions API."""

from __future__ import annotations

import json
from typing import Any

from groq import Groq

from config import GROQ_API_KEY, GROQ_MODEL

_client = Groq(api_key=GROQ_API_KEY)


def complete_json(system_prompt: str, user_prompt: str, temperature: float = 0.1) -> dict[str, Any]:
    """Call Groq with JSON-mode and parse the response. Caller defines the schema in the prompt."""
    response = _client.chat.completions.create(
        model=GROQ_MODEL,
        temperature=temperature,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return json.loads(response.choices[0].message.content)


def complete_text(system_prompt: str, user_prompt: str, temperature: float = 0.3) -> str:
    response = _client.chat.completions.create(
        model=GROQ_MODEL,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content
