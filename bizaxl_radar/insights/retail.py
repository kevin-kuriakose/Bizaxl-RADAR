"""
Reporting helpers for the retail vertical — using BA Sales Invoice.
"""

from __future__ import annotations

import frappe
from frappe.utils import flt, nowdate, get_first_day

from bizaxl_radar.core import data_access as da


@frappe.whitelist()
def sales_value_today() -> float:
    rows = da.get_records(
        "BA Sales Invoice",
        filters={"posting_date": nowdate(), "docstatus": 1},
        fields=["grand_total"], limit=1000,
    )
    return flt(sum(flt(r.get("grand_total", 0)) for r in rows))


@frappe.whitelist()
def sales_value_mtd() -> float:
    rows = da.get_records(
        "BA Sales Invoice",
        filters={"posting_date": [">=", get_first_day(nowdate())], "docstatus": 1},
        fields=["grand_total"], limit=10000,
    )
    return flt(sum(flt(r.get("grand_total", 0)) for r in rows))


@frappe.whitelist()
def outstanding_receivables() -> float:
    rows = da.get_records(
        "BA Sales Invoice",
        filters={"status": ["in", ["Unpaid", "Overdue"]], "docstatus": 1},
        fields=["outstanding_amount"], limit=10000,
    )
    return flt(sum(flt(r.get("outstanding_amount", 0)) for r in rows))
