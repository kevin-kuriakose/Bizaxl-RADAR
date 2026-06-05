// ─────────────────────────────────────────────────────────────────
//  BizAxl RADAR — Workspace Card
//  File location on your server:
//  ~/frappe-bench/apps/bizaxl_radar/bizaxl_radar/public/js/radar_workspace_card.js
//
//  After copying, add it to hooks.py (see instructions at bottom)
//  then run: bench build --app bizaxl_radar && bench restart
// ─────────────────────────────────────────────────────────────────

frappe.provide("bizaxl.radar");

bizaxl.radar.WorkspaceCard = {

    init: function () {
        // Remove card when navigating away (SPA cleanup)
        var _old = document.getElementById("ba-radar-card");
        if (_old && _old.parentNode) _old.parentNode.removeChild(_old);

        // Only run on the RADAR workspace
        if (!window.location.pathname.startsWith("/app/radar")) return;

        // Wait for workspace content to mount, then inject
        frappe.after_ajax(function () {


            bizaxl.radar.WorkspaceCard._tryInject(0);
        });
    },

    _tryInject: function (attempts) {
        if (!window.location.pathname.startsWith("/app/radar")) return;
        var self = bizaxl.radar.WorkspaceCard;
        var container = document.querySelector(".layout-main-section");
        if (!container) {
            // Retry up to 20 times (2 seconds total)
            if (attempts < 20) {
                setTimeout(function () { self._tryInject(attempts + 1); }, 100);
            }
            return;
        }
        // Don't inject twice
        if (document.getElementById("ba-radar-card")) return;
        self._render(container);
    },

    _render: function (container) {
        var card = document.createElement("div");
        card.innerHTML = bizaxl.radar.WorkspaceCard._html();

        // Insert after the first child (the header block)
        var first = container.firstChild;
        if (first && first.nextSibling) {
            container.insertBefore(card, first.nextSibling);
        } else {
            container.appendChild(card);
        }

        bizaxl.radar.WorkspaceCard._loadMetrics();
    },

    _loadMetrics: function () {
        var today = new Date();
        var y  = today.getFullYear();
        var mo = String(today.getMonth() + 1).padStart(2, "0");
        var d  = String(today.getDate()).padStart(2, "0");
        var todayStr  = y + "-" + mo + "-" + d;
        var monthStart = y + "-" + mo + "-01";

        function fmt(val) {
            if (!val && val !== 0) return "INR \u2014";
            return "INR " + Number(val).toLocaleString("en-IN", { maximumFractionDigits: 2 });
        }
        function set(id, text) {
            var el = document.getElementById(id);
            if (el) el.innerHTML = text;
        }

        // Sales Today
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "BA Sales Invoice",
                filters: [["posting_date", "=", todayStr], ["docstatus", "=", 1]],
                fields: ["grand_total"],
                limit: 0
            },
            callback: function (r) {
                var total = 0;
                if (r && r.message) r.message.forEach(function (i) { total += (i.grand_total || 0); });
                set("ba-today", fmt(total));
            }
        });

        // Sales MTD
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "BA Sales Invoice",
                filters: [
                    ["posting_date", ">=", monthStart],
                    ["posting_date", "<=", todayStr],
                    ["docstatus", "=", 1]
                ],
                fields: ["grand_total"],
                limit: 0
            },
            callback: function (r) {
                var total = 0;
                if (r && r.message) r.message.forEach(function (i) { total += (i.grand_total || 0); });
                set("ba-mtd", fmt(total));
            }
        });

        // Outstanding
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "BA Sales Invoice",
                filters: [["docstatus", "=", 1], ["outstanding_amount", ">", 0]],
                fields: ["outstanding_amount"],
                limit: 0
            },
            callback: function (r) {
                var total = 0;
                if (r && r.message) r.message.forEach(function (i) { total += (i.outstanding_amount || 0); });
                set("ba-outstanding", fmt(total));
            }
        });
    },

    _html: function () {
        return `
<style>
.ba-radar-card*{box-sizing:border-box;margin:0;padding:0}
.ba-radar-card{
  font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  background:#0d1117;
  border:0.5px solid #1e2d3d;
  border-radius:16px;
  overflow:hidden;
  max-width:560px;
  margin:1.5rem 0;
}
.ba-header{padding:1.75rem 2rem 1.5rem;border-bottom:0.5px solid #1e2d3d}
.ba-brand-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem}
.ba-brand-left{display:flex;align-items:center;gap:13px}
.ba-icon{
  width:42px;height:42px;border-radius:10px;
  background:#0a2540;border:0.5px solid #1e3a5f;
  display:flex;align-items:center;justify-content:center;flex-shrink:0
}
.ba-icon svg{width:22px;height:22px;stroke:#00d4aa;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.ba-name{font-size:17px;font-weight:500;color:#e8edf2;letter-spacing:-0.02em}
.ba-sub{font-size:11px;color:#4a6070;margin-top:2px;font-family:'DM Mono',monospace;letter-spacing:0.06em}
.ba-live{
  display:flex;align-items:center;gap:6px;
  background:#051a12;border:0.5px solid #0a3d28;
  border-radius:20px;padding:5px 10px;
  font-size:11px;color:#00d4aa;font-family:'DM Mono',monospace;letter-spacing:0.04em
}
.ba-live-dot{width:6px;height:6px;border-radius:50%;background:#00d4aa}
.ba-tagline{font-size:13px;color:#5a7080;line-height:1.65;margin-bottom:1.25rem}
.ba-pills{display:flex;gap:7px;flex-wrap:wrap}
.ba-pill{
  font-size:11px;padding:3px 9px;border-radius:20px;
  border:0.5px solid #1e2d3d;color:#4a6070;
  font-family:'DM Mono',monospace;letter-spacing:0.03em;background:#111820
}
.ba-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#1e2d3d}
.ba-metric{background:#0d1117;padding:1.25rem 1.5rem}
.ba-mlabel{
  font-size:10px;color:#4a6070;margin-bottom:8px;
  font-family:'DM Mono',monospace;letter-spacing:0.08em;text-transform:uppercase
}
.ba-mval{font-size:18px;font-weight:500;color:#e8edf2;letter-spacing:-0.02em;font-family:'DM Mono',monospace}
.ba-mhint{font-size:11px;color:#2e4a5a;margin-top:4px}
.ba-footer{
  padding:1.25rem 2rem;border-top:0.5px solid #1e2d3d;
  display:flex;align-items:center;justify-content:space-between;
  gap:1rem;background:#0a0f14
}
.ba-status{display:flex;align-items:center;gap:7px;font-size:12px;color:#2e4a5a;font-family:'DM Mono',monospace}
.ba-status-dot{width:6px;height:6px;border-radius:50%;background:#00d4aa}
.ba-btn{
  display:flex;align-items:center;gap:8px;
  background:#00d4aa;color:#051a12;border:none;border-radius:8px;
  padding:9px 18px;font-size:13px;font-weight:500;
  cursor:pointer;letter-spacing:-0.01em;
  transition:opacity 0.15s,transform 0.1s
}
.ba-btn:hover{opacity:0.85}
.ba-btn:active{transform:scale(0.97)}
.ba-btn svg{width:14px;height:14px;stroke:#051a12;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ba-loading{color:#2e4a5a;font-size:11px;font-family:'DM Mono',monospace}
</style>

<div class="ba-radar-card" id="ba-radar-card">
  <div class="ba-header">
    <div class="ba-brand-row">
      <div class="ba-brand-left">
        <div class="ba-icon">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6a6 6 0 0 0 6 6"/><path d="M12 10a2 2 0 0 0 2 2"/></svg>
        </div>
        <div>
          <div class="ba-name">BizAxl RADAR</div>
          <div class="ba-sub">intelligence platform</div>
        </div>
      </div>
      <div class="ba-live"><span class="ba-live-dot"></span>Live</div>
    </div>
    <p class="ba-tagline">Real-time business analytics with AI-powered insights. Monitor your KPIs, track market signals, and act before issues surface.</p>
    <div class="ba-pills">
      <span class="ba-pill">AI insights</span>
      <span class="ba-pill">Live KPIs</span>
      <span class="ba-pill">Competitor signals</span>
      <span class="ba-pill">Market alerts</span>
    </div>
  </div>
  <div class="ba-metrics">
    <div class="ba-metric">
      <div class="ba-mlabel">Sales today</div>
      <div class="ba-mval" id="ba-today"><span class="ba-loading">loading...</span></div>
      <div class="ba-mhint">Updated live</div>
    </div>
    <div class="ba-metric">
      <div class="ba-mlabel">Sales MTD</div>
      <div class="ba-mval" id="ba-mtd"><span class="ba-loading">loading...</span></div>
      <div class="ba-mhint">Month to date</div>
    </div>
    <div class="ba-metric">
      <div class="ba-mlabel">Outstanding</div>
      <div class="ba-mval" id="ba-outstanding"><span class="ba-loading">loading...</span></div>
      <div class="ba-mhint">Unpaid balance</div>
    </div>
  </div>
  <div class="ba-footer">
    <div class="ba-status"><span class="ba-status-dot"></span>Connected · ERPNext</div>
    <button class="ba-btn" onclick="frappe.set_route('bizaxl-radar')">
      Open RADAR
      <svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </button>
  </div>
</div>`;
    }
};

// Auto-init on page change (Frappe SPA router)
$(document).on("page-change", function () {

    bizaxl.radar.WorkspaceCard.init();
});

// Also init on first load
$(document).ready(function () {
    bizaxl.radar.WorkspaceCard.init();
});
