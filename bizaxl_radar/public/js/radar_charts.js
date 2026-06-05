// ═══════════════════════════════════════════════════════════════════
//  BizAxl RADAR — Business Analytics  v3
//  KPI card in the strip → click → slide-up overlay with 4 charts
// ═══════════════════════════════════════════════════════════════════

var RD_C = {
    bg:"#0d0d12", card:"#111118", border:"rgba(255,255,255,0.06)",
    text:"#6b7280", label:"#9ca3af", heading:"#e5e7eb", grid:"rgba(255,255,255,0.04)",
    green:"#00e5a0", greenLo:"rgba(0,229,160,0.12)",
    purple:"#818cf8", purpLo:"rgba(129,140,248,0.12)",
    amber:"#fbbf24", ambrLo:"rgba(251,191,36,0.10)",
    colors:["#00e5a0","#818cf8","#fbbf24","#38bdf8","#f472b6","#a3e635","#fb923c","#c084fc"],
};

// ── Inject Analytics card into the KPI strip ─────────────────────
function rdInjectKpiCard() {
    if (document.getElementById("rd-analytics-card")) return;

    var refCard = document.getElementById("kpi-outstanding") ||
                  document.getElementById("kpi-stock") ||
                  document.querySelector(".kc");
    var strip = refCard ? refCard.parentElement : null;
    if (!strip) { setTimeout(rdInjectKpiCard, 600); return; }

    var card = document.createElement("div");
    card.id = "rd-analytics-card";
    card.className = "kc";
    card.style.cssText = "cursor:pointer;transition:opacity .2s,box-shadow .2s;";

    var icon = document.createElement("div");
    icon.style.cssText = "width:32px;height:32px;border-radius:8px;" +
        "background:rgba(0,229,160,0.12);display:flex;align-items:center;" +
        "justify-content:center;font-size:15px;";
    icon.textContent = "\uD83D\uDCCA";

    var label = document.createElement("span");
    label.style.cssText = "font-size:9px;font-weight:700;letter-spacing:1px;" +
        "color:#4b5563;text-transform:uppercase;";
    label.textContent = "ANALYTICS";

    var top = document.createElement("div");
    top.style.cssText = "display:flex;justify-content:space-between;" +
        "align-items:flex-start;margin-bottom:10px;";
    top.appendChild(icon);
    top.appendChild(label);

    var val = document.createElement("div");
    val.style.cssText = "font-size:18px;font-weight:700;color:#00e5a0;" +
        "letter-spacing:-.5px;margin-bottom:4px;";
    val.textContent = "Charts";

    var sub = document.createElement("div");
    sub.style.cssText = "font-size:11px;color:#4b5563;";
    sub.textContent = "View analytics";

    card.appendChild(top);
    card.appendChild(val);
    card.appendChild(sub);

    card.addEventListener("mouseenter", function(){
        this.style.opacity = ".82";
        this.style.boxShadow = "0 0 0 1px rgba(0,229,160,0.3)";
    });
    card.addEventListener("mouseleave", function(){
        this.style.opacity = "1";
        this.style.boxShadow = "none";
    });
    card.addEventListener("click", rdOpenAnalytics);
    strip.appendChild(card);
}


