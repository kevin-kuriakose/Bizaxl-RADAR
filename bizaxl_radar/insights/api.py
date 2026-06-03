"""
Dashboard data + AI narrative endpoints for RADAR.

The AI narrative uses Groq to summarise REAL, already-fetched business data
into 2-3 sentences. It never predicts or invents numbers — it reads what
get_dashboard_data() returns and writes a plain-English observation.
"""

from __future__ import annotations
import frappe
from frappe.utils import flt, nowdate, get_first_day
from bizaxl_radar.core.data_access import get_records
import requests


@frappe.whitelist()
def get_dashboard_data() -> dict:
    today = nowdate()
    month_start = get_first_day(today)
    cur = frappe.defaults.get_global_default("currency") or "INR"

    # --- sales today ---
    today_invs = get_records(
        "BA Sales Invoice",
        filters={"posting_date": today, "docstatus": 1},
        fields=["grand_total"], limit=1000,
    )
    sales_today = sum(flt(r.get("grand_total", 0)) for r in today_invs)

    # --- sales MTD ---
    mtd_invs = get_records(
        "BA Sales Invoice",
        filters={"posting_date": [">=", month_start], "docstatus": 1},
        fields=["customer", "grand_total"], limit=10000,
    )
    sales_mtd = sum(flt(r.get("grand_total", 0)) for r in mtd_invs)

    # --- outstanding ---
    unpaid = get_records(
        "BA Sales Invoice",
        filters={"status": ["in", ["Unpaid", "Overdue"]], "docstatus": 1},
        fields=["customer", "outstanding_amount", "status"], limit=10000,
    )
    outstanding = sum(flt(r.get("outstanding_amount", 0)) for r in unpaid)
    overdue_count = sum(1 for r in unpaid if r.get("status") == "Overdue")

    # --- top customer MTD ---
    cust_agg: dict[str, float] = {}
    for r in mtd_invs:
        c = r.get("customer") or "Unknown"
        cust_agg[c] = cust_agg.get(c, 0) + flt(r.get("grand_total", 0))
    top_customers = sorted(cust_agg.items(), key=lambda x: x[1], reverse=True)[:5]

    # --- low stock ---
    low_stock_count = 0
    low_stock_items = []
    if frappe.db.table_exists("tabShop Item"):
        items = get_records(
            "Shop Item",
            fields=["item_name", "stock_quantity", "reorder_level"], limit=500,
        )
        low = [r for r in items
               if flt(r.get("reorder_level", 0)) > 0
               and flt(r.get("stock_quantity", 0)) <= flt(r.get("reorder_level", 0))]
        low_stock_count = len(low)
        low_stock_items = low[:5]

    return {
        "sales_today": sales_today,
        "sales_mtd": sales_mtd,
        "outstanding": outstanding,
        "unpaid_count": len(unpaid),
        "overdue_count": overdue_count,
        "top_customers": [{"customer": c, "total": v} for c, v in top_customers],
        "low_stock_count": low_stock_count,
        "low_stock_items": low_stock_items,
        "currency": cur,
    }


@frappe.whitelist()
def get_ai_narrative() -> dict:
    api_key = frappe.conf.get("radar_groq_api_key")
    if not api_key:
        return {"narrative": "AI insights unavailable — set radar_groq_api_key in site config."}

    d = get_dashboard_data()

    prompt = (
        f"Business snapshot for today:\n"
        f"- Sales today: {d['currency']} {d['sales_today']:,.2f}\n"
        f"- Sales this month: {d['currency']} {d['sales_mtd']:,.2f}\n"
        f"- Outstanding receivables: {d['currency']} {d['outstanding']:,.2f} "
        f"({d['unpaid_count']} invoices, {d['overdue_count']} overdue)\n"
        f"- Top customer this month: {d['top_customers'][0]['customer'] if d['top_customers'] else 'none'}\n"
        f"- Items below reorder level: {d['low_stock_count']}\n\n"
        "Write exactly 2-3 sentences of direct, actionable business insight for the owner. "
        "Be specific with the numbers. Highlight the single most urgent thing. "
        "Do not use bullet points or headers. Do not predict — only describe what the numbers show."
    )

    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 200,
            "temperature": 0.3,
        },
        timeout=15,
    )
    resp.raise_for_status()
    narrative = resp.json()["choices"][0]["message"]["content"].strip()
    return {"narrative": narrative, "data": d}
