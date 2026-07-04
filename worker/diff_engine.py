"""Deterministic line-item diff between an Angebot (quote) and Bestellung (order).

Everything here is plain arithmetic and fuzzy string matching — no LLM.
That's the point: a customer's engineer can verify every euro figure by
hand. The only place an LLM re-enters is clause_diff.py, for prose that
can't be diffed as structured rows.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from rapidfuzz import fuzz

FUZZY_MATCH_THRESHOLD = 70


@dataclass
class Deviation:
    quote_item: dict[str, Any] | None
    order_item: dict[str, Any] | None
    type: str
    severity: str
    impact_eur: float
    confidence: float
    needs_review: bool
    description: str


def _line_total(item: dict[str, Any]) -> float:
    return float(item.get("qty") or 0) * float(item.get("unit_price") or 0)


def _match_by_article(order_items: list[dict], article_no: str | None) -> dict | None:
    if not article_no:
        return None
    for item in order_items:
        if item.get("article_no") == article_no:
            return item
    return None


def _best_fuzzy_match(order_items: list[dict], description: str) -> dict | None:
    best_item, best_score = None, 0
    for item in order_items:
        score = fuzz.token_sort_ratio(description, item.get("description") or "")
        if score > best_score:
            best_item, best_score = item, score
    if best_score >= FUZZY_MATCH_THRESHOLD:
        return best_item
    return None


def diff_line_items(quote_items: list[dict[str, Any]], order_items: list[dict[str, Any]]) -> list[Deviation]:
    deviations: list[Deviation] = []
    matched_order_ids: set[Any] = set()

    for quote_item in quote_items:
        order_item = _match_by_article(order_items, quote_item.get("article_no"))
        if order_item is None:
            order_item = _best_fuzzy_match(
                [o for o in order_items if o.get("id") not in matched_order_ids],
                quote_item.get("description") or "",
            )

        if order_item is None:
            deviations.append(
                Deviation(
                    quote_item=quote_item,
                    order_item=None,
                    type="REMOVED",
                    severity="high",
                    impact_eur=-_line_total(quote_item),
                    confidence=0.95,
                    needs_review=True,
                    description=f'Position "{quote_item.get("description")}" fehlt vollständig in der Bestellung.',
                )
            )
            continue

        matched_order_ids.add(order_item.get("id"))
        qty_changed = float(quote_item.get("qty") or 0) != float(order_item.get("qty") or 0)
        price_changed = float(quote_item.get("unit_price") or 0) != float(order_item.get("unit_price") or 0)
        article_changed = (
            quote_item.get("article_no")
            and order_item.get("article_no")
            and quote_item["article_no"] != order_item["article_no"]
        )
        impact = _line_total(order_item) - _line_total(quote_item)

        if article_changed:
            deviations.append(
                Deviation(
                    quote_item=quote_item, order_item=order_item, type="PRICE_CHANGED", severity="high",
                    impact_eur=impact, confidence=0.9, needs_review=True,
                    description=(
                        f'{quote_item.get("description")} ({quote_item.get("article_no")}) wurde in der Bestellung '
                        f'durch {order_item.get("article_no")} ersetzt.'
                    ),
                )
            )
        elif qty_changed:
            deviations.append(
                Deviation(
                    quote_item=quote_item, order_item=order_item, type="QTY_CHANGED", severity="medium",
                    impact_eur=impact, confidence=0.97, needs_review=False,
                    description=(
                        f'Menge {quote_item.get("description")} geändert: '
                        f'{quote_item.get("qty")} → {order_item.get("qty")}.'
                    ),
                )
            )
        elif price_changed:
            deviations.append(
                Deviation(
                    quote_item=quote_item, order_item=order_item, type="PRICE_CHANGED", severity="medium",
                    impact_eur=impact, confidence=0.9, needs_review=True,
                    description=f'Preis geändert bei {quote_item.get("description")}.',
                )
            )
        # else: MATCH — no deviation row needed for the demo, but could be logged for completeness.

    for order_item in order_items:
        if order_item.get("id") in matched_order_ids:
            continue
        deviations.append(
            Deviation(
                quote_item=None, order_item=order_item, type="ADDED", severity="medium",
                impact_eur=_line_total(order_item), confidence=0.9, needs_review=True,
                description=f'Neue Position in der Bestellung ohne Entsprechung im Angebot: {order_item.get("description")}.',
            )
        )

    return deviations