// ── Modal HTML ────────────────────────────────────────────────────
function rdBuildModal() {
    if (document.getElementById("rd-analytics-modal")) return;

    var style = document.createElement("style");
    style.id = "rd-analytics-style";
    style.textContent = `
    #rd-analytics-modal {
        position:fixed; inset:0; z-index:9999;
        background:rgba(0,0,0,0.75); backdrop-filter:blur(4px);
        display:flex; align-items:flex-end; justify-content:center;
        opacity:0; pointer-events:none; transition:opacity .25s;
    }
    #rd-analytics-modal.rd-open {
        opacity:1; pointer-events:all;
    }
    #rd-analytics-panel {
        width:100%; max-width:1400px;
        background:#0d0d12; border-top:1px solid rgba(255,255,255,0.08);
        border-radius:16px 16px 0 0; padding:28px 32px 36px;
        transform:translateY(40px); transition:transform .3s cubic-bezier(.22,.68,0,1.2);
        max-height:88vh; overflow-y:auto;
    }
    #rd-analytics-modal.rd-open #rd-analytics-panel { transform:translateY(0); }
    .rd-modal-header {
        display:flex; align-items:center; justify-content:space-between;
        margin-bottom:24px; padding-bottom:16px;
        border-bottom:1px solid rgba(255,255,255,0.05);
    }
    .rd-modal-title { font-size:11px; font-weight:700; letter-spacing:1.5px;
        color:#4b5563; text-transform:uppercase; }
    .rd-modal-close {
        width:28px; height:28px; border-radius:8px;
        background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
        color:#6b7280; font-size:16px; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        transition:all .15s; line-height:1;
    }
    .rd-modal-close:hover { background:rgba(239,68,68,0.15); color:#ef4444; border-color:#ef4444; }
    .rd-charts-grid {
        display:grid; grid-template-columns:1fr 1fr; gap:16px;
    }
    .rd-chart-card {
        background:#111118; border:1px solid rgba(255,255,255,0.06);
        border-radius:12px; padding:22px 24px;
    }
    .rd-chart-lbl {
        font-size:10px; font-weight:700; letter-spacing:1.2px;
        color:#374151; text-transform:uppercase; margin-bottom:18px;
    }
    .rd-chart-stat {
        font-size:18px; font-weight:700; color:#e5e7eb; margin-bottom:4px;
    }
    .rd-chart-stat-sub {
        font-size:10px; color:#4b5563; margin-bottom:16px;
    }
    .rd-chart-wrap { position:relative; }
    .rd-chart-skeleton {
        position:absolute; inset:0; border-radius:6px;
        background:linear-gradient(90deg,#16161f 25%,#1c1c28 50%,#16161f 75%);
        background-size:200% 100%; animation:rdShimmer 1.5s infinite;
    }
    @keyframes rdShimmer{0%{background-position:200% 0}to{background-position:-200% 0}}
    @media(max-width:860px){ .rd-charts-grid{grid-template-columns:1fr;} }
    `;
    document.head.appendChild(style);

    var modal = document.createElement("div");
    modal.id = "rd-analytics-modal";
    modal.innerHTML = `
    <div id="rd-analytics-panel">
      <div class="rd-modal-header">
        <span class="rd-modal-title">Business Analytics</span>
        <div style="display:flex;gap:8px;align-items:center;">
          <button id="rd-modal-refresh" style="background:none;border:1px solid rgba(255,255,255,0.08);
            color:#4b5563;border-radius:6px;padding:4px 12px;font-size:11px;cursor:pointer;">
            ↻ Refresh
          </button>
          <button class="rd-modal-close" id="rd-modal-close">✕</button>
        </div>
      </div>
      <div class="rd-charts-grid">
        <div class="rd-chart-card">
          <div class="rd-chart-lbl">Monthly Revenue — 12 months</div>
          <div class="rd-chart-stat" id="rd-stat-revenue">—</div>
          <div class="rd-chart-stat-sub" id="rd-stat-revenue-sub">Year to date</div>
          <div class="rd-chart-wrap" style="height:200px"><canvas id="rd-c-revenue"></canvas></div>
        </div>
        <div class="rd-chart-card">
          <div class="rd-chart-lbl">Year-over-Year</div>
          <div class="rd-chart-stat" id="rd-stat-yoy">—</div>
          <div class="rd-chart-stat-sub" id="rd-stat-yoy-sub">vs last year</div>
          <div class="rd-chart-wrap" style="height:200px"><canvas id="rd-c-yoy"></canvas></div>
        </div>
        <div class="rd-chart-card">
          <div class="rd-chart-lbl">Top Products — this year</div>
          <div class="rd-chart-stat" id="rd-stat-products">—</div>
          <div class="rd-chart-stat-sub">By revenue</div>
          <div class="rd-chart-wrap" style="height:220px"><canvas id="rd-c-products"></canvas></div>
        </div>
        <div class="rd-chart-card">
          <div class="rd-chart-lbl">Customer Activity — 6 months</div>
          <div class="rd-chart-stat" id="rd-stat-customers">—</div>
          <div class="rd-chart-stat-sub">Unique customers/month</div>
          <div class="rd-chart-wrap" style="height:220px"><canvas id="rd-c-customers"></canvas></div>
        </div>
      </div>
    </div>`;

    document.body.appendChild(modal);

    // Close handlers
    document.getElementById("rd-modal-close").addEventListener("click", rdCloseAnalytics);
    modal.addEventListener("click", function(e){
        if (e.target === modal) rdCloseAnalytics();
    });
    document.addEventListener("keydown", function(e){
        if (e.key === "Escape") rdCloseAnalytics();
    });
    document.getElementById("rd-modal-refresh").addEventListener("click", function(){
        rdFetchCharts();
    });
}

// ── Open / close ──────────────────────────────────────────────────
function rdOpenAnalytics() {
    rdBuildModal();
    var modal = document.getElementById("rd-analytics-modal");
    modal.style.display = "flex";
    setTimeout(function(){ modal.classList.add("rd-open"); }, 10);
    if (!window._rdChartsLoaded) {
        rdFetchCharts();
        window._rdChartsLoaded = true;
    }
}

function rdCloseAnalytics() {
    var modal = document.getElementById("rd-analytics-modal");
    if (!modal) return;
    modal.classList.remove("rd-open");
    setTimeout(function(){ modal.style.display = "none"; }, 280);
}

