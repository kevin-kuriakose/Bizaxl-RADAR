"""
Permission-safe data access for BizAxl RADAR.

All reads go through frappe.get_list (permission-enforcing).
DocType names match the BA-prefixed schema in bizaxl_erp.
"""

from __future__ import annotations

import frappe
from frappe import _

_COMPANY_AWARE = {
    "BA Sales Invoice",
    "BA Sales Order",
    "BA Purchase Invoice",
    "BA Purchase Order",
    "BA Payment Entry",
    "BA Journal Entry",
    "BA GL Entry",
}


def allowed_companies() -> list[str]:
    if not frappe.db.table_exists("tabBA Company"):
        return []
    return frappe.get_list("BA Company", pluck="name")


def _apply_company_scope(doctype: str, filters: dict) -> dict:
    if doctype not in _COMPANY_AWARE:
        return filters
    if "company" in filters:
        return filters
    companies = allowed_companies()
    if companies:
        filters = {**filters, "company": ["in", companies]}
    return filters


def get_records(
    doctype: str,
    *,
    filters: dict | None = None,
    fields: list[str] | None = None,
    order_by: str | None = None,
    limit: int | None = 50,
) -> list[dict]:
    filters = _apply_company_scope(doctype, dict(filters or {}))
    return frappe.get_list(
        doctype,
        filters=filters,
        fields=fields or ["name"],
        order_by=order_by,
        limit_page_length=limit,
        ignore_permissions=False,
    )


def get_count(doctype: str, *, filters: dict | None = None) -> int:
    filters = _apply_company_scope(doctype, dict(filters or {}))
    return len(frappe.get_list(
        doctype, filters=filters, limit_page_length=0, ignore_permissions=False
    ))


def run_permitted_aggregate(doctype: str, query: str, values: dict) -> list[dict]:
    if not frappe.has_permission(doctype, "read"):
        raise frappe.PermissionError(_("Not permitted to read {0}").format(doctype))
    return frappe.db.sql(query, values, as_dict=True)
