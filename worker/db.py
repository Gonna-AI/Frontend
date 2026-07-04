"""Thin Postgres access layer for the Kostencheck worker.

Uses a direct psycopg2 connection (the worker needs joins and jsonb writes
that are simplest expressed as plain SQL) rather than the Supabase REST
client. Connect via the Postgres connection string with the service role
(bypasses RLS, which is expected for a trusted backend worker).
"""

from __future__ import annotations

import json
from contextlib import contextmanager
from typing import Any, Iterator

import psycopg2
import psycopg2.extras

from config import DATABASE_URL


@contextmanager
def get_conn() -> Iterator[psycopg2.extensions.connection]:
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def fetch_one(query: str, params: tuple = ()) -> dict[str, Any] | None:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, params)
            row = cur.fetchone()
            return dict(row) if row else None


def fetch_all(query: str, params: tuple = ()) -> list[dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, params)
            return [dict(r) for r in cur.fetchall()]


def execute(query: str, params: tuple = ()) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)


def execute_returning_id(query: str, params: tuple = ()) -> str:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchone()[0]


def get_company_by_api_key(api_key: str) -> dict[str, Any] | None:
    return fetch_one("select * from pipeline_companies where api_key = %s", (api_key,))


def insert_document(company_id: str, kind: str, doc_number: str | None, file_url: str | None) -> str:
    return execute_returning_id(
        """
        insert into pipeline_documents (company_id, kind, doc_number, file_url, status)
        values (%s, %s, %s, %s, 'uploaded')
        returning id
        """,
        (company_id, kind, doc_number, file_url),
    )


def enqueue_job(document_id: str, stage: str) -> str:
    return execute_returning_id(
        "insert into pipeline_jobs (document_id, stage, status) values (%s, %s, 'queued') returning id",
        (document_id, stage),
    )


def claim_next_job() -> dict[str, Any] | None:
    """Atomically claim the oldest queued job so multiple worker instances don't race."""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                update pipeline_jobs
                set status = 'processing', updated_at = now()
                where id = (
                    select id from pipeline_jobs
                    where status = 'queued'
                    order by created_at
                    for update skip locked
                    limit 1
                )
                returning *
                """
            )
            row = cur.fetchone()
            return dict(row) if row else None


def finish_job(job_id: str, status: str, error_message: str | None = None) -> None:
    execute(
        "update pipeline_jobs set status = %s, error_message = %s, updated_at = now() where id = %s",
        (status, error_message, job_id),
    )


def update_document(document_id: str, **fields: Any) -> None:
    if not fields:
        return
    set_clause = ", ".join(f"{key} = %s" for key in fields)
    values = list(fields.values())
    if "metadata" in fields:
        idx = list(fields.keys()).index("metadata")
        values[idx] = json.dumps(fields["metadata"])
    execute(f"update pipeline_documents set {set_clause} where id = %s", (*values, document_id))


def insert_line_items(document_id: str, items: list[dict[str, Any]]) -> None:
    if not items:
        return
    with get_conn() as conn:
        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                """
                insert into pipeline_line_items
                    (document_id, position_no, article_no, description, qty, unit_price, delivery_date, raw)
                values %s
                """,
                [
                    (
                        document_id,
                        item.get("position_no"),
                        item.get("article_no"),
                        item.get("description"),
                        item.get("qty"),
                        item.get("unit_price"),
                        item.get("delivery_date"),
                        json.dumps(item),
                    )
                    for item in items
                ],
            )


def get_line_items(document_id: str) -> list[dict[str, Any]]:
    return fetch_all("select * from pipeline_line_items where document_id = %s", (document_id,))


def get_document(document_id: str) -> dict[str, Any] | None:
    return fetch_one("select * from pipeline_documents where id = %s", (document_id,))


def find_matching_project(company_id: str, order_document_id: str) -> dict[str, Any] | None:
    return fetch_one(
        "select * from pipeline_projects where company_id = %s and order_document_id = %s",
        (company_id, order_document_id),
    )


def create_project(company_id: str, name: str, customer_name: str | None,
                    quote_document_id: str | None, order_document_id: str) -> str:
    return execute_returning_id(
        """
        insert into pipeline_projects (company_id, name, customer_name, quote_document_id, order_document_id)
        values (%s, %s, %s, %s, %s)
        returning id
        """,
        (company_id, name, customer_name, quote_document_id, order_document_id),
    )


def latest_quote_document(company_id: str) -> dict[str, Any] | None:
    return fetch_one(
        """
        select * from pipeline_documents
        where company_id = %s and kind = 'angebot'
        order by uploaded_at desc
        limit 1
        """,
        (company_id,),
    )


def insert_deviation(project_id: str, quote_line_item_id: str | None, order_line_item_id: str | None,
                      dtype: str, severity: str, impact_eur: float, confidence: float,
                      needs_review: bool, description: str) -> None:
    execute(
        """
        insert into pipeline_deviations
            (project_id, quote_line_item_id, order_line_item_id, type, severity, impact_eur, confidence, needs_review, description)
        values (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (project_id, quote_line_item_id, order_line_item_id, dtype, severity, impact_eur, confidence, needs_review, description),
    )


def get_deviations(project_id: str) -> list[dict[str, Any]]:
    return fetch_all(
        "select * from pipeline_deviations where project_id = %s order by created_at",
        (project_id,),
    )


def insert_checklist_item(project_id: str, label: str, category: str, priority: str) -> None:
    execute(
        "insert into pipeline_checklist_items (project_id, label, category, priority) values (%s, %s, %s, %s)",
        (project_id, label, category, priority),
    )


def insert_generated_doc(project_id: str, kind: str, title: str, content: str) -> None:
    execute(
        "insert into pipeline_generated_docs (project_id, kind, title, content) values (%s, %s, %s, %s)",
        (project_id, kind, title, content),
    )


def historical_projects_missing_embeddings(company_id: str, limit: int = 20) -> list[dict[str, Any]]:
    return fetch_all(
        "select * from pipeline_historical_projects where company_id = %s and embedding is null limit %s",
        (company_id, limit),
    )


def set_historical_embedding(row_id: str, embedding: list[float]) -> None:
    execute(
        "update pipeline_historical_projects set embedding = %s where id = %s",
        (embedding, row_id),
    )


def search_similar_projects(company_id: str, embedding: list[float], limit: int = 5) -> list[dict[str, Any]]:
    return fetch_all(
        """
        select id, title, summary, outcome, embedding <=> %s::vector as distance
        from pipeline_historical_projects
        where company_id = %s and embedding is not null
        order by embedding <=> %s::vector
        limit %s
        """,
        (embedding, company_id, embedding, limit),
    )
