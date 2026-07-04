"""Generates the four downstream documents from a completed diff.

Zusammenfassung / KickOff-Brief / Abweichungsbericht are free text (Groq).
The Abweichungsbericht's numbers come straight from the deviation rows we
already computed deterministically — the LLM is only asked to phrase them,
not to recompute them, so the euro figures can't drift from ground truth.
"""

from __future__ import annotations

from typing import Any

from groq_client import complete_text

SUMMARY_SYSTEM = "Du fasst eine Kostencheck-Abweichungsanalyse für ein Maschinenbau-Projekt in 3-4 prägnanten Sätzen auf Deutsch zusammen."
KICKOFF_SYSTEM = "Du schreibst einen kurzen KickOff-Brief für Auftragsleiter (AL) und Projektleiter Technik (PTL) auf Deutsch, basierend auf den erkannten Abweichungen und der Checkliste."
AB_SYSTEM = "Du formulierst den einleitenden Text einer Auftragsbestätigung (AB) auf Deutsch, der offene Abweichungen benennt, die vor Versand geklärt werden müssen."


def _deviation_lines(deviations: list[dict[str, Any]]) -> str:
    return "\n".join(
        f'- {d["type"]}: {d["description"]} (Impact: {d["impact_eur"]:+.2f} €, Konfidenz {d["confidence"]:.0%})'
        for d in deviations
    )


def generate_zusammenfassung(project_name: str, deviations: list[dict[str, Any]]) -> str:
    prompt = f"Projekt: {project_name}\nAbweichungen:\n{_deviation_lines(deviations)}"
    return complete_text(SUMMARY_SYSTEM, prompt)


def generate_kickoff_brief(project_name: str, customer_name: str,
                           checklist: list[dict[str, Any]]) -> str:
    checklist_lines = "\n".join(f'- [{c["priority"]}] {c["label"]}' for c in checklist)
    prompt = f"Projekt: {project_name}\nKunde: {customer_name}\nChecklistenpunkte:\n{checklist_lines}"
    return complete_text(KICKOFF_SYSTEM, prompt)


def generate_deviation_report(deviations: list[dict[str, Any]]) -> str:
    numbered = "\n".join(
        f'{i + 1}) {d["description"]} ({d["impact_eur"]:+.2f} €)' for i, d in enumerate(deviations)
    )
    return numbered


def generate_ab_draft(order_doc_number: str, deviations_needing_review: list[dict[str, Any]]) -> str:
    if not deviations_needing_review:
        prompt = f"Bestellung {order_doc_number}, keine offenen Abweichungen."
    else:
        items = ", ".join(d["description"] for d in deviations_needing_review)
        prompt = f"Bestellung {order_doc_number}, offene Abweichungen die vor Versand geklärt werden müssen: {items}."
    return complete_text(AB_SYSTEM, prompt)
