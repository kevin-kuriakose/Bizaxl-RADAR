"""
RADAR Assistant API — whitelisted endpoint for the chat UI.
Routes the user's question through intent classification (LLM)
then executes the matched query and returns a formatted response.
"""
from __future__ import annotations
import frappe
from frappe.utils import flt, nowdate, get_first_day
from bizaxl_radar.assist.llm import classify

# ── Intent menu sent to the LLM ──────────────────────────────────────────────
_INTENT_MENU = """
sales_today        — user asks about today's sales total or revenue
sales_mtd          — user asks about this month's sales or revenue
outstanding        — user asks about outstanding, unpaid, or overdue invoices
top_customers      — user asks about best/top customers
low_stock          — user asks about low stock, items to reorder, stock levels
invoice_list       — user asks to list or show invoices (recent, unpaid, etc.)
sales_by_item      — user asks about best/top selling products or items
general_summary    — user asks for a general summary or overview
"""


@frappe.whitelist()
def ask(question: str) -> str | dict:
    """
    Main chat endpoint. Classifies intent, executes query, returns
    a formatted string or table dict for the UI to render.
    """
    try:
        result = classify(question, _INTENT_MENU)
        intent = result.get("intent")
        params = result.get("params", {})

        if intent == "sales_today":
            return _sales_today()
        elif intent == "sales_mtd":
            return _sales_mtd()
        elif intent == "outstanding":
            return _outstanding()
        elif intent == "top_customers":
            return _top_customers()
        elif intent == "low_stock":
            return _low_stock()
        elif intent == "invoice_list":
            return _invoice_list(params)
        elif intent == "sales_by_item":
            return _sales_by_item()
        elif intent == "general_summary":
            return _general_summary()
        else:
            return (
                "I can answer questions about sales, invoices, stock levels, "
                "and customers. Try asking: 'What were today's sales?' or "
                "'Show me unpaid invoices'."
            )
    except Exception:
        frappe.log_error(frappe.get_traceback(), "RADAR Assistant Error")
        return "I ran into an error processing your question. Please try again."


# ── Intent handlers ───────────────────────────────────────────────────────────

def _sales_today() -> str:
    today = nowdate()
    data = frappe.db.sql("""
        SELECT COALESCE(SUM(grand_total), 0) as total,
               COUNT(*) as count
        FROM `tabBA Sales Invoice`
        WHERE posting_date = %s AND docstatus = 1
    """, today, as_dict=True)
    total = flt(data[0].total) if data else 0
    count = data[0].count if data else 0
    cur = frappe.defaults.get_global_default("currency") or "₹"
    if total == 0:
        return f"No sales have been recorded today ({today}) yet."
    return (
        f"Today's total sales are **{cur} {total:,.2f}** "
        f"across {count} invoice{'s' if count != 1 else ''}."
    )


def _sales_mtd() -> str:
    today = nowdate()
    month_start = get_first_day(today)
    data = frappe.db.sql("""
        SELECT COALESCE(SUM(grand_total), 0) as total,
               COUNT(*) as count
        FROM `tabBA Sales Invoice`
        WHERE posting_date >= %s AND docstatus = 1
    """, month_start, as_dict=True)
    total = flt(data[0].total) if data else 0
    count = data[0].count if data else 0
    cur = frappe.defaults.get_global_default("currency") or "₹"
    if total == 0:
        return f"No sales recorded this month so far (from {month_start})."
    return (
        f"Sales this month (from {month_start}): **{cur} {total:,.2f}** "
        f"across {count} invoice{'s' if count != 1 else ''}."
    )


def _outstanding() -> dict:
    data = frappe.db.sql("""
        SELECT customer, outstanding_amount, status, name
        FROM `tabBA Sales Invoice`
        WHERE status IN ('Unpaid', 'Overdue') AND docstatus = 1
        ORDER BY outstanding_amount DESC
        LIMIT 20
    """, as_dict=True)
    cur = frappe.defaults.get_global_default("currency") or "₹"
    if not data:
        return "Great news — no outstanding invoices right now!"
    total = sum(flt(r.outstanding_amount) for r in data)
    overdue = [r for r in data if r.status == "Overdue"]
    return {
        "summary": (
            f"**{len(data)} outstanding invoices** totalling "
            f"{cur} {total:,.2f}. "
            f"{len(overdue)} overdue."
        ),
        "columns": ["Customer", "Amount", "Status"],
        "rows": [
            {
                "Customer": r.customer or "—",
                "Amount": f"{cur} {flt(r.outstanding_amount):,.2f}",
                "Status": r.status,
            }
            for r in data[:10]
        ],
    }


def _top_customers() -> dict:
    today = nowdate()
    month_start = get_first_day(today)
    data = frappe.db.sql("""
        SELECT customer,
               SUM(grand_total) as total,
               COUNT(*) as orders
        FROM `tabBA Sales Invoice`
        WHERE posting_date >= %s AND docstatus = 1
        GROUP BY customer
        ORDER BY total DESC
        LIMIT 10
    """, month_start, as_dict=True)
    cur = frappe.defaults.get_global_default("currency") or "₹"
    if not data:
        return "No customer sales found this month."
    return {
        "summary": f"Top customers by revenue this month (from {month_start}):",
        "columns": ["#", "Customer", "Revenue", "Orders"],
        "rows": [
            {
                "#": i + 1,
                "Customer": r.customer or "Unknown",
                "Revenue": f"{cur} {flt(r.total):,.2f}",
                "Orders": r.orders,
            }
            for i, r in enumerate(data)
        ],
    }


