"""
bizaxl_radar/bizaxl_radar/intelligence/domain_loader.py

Domain Intelligence Loader
──────────────────────────
Reads the active business profile (set during RADAR setup) and returns
domain-specific configuration:
  • AI system prompt additions (injected into BizBot + RADAR recommendations)
  • Domain KPI definitions (extra rows in the RADAR KPI strip)
  • Vision document type hints (shown when user uploads an image)
  • Anomaly rules (thresholds that colour the AI recommendations)

Adding a new vertical:
  1. Add a config block to DOMAIN_CONFIGS
  2. Map its category names in CATEGORY_MAP
  No other changes needed — api.py and chat.py auto-pick it up.
"""

from __future__ import annotations
import json
import frappe

# ── Domain config registry ─────────────────────────────────────────────────────

DOMAIN_CONFIGS: dict[str, dict] = {

    "retail": {
        "label": "Retail / General Trade",
        "icon": "🛍️",
        "color": "#f59e0b",
        "system_prompt": (
            "You are a retail business intelligence analyst embedded in BizAxl ERP. "
            "Key focus areas: sales velocity, inventory turnover, stockout risk, "
            "customer repeat-purchase rates, margin protection on discounts. "
            "Proactively flag: items with zero sales in 30 days, customers whose "
            "purchase frequency has dropped, invoices with unusually high discounts (>25%), "
            "and stock nearing reorder point. "
            "Use INR as the default currency."
        ),
        "kpis": [
            {
                "label": "Items Low Stock",
                "query": (
                    "SELECT COUNT(*) FROM `tabBA Item` "
                    "WHERE current_stock < min_order_qty AND current_stock > 0"
                ),
                "icon": "⚠️", "color": "#f59e0b", "fallback": 0,
            },
            {
                "label": "Avg Invoice (MTD)",
                "query": (
                    "SELECT ROUND(COALESCE(AVG(grand_total),0),0) "
                    "FROM `tabBA Sales Invoice` "
                    "WHERE MONTH(posting_date)=MONTH(CURDATE()) "
                    "AND YEAR(posting_date)=YEAR(CURDATE()) "
                    "AND status != 'Cancelled'"
                ),
                "icon": "📊", "color": "#6366f1", "fallback": 0, "prefix": "₹",
            },
        ],
        "anomaly_rules": [
            {
                "check": "high_discount",
                "message": "Several invoices this month have discounts above 25% — check margin impact.",
            },
            {
                "check": "low_stock_count",
                "threshold": 5,
                "message": "More than 5 items are below reorder point — review purchase orders.",
            },
        ],
        "vision_documents": ["Purchase Bill", "Delivery Note", "Stock Transfer", "Price List", "GRN"],
        "recommendations_context": (
            "The business is in retail. Focus recommendations on: "
            "inventory health (slow-movers, stockouts), customer retention, "
            "margin protection, and sales trend anomalies."
        ),
    },

    "logistics": {
        "label": "Logistics & Transportation",
        "icon": "🚛",
        "color": "#0ea5e9",
        "system_prompt": (
            "You are a logistics and fleet operations analyst embedded in BizAxl ERP. "
            "Key focus areas: shipment delivery vs SLA, vehicle fuel efficiency, "
            "driver utilisation, freight cost per km, and customs/compliance deadlines. "
            "Proactively flag: overdue deliveries, vehicles due for service, "
            "routes with high idle time, and consignments approaching dwell-time limits."
        ),
        "kpis": [
            {
                "label": "Active Shipments",
                "query": "SELECT COUNT(*) FROM `tabShipment` WHERE status='In Transit'",
                "icon": "🚚", "color": "#0ea5e9", "fallback": 0,
            },
            {
                "label": "Overdue Deliveries",
                "query": (
                    "SELECT COUNT(*) FROM `tabShipment` "
                    "WHERE expected_delivery < CURDATE() "
                    "AND status NOT IN ('Delivered','Cancelled')"
                ),
                "icon": "🔴", "color": "#ef4444", "fallback": 0,
            },
        ],
        "vision_documents": [
            "Bill of Lading", "Waybill", "Proof of Delivery",
            "Freight Invoice", "Customs Declaration", "E-way Bill",
        ],
        "recommendations_context": (
            "The business is in logistics & transportation. Focus on: "
            "on-time delivery rates, fleet utilisation, route profitability, "
            "driver performance, and fuel cost trends."
        ),
    },

    "professional_services": {
        "label": "Professional Services",
        "icon": "💼",
        "color": "#8b5cf6",
        "system_prompt": (
            "You are a professional services business analyst embedded in BizAxl ERP. "
            "Key focus areas: billable utilisation, unbilled hours, project profitability, "
            "client concentration risk, and receivables aging for retainer clients. "
            "Proactively flag: projects over budget, unbilled time older than 30 days, "
            "clients with invoices overdue >60 days, and staff utilisation below 70%."
        ),
        "kpis": [
            {
                "label": "Unbilled Timesheets",
                "query": (
                    "SELECT COUNT(*) FROM `tabTimesheet` "
                    "WHERE status='Submitted' AND billed=0 "
                    "AND MONTH(start_date)=MONTH(CURDATE())"
                ),
                "icon": "⏱️", "color": "#8b5cf6", "fallback": 0,
            },
        ],
        "vision_documents": [
            "Timesheet", "Project Proposal", "Statement of Work",
            "Client Invoice", "Expense Report",
        ],
        "recommendations_context": (
            "The business is in professional services. Focus on: "
            "billable utilisation, project margin, receivables health, "
            "resource capacity, and client retention signals."
        ),
    },

    "restaurant": {
        "label": "Restaurant / Food Service",
        "icon": "🍽️",
        "color": "#f97316",
        "system_prompt": (
            "You are a restaurant and food service business analyst embedded in BizAxl ERP. "
            "Key focus areas: table turnover, food cost % (target 28-35%), "
            "menu item profitability, peak-hour staffing, and supplier price variance. "
            "Proactively flag: food cost above 38%, menu items below margin threshold, "
            "high no-show reservations, and ingredient price spikes from suppliers."
        ),
        "kpis": [
            {
                "label": "Covers Today",
                "query": "SELECT COALESCE(SUM(covers),0) FROM `tabPOS Invoice` WHERE DATE(posting_date)=CURDATE()",
                "icon": "🍴", "color": "#f97316", "fallback": 0,
            },
        ],
        "vision_documents": [
            "Supplier Invoice", "Purchase Receipt", "Menu", "Expense Bill", "Daily Sales Report",
        ],
        "recommendations_context": (
            "The business is a restaurant or food service. Focus on: "
            "food cost control, table/seat utilisation, menu profitability, "
            "waste reduction, and supplier cost management."
        ),
    },

    "healthcare": {
        "label": "Healthcare / Clinic",
        "icon": "🏥",
        "color": "#10b981",
        "system_prompt": (
            "You are a healthcare practice management analyst embedded in BizAxl ERP. "
            "Key focus areas: appointment utilisation, no-show rates, revenue per visit, "
            "insurance claim rejection rates, critical consumable inventory. "
            "Proactively flag: appointment slots below 70% utilisation, high no-show rates, "
            "expired or near-expiry consumables, and claims pending >30 days."
        ),
        "kpis": [
            {
                "label": "Appointments Today",
                "query": (
                    "SELECT COUNT(*) FROM `tabPatient Appointment` "
                    "WHERE DATE(appointment_date)=CURDATE()"
                ),
                "icon": "📅", "color": "#10b981", "fallback": 0,
            },
        ],
        "vision_documents": [
            "Prescription", "Lab Report", "Insurance Claim",
            "Medical Bill", "Diagnostic Report",
        ],
        "recommendations_context": (
            "The business is a healthcare clinic or hospital. Focus on: "
            "appointment utilisation, patient retention, claims efficiency, "
            "consumable inventory for critical items, and revenue per consultation."
        ),
    },

    "manufacturing": {
        "label": "Manufacturing",
        "icon": "🏭",
        "color": "#64748b",
        "system_prompt": (
            "You are a manufacturing operations analyst embedded in BizAxl ERP. "
            "Key focus areas: OEE (Overall Equipment Effectiveness), raw material "
            "consumption vs standard BOM, work order completion rate, quality rejection %, "
            "and machine downtime. "
            "Proactively flag: work orders delayed >2 days, material variance >10%, "
            "high rejection batches, and machines approaching service intervals."
        ),
        "kpis": [],
        "vision_documents": [
            "Purchase Order", "Quality Report", "Delivery Challan",
            "BOM", "Work Order", "Inspection Report",
        ],
        "recommendations_context": (
            "The business is in manufacturing. Focus on: "
            "production efficiency, material utilisation, quality control, "
            "downtime reduction, and on-time delivery to customers."
        ),
    },

    "hospitality": {
        "label": "Hospitality / Hotel",
        "icon": "🏨",
        "color": "#ec4899",
        "system_prompt": (
            "You are a hospitality revenue management analyst embedded in BizAxl ERP. "
            "Key focus areas: occupancy rate, RevPAR (Revenue per Available Room), "
            "F&B cost ratios, guest acquisition cost, and repeat guest rate. "
            "Proactively flag: occupancy below 60%, high OTA commission rates, "
            "F&B cost above 35%, and guest complaint patterns."
        ),
        "kpis": [],
        "vision_documents": [
            "Hotel Invoice", "F&B Bill", "Supplier Invoice",
            "Expense Voucher", "Group Booking Confirmation",
        ],
        "recommendations_context": (
            "The business is in hospitality. Focus on: "
            "room revenue optimisation, F&B profitability, guest retention, "
            "channel mix (direct vs OTA), and cost per occupied room."
        ),
    },

    "energy": {
        "label": "Energy & Utilities",
        "icon": "⚡",
        "color": "#eab308",
        "system_prompt": (
            "You are an energy and utilities operations analyst embedded in BizAxl ERP. "
            "Key focus areas: consumption anomalies, peak load patterns, "
            "equipment health indicators, billing accuracy, and regulatory compliance. "
            "Proactively flag: sudden consumption spikes, equipment nearing maintenance, "
            "billing disputes, and units with abnormal loss percentages."
        ),
        "kpis": [],
        "vision_documents": [
            "Meter Reading Report", "Equipment Inspection", "Billing Statement",
            "Maintenance Log", "Compliance Certificate",
        ],
        "recommendations_context": (
            "The business is in energy or utilities. Focus on: "
            "consumption efficiency, equipment reliability, billing accuracy, "
            "peak load management, and regulatory compliance."
        ),
    },

    "default": {
        "label": "General Business",
        "icon": "🏢",
        "color": "#00e5a0",
        "system_prompt": (
            "You are a business intelligence analyst embedded in BizAxl ERP. "
            "Focus on sales trends, outstanding receivables, inventory health, and cost control."
        ),
        "kpis": [],
        "vision_documents": ["Invoice", "Bill", "Receipt", "Purchase Order", "Delivery Note"],
        "recommendations_context": (
            "Focus on revenue growth, cost control, and cash flow management."
        ),
    },
}

