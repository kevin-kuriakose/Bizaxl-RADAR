"""
Vertical configuration — the part of RADAR that is actually defensible.

A "vertical" bundles the doctypes, KPIs, and the set of questions the assistant
understands for a given client type (RetailEdge, MuseumEdge, ...). The NL
plumbing is commoditised; THIS is where domain knowledge accrues and compounds.

Add a vertical by registering a VerticalConfig. The assistant and the insights
module both read from this registry, so a new vertical is configured in one
place rather than threaded through the codebase.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class VerticalConfig:
    key: str                      # "retail", "museum"
    label: str                    # "RetailEdge"
    # Intent keys (see core/intents.py) this vertical exposes to the assistant.
    intents: tuple[str, ...]
    # Human descriptions used to build the LLM's intent menu. Keep these in the
    # client's language and domain vocabulary — this is the tuning surface.
    intent_descriptions: dict[str, str] = field(default_factory=dict)


_REGISTRY: dict[str, VerticalConfig] = {}


def register(cfg: VerticalConfig) -> None:
    _REGISTRY[cfg.key] = cfg


def get(key: str) -> VerticalConfig:
    if key not in _REGISTRY:
        raise KeyError(f"Unknown vertical '{key}'. Registered: {list(_REGISTRY)}")
    return _REGISTRY[key]


def all_keys() -> list[str]:
    return list(_REGISTRY)


# --- RetailEdge -------------------------------------------------------------
register(
    VerticalConfig(
        key="retail",
        label="RetailEdge",
        intents=(
            "unpaid_invoices",
            "low_stock_items",
            "sales_today",
            "top_customers",
        ),
        intent_descriptions={
            "unpaid_invoices": "List unpaid / overdue sales invoices, optionally for a period.",
            "low_stock_items": "List items at or below their reorder level.",
            "sales_today": "Total sales value for a day (defaults to today).",
            "top_customers": "Customers ranked by sales value over a period.",
        },
    )
)

# --- MuseumEdge (intents to be authored as the data model firms up) ---------
register(
    VerticalConfig(
        key="museum",
        label="MuseumEdge",
        intents=(
            "unpaid_invoices",   # shared billing intents reuse the same handler
        ),
        intent_descriptions={
            "unpaid_invoices": "List unpaid invoices (memberships, facility hire, etc.).",
        },
    )
)