def _low_stock() -> dict | str:
    if not frappe.db.table_exists("tabShop Item"):
        return "Stock tracking is not set up yet for this site."
    data = frappe.db.sql("""
        SELECT item_name, stock_quantity, reorder_level, uom
        FROM `tabShop Item`
        WHERE reorder_level > 0
          AND stock_quantity <= reorder_level
        ORDER BY (reorder_level - stock_quantity) DESC
        LIMIT 20
    """, as_dict=True)
    if not data:
        return "All items are above their reorder levels. Stock looks good!"
    return {
        "summary": f"**{len(data)} item{'s' if len(data) != 1 else ''}** at or below reorder level:",
        "columns": ["Item", "Stock", "Reorder Level"],
        "rows": [
            {
                "Item": r.item_name or "—",
                "Stock": f"{flt(r.stock_quantity):.0f} {r.uom or ''}".strip(),
                "Reorder Level": f"{flt(r.reorder_level):.0f}",
            }
            for r in data
        ],
    }


def _invoice_list(params: dict) -> dict | str:
    status_filter = params.get("status")
    filters = "docstatus = 1"
    args = []
    if status_filter:
        filters += " AND status = %s"
        args.append(status_filter)
    data = frappe.db.sql(f"""
        SELECT name, customer, grand_total, status, posting_date
        FROM `tabBA Sales Invoice`
        WHERE {filters}
        ORDER BY posting_date DESC
        LIMIT 15
    """, args, as_dict=True)
    cur = frappe.defaults.get_global_default("currency") or "₹"
    if not data:
        return "No invoices found matching your query."
    return {
        "summary": f"Showing {len(data)} recent invoices:",
        "columns": ["Invoice", "Customer", "Amount", "Status", "Date"],
        "rows": [
            {
                "Invoice": r.name,
                "Customer": r.customer or "—",
                "Amount": f"{cur} {flt(r.grand_total):,.2f}",
                "Status": r.status,
                "Date": str(r.posting_date),
            }
            for r in data
        ],
    }


def _sales_by_item() -> dict | str:
    today = nowdate()
    month_start = get_first_day(today)

    # Try BA Sales Invoice Item first, fall back to standard
    table = "tabBA Sales Invoice Item" if frappe.db.table_exists("tabBA Sales Invoice Item") \
        else "tabSales Invoice Item"
    parent_table = "tabBA Sales Invoice" if frappe.db.table_exists("tabBA Sales Invoice") \
        else "tabSales Invoice"

    data = frappe.db.sql(f"""
        SELECT i.item_name,
               SUM(i.qty) as total_qty,
               SUM(i.amount) as total_amount
        FROM `{table}` i
        JOIN `{parent_table}` p ON p.name = i.parent
        WHERE p.posting_date >= %s AND p.docstatus = 1
        GROUP BY i.item_name
        ORDER BY total_amount DESC
        LIMIT 10
    """, month_start, as_dict=True)
    cur = frappe.defaults.get_global_default("currency") or "₹"
    if not data:
        return "No item sales data found for this month."
    return {
        "summary": f"Best selling items this month (from {month_start}):",
        "columns": ["Item", "Qty Sold", "Revenue"],
        "rows": [
            {
                "Item": r.item_name or "—",
                "Qty Sold": f"{flt(r.total_qty):.0f}",
                "Revenue": f"{cur} {flt(r.total_amount):,.2f}",
            }
            for r in data
        ],
    }


def _general_summary() -> str:
    today = nowdate()
    month_start = get_first_day(today)
    cur = frappe.defaults.get_global_default("currency") or "₹"

    today_data = frappe.db.sql("""
        SELECT COALESCE(SUM(grand_total),0) as t
        FROM `tabBA Sales Invoice`
        WHERE posting_date=%s AND docstatus=1
    """, today, as_dict=True)

    mtd_data = frappe.db.sql("""
        SELECT COALESCE(SUM(grand_total),0) as t
        FROM `tabBA Sales Invoice`
        WHERE posting_date>=%s AND docstatus=1
    """, month_start, as_dict=True)

    out_data = frappe.db.sql("""
        SELECT COALESCE(SUM(outstanding_amount),0) as t, COUNT(*) as c
        FROM `tabBA Sales Invoice`
        WHERE status IN ('Unpaid','Overdue') AND docstatus=1
    """, as_dict=True)

    sales_today = flt(today_data[0].t) if today_data else 0
    sales_mtd = flt(mtd_data[0].t) if mtd_data else 0
    outstanding = flt(out_data[0].t) if out_data else 0
    out_count = out_data[0].c if out_data else 0

    return (
        f"Here's your business summary:\n\n"
        f"• **Today's Sales:** {cur} {sales_today:,.2f}\n"
        f"• **Month-to-Date Sales:** {cur} {sales_mtd:,.2f}\n"
        f"• **Outstanding Receivables:** {cur} {outstanding:,.2f} ({out_count} invoices)\n\n"
        f"Ask me anything more specific about sales, customers, stock, or invoices!"
    )
