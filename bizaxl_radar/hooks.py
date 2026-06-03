app_name = "bizaxl_radar"
app_title = "BizAxl RADAR"
app_publisher = "BizAxl"
app_description = "Vertical reporting, a deterministic NL assistant, and an alert layer for Frappe/ERPNext."
app_email = "dev@bizaxl.example"
app_license = "mit"
app_include_js = ["/assets/bizaxl_radar/js/radar_workspace_card.js"]

after_install = "bizaxl_radar.install.after_install"


scheduler_events = {
    "hourly": ["bizaxl_radar.insights.alerts.scan_overdue_invoices"],
    "daily":  ["bizaxl_radar.insights.alerts.scan_low_stock"],
}

fixtures = [
    {"dt": "Number Card", "filters": [["name", "like", "RADAR-%"]]},
    {"dt": "Page",        "filters": [["name", "=", "bizaxl-radar"]]},
    {"dt": "Workspace",   "filters": [["name", "=", "BizAxl RADAR"]]},
]
