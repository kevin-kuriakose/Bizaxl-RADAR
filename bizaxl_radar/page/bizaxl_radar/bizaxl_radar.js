frappe.pages["bizaxl-radar"].on_page_load = function(wrapper) {

    frappe.ui.make_app_page({
        parent: wrapper,
        title: "BizAxl RADAR",
        single_column: true,
    });

    const page = wrapper.page;

    page.main.html(`
        <div style="padding:20px;">
            <h2>📡 RADAR LOADED</h2>

            <div id="kpi-today-val">Loading...</div>
            <div id="kpi-mtd-val"></div>
            <div id="kpi-out-val"></div>
            <div id="kpi-out-sub"></div>
            <div id="kpi-stock-val"></div>

            <button id="radar-refresh">Refresh</button>
        </div>
    `);

    frappe.call({
        method: "bizaxl_radar.insights.api.get_dashboard_data",
        callback: (r) => {

            if (!r.message) return;

            const d = r.message;

            const set = (id, val) => {
                const el = page.main.find("#" + id);
                if (el.length) el.text(val);
            };

            set("kpi-today-val", "Today: ₹ " + (d.sales_today || 0));
            set("kpi-mtd-val", "MTD: ₹ " + (d.sales_mtd || 0));
            set("kpi-out-val", "Outstanding: ₹ " + (d.outstanding || 0));
            set("kpi-out-sub",
                (d.overdue_count || 0) + " overdue · " + (d.unpaid_count || 0) + " unpaid"
            );
            set("kpi-stock-val", "Low Stock: " + (d.low_stock_count || 0));
        }
    });
};
