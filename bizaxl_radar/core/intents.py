"""
Deterministic intent engine — DocTypes mapped to bizaxl_erp BA-prefix schema.

The LLM classifies the question into one of these intents and extracts typed
parameters. It never touches the DB. Each handler here does the actual query
through the permission-safe data_access layer.

low_stock_items is stubbed — no standard BA Item/Bin DocType exists.
Configure it by checking your retail_erp Shop Item fields and updating the
handler below. Run: frappe.get_meta("Shop Item").fields to see available fields.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

import frappe
from frappe.utils import flt, fmt_money, getdate, nowdate

from bizaxl_radar.core import data_access as da


@dataclass
class IntentResult:
    summary: str
    columns: list[str]
    rows: list[dict]


ParamSpec = dict[str, tuple[type, bool, object]]


@dataclass
class Intent:
    key: str
    params: ParamSpec
    handler: Callable[[dict], IntentResult]


_INTENTS: dict[str, Intent] = {}


def intent(key: str, params: ParamSpec):
    def deco(fn):
        _INTENTS[key] = Intent(key=key, params=params, handler=fn)
        return fn
    return deco


def get_intent(key: str):
    return _INTENTS.get(key)


def coerce_params(spec: ParamSpec, raw: dict) -> dict:
    out: dict = {}
    for name, (typ, required, default) in spec.items():
        if name in raw and raw[name] not in (None, ""):
            try:
                out[name] = typ(raw[name])
            except (TypeError, ValueError):
                frappe.throw(f"Invalid value for '{name}'.")
        elif required:
            frappe.throw(f"Missing required parameter '{name}'.")
        else:
            out[name] = default
    return out


# ---------------------------------------------------------------------------
# Handlers
# ---------------------------------------------------------------------------

@intent("unpaid_invoices", params={"month": (str, False, None)})
def _unpaid_invoices(p: dict) -> IntentResult:
    filters = {"status": ["in", ["Unpaid", "Overdue"]], "docstatus": 1}
    if p.get("month"):
        filters["posting_date"] = [">=", getdate(f"{p['month']}-01")]
    rows = da.get_records(
        "BA Sales Invoice",
        filters=filters,
        fields=["name", "customer", "posting_date", "due_date",
                "outstanding_amount", "status"],
        order_by="due_date asc",
        limit=100,
    )
    total = sum(flt(r.get("outstanding_amount", 0)) for r in rows)
    cur = frappe.defaults.get_global_default("currency") or "INR"
    summary = (
        f"{len(rows)} unpaid/overdue invoice(s), "
        f"{fmt_money(total, currency=cur)} outstanding."
    )
    return IntentResult(
        summary=summary,
        columns=["name", "customer", "posting_date", "due_date",
                 "outstanding_amount", "status"],
        rows=rows,
    )


@intent("low_stock_items", params={})
def _low_stock_items(_p: dict) -> IntentResult:
    rows = da.get_records(
        "Shop Item",
        fields=["sku", "item_name", "stock_quantity", "reorder_level", "supplier"],
        limit=1000,
    )
    low = [
        r for r in rows
        if float(r.get("reorder_level") or 0) > 0
        and float(r.get("stock_quantity") or 0) <= float(r.get("reorder_level") or 0)
    ]
    return IntentResult(
        summary=f"{len(low)} item(s) at or below reorder level.",
        columns=["sku", "item_name", "stock_quantity", "reorder_level", "supplier"],
        rows=low,
    )


@intent("sales_today", params={"date": (str, False, None)})
def _sales_today(p: dict) -> IntentResult:
    day = p.get("date") or nowdate()
    rows = da.get_records(
        "BA Sales Invoice",
        filters={"posting_date": day, "docstatus": 1},
        fields=["name", "customer", "grand_total"],
        limit=500,
    )
    total = sum(flt(r.get("grand_total", 0)) for r in rows)
    cur = frappe.defaults.get_global_default("currency") or "INR"
    return IntentResult(
        summary=f"{fmt_money(total, currency=cur)} across {len(rows)} invoice(s) on {day}.",
        columns=["name", "customer", "grand_total"],
        rows=rows,
    )


@intent("top_customers", params={"month": (str, False, None), "limit": (int, False, 10)})
def _top_customers(p: dict) -> IntentResult:
    filters = {"docstatus": 1}
    if p.get("month"):
        filters["posting_date"] = [">=", getdate(f"{p['month']}-01")]
    rows = da.get_records(
        "BA Sales Invoice",
        filters=filters,
        fields=["customer", "grand_total"],
        limit=5000,
    )
    agg: dict[str, float] = {}
    for r in rows:
        agg[r["customer"]] = agg.get(r["customer"], 0) + flt(r.get("grand_total", 0))
    ranked = sorted(agg.items(), key=lambda kv: kv[1], reverse=True)[: p["limit"]]
    cur = frappe.defaults.get_global_default("currency") or "INR"
    out = [{"customer": c, "total": fmt_money(v, currency=cur)} for c, v in ranked]
    return IntentResult(
        summary=f"Top {len(out)} customer(s) by sales value.",
        columns=["customer", "total"],
        rows=out,
    )