# ── Category → config key mapping ─────────────────────────────────────────────
# Keys are lowercase stripped versions of the category string from business profile

CATEGORY_MAP: dict[str, str] = {
    "retail / general trade":       "retail",
    "retail":                       "retail",
    "general trade":                "retail",
    "e-commerce":                   "retail",
    "wholesale / distribution":     "logistics",
    "restaurant / food service":    "restaurant",
    "restaurant":                   "restaurant",
    "food service":                 "restaurant",
    "cafe":                         "restaurant",
    "food & beverage":              "restaurant",
    "professional services":        "professional_services",
    "it services / software":       "professional_services",
    "consulting":                   "professional_services",
    "logistics & transportation":   "logistics",
    "logistics":                    "logistics",
    "transportation":               "logistics",
    "freight":                      "logistics",
    "healthcare / clinic":          "healthcare",
    "healthcare":                   "healthcare",
    "clinic":                       "healthcare",
    "hospital":                     "healthcare",
    "pharmacy":                     "healthcare",
    "manufacturing":                "manufacturing",
    "production":                   "manufacturing",
    "energy & utilities":           "energy",
    "energy":                       "energy",
    "utilities":                    "energy",
    "hospitality / hotel":          "hospitality",
    "hospitality":                  "hospitality",
    "hotel":                        "hospitality",
    "media & advertising":          "default",
    "education":                    "default",
    "real estate":                  "default",
    "construction":                 "default",
    "agriculture":                  "default",
    "financial services":           "default",
    "non-profit / ngo":             "default",
    "government / civic":           "default",
    "other":                        "default",
}