// ── Chart defaults ────────────────────────────────────────────────
function rdDefaults() {
    if (!window.Chart) return;
    Chart.defaults.font.family = "'Inter','Segoe UI',system-ui,sans-serif";
    Chart.defaults.font.size   = 10.5;
    Chart.defaults.color       = RD_C.text;
    Chart.defaults.plugins.legend.labels.color    = RD_C.label;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.boxHeight= 8;
    Chart.defaults.plugins.legend.labels.padding  = 16;
    Chart.defaults.plugins.tooltip.backgroundColor= "#1a1a26";
    Chart.defaults.plugins.tooltip.borderColor    = "rgba(255,255,255,0.08)";
    Chart.defaults.plugins.tooltip.borderWidth    = 1;
    Chart.defaults.plugins.tooltip.titleColor     = RD_C.heading;
    Chart.defaults.plugins.tooltip.bodyColor      = RD_C.label;
    Chart.defaults.plugins.tooltip.padding        = 10;
    Chart.defaults.plugins.tooltip.cornerRadius   = 8;
}

function rdFmt(v) {
    if (v >= 1e7) return "₹"+(v/1e7).toFixed(1)+"Cr";
    if (v >= 1e5) return "₹"+(v/1e5).toFixed(1)+"L";
    if (v >= 1e3) return "₹"+(v/1e3).toFixed(0)+"K";
    return "₹"+v;
}

function rdYScales(horiz) {
    var base = { grid:{color:RD_C.grid}, border:{display:false},
                 ticks:{color:RD_C.text, maxTicksLimit:5} };
    var money = Object.assign({},base,{ticks:Object.assign({},base.ticks,{callback:rdFmt})});
    return horiz ? {x:money,y:base} : {x:base,y:money};
}

var _rdC = {};
function rdChart(id, cfg) {
    if (_rdC[id]) { _rdC[id].destroy(); }
    var el = document.getElementById(id); if (!el) return;
    _rdC[id] = new Chart(el, cfg);
}

// ── Render all charts ─────────────────────────────────────────────
function rdRenderCharts(data) {
    rdDefaults();
    var OPT = {responsive:true, maintainAspectRatio:false};

    // Stats
    var revTotal = (data.monthly_revenue||[]).reduce(function(s,d){return s+d.value;},0);
    var el = document.getElementById("rd-stat-revenue");
    if (el) el.textContent = rdFmt(revTotal);

    var yoy = data.yoy||{};
    var thisTotal = (yoy.this_year||[]).reduce(function(a,b){return a+b;},0);
    var lastTotal = (yoy.last_year||[]).reduce(function(a,b){return a+b;},0);
    var yoyDiff = lastTotal ? Math.round((thisTotal-lastTotal)/lastTotal*100) : 0;
    var yoySub = document.getElementById("rd-stat-yoy-sub");
    var yoyStat = document.getElementById("rd-stat-yoy");
    if (yoyStat) yoyStat.textContent = (yoyDiff >= 0 ? "+" : "") + yoyDiff + "%";
    if (yoySub) { yoySub.textContent = yoyDiff >= 0 ? "▲ vs last year" : "▼ vs last year";
                  yoySub.style.color = yoyDiff >= 0 ? RD_C.green : "#ef4444"; }

    var tp = data.top_products||[];
    var tpStat = document.getElementById("rd-stat-products");
    if (tpStat && tp.length) tpStat.textContent = (tp[0].label||"").slice(0,18);

    var ca = data.customer_activity||[];
    var caMax = ca.length ? Math.max.apply(null,ca.map(function(d){return d.value;})) : 0;
    var caStat = document.getElementById("rd-stat-customers");
    if (caStat) caStat.textContent = caMax + " peak";

    // 1 — Monthly Revenue
    var mr = data.monthly_revenue||[];
    rdChart("rd-c-revenue",{type:"bar",data:{
        labels:mr.map(function(d){return d.label;}),
        datasets:[{data:mr.map(function(d){return d.value;}),
            backgroundColor:function(ctx){
                var g=ctx.chart.ctx.createLinearGradient(0,0,0,200);
                g.addColorStop(0,"rgba(0,229,160,0.75)");
                g.addColorStop(1,"rgba(0,229,160,0.04)"); return g;},
            borderColor:RD_C.green,borderWidth:1,borderRadius:4,
            borderSkipped:false,hoverBackgroundColor:RD_C.green}]},
        options:Object.assign({},OPT,{plugins:{legend:{display:false},
            tooltip:{callbacks:{label:function(c){return " "+rdFmt(c.parsed.y);}}}},
            scales:rdYScales(false)})});

    // 2 — YoY
    rdChart("rd-c-yoy",{type:"line",data:{labels:yoy.labels||[],datasets:[
        {label:yoy.this_label||"This Year",data:yoy.this_year||[],
            borderColor:RD_C.green,backgroundColor:RD_C.greenLo,fill:true,
            tension:0.4,pointRadius:3,pointBackgroundColor:RD_C.green,borderWidth:2},
        {label:yoy.last_label||"Last Year",data:yoy.last_year||[],
            borderColor:RD_C.purple,backgroundColor:RD_C.purpLo,fill:true,
            tension:0.4,pointRadius:2,pointBackgroundColor:RD_C.purple,
            borderWidth:1.5,borderDash:[4,4]}]},
        options:Object.assign({},OPT,{plugins:{legend:{display:true,position:"top",
            labels:{pointStyle:"circle",usePointStyle:true}}},
            scales:rdYScales(false)})});

    // 3 — Top Products
    rdChart("rd-c-products",{type:"bar",data:{
        labels:tp.map(function(d){return d.label;}),
        datasets:[{data:tp.map(function(d){return d.value;}),
            backgroundColor:RD_C.colors.slice(0,tp.length),
            borderRadius:3,borderSkipped:false}]},
        options:Object.assign({},OPT,{indexAxis:"y",
            plugins:{legend:{display:false},
                tooltip:{callbacks:{label:function(c){return " "+rdFmt(c.parsed.x);}}}},
            scales:rdYScales(true)})});

    // 4 — Customer Activity
    rdChart("rd-c-customers",{type:"line",data:{
        labels:ca.map(function(d){return d.label;}),
        datasets:[{data:ca.map(function(d){return d.value;}),
            borderColor:RD_C.amber,backgroundColor:RD_C.ambrLo,fill:true,
            tension:0.4,pointRadius:5,pointHoverRadius:7,
            pointBackgroundColor:RD_C.amber,
            pointBorderColor:"#111118",pointBorderWidth:2,borderWidth:2}]},
        options:Object.assign({},OPT,{plugins:{legend:{display:false}},
            scales:{x:{grid:{color:RD_C.grid},border:{display:false},ticks:{color:RD_C.text}},
                y:{beginAtZero:true,grid:{color:RD_C.grid},border:{display:false},
                   ticks:{color:RD_C.text,precision:0,maxTicksLimit:4}}}})});
}

