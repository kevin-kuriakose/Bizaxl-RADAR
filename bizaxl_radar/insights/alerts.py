"""
Alert scanners — uses BA-prefixed DocTypes from bizaxl_erp.
"""

from __future__ import annotations

import frappe
from frappe.utils import flt


def dispatch(*, title: str, body: str, users: list[str] | None = None) -> None:
    _send_inapp(title, body, users or _system_managers())


def _system_managers() -> list[str]:
    return frappe.get_list(
        "Has Role", filters={"role": "System Manager"}, pluck="parent",
        ignore_permissions=True,
    )


def _send_inapp(title: str, body: str, users: list[str]) -> None:
    for user in set(users):
        frappe.get_doc({
            "doctype": "Notification Log",
            "subject": title,
            "email_content": body,
            "for_user": user,
            "type": "Alert",
        }).insert(ignore_permissions=True)


def scan_overdue_invoices() -> None:
    if not frappe.db.table_exists("tabBA Sales Invoice"):
        return
    rows = frappe.get_all(
        "BA Sales Invoice",
        filters={"status": "Overdue", "docstatus": 1},
        fields=["name", "customer", "outstanding_amount"],
    )
    if not rows:
        return
    total = sum(flt(r["outstanding_amount"]) for r in rows)
    dispatch(
        title=f"{len(rows)} overdue BA Sales Invoice(s)",
        body=f"Total outstanding: {total}. Oldest: {rows[0]['name']} ({rows[0]['customer']}).",
    )


def scan_low_stock() -> None:
    # Stub — configure once you identify your item DocType.
    pass
