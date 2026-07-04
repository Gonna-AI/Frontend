"""Orchestrates one document through parse -> extract -> diff -> generate.

Called by the job runner in main.py once per claimed pipeline_jobs row.
Each stage is idempotent-ish and updates document/job status as it goes so
the Infrastructure/Live Stack dashboard page reflects real progress.
"""

from __future__ import annotations

import logging
from typing import Any

import db
import parsing
from clause_diff import compare_clause
from diff_engine import diff_line_items
from extraction import extract_document
from generate import (
    generate_ab_draft,
    generate_deviation_report,
    generate_kickoff_brief,
    generate_zusammenfassung,
)

logger = logging.getLogger("kostencheck.pipeline")

CHECKLIST_RULES = [
    # (article_no substring, label template, category, priority)
    ("TM-75", 'Sondermotor {article} bestellen — lange Lieferzeit prüfen', "procurement", "high"),
]


def process_job(job: dict[str, Any]) -> None:
    document = db.get_document(job["document_id"])
    if document is None:
        db.finish_job(job["id"], "error", "document not found")
        return

    try:
        if job["stage"] == "parse":
            _run_parse(document)
        elif job["stage"] == "extract":
            _run_extract(document)
        elif job["stage"] == "diff":
            _run_diff(document)
        elif job["stage"] == "generate":
            _run_generate(document)
        db.finish_job(job["id"], "done")
    except Exception as exc:  # noqa: BLE001 — surface any failure onto the job row
        logger.exception("job %s failed", job["id"])
        db.finish_job(job["id"], "error", str(exc))
        db.update_document(document["id"], status="error")


def _run_parse(document: dict[str, Any]) -> None:
    db.update_document(document["id"], status="parsing")
    raw_text = parsing.extract_text(document["file_url"])
    db.update_document(document["id"], raw_text=raw_text, status="parsed")
    db.enqueue_job(document["id"], "extract")


def _run_extract(document: dict[str, Any]) -> None:
    extracted = extract_document(document["raw_text"] or "")
    merged_metadata = {**document.get("metadata", {}), **extracted["metadata"], "clauses": extracted["clauses"]}
    db.update_document(document["id"], metadata=merged_metadata)
    db.insert_line_items(document["id"], extracted["line_items"])
    if document["kind"] == "bestellung":
        db.enqueue_job(document["id"], "diff")
    else:
        db.enqueue_job(document["id"], "generate")


def _run_diff(document: dict[str, Any]) -> None:
    quote_document = db.latest_quote_document(document["company_id"])
    if quote_document is None:
        raise RuntimeError("no matching Angebot found for this Bestellung")

    quote_items = db.get_line_items(quote_document["id"])
    order_items = db.get_line_items(document["id"])

    project = db.find_matching_project(document["company_id"], document["id"])
    if project is None:
        project_id = db.create_project(
            company_id=document["company_id"],
            name=f'{document.get("metadata", {}).get("customer", "Unbekannt")} – Kostencheck',
            customer_name=document.get("metadata", {}).get("customer"),
            quote_document_id=quote_document["id"],
            order_document_id=document["id"],
        )
    else:
        project_id = project["id"]

    for deviation in diff_line_items(quote_items, order_items):
        db.insert_deviation(
            project_id=project_id,
            quote_line_item_id=deviation.quote_item.get("id") if deviation.quote_item else None,
            order_line_item_id=deviation.order_item.get("id") if deviation.order_item else None,
            dtype=deviation.type,
            severity=deviation.severity,
            impact_eur=deviation.impact_eur,
            confidence=deviation.confidence,
            needs_review=deviation.needs_review,
            description=deviation.description,
        )
        _maybe_add_checklist_item(project_id, deviation)

    quote_clauses = quote_document.get("metadata", {}).get("clauses", {})
    order_clauses = document.get("metadata", {}).get("clauses", {})
    for label in ("payment_terms", "delivery", "warranty", "penalties"):
        result = compare_clause(label, quote_clauses.get(label), order_clauses.get(label))
        if result:
            db.insert_deviation(
                project_id=project_id, quote_line_item_id=None, order_line_item_id=None,
                dtype="CLAUSE_CHANGED", severity=result["severity"], impact_eur=0,
                confidence=result["confidence"], needs_review=result["confidence"] < 0.8,
                description=result["description"],
            )

    db.enqueue_job(document["id"], "generate")


def _maybe_add_checklist_item(project_id: str, deviation) -> None:
    for needle, template, category, priority in CHECKLIST_RULES:
        article = (deviation.order_item or deviation.quote_item or {}).get("article_no", "")
        if needle in (article or ""):
            db.insert_checklist_item(project_id, template.format(article=article), category, priority)


def _run_generate(document: dict[str, Any]) -> None:
    project = db.find_matching_project(document["company_id"], document["id"])
    if project is None:
        return  # a lone Angebot with no order yet — nothing to generate

    deviations = db.get_deviations(project["id"])
    zusammenfassung = generate_zusammenfassung(project["name"], deviations)
    db.insert_generated_doc(project["id"], "zusammenfassung", f'Zusammenfassung – {project["name"]}', zusammenfassung)

    report = generate_deviation_report(deviations)
    db.insert_generated_doc(project["id"], "deviation_report", f'Abweichungsbericht – {project["name"]}', report)

    needs_review = [d for d in deviations if d.get("needs_review")]
    ab_draft = generate_ab_draft(document.get("doc_number", ""), needs_review)
    db.insert_generated_doc(project["id"], "ab_draft", f'Auftragsbestätigung (Entwurf)', ab_draft)