// ── Skeleton ──────────────────────────────────────────────────────
function rdSkeleton(show) {
    ["rd-c-revenue","rd-c-yoy","rd-c-products","rd-c-customers"].forEach(function(id){
        var el=document.getElementById(id); if(!el) return;
        var p=el.parentElement; if(!p) return;
        if(show){
            el.style.display="none";
            if(!p.querySelector(".rd-chart-skeleton")){
                var s=document.createElement("div");
                s.className="rd-chart-skeleton"; p.appendChild(s);
            }
        } else {
            el.style.display="block";
            p.querySelectorAll(".rd-chart-skeleton").forEach(function(s){s.remove();});
        }
    });
}

// ── Fetch & render ────────────────────────────────────────────────
function rdFetchCharts() {
    rdSkeleton(true);
    frappe.call({
        method:"bizaxl_radar.intelligence.api.get_chart_data",
        callback:function(r){
            rdSkeleton(false);
            if(r.message) rdRenderCharts(r.message);
        },
        error:function(){ rdSkeleton(false); }
    });
}

// ── Main entry ────────────────────────────────────────────────────
function rdLoadCharts() {
    if (!window.Chart) {
        var s=document.createElement("script");
        s.src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
        s.onload=function(){ rdBuildModal(); rdInjectKpiCard(); };
        document.head.appendChild(s);
    } else {
        rdBuildModal();
        rdInjectKpiCard();
    }
    window._rdChartsLoaded = false;
}

// ── SPA hook ──────────────────────────────────────────────────────
(function(){
    var _init=false;
    function tryLoad(){
        if(_init) return;
        if(!window.location.pathname.includes("bizaxl-radar")) return;
        var _ready = document.querySelector(".rh-live") ||
                     document.getElementById("rd-kpi-strip") ||
                     document.querySelector("#page-bizaxl-radar .page-content");
        if(!_ready){ setTimeout(tryLoad,400); return; }
        _init=true;
        window._rdChartsLoaded=false;
        setTimeout(rdLoadCharts,800);
    }
    $(document).on("page-change",function(){
        _init=false;
        window._rdChartsLoaded=false;
        var m=document.getElementById("rd-analytics-modal");
        if(m) m.style.display="none";
        Object.keys(_rdC).forEach(function(k){if(_rdC[k])_rdC[k].destroy();});
        _rdC={};
        tryLoad();
    });
    if(document.readyState==="complete") tryLoad();
    else $(document).ready(tryLoad);
})();


// ══════════════════════════════════════════════════════════════════
//  BizAxl RADAR — Analytics Modal v2
//  Adds Customer Health (RFM) + Cash Conversion panels
//  Append to radar_charts.js  OR  replace rdBuildModal()
// ══════════════════════════════════════════════════════════════════