# ── Public API ─────────────────────────────────────────────────────────────────

def get_active_domain_key() -> str:
    """Read the radar business profile and return the matching domain key."""
    try:
        raw = frappe.db.get_default("radar_business_profile")
        if raw:
            profile = json.loads(raw)
            cat = (profile.get("category") or "").strip().lower()
            return CATEGORY_MAP.get(cat, "default")
    except Exception:
        pass
    return "default"


def get_domain_config() -> dict:
    """Return the full domain config dict for the active profile."""
    return DOMAIN_CONFIGS.get(get_active_domain_key(), DOMAIN_CONFIGS["default"])


def get_system_prompt_addition() -> str:
    """Domain-specific system prompt text — injected into every AI call."""
    return get_domain_config().get("system_prompt", "")


def get_domain_label() -> str:
    return get_domain_config().get("label", "General Business")


def get_domain_icon() -> str:
    return get_domain_config().get("icon", "🏢")


def get_domain_color() -> str:
    return get_domain_config().get("color", "#00e5a0")


def get_vision_document_types() -> list:
    """Document types this domain commonly handles — shown in Vision UI hints."""
    return get_domain_config().get("vision_documents", [])


def get_recommendations_context() -> str:
    """Extra context string injected into the RADAR recommendations prompt."""
    return get_domain_config().get("recommendations_context", "")


