(function(){if(window.__radarBundleLoaded)return;window.__radarBundleLoaded=true;
var RADAR_HTML='<div id="radar-root" class="radar-wrap"><div class="radar-header"><span class="radar-logo">📡 BizAxl RADAR</span><button id="radar-refresh" class="radar-btn-ghost">↻ Refresh</button></div><div id="radar-kpi-row" class="radar-kpi-row"><div class="radar-kpi-card" id="kpi-today"><div class="radar-kpi-label">Sales Today</div><div class="radar-kpi-value" id="kpi-today-val">—</div></div><div class="radar-kpi-card" id="kpi-mtd"><div class="radar-kpi-label">Sales This Month</div><div class="radar-kpi-value" id="kpi-mtd-val">—</div></div><div class="radar-kpi-card radar-kpi-alert" id="kpi-outstanding"><div class="radar-kpi-label">Outstanding</div><div class="radar-kpi-value" id="kpi-out-val">—</div><div class="radar-kpi-sub" id="kpi-out-sub"></div></div><div class="radar-kpi-card" id="kpi-stock"><div class="radar-kpi-label">Low Stock Items</div><div class="radar-kpi-value" id="kpi-stock-val">—</div></div></div><div class="radar-body"><div class="radar-col-main"><div class="radar-card"><div class="radar-card-head"><span>🤖 AI Insights</span><span id="radar-insight-status" class="radar-status">Generating…</span></div><div id="radar-narrative" class="radar-narrative"><div class="radar-pulse"></div></div></div><div class="radar-card"><div class="radar-card-head">💬 Ask RADAR</div><div class="radar-ask-wrap"><input id="radar-q" type="text" class="radar-input" placeholder="e.g. show me unpaid invoices this month"/><button id="radar-ask-btn" class="radar-btn">Ask</button><label for="radar-file-input" class="radar-btn" style="cursor:pointer;padding:8px 12px;">📎</label><input type="file" id="radar-file-input" accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp" style="display:none"/></div><div id="radar-file-name" style="font-size:12px;margin:0 0 8px 0;color:var(--text-muted,#888)"></div><div id="radar-answer"></div></div></div><div class="radar-col-side"><div class="radar-card"><div class="radar-card-head">🏆 Top Customers (MTD)</div><div id="radar-top-cust"></div></div><div class="radar-card"><div class="radar-card-head">⚠️ Stock Alerts</div><div id="radar-stock-list"></div></div></div></div></div>';
var RADAR_CSS='.radar-wrap{font-family:var(--font-stack,sans-serif);padding:1.5rem;max-width:1400px}.radar-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem}.radar-logo{font-size:1.25rem;font-weight:700;color:var(--heading-color,#1a1a2e)}.radar-btn-ghost{background:none;border:1px solid var(--border-color,#d1d5db);border-radius:6px;padding:4px 14px;cursor:pointer}.radar-btn{background:var(--primary,#4A90E2);color:#fff;border:none;border-radius:6px;padding:8px 20px;cursor:pointer;font-size:14px}.radar-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem}.radar-kpi-card{background:var(--card-bg,#fff);border:1px solid var(--border-color,#e5e7eb);border-radius:10px;padding:1.25rem}.radar-kpi-label{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted,#888);margin-bottom:.5rem}.radar-kpi-value{font-size:1.6rem;font-weight:700;color:var(--heading-color,#111)}.radar-kpi-sub{font-size:12px;color:var(--text-muted,#888);margin-top:.25rem}.radar-kpi-red .radar-kpi-value{color:#C62828}.radar-kpi-alert{border-left:3px solid #FFA000}.radar-body{display:grid;grid-template-columns:1fr 340px;gap:1rem}.radar-col-main,.radar-col-side{display:flex;flex-direction:column;gap:1rem}.radar-card{background:var(--card-bg,#fff);border:1px solid var(--border-color,#e5e7eb);border-radius:10px;padding:1.25rem}.radar-card-head{font-weight:600;font-size:.95rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between}.radar-narrative{line-height:1.7;color:var(--text-color,#374151);min-height:60px}.radar-status{font-size:12px;font-weight:400;color:var(--text-muted,#888)}.radar-ask-wrap{display:flex;gap:.5rem;margin-bottom:1rem}.radar-input{flex:1;border:1px solid var(--border-color,#d1d5db);border-radius:6px;padding:8px 12px;font-size:14px;outline:none}.radar-input:focus{border-color:var(--primary,#4A90E2)}.radar-answer-summary{font-weight:600;margin-bottom:.75rem;color:var(--text-color,#111)}.radar-table-wrap{overflow-x:auto}.radar-table{width:100%;border-collapse:collapse;font-size:13px}.radar-table th{background:var(--subtle-bg,#f3f4f6);padding:6px 10px;text-align:left;font-weight:600;border-bottom:1px solid var(--border-color,#e5e7eb)}.radar-table td{padding:6px 10px;border-bottom:1px solid var(--border-color,#f3f4f6)}.radar-list-row{display:flex;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-color,#f3f4f6);font-size:13px}.radar-rank{width:24px;color:var(--text-muted,#888);font-weight:600}.radar-name{flex:1;color:var(--text-color,#374151)}.radar-val{font-weight:600}.radar-red{color:#C62828}.radar-ok{color:#2E7D32;font-size:13px}.radar-empty{color:var(--text-muted,#888);font-size:13px}.radar-pulse{height:20px;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;border-radius:4px;animation:pulse 1.5s infinite}@keyframes pulse{0%{background-position:200% 0}100%{background-position:-200% 0}}@media(max-width:900px){.radar-kpi-row{grid-template-columns:repeat(2,1fr)}.radar-body{grid-template-columns:1fr}}';

function initRadarDashboard() {
  if (window._radarDashInitialized) return;
  window._radarDashInitialized = true;
  var radarDash = {
    init: function() {
      var self = this;
      var q = document.getElementById('radar-q');
      if (q) q.addEventListener('keydown', function(e) { if(e.key==='Enter') self.ask(); });
      document.getElementById('radar-ask-btn')?.addEventListener('click', function() { self.ask(); });
      document.getElementById('radar-refresh')?.addEventListener('click', function() { self.load(); });
      var fi = document.getElementById('radar-file-input');
      var fn = document.getElementById('radar-file-name');
      if (fi) fi.addEventListener('change', function(e) {
        var f = e.target.files[0];
        if (f) { fn.textContent = 'Selected: ' + f.name; self.pendingFile = f; }
      });
      this.load();
    },
    load: function() { this.loadKpis(); this.loadNarrative(); },
    loadKpis: function() {
      frappe.call({
        method: 'bizaxl_radar.insights.api.get_dashboard_data',
        callback: function(r) { if(r.message) radarDash.renderKpis(r.message); }
      });
    },
    renderKpis: function(d) {
      var fmt = function(v) {
        return (d.currency||'₹')+'\xa0'+parseFloat(v||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
      };
      var set = function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
      set('kpi-today-val', fmt(d.sales_today));
      set('kpi-mtd-val',   fmt(d.sales_mtd));
      set('kpi-out-val',   fmt(d.outstanding));
      set('kpi-out-sub',   (d.overdue_count>0?d.overdue_count+' overdue · ':'')+d.unpaid_count+' unpaid');
      set('kpi-stock-val', d.low_stock_count);
      if(d.overdue_count>0){var k=document.getElementById('kpi-outstanding');if(k)k.classList.add('radar-kpi-red');}
      if(d.low_stock_count>0){var k=document.getElementById('kpi-stock');if(k)k.classList.add('radar-kpi-red');}
      var ce=document.getElementById('radar-top-cust');
      if(ce) ce.innerHTML = d.top_customers&&d.top_customers.length
        ? d.top_customers.map(function(c,i){return '<div class="radar-list-row"><span class="radar-rank">'+(i+1)+'</span><span class="radar-name">'+c.customer+'</span><span class="radar-val">'+fmt(c.total)+'</span></div>';}).join('')
        : '<div class="radar-empty">No sales this month yet</div>';
      var se=document.getElementById('radar-stock-list');
      if(se) se.innerHTML = d.low_stock_count===0
        ? '<div class="radar-ok">✓ All items above reorder level</div>'
        : (d.low_stock_items||[]).map(function(r){return '<div class="radar-list-row"><span class="radar-name">'+(r.item_name||'Item')+'</span><span class="radar-val radar-red">'+r.stock_quantity+' / '+r.reorder_level+'</span></div>';}).join('');
    },
    loadNarrative: function() {
      var ns=document.getElementById('radar-insight-status');
      var nb=document.getElementById('radar-narrative');
      if(ns) ns.textContent='Generating…';
      if(nb) nb.innerHTML='<div class="radar-pulse"></div>';
      frappe.call({
        method:'bizaxl_radar.insights.api.get_ai_narrative',
        callback:function(r){
          if(r.message){
            if(nb) nb.textContent=r.message.narrative;
            if(ns) ns.textContent='';
            if(r.message.data) radarDash.renderKpis(r.message.data);
          }
        },
        error:function(){ if(nb) nb.textContent='Could not load AI insights — check your Groq API key.'; if(ns) ns.textContent=''; }
      });
    },
    pendingFile: null,
    ask: function() {
      var q=document.getElementById('radar-q');
      var question = q ? q.value.trim() : '';
      if (!question && !this.pendingFile) return;
      if (q) q.value = '';
      var ans=document.getElementById('radar-answer');
      if(ans) ans.innerHTML='<div class="radar-pulse"></div>';
      if (this.pendingFile) {
        var formData = new FormData();
        formData.append('file', this.pendingFile);
        formData.append('question', question);
        formData.append('vertical', 'retail');
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/method/bizaxl_radar.assist.api.ask_with_file', true);
        xhr.setRequestHeader('X-Frappe-CSRF-Token', frappe.csrf_token);
        var self = this;
        xhr.onload = function() {
          if (xhr.status === 200) {
            try {
              var res = JSON.parse(xhr.responseText).message;
              if (!ans) return;
              if (!res.ok) { ans.innerHTML='<div class="radar-empty">'+res.message+'</div>'; return; }
              var html='<div class="radar-answer-summary">'+res.summary+'</div>';
              if ((res.rows||[]).length) {
                var heads=res.columns.map(function(c){return '<th>'+c+'</th>';}).join('');
                var rows=res.rows.map(function(row){return '<tr>'+res.columns.map(function(c){return '<td>'+(row[c]!=null?row[c]:'')+'</td>';}).join('')+'</tr>';}).join('');
                html+='<div class="radar-table-wrap"><table class="radar-table"><thead><tr>'+heads+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
              }
              ans.innerHTML=html;
            } catch(e) { ans.innerHTML = '<div class="radar-empty">Error parsing response</div>'; }
          } else {
            ans.innerHTML = '<div class="radar-empty">Upload failed. Please try again.</div>';
          }
          self.pendingFile = null;
          document.getElementById('radar-file-name').textContent = '';
          document.getElementById('radar-file-input').value = '';
        };
        xhr.send(formData);
      } else {
        frappe.call({
          method:'bizaxl_radar.assist.api.ask',
          args:{question:question,vertical:'retail'},
          callback:function(r){
            var res=r.message||{};
            if(!ans) return;
            if(!res.ok){ans.innerHTML='<div class="radar-empty">'+res.message+'</div>';return;}
            var html='<div class="radar-answer-summary">'+res.summary+'</div>';
            if((res.rows||[]).length){
              var heads=res.columns.map(function(c){return '<th>'+c+'</th>';}).join('');
              var rows=res.rows.map(function(row){return '<tr>'+res.columns.map(function(c){return '<td>'+(row[c]!=null?row[c]:'')+'</td>';}).join('')+'</tr>';}).join('');
              html+='<div class="radar-table-wrap"><table class="radar-table"><thead><tr>'+heads+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
            }
            ans.innerHTML=html;
          }
        });
      }
    }
  };
  radarDash.init();
  window._radarDashInstance = radarDash;
}

function patchRadarPage() {
  var pg = frappe.pages['bizaxl-radar'];
  if (!pg || !pg.body) { setTimeout(patchRadarPage, 100); return; }
  if (!document.getElementById('radar-styles')) {
    var st = document.createElement('style');
    st.id = 'radar-styles';
    st.textContent = RADAR_CSS;
    document.head.appendChild(st);
  }
  if (!pg.body.text().trim() || !document.getElementById('radar-root')) {
    pg.body.html(RADAR_HTML);
    window._radarDashInitialized = false;
    initRadarDashboard();
  }
  var origShow = pg.on_page_show;
  pg.on_page_show = function() {
    if (!document.getElementById('radar-root')) {
      pg.body.html(RADAR_HTML);
      window._radarDashInitialized = false;
      initRadarDashboard();
    } else if (window._radarDashInstance) {
      window._radarDashInstance.load();
    }
    if (origShow) origShow.call(pg);
  };
}

function startWatching() {
  if (frappe.router) {
    frappe.router.on('change', function() {
      if (frappe.get_route()[0] === 'bizaxl-radar') {
        setTimeout(patchRadarPage, 300);
        setTimeout(patchRadarPage, 800);
      }
    });
  }
  setTimeout(function() {
    if (frappe.get_route && frappe.get_route()[0] === 'bizaxl-radar') patchRadarPage();
  }, 200);
  setTimeout(function() {
    if (frappe.get_route && frappe.get_route()[0] === 'bizaxl-radar') patchRadarPage();
  }, 1000);
}

if (frappe.boot) startWatching();
else document.addEventListener('DOMContentLoaded', startWatching);
})();