// ── Overwrite rdBuildModal with the 6-panel version ───────────────
function rdBuildModal() {
    if (document.getElementById("rd-analytics-modal")) return;

    var style = document.createElement("style");
    style.id = "rd-analytics-style";
    style.textContent = `
    #rd-analytics-modal {
        position:fixed;inset:0;z-index:9999;
        background:rgba(0,0,0,0.78);backdrop-filter:blur(5px);
        display:flex;align-items:flex-end;justify-content:center;
        opacity:0;pointer-events:none;transition:opacity .25s;
    }
    #rd-analytics-modal.rd-open { opacity:1;pointer-events:all; }
    #rd-analytics-panel {
        width:100%;max-width:1440px;background:#0d0d12;
        border-top:1px solid rgba(255,255,255,0.08);
        border-radius:16px 16px 0 0;padding:28px 32px 40px;
        transform:translateY(40px);
        transition:transform .3s cubic-bezier(.22,.68,0,1.2);
        max-height:90vh;overflow-y:auto;
    }
    #rd-analytics-modal.rd-open #rd-analytics-panel { transform:translateY(0); }
    .rd-modal-header {
        display:flex;align-items:center;justify-content:space-between;
        margin-bottom:24px;padding-bottom:16px;
        border-bottom:1px solid rgba(255,255,255,0.05);
    }
    .rd-modal-tabs {
        display:flex;gap:4px;background:rgba(255,255,255,0.04);
        border-radius:8px;padding:3px;
    }
    .rd-tab {
        padding:6px 16px;border-radius:6px;font-size:11px;font-weight:600;
        letter-spacing:.3px;cursor:pointer;color:#4b5563;border:none;
        background:transparent;transition:all .15s;
    }
    .rd-tab.active { background:#1a1a26;color:#e5e7eb; }
    .rd-tab:hover:not(.active) { color:#9ca3af; }
    .rd-modal-close {
        width:28px;height:28px;border-radius:8px;
        background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
        color:#6b7280;font-size:16px;cursor:pointer;display:flex;
        align-items:center;justify-content:center;transition:all .15s;
    }
    .rd-modal-close:hover { background:rgba(239,68,68,0.15);color:#ef4444;border-color:#ef4444; }
    .rd-tab-panel { display:none; }
    .rd-tab-panel.active { display:block; }
    /* Charts grid */
    .rd-charts-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
    .rd-chart-card {
        background:#111118;border:1px solid rgba(255,255,255,0.06);
        border-radius:12px;padding:22px 24px;
    }
    .rd-chart-lbl {
        font-size:10px;font-weight:700;letter-spacing:1.2px;
        color:#374151;text-transform:uppercase;margin-bottom:6px;
    }
    .rd-chart-stat { font-size:20px;font-weight:700;color:#e5e7eb;margin-bottom:2px; }
    .rd-chart-stat-sub { font-size:10px;color:#4b5563;margin-bottom:16px; }
    /* RFM table */
    .rd-rfm-table { width:100%;border-collapse:collapse;font-size:12px; }
    .rd-rfm-table th {
        text-align:left;padding:8px 12px;font-size:9px;font-weight:700;
        letter-spacing:1px;color:#374151;text-transform:uppercase;
        border-bottom:1px solid rgba(255,255,255,0.05);
    }
    .rd-rfm-table td { padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.03);color:#9ca3af; }
    .rd-rfm-table tr:hover td { background:rgba(255,255,255,0.02); }
    .rd-seg-badge {
        display:inline-block;padding:2px 8px;border-radius:4px;
        font-size:9px;font-weight:700;letter-spacing:.5px;
    }
    /* Metric tiles */
    .rd-metric-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px; }
    .rd-metric-tile {
        background:#111118;border:1px solid rgba(255,255,255,0.06);
        border-radius:12px;padding:18px 20px;
    }
    .rd-metric-lbl { font-size:9px;font-weight:700;letter-spacing:1px;color:#374151;
        text-transform:uppercase;margin-bottom:8px; }
    .rd-metric-val { font-size:22px;font-weight:700;color:#e5e7eb;margin-bottom:4px; }
    .rd-metric-sub { font-size:10px;color:#4b5563; }
    /* Aging bar */
    .rd-aging-row { display:flex;align-items:center;gap:10px;margin-bottom:10px; }
    .rd-aging-label { font-size:11px;color:#6b7280;min-width:80px; }
    .rd-aging-bar-wrap { flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden; }
    .rd-aging-bar { height:100%;border-radius:3px;transition:width .6s ease; }
    .rd-aging-amt { font-size:11px;color:#9ca3af;min-width:70px;text-align:right; }
    /* Skeleton */
    .rd-chart-wrap { position:relative; }
    .rd-chart-skeleton {
        position:absolute;inset:0;border-radius:6px;
        background:linear-gradient(90deg,#16161f 25%,#1c1c28 50%,#16161f 75%);
        background-size:200% 100%;animation:rdShimmer 1.5s infinite;
    }
    @keyframes rdShimmer{0%{background-position:200% 0}to{background-position:-200% 0}}
    @media(max-width:900px){.rd-charts-grid,.rd-metric-grid{grid-template-columns:1fr;}}
    `;
    document.head.appendChild(style);

    var modal = document.createElement("div");
    modal.id = "rd-analytics-modal";
    modal.innerHTML = `
    <div id="rd-analytics-panel">
      <div class="rd-modal-header">
        <div class="rd-modal-tabs">
          <button class="rd-tab active" data-tab="charts">Revenue & Products</button>
          <button class="rd-tab" data-tab="customers">Customer Health</button>
          <button class="rd-tab" data-tab="cash">Cash Conversion</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button id="rd-modal-refresh" style="background:none;border:1px solid rgba(255,255,255,0.08);
            color:#4b5563;border-radius:6px;padding:4px 12px;font-size:11px;cursor:pointer;">
            ↻ Refresh
          </button>
          <button class="rd-modal-close" id="rd-modal-close">✕</button>
        </div>
      </div>

      <!-- TAB 1: Revenue & Products -->
      <div class="rd-tab-panel active" id="rd-panel-charts">
        <div class="rd-charts-grid">
          <div class="rd-chart-card">
            <div class="rd-chart-lbl">Monthly Revenue — 12 months</div>
            <div class="rd-chart-stat" id="rd-stat-revenue">—</div>
            <div class="rd-chart-stat-sub">Year to date</div>
            <div class="rd-chart-wrap" style="height:200px"><canvas id="rd-c-revenue"></canvas></div>
          </div>
          <div class="rd-chart-card">
            <div class="rd-chart-lbl">Year-over-Year</div>
            <div class="rd-chart-stat" id="rd-stat-yoy">—</div>
            <div class="rd-chart-stat-sub" id="rd-stat-yoy-sub">vs last year</div>
            <div class="rd-chart-wrap" style="height:200px"><canvas id="rd-c-yoy"></canvas></div>
          </div>
          <div class="rd-chart-card">
            <div class="rd-chart-lbl">Top Products — this year</div>
            <div class="rd-chart-stat" id="rd-stat-products">—</div>
            <div class="rd-chart-stat-sub">By revenue</div>
            <div class="rd-chart-wrap" style="height:220px"><canvas id="rd-c-products"></canvas></div>
          </div>
          <div class="rd-chart-card">
            <div class="rd-chart-lbl">Customer Activity — 6 months</div>
            <div class="rd-chart-stat" id="rd-stat-customers">—</div>
            <div class="rd-chart-stat-sub">Unique customers/month</div>
            <div class="rd-chart-wrap" style="height:220px"><canvas id="rd-c-customers"></canvas></div>
          </div>
        </div>
      </div>

      <!-- TAB 2: Customer Health -->
      <div class="rd-tab-panel" id="rd-panel-customers">
        <div class="rd-metric-grid" id="rd-rfm-summary">
          <div class="rd-metric-tile">
            <div class="rd-metric-lbl">Champions</div>
            <div class="rd-metric-val" id="rfm-champion-count" style="color:#00e5a0">—</div>
            <div class="rd-metric-sub">High value, recent, frequent</div>
          </div>
          <div class="rd-metric-tile">
            <div class="rd-metric-lbl">At Risk</div>
            <div class="rd-metric-val" id="rfm-atrisk-count" style="color:#f59e0b">—</div>
            <div class="rd-metric-sub">Were good, going quiet</div>
          </div>
          <div class="rd-metric-tile">
            <div class="rd-metric-lbl">Dormant</div>
            <div class="rd-metric-val" id="rfm-dormant-count" style="color:#ef4444">—</div>
            <div class="rd-metric-sub">No activity in 90+ days</div>
          </div>
        </div>
        <div class="rd-chart-card" style="margin-bottom:16px;" id="rd-churn-risk-panel">
          <div class="rd-chart-lbl" style="margin-bottom:14px;">At-Risk Customers — act before they leave</div>
          <table class="rd-rfm-table">
            <thead><tr>
              <th>Customer</th><th>Last Order</th>
              <th>Days Silent</th><th>Revenue (90d)</th><th>Score</th>
            </tr></thead>
            <tbody id="rd-churn-table-body">
              <tr><td colspan="5" style="color:#374151;text-align:center;padding:24px;">Loading...</td></tr>
            </tbody>
          </table>
        </div>
        <div class="rd-chart-card">
          <div class="rd-chart-lbl" style="margin-bottom:14px;">All Customers — RFM Scores</div>
          <table class="rd-rfm-table">
            <thead><tr>
              <th>Customer</th><th>Segment</th>
              <th>RFM Score</th><th>Total Revenue</th><th>Last Order</th>
            </tr></thead>
            <tbody id="rd-rfm-table-body">
              <tr><td colspan="5" style="color:#374151;text-align:center;padding:24px;">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: Cash Conversion -->
      <div class="rd-tab-panel" id="rd-panel-cash">
        <div class="rd-metric-grid" id="rd-cash-metrics">
          <div class="rd-metric-tile">
            <div class="rd-metric-lbl">Days Sales Outstanding</div>
            <div class="rd-metric-val" id="cash-dso">—</div>
            <div class="rd-metric-sub" id="cash-dso-sub">Avg days invoice → cash</div>
          </div>
          <div class="rd-metric-tile">
            <div class="rd-metric-lbl">Outstanding Receivables</div>
            <div class="rd-metric-val" id="cash-outstanding">—</div>
            <div class="rd-metric-sub">Total unpaid invoices</div>
          </div>
          <div class="rd-metric-tile">
            <div class="rd-metric-lbl">Collected This Month</div>
            <div class="rd-metric-val" id="cash-collected" style="color:#00e5a0">—</div>
            <div class="rd-metric-sub">Cash actually received MTD</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="rd-chart-card">
            <div class="rd-chart-lbl" style="margin-bottom:16px;">Receivables Aging</div>
            <div id="rd-aging-bars">Loading...</div>
          </div>
          <div class="rd-chart-card">
            <div class="rd-chart-lbl">Collection Velocity Trend</div>
            <div class="rd-chart-stat" id="cash-velocity-stat">—</div>
            <div class="rd-chart-stat-sub">Avg days to collect (paid invoices)</div>
            <div class="rd-chart-wrap" style="height:180px"><canvas id="rd-c-velocity"></canvas></div>
          </div>
        </div>
      </div>
    </div>`;

    document.body.appendChild(modal);

    // Tab switching
    modal.querySelectorAll(".rd-tab").forEach(function(btn) {
        btn.addEventListener("click", function() {
            modal.querySelectorAll(".rd-tab").forEach(function(t){ t.classList.remove("active"); });
            modal.querySelectorAll(".rd-tab-panel").forEach(function(p){ p.classList.remove("active"); });
            btn.classList.add("active");
            var panel = document.getElementById("rd-panel-" + btn.dataset.tab);
            if (panel) panel.classList.add("active");
        });
    });

    document.getElementById("rd-modal-close").addEventListener("click", rdCloseAnalytics);
    modal.addEventListener("click", function(e){ if (e.target === modal) rdCloseAnalytics(); });
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") rdCloseAnalytics(); });
    document.getElementById("rd-modal-refresh").addEventListener("click", function(){
        window._rdChartsLoaded = false;
        rdFetchAll();
    });
}

