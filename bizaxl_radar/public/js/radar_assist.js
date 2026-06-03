// BizAxl RADAR — assistant launcher.
//
// Native Desk integration: adds a toolbar button that opens a frappe.ui.Dialog.
// This is the upgrade-safe alternative to hand-injecting a floating widget into
// the home page. It calls the whitelisted endpoint, which runs as the logged-in
// user, so results are already permission-scoped.

frappe.provide("bizaxl_radar");

bizaxl_radar.open_assistant = function (vertical) {
	vertical = vertical || "retail";
	const d = new frappe.ui.Dialog({
		title: __("RADAR Assistant"),
		fields: [
			{ fieldtype: "Data", fieldname: "q",
			  label: __("Ask about your business"),
			  placeholder: __("e.g. show me unpaid invoices this month") },
			{ fieldtype: "HTML", fieldname: "out" },
		],
		primary_action_label: __("Ask"),
		primary_action(values) {
			const $out = d.fields_dict.out.$wrapper.empty()
				.append(`<div class="text-muted">${__("Thinking…")}</div>`);
			frappe.call({
				method: "bizaxl_radar.assist.api.ask",
				args: { question: values.q, vertical },
			}).then((r) => {
				const res = r.message || {};
				$out.empty();
				if (!res.ok) {
					$out.append(`<div class="text-muted">${frappe.utils.escape_html(res.message || "")}</div>`);
					return;
				}
				$out.append(`<div class="bold mb-2">${frappe.utils.escape_html(res.summary)}</div>`);
				if ((res.rows || []).length) {
					const head = res.columns.map((c) => `<th>${frappe.utils.escape_html(c)}</th>`).join("");
					const body = res.rows.map((row) =>
						`<tr>${res.columns.map((c) =>
							`<td>${frappe.utils.escape_html(String(row[c] ?? ""))}</td>`).join("")}</tr>`).join("");
					$out.append(`<table class="table table-bordered"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
				}
			});
		},
	});
	d.show();
};

$(document).on("toolbar_setup", function () {
	if (!frappe.boot) return;
	frappe.ui.toolbar.add_dropdown_button
		? null
		: null; // placeholder; wire into your preferred toolbar slot
});