def resolve_domain_kpis() -> list:
    """
    Execute domain-specific KPI queries safely.
    Returns [{label, value, icon, color, prefix}]
    Tables that don't exist on this site are silently skipped.
    """
    results = []
    for kpi in get_domain_config().get("kpis", []):
        try:
            row = frappe.db.sql(kpi["query"])
            value = row[0][0] if row and row[0][0] is not None else kpi.get("fallback", 0)
            results.append({
                "label":  kpi["label"],
                "value":  value,
                "icon":   kpi.get("icon", "📊"),
                "color":  kpi.get("color", "#00e5a0"),
                "prefix": kpi.get("prefix", ""),
            })
        except Exception as e:
            # Vertical DocType not installed on this site — skip quietly
            frappe.log_error(str(e)[:120], "domain_kpi:" + kpi.get("label", ""))
    return results


@frappe.whitelist()
def get_domain_info() -> dict:
    """
    Whitelisted endpoint — called by the RADAR frontend on load.
    Returns everything the UI needs to render domain-specific features.
    """
    cfg = get_domain_config()
    return {
        "key":            get_active_domain_key(),
        "label":          cfg.get("label", "General Business"),
        "icon":           cfg.get("icon", "🏢"),
        "color":          cfg.get("color", "#00e5a0"),
        "vision_docs":    cfg.get("vision_documents", []),
        "domain_kpis":    resolve_domain_kpis(),
    }