// ── Fetch all three datasets in parallel ─────────────────────────
function rdFetchAll() {
    if (window._rdChartsLoaded) return;
    window._rdChartsLoaded = true;
    rdSkeleton(true);
    var done = 0;
    function tick(){ done++; if (done === 3) rdSkeleton(false); }

    frappe.call({ method:"bizaxl_radar.intelligence.api.get_chart_data",
        callback:function(r){ if(r.message) rdRenderCharts(r.message); tick(); },
        error: tick });

    frappe.call({ method:"bizaxl_radar.intelligence.api.get_customer_health",
        callback:function(r){ if(r.message) rdRenderCustomerHealth(r.message); tick(); },
        error: tick });

    frappe.call({ method:"bizaxl_radar.intelligence.api.get_cash_conversion",
        callback:function(r){ if(r.message) rdRenderCashConversion(r.message); tick(); },
        error: tick });
}

// ── Render Customer Health ────────────────────────────────────────
function rdRenderCustomerHealth(data) {
    var sc = data.seg_counts || {};
    var set = function(id, val) {
        var el = document.getElementById(id); if (el) el.textContent = val;
    };
    set("rfm-champion-count", sc.Champion || 0);
    set("rfm-atrisk-count",   sc["At Risk"] || 0);
    set("rfm-dormant-count",  sc.Dormant || 0);

    function fmt(v) {
        if (v >= 1e5) return "\u20B9" + (v/1e5).toFixed(1) + "L";
        if (v >= 1e3) return "\u20B9" + (v/1e3).toFixed(0) + "K";
        return "\u20B9" + v;
    }

    // Churn risk table
    var churnBody = document.getElementById("rd-churn-table-body");
    if (churnBody) {
        if (!data.churn_risk || !data.churn_risk.length) {
            churnBody.innerHTML = "<tr><td colspan='5' style='color:#374151;text-align:center;" +
                "padding:24px;'>No at-risk customers right now</td></tr>";
        } else {
            churnBody.innerHTML = data.churn_risk.map(function(c) {
                return "<tr>" +
                    "<td style='color:#e5e7eb;font-weight:600;'>" + c.customer + "</td>" +
                    "<td>" + (c.last_order || "—") + "</td>" +
                    "<td style='color:#f59e0b;font-weight:700;'>" + c.recency_days + "d</td>" +
                    "<td>" + fmt(c.monetary_90) + "</td>" +
                    "<td><div style='display:flex;align-items:center;gap:6px;'>" +
                        "<div style='height:4px;width:" + Math.round(c.rfm_score/15*60) + "px;" +
                            "background:" + c.color + ";border-radius:2px;'></div>" +
                        "<span style='color:" + c.color + ";font-weight:700;'>" + c.rfm_score + "/15</span>" +
                    "</div></td>" +
                    "</tr>";
            }).join("");
        }
    }

    // Full RFM table
    var rfmBody = document.getElementById("rd-rfm-table-body");
    if (rfmBody && data.customers) {
        rfmBody.innerHTML = data.customers.map(function(c) {
            return "<tr>" +
                "<td style='color:#e5e7eb;'>" + c.customer + "</td>" +
                "<td><span class='rd-seg-badge' style='background:" + c.color + "22;" +
                    "color:" + c.color + ";'>" + c.segment + "</span></td>" +
                "<td style='color:" + c.color + ";font-weight:700;'>" + c.rfm_score + "/15</td>" +
                "<td>" + fmt(c.total_revenue) + "</td>" +
                "<td style='color:#4b5563;'>" + (c.last_order || "—") + "</td>" +
                "</tr>";
        }).join("");
    }
}

// ── Render Cash Conversion ────────────────────────────────────────
function rdRenderCashConversion(data) {
    function fmt(v) {
        if (v >= 1e7) return "\u20B9" + (v/1e7).toFixed(1) + "Cr";
        if (v >= 1e5) return "\u20B9" + (v/1e5).toFixed(1) + "L";
        if (v >= 1e3) return "\u20B9" + (v/1e3).toFixed(0) + "K";
        return "\u20B9" + Math.round(v);
    }
    function set(id, val) { var el=document.getElementById(id); if(el) el.textContent=val; }

    var dsoColor = data.dso_status === "good" ? "#00e5a0" :
                   data.dso_status === "warning" ? "#f59e0b" : "#ef4444";
    var dsoEl = document.getElementById("cash-dso");
    if (dsoEl) { dsoEl.textContent = data.dso + " days"; dsoEl.style.color = dsoColor; }
    set("cash-dso-sub", data.dso_status === "good" ? "Healthy collection speed" :
                        data.dso_status === "warning" ? "Starting to slow" : "Collections overdue");
    set("cash-outstanding", fmt(data.outstanding));
    set("cash-collected",   fmt(data.collected_mtd));

    // Aging bars
    var agingEl = document.getElementById("rd-aging-bars");
    if (agingEl && data.aging) {
        var total = Object.values(data.aging).reduce(function(a,b){ return a+b; }, 0) || 1;
        var colors = { "0-30 days":"#00e5a0", "31-60 days":"#818cf8",
                       "61-90 days":"#f59e0b", "90+ days":"#ef4444" };
        agingEl.innerHTML = Object.entries(data.aging).map(function(entry) {
            var label = entry[0], amount = entry[1];
            var pct = Math.round(amount / total * 100);
            return "<div class='rd-aging-row'>" +
                "<span class='rd-aging-label'>" + label + "</span>" +
                "<div class='rd-aging-bar-wrap'><div class='rd-aging-bar' style='width:" +
                    pct + "%;background:" + (colors[label] || "#818cf8") + ";'></div></div>" +
                "<span class='rd-aging-amt'>" + fmt(amount) + "</span>" +
                "</div>";
        }).join("");
    }

    // Velocity chart
    var vel = data.velocity || [];
    if (vel.length && window.Chart) {
        var velCanvas = document.getElementById("rd-c-velocity");
        if (velCanvas) {
            if (_rdC["rd-c-velocity"]) _rdC["rd-c-velocity"].destroy();
            var avgDays = vel.reduce(function(s,d){ return s+d.days; },0) / vel.length;
            set("cash-velocity-stat", Math.round(avgDays) + " days avg");
            _rdC["rd-c-velocity"] = new Chart(velCanvas, {
                type: "line",
                data: {
                    labels: vel.map(function(d){ return d.label; }),
                    datasets: [{
                        data: vel.map(function(d){ return d.days; }),
                        borderColor: dsoColor,
                        backgroundColor: dsoColor.replace(")", ",0.1)").replace("rgb","rgba"),
                        fill: true, tension: 0.4,
                        pointRadius: 5, pointBackgroundColor: dsoColor,
                        pointBorderColor: "#111118", pointBorderWidth: 2, borderWidth: 2,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid:{color:"rgba(255,255,255,0.04)"},border:{display:false},
                             ticks:{color:"#6b7280"} },
                        y: { grid:{color:"rgba(255,255,255,0.04)"},border:{display:false},
                             beginAtZero:true,ticks:{color:"#6b7280",
                             callback:function(v){ return v+"d"; }} }
                    }
                }
            });
        }
    } else if (!vel.length) {
        set("cash-velocity-stat", "No paid invoices yet");
    }
}

// ── Patch rdOpenAnalytics to call rdFetchAll ──────────────────────
function rdOpenAnalytics() {
    rdBuildModal();
    var modal = document.getElementById("rd-analytics-modal");
    modal.style.display = "flex";
    setTimeout(function(){ modal.classList.add("rd-open"); }, 10);
    if (!window._rdChartsLoaded) rdFetchAll();
}
