// ─────────────────────────────────────────────────────────────────────────────
//  BizAxl RADAR  —  Command Center Intelligence Platform
//  radar_dashboard.js  |  Drop in: apps/bizaxl_radar/.../public/js/
// ─────────────────────────────────────────────────────────────────────────────

frappe.pages["bizaxl-radar"].on_page_load = function (wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: "BizAxl RADAR",
		single_column: true,
	});

	const page = wrapper.page;

	// Hide Frappe's redundant title bar — our header owns the brand
	$(wrapper).find(".page-head").hide();

	page.main.html(`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

/* ─── TOKENS ─────────────────────────────────────────────────────────────── */
:root {
	--bg:        #020913;
	--s0:        #060E1F;
	--s1:        #0A1628;
	--s2:        #0F1F38;
	--s3:        #162844;
	--bord:      rgba(50,100,180,0.14);
	--bord2:     rgba(50,100,180,0.28);
	--bord3:     rgba(50,100,180,0.45);
	--mint:      #0DDFAA;
	--blue:      #3D7EFF;
	--red:       #FF4040;
	--amber:     #F5A800;
	--gold:      #C9A03C;
	--lime:      #0DC96A;
	--txt:       #D6E8F8;
	--txt2:      #6A90B4;
	--txt3:      #2E4E6C;
	--font:      'Sora', -apple-system, sans-serif;
	--mono:      'Space Mono', 'Courier New', monospace;
	--r:         13px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }

#rr {
	font-family: var(--font);
	background: var(--bg);
	min-height: 100vh;
	color: var(--txt);
	margin: -15px;
	-webkit-font-smoothing: antialiased;
	display: flex;
	flex-direction: column;
}

/* ─── HEADER ─────────────────────────────────────────────────────────────── */
.rh {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 28px;
	height: 56px;
	background: var(--s0);
	border-bottom: 1px solid var(--bord);
	position: sticky;
	top: 0;
	z-index: 300;
	flex-shrink: 0;
}
.rh-brand {
	display: flex;
	align-items: center;
	gap: 11px;
}
.rh-mark {
	width: 34px; height: 34px;
	border-radius: 9px;
	background: linear-gradient(145deg, var(--mint) 0%, var(--blue) 100%);
	display: flex; align-items: center; justify-content: center;
	flex-shrink: 0;
	box-shadow: 0 0 18px rgba(13,223,170,0.22);
	position: relative;
	overflow: hidden;
}
.rh-mark::after {
	content: '';
	position: absolute; inset: 0;
	background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
	border-radius: inherit;
}
.rh-mark svg { width: 18px; height: 18px; position: relative; z-index: 1; }
.rh-name {
	font-size: 15px;
	font-weight: 700;
	letter-spacing: -0.3px;
	background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}
.rh-tag {
	font-size: 9px;
	font-weight: 500;
	letter-spacing: 2.5px;
	text-transform: uppercase;
	color: var(--txt3);
	margin-top: 1px;
}
.rh-right {
	display: flex; align-items: center; gap: 16px;
}
.rh-live {
	display: flex; align-items: center; gap: 7px;
	font-size: 11px;
	font-weight: 500;
	color: var(--mint);
	letter-spacing: 0.5px;
}
.live-ring {
	position: relative;
	width: 10px; height: 10px;
}
.live-ring::before,
.live-ring::after {
	content: '';
	position: absolute;
	inset: 0;
	border-radius: 50%;
}
.live-ring::before {
	background: var(--mint);
}
.live-ring::after {
	border: 1.5px solid var(--mint);
	animation: liveExpand 2s ease-out infinite;
}
@keyframes liveExpand {
	0%   { transform: scale(1); opacity: 0.8; }
	100% { transform: scale(2.8); opacity: 0; }
}
.rh-ts {
	font-size: 11px;
	color: var(--txt3);
	font-variant-numeric: tabular-nums;
}
.rh-btn {
	display: flex; align-items: center; gap: 6px;
	padding: 0 14px; height: 32px;
	background: var(--s2);
	border: 1px solid var(--bord2);
	border-radius: 8px;
	color: var(--txt2);
	font-size: 11.5px;
	font-weight: 500;
	font-family: var(--font);
	cursor: pointer;
	transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.rh-btn svg { width: 12px; height: 12px; stroke: currentColor; fill: none; }
.rh-btn:hover { background: var(--s3); color: var(--txt); border-color: var(--bord3); }

/* ─── BODY ───────────────────────────────────────────────────────────────── */
.rb { padding: 24px 28px 36px; flex: 1; }

/* ─── SECTION LABEL ─────────────────────────────────────────────────────── */
.sl {
	display: flex; align-items: center; gap: 10px;
	font-size: 9px;
	font-weight: 700;
	letter-spacing: 3px;
	text-transform: uppercase;
	color: var(--txt3);
	margin-bottom: 14px;
}
.sl::after {
	content: '';
	flex: 1; height: 1px;
	background: var(--bord);
}

/* ─── KPI GRID ───────────────────────────────────────────────────────────── */
.kg {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 12px;
	margin-bottom: 28px;
}
@media (max-width: 1280px) { .kg { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 720px)  { .kg { grid-template-columns: 1fr 1fr; } }

/* ─── KPI CARD ───────────────────────────────────────────────────────────── */
.kc {
	background: var(--s1);
	border: 1px solid var(--bord);
	border-radius: var(--r);
	padding: 18px 18px 16px;
	position: relative;
	overflow: hidden;
	transition: border-color 0.2s, box-shadow 0.2s, transform 0.18s;
	cursor: default;
}
/* accent strip — left edge */
.kc::after {
	content: '';
	position: absolute;
	left: 0; top: 10%; bottom: 10%;
	width: 2.5px;
	border-radius: 0 3px 3px 0;
	background: linear-gradient(180deg, var(--mint), var(--blue));
	opacity: 0;
	transition: opacity 0.2s;
}
.kc:hover {
	border-color: var(--bord2);
	transform: translateY(-2px);
	box-shadow: 0 8px 28px rgba(0,0,0,0.5);
}
.kc:hover::after { opacity: 1; }
/* danger state */
.kc.danger {
	border-color: rgba(255,64,64,0.22);
	background: linear-gradient(175deg, rgba(255,64,64,0.05) 0%, var(--s1) 50%);
}
.kc.danger::after { background: var(--red); opacity: 1; }
/* warn state */
.kc.warn {
	border-color: rgba(245,168,0,0.22);
	background: linear-gradient(175deg, rgba(245,168,0,0.05) 0%, var(--s1) 50%);
}
.kc.warn::after { background: var(--amber); opacity: 1; }

.kc-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.kc-label {
	font-size: 9px;
	font-weight: 700;
	letter-spacing: 2px;
	text-transform: uppercase;
	color: var(--txt3);
	line-height: 1.5;
	text-align: right;
}
.kc-ico {
	width: 32px; height: 32px;
	border-radius: 8px;
	background: var(--s2);
	border: 1px solid var(--bord);
	display: flex; align-items: center; justify-content: center;
	flex-shrink: 0;
}
.kc-ico svg { width: 15px; height: 15px; }
.kc-val {
	font-family: var(--mono);
	font-size: 21px;
	font-weight: 700;
	letter-spacing: -0.5px;
	color: var(--txt);
	line-height: 1.1;
	margin-bottom: 5px;
	min-height: 25px;
}
.kc-val.sm {
	font-family: var(--font);
	font-size: 15px;
	font-weight: 600;
	letter-spacing: 0;
}
.kc-sub {
	font-size: 10.5px;
	color: var(--txt3);
	min-height: 14px;
	line-height: 1.4;
}
/* skeleton */
.sk {
	display: inline-block;
	height: 20px; border-radius: 4px;
	background: linear-gradient(90deg, var(--s2) 25%, rgba(255,255,255,0.02) 50%, var(--s2) 75%);
	background-size: 200% 100%;
	animation: skAnim 1.6s infinite;
}
@keyframes skAnim { to { background-position: -200% 0; } }
/* badge */
.badge {
	display: inline-flex; align-items: center; gap: 3px;
	padding: 2px 7px; border-radius: 20px;
	font-size: 9.5px; font-weight: 600;
	font-family: var(--font);
}
.badge-red    { background: rgba(255,64,64,0.1);  color: #FF8080; }
.badge-green  { background: rgba(13,201,106,0.1);  color: #5FEAA0; }
.badge-amber  { background: rgba(245,168,0,0.1);   color: #F5C850; }

/* ─── TWO-COL ────────────────────────────────────────────────────────────── */
.t2 {
	display: grid;
	grid-template-columns: 1fr 340px;
	gap: 14px;
	margin-bottom: 28px;
}
@media (max-width: 1080px) { .t2 { grid-template-columns: 1fr; } }

/* ─── PANEL ──────────────────────────────────────────────────────────────── */
.pnl {
	background: var(--s1);
	border: 1px solid var(--bord);
	border-radius: var(--r);
	overflow: hidden;
	display: flex; flex-direction: column;
}
.pnl-h {
	display: flex; align-items: center; justify-content: space-between;
	padding: 12px 18px;
	border-bottom: 1px solid var(--bord);
	font-size: 9px;
	font-weight: 700;
	letter-spacing: 2.5px;
	text-transform: uppercase;
	color: var(--txt3);
}
.pnl-b { padding: 18px; flex: 1; }
/* pill button */
.pill-btn {
	display: flex; align-items: center; gap: 5px;
	padding: 3px 9px;
	background: var(--s2); border: 1px solid var(--bord2);
	border-radius: 20px;
	color: var(--txt3);
	font-size: 9.5px; font-weight: 600;
	font-family: var(--font);
	cursor: pointer; letter-spacing: 0.3px;
	transition: all 0.15s;
}
.pill-btn svg { width: 9px; height: 9px; stroke: currentColor; fill: none; }
.pill-btn:hover { background: var(--s3); color: var(--txt2); border-color: var(--bord3); }

/* ─── NARRATIVE ──────────────────────────────────────────────────────────── */
.narr {
	font-size: 13.5px;
	line-height: 1.8;
	color: #9BBCD8;
	min-height: 80px;
}
.narr-loading {
	display: flex; align-items: center; gap: 10px;
	color: var(--txt3); font-size: 12px;
}
.spin {
	width: 14px; height: 14px; flex-shrink: 0;
	border: 2px solid var(--bord2);
	border-top-color: var(--mint);
	border-radius: 50%;
	animation: rSpin 0.75s linear infinite;
}
@keyframes rSpin { to { transform: rotate(360deg); } }

/* ─── CUSTOMERS TABLE ────────────────────────────────────────────────────── */
.ctbl { width: 100%; border-collapse: collapse; font-size: 12px; }
.ctbl tr { border-bottom: 1px solid var(--bord); }
.ctbl tr:last-child { border-bottom: none; }
.ctbl td { padding: 9px 5px; vertical-align: middle; }
.ctbl td:nth-child(1) { color: var(--txt3); font-size: 9.5px; font-weight: 700; width: 20px; letter-spacing: 0.5px; }
.ctbl td:nth-child(2) { color: var(--txt2); }
.ctbl td:nth-child(3) { text-align: right; font-family: var(--mono); font-size: 11px; color: var(--mint); }

/* ─── CHAT ───────────────────────────────────────────────────────────────── */
.chat {
	background: var(--s1);
	border: 1px solid var(--bord);
	border-radius: var(--r);
	overflow: hidden;
	display: flex; flex-direction: column;
	height: 480px;
}
.chat-h {
	display: flex; align-items: center; justify-content: space-between;
	padding: 12px 18px;
	border-bottom: 1px solid var(--bord);
	flex-shrink: 0;
}
.chat-h-left {
	display: flex; align-items: center; gap: 10px;
}
.chat-ico {
	width: 28px; height: 28px;
	background: linear-gradient(135deg, var(--mint), var(--blue));
	border-radius: 7px;
	display: flex; align-items: center; justify-content: center;
}
.chat-ico svg { width: 13px; height: 13px; fill: #020913; }
.chat-title {
	font-size: 9px;
	font-weight: 700;
	letter-spacing: 2.5px;
	text-transform: uppercase;
	color: var(--txt3);
}
.chat-online {
	display: flex; align-items: center; gap: 5px;
	font-size: 9.5px; font-weight: 600;
	color: var(--lime); letter-spacing: 0.5px;
}
.chat-online-dot {
	width: 6px; height: 6px;
	background: var(--lime);
	border-radius: 50%;
	box-shadow: 0 0 6px var(--lime);
}
.chat-msgs {
	flex: 1; overflow-y: auto;
	padding: 16px;
	display: flex; flex-direction: column; gap: 14px;
	scrollbar-width: thin;
	scrollbar-color: var(--bord) transparent;
}
.msg { display: flex; gap: 9px; animation: msgIn 0.22s ease; }
@keyframes msgIn {
	from { opacity: 0; transform: translateY(10px); }
	to   { opacity: 1; transform: translateY(0); }
}
.msg.user { flex-direction: row-reverse; }
.msg-av {
	width: 28px; height: 28px;
	border-radius: 8px; flex-shrink: 0;
	display: flex; align-items: center; justify-content: center;
}
.msg.bot  .msg-av { background: linear-gradient(135deg, var(--mint), var(--blue)); }
.msg.user .msg-av { background: var(--s2); border: 1px solid var(--bord2); }
.msg-av svg { width: 13px; height: 13px; }
.msg-bub {
	max-width: 72%;
	padding: 10px 13px;
	border-radius: 11px;
	font-size: 12.5px; line-height: 1.6;
}
.msg.bot  .msg-bub { background: var(--s2); color: var(--txt); border-bottom-left-radius: 3px; }
.msg.user .msg-bub {
	background: linear-gradient(135deg, rgba(13,223,170,0.1), rgba(61,126,255,0.1));
	border: 1px solid rgba(13,223,170,0.16);
	color: var(--txt);
	border-bottom-right-radius: 3px;
}
.msg-tbl {
	width: 100%; border-collapse: collapse;
	font-size: 11px; margin-top: 8px;
	font-family: var(--mono);
}
.msg-tbl th {
	text-align: left; padding: 4px 6px;
	background: rgba(255,255,255,0.04);
	color: var(--mint); font-size: 8px;
	text-transform: uppercase; letter-spacing: 1.5px;
	font-family: var(--font);
}
.msg-tbl td {
	padding: 5px 6px;
	border-bottom: 1px solid var(--bord);
	color: var(--txt);
}
/* thinking */
.thinking { display: flex; align-items: center; gap: 4px; padding: 5px 2px; }
.thinking span {
	width: 6px; height: 6px;
	border-radius: 50%; background: var(--txt3);
	animation: thinkBounce 1.2s ease-in-out infinite;
}
.thinking span:nth-child(2) { animation-delay: 0.18s; }
.thinking span:nth-child(3) { animation-delay: 0.36s; }
@keyframes thinkBounce {
	0%,60%,100% { transform: translateY(0); background: var(--txt3); }
	30%          { transform: translateY(-7px); background: var(--mint); }
}
/* suggestions */
.suggs { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; }
.sugg {
	padding: 4px 11px;
	background: var(--s2); border: 1px solid var(--bord2);
	border-radius: 20px;
	font-size: 10.5px; color: var(--txt3);
	cursor: pointer;
	transition: all 0.14s; font-family: var(--font);
}
.sugg:hover { border-color: var(--mint); color: var(--mint); background: rgba(13,223,170,0.06); }
/* input */
.chat-in {
	padding: 11px 15px;
	border-top: 1px solid var(--bord);
	display: flex; gap: 8px; flex-shrink: 0;
	background: rgba(2,9,19,0.6);
}
.c-input {
	flex: 1;
	background: var(--s2); border: 1px solid var(--bord);
	border-radius: 9px; padding: 8px 13px;
	font-size: 12.5px; font-family: var(--font);
	color: var(--txt); outline: none;
	transition: border-color 0.16s, box-shadow 0.16s;
}
.c-input::placeholder { color: var(--txt3); }
.c-input:focus { border-color: var(--mint); box-shadow: 0 0 0 3px rgba(13,223,170,0.07); }
.c-send {
	width: 38px; height: 38px; flex-shrink: 0;
	background: linear-gradient(135deg, var(--mint), var(--blue));
	border: none; border-radius: 9px;
	display: flex; align-items: center; justify-content: center;
	cursor: pointer;
	transition: opacity 0.15s, transform 0.1s;
	box-shadow: 0 2px 10px rgba(13,223,170,0.3);
}
.c-send:hover { opacity: 0.85; transform: scale(0.96); }
.c-send svg { width: 14px; height: 14px; fill: #020913; }

/* ─── FOOTER ─────────────────────────────────────────────────────────────── */
.rfooter {
	padding: 18px 28px;
	border-top: 1px solid var(--bord);
	display: flex; align-items: center; justify-content: space-between;
	flex-shrink: 0;
}
.rf-brand {
	display: flex; align-items: center; gap: 7px;
	font-size: 10px; font-weight: 600; color: var(--txt3);
	letter-spacing: 0.5px;
}
.rf-dot {
	width: 5px; height: 5px;
	background: linear-gradient(135deg, var(--mint), var(--blue));
	border-radius: 50%;
}
.rf-ver {
	font-size: 9.5px; color: var(--txt3); letter-spacing: 0.5px;
}

/* ── SETUP MODAL ─────────────────────────────────────────────────────── */
#rd-setup-overlay {
    position:fixed;inset:0;background:rgba(2,9,19,0.92);
    z-index:9999;display:flex;align-items:center;justify-content:center;
    backdrop-filter:blur(6px);
}
#rd-setup-modal {
    background:#070F24;border:1px solid rgba(64,110,182,0.3);
    border-radius:16px;padding:32px 36px;width:min(560px,94vw);
    box-shadow:0 24px 80px rgba(0,0,0,0.7);
    font-family:'Sora',-apple-system,sans-serif;color:#D6E8F8;
}
.rd-setup-logo {
    display:flex;align-items:center;gap:10px;margin-bottom:6px;
}
.rd-setup-logo-mark {
    width:32px;height:32px;border-radius:9px;
    background:linear-gradient(135deg,#0DDFAA,#4C8FFF);
    display:flex;align-items:center;justify-content:center;font-size:16px;
}
.rd-setup-h { font-size:20px;font-weight:700;margin-bottom:4px; }
.rd-setup-sub { font-size:12px;color:#6A90B4;margin-bottom:24px; }
.rd-setup-field { margin-bottom:16px; }
.rd-setup-label { font-size:10px;font-weight:700;letter-spacing:1.5px;
    text-transform:uppercase;color:#4A6A90;margin-bottom:6px;display:block; }
.rd-setup-input {
    width:100%;padding:9px 13px;background:#0C1628;
    border:1px solid rgba(64,110,182,0.22);border-radius:9px;
    color:#D6E8F8;font-size:13px;font-family:inherit;outline:none;
    transition:border-color .18s;box-sizing:border-box;
}
.rd-setup-input:focus { border-color:#0DDFAA;box-shadow:0 0 0 3px rgba(13,223,170,.07); }
.rd-setup-row { display:flex;gap:8px; }
.rd-setup-row .rd-setup-input { flex:1; }
.rd-setup-locate-btn {
    padding:0 14px;background:rgba(13,223,170,.1);border:1px solid rgba(13,223,170,.3);
    border-radius:9px;color:#0DDFAA;font-size:12px;font-family:inherit;
    cursor:pointer;white-space:nowrap;transition:all .15s;
}
.rd-setup-locate-btn:hover { background:rgba(13,223,170,.2); }
.rd-setup-location-preview {
    font-size:11px;color:#0DDFAA;margin-top:5px;min-height:14px;
}
.rd-setup-footer { display:flex;justify-content:flex-end;gap:10px;margin-top:24px; }
.rd-setup-skip-btn {
    padding:9px 18px;background:transparent;border:1px solid rgba(64,110,182,.22);
    border-radius:9px;color:#4A6A90;font-size:12px;font-family:inherit;cursor:pointer;
}
.rd-setup-save-btn {
    padding:9px 20px;background:linear-gradient(135deg,#0DDFAA,#4C8FFF);
    border:none;border-radius:9px;color:#020913;font-size:13px;
    font-weight:700;font-family:inherit;cursor:pointer;transition:opacity .15s;
}
.rd-setup-save-btn:hover { opacity:.88; }
.rd-setup-save-btn:disabled { opacity:.5;cursor:not-allowed; }

/* ── SETTINGS GEAR ──────────────────────────────────────────────────── */
.rd-settings-btn {
    width:28px;height:28px;border-radius:7px;border:1px solid var(--bord);
    background:var(--s2);display:flex;align-items:center;justify-content:center;
    cursor:pointer;color:var(--txt3);font-size:13px;transition:all .15s;
    margin-right:6px;
}
.rd-settings-btn:hover { background:var(--s3);color:var(--txt2); }

/* ── INTELLIGENCE SECTION ───────────────────────────────────────────── */
.rd-intel-grid {
    display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;
}
@media(max-width:900px){ .rd-intel-grid{ grid-template-columns:1fr; } }
.rd-intel-setup-hint {
    padding:32px;text-align:center;color:var(--txt3);font-size:13px;
}
.rd-intel-setup-hint a {
    color:var(--mint);cursor:pointer;text-decoration:underline;
}

/* ── COMPETITOR CARDS ───────────────────────────────────────────────── */
.rd-comp-summary {
    font-size:13px;color:var(--txt2);margin-bottom:14px;line-height:1.6;
}
.rd-comp-summary strong { color:var(--txt); }
.rd-comp-list { display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto;
    scrollbar-width:thin;scrollbar-color:var(--bord) transparent; }
.rd-comp-item {
    display:flex;align-items:center;gap:8px;padding:7px 10px;
    background:var(--s2);border-radius:8px;border:1px solid var(--bord);
}
.rd-comp-icon { width:26px;height:26px;border-radius:6px;
    background:linear-gradient(135deg,rgba(13,223,170,.15),rgba(76,143,255,.15));
    display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0; }
.rd-comp-name { font-size:12px;font-weight:600;color:var(--txt2);flex:1;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.rd-comp-addr { font-size:10px;color:var(--txt3);white-space:nowrap;overflow:hidden;
    text-overflow:ellipsis;max-width:140px; }

/* ── BENCHMARK ──────────────────────────────────────────────────────── */
.rd-bench-row { display:flex;justify-content:space-between;align-items:center;
    margin-bottom:14px; }
.rd-bench-score { font-family:'Space Mono',monospace;font-size:38px;font-weight:700;
    letter-spacing:-1px;line-height:1; }
.rd-bench-score.above { color:var(--mint); }
.rd-bench-score.below { color:var(--r-red,#FF4040); }
.rd-bench-label { font-size:10px;font-weight:700;letter-spacing:1px;
    text-transform:uppercase;color:var(--txt3);margin-top:2px; }
.rd-bench-bar-wrap { margin:12px 0 6px; }
.rd-bench-bar-label { display:flex;justify-content:space-between;
    font-size:10px;color:var(--txt3);margin-bottom:5px; }
.rd-bench-track { height:6px;border-radius:3px;background:var(--s2);overflow:hidden; }
.rd-bench-fill { height:100%;border-radius:3px;transition:width 1.2s ease;
    background:linear-gradient(90deg,var(--mint),var(--blue)); }
.rd-bench-stat { display:flex;justify-content:space-between;align-items:center;
    padding:6px 0;border-top:1px solid var(--bord);font-size:11px; }
.rd-bench-stat-key { color:var(--txt3); }
.rd-bench-stat-val { font-weight:600; }
.rd-bench-stat-val.good { color:var(--mint); }
.rd-bench-stat-val.warn { color:#F5BA00; }

/* ── NEWS FEED ──────────────────────────────────────────────────────── */
.rd-news-item {
    display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--bord);
}
.rd-news-item:last-child { border-bottom:none; }
.rd-news-dot { width:6px;height:6px;border-radius:50%;background:var(--mint);
    flex-shrink:0;margin-top:5px; }
.rd-news-content { flex:1;min-width:0; }
.rd-news-title { font-size:12px;color:var(--txt2);line-height:1.45;margin-bottom:2px; }
.rd-news-title a { color:inherit;text-decoration:none; }
.rd-news-title a:hover { color:var(--mint); }
.rd-news-meta { font-size:10px;color:var(--txt3); }

/* ── FOREX BAR ──────────────────────────────────────────────────────── */
.rd-forex-bar {
    display:flex;gap:12px;padding:10px 14px;background:var(--s2);
    border-radius:8px;margin-bottom:14px;flex-wrap:wrap;
}
.rd-forex-item { font-size:11px; }
.rd-forex-pair { color:var(--txt3); }
.rd-forex-rate { font-family:'Space Mono',monospace;color:var(--txt);font-weight:700;margin-left:4px; }

/* ── AI RECOMMENDATIONS ─────────────────────────────────────────────── */
.rd-reco-text {
    font-size:13px;line-height:1.75;color:#9BBCD8;white-space:pre-line;
}
</style>

<div id="rr">

<!-- ── HEADER ─────────────────────────────────────────────────────────── -->
<header class="rh">
	<div class="rh-brand">
		<div class="rh-mark">
			<!-- Radar sweep icon -->
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="12" cy="12" r="9" stroke="#020913" stroke-width="1.5" fill="none" opacity="0.7"/>
				<circle cx="12" cy="12" r="5" stroke="#020913" stroke-width="1.5" fill="none" opacity="0.5"/>
				<circle cx="12" cy="12" r="1.8" fill="#020913"/>
				<line x1="12" y1="12" x2="12" y2="3" stroke="#020913" stroke-width="2" stroke-linecap="round"/>
			</svg>
		</div>
		<div>
			<div class="rh-name">BizAxl RADAR</div>
			<div class="rh-tag">Intelligence Platform</div>
		</div>
	</div>
	<div class="rh-right">
		<div class="rh-live">
			<div class="live-ring"></div>
			Live
		</div>
		<span class="rh-ts" id="rd-ts">Connecting...</span>
		<button class="rh-btn" id="radar-refresh">
			<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="1 4 1 10 7 10"/>
				<path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
			</svg>
			Refresh
		</button>
	</div>
</header>

<!-- ── BODY ───────────────────────────────────────────────────────────── -->
<div class="rb">

	<!-- KPI STRIP -->
	<div class="sl">Live KPIs</div>
	<div class="kg">

		<!-- Sales Today -->
		<div class="kc">
			<div class="kc-row">
				<div class="kc-ico">
					<svg viewBox="0 0 24 24" fill="none" stroke="var(--mint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
						<polyline points="17 6 23 6 23 12"/>
					</svg>
				</div>
				<div class="kc-label">Sales<br>Today</div>
			</div>
			<div class="kc-val" id="kpi-today-val"><span class="sk" style="width:95px;"></span></div>
			<div class="kc-sub" id="kpi-today-sub">&nbsp;</div>
		</div>

		<!-- MTD -->
		<div class="kc">
			<div class="kc-row">
				<div class="kc-ico">
					<svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round">
						<rect x="3" y="4" width="18" height="18" rx="2"/>
						<line x1="16" y1="2" x2="16" y2="6"/>
						<line x1="8" y1="2" x2="8" y2="6"/>
						<line x1="3" y1="10" x2="21" y2="10"/>
					</svg>
				</div>
				<div class="kc-label">Sales<br>MTD</div>
			</div>
			<div class="kc-val" id="kpi-mtd-val"><span class="sk" style="width:95px;"></span></div>
			<div class="kc-sub" id="kpi-mtd-sub">&nbsp;</div>
		</div>

		<!-- Outstanding -->
		<div class="kc" id="kpi-outstanding">
			<div class="kc-row">
				<div class="kc-ico">
					<svg viewBox="0 0 24 24" fill="none" stroke="var(--amber)" stroke-width="2" stroke-linecap="round">
						<circle cx="12" cy="12" r="10"/>
						<line x1="12" y1="8" x2="12" y2="12"/>
						<circle cx="12" cy="16" r="0.5" fill="var(--amber)" stroke="var(--amber)"/>
					</svg>
				</div>
				<div class="kc-label">Outstanding<br>Balance</div>
			</div>
			<div class="kc-val" id="kpi-out-val"><span class="sk" style="width:95px;"></span></div>
			<div class="kc-sub" id="kpi-out-sub">&nbsp;</div>
		</div>

		<!-- Low Stock -->
		<div class="kc" id="kpi-stock">
			<div class="kc-row">
				<div class="kc-ico">
					<svg viewBox="0 0 24 24" fill="none" stroke="var(--txt2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
						<polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
						<line x1="12" y1="22.08" x2="12" y2="12"/>
					</svg>
				</div>
				<div class="kc-label">Low Stock<br>Items</div>
			</div>
			<div class="kc-val" id="kpi-stock-val"><span class="sk" style="width:50px;"></span></div>
			<div class="kc-sub" id="kpi-stock-sub">&nbsp;</div>
		</div>

		<!-- Top Customer -->
		<div class="kc">
			<div class="kc-row">
				<div class="kc-ico">
					<svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linecap="round">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
						<circle cx="12" cy="7" r="4"/>
					</svg>
				</div>
				<div class="kc-label">Top<br>Customer</div>
			</div>
			<div class="kc-val sm" id="kpi-topcust-val"><span class="sk" style="width:110px;height:17px;"></span></div>
			<div class="kc-sub" id="kpi-topcust-sub">&nbsp;</div>
		</div>

	</div><!-- /kg -->

	<!-- ANALYTICS ROW -->
	<div class="sl">Analytics</div>
	<div class="t2">

		<!-- AI Narrative -->
		<div class="pnl">
			<div class="pnl-h">
				<span style="display:flex;align-items:center;gap:6px;">
					<!-- sparkle icon -->
					<svg width="10" height="10" viewBox="0 0 24 24" fill="var(--mint)">
						<path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
					</svg>
					AI Business Insight
				</span>
				<button class="pill-btn" id="rd-refresh-narr">
					<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="1 4 1 10 7 10"/>
						<path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
					</svg>
					Refresh
				</button>
			</div>
			<div class="pnl-b">
				<div class="narr narr-loading" id="rd-narrative">
					<div class="spin"></div>
					<span>Analysing your business data...</span>
				</div>
			</div>
		</div>

		<!-- Top Customers -->
		<div class="pnl">
			<div class="pnl-h">Top Customers (MTD)</div>
			<div class="pnl-b" style="padding:8px 14px;">
				<table class="ctbl" id="rd-topcust-table">
					<tr>
						<td colspan="3" style="color:var(--txt3);text-align:center;padding:28px 0;font-size:11px;">
							Loading...
						</td>
					</tr>
				</table>
			</div>
		</div>

	</div><!-- /t2 -->

	<!-- RADAR ASSISTANT -->
	<div class="sl">RADAR Assistant</div>
	<div class="chat">
		<div class="chat-h">
			<div class="chat-h-left">
				<div class="chat-ico">
					<!-- signal waves icon -->
					<svg viewBox="0 0 24 24" fill="#020913">
						<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
					</svg>
				</div>
				<div class="chat-title">Ask anything about your business</div>
			</div>
			<div class="chat-online">
				<div class="chat-online-dot"></div>
				Online
			</div>
		</div>

		<div class="chat-msgs" id="rd-chat-messages">
			<div class="msg bot">
				<div class="msg-av">
					<svg viewBox="0 0 24 24" fill="#020913">
						<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
					</svg>
				</div>
				<div class="msg-bub">
					Hi! I'm your RADAR assistant. Ask me anything about your sales, customers, stock, or invoices. Try one of the suggestions below.
				</div>
			</div>
		</div>

		<div class="suggs" id="rd-suggestions">
			<button class="sugg" data-q="What were today's total sales?">Today's sales</button>
			<button class="sugg" data-q="Show unpaid invoices">Unpaid invoices</button>
			<button class="sugg" data-q="Which items are low on stock?">Low stock</button>
			<button class="sugg" data-q="Who is our best customer this month?">Best customer</button>
			<button class="sugg" data-q="What is our total outstanding amount?">Outstanding</button>
		</div>

		<div class="chat-in">
			<input class="c-input" id="rd-chat-input"
				placeholder="Ask about sales, stock, invoices, customers..." />
			<button class="c-send" id="rd-send-btn">
				<!-- send arrow -->
				<svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
			</button>
		</div>
	</div><!-- /chat -->



    <!-- MARKET INTELLIGENCE ──────────────────────────────────────── -->
    <div class="sl">Market Intelligence</div>

    <div class="rd-intel-grid">
        <div class="rpanel" id="rd-intel-competitors">
            <div class="rpanel-head">
                <span>🏪 Local Competitors</span>
                <span id="rd-comp-radius" style="color:var(--txt3);font-size:10px;"></span>
            </div>
            <div class="rpanel-body" id="rd-comp-body">
                <div class="rd-intel-setup-hint" id="rd-comp-loading">
                    <div class="spin" style="margin:0 auto 10px;"></div>
                    Loading competitor data…
                </div>
            </div>
        </div>
        <div class="rpanel" id="rd-intel-benchmark">
            <div class="rpanel-head">📊 Benchmark Score</div>
            <div class="rpanel-body" id="rd-bench-body">
                <div class="rd-intel-setup-hint">
                    <div class="spin" style="margin:0 auto 10px;"></div>
                    Calculating benchmark…
                </div>
            </div>
        </div>
    </div>

    <div class="rd-intel-grid">
        <div class="rpanel">
            <div class="rpanel-head">📰 Policy & Market News</div>
            <div class="rpanel-body" id="rd-news-body">
                <div class="rd-intel-setup-hint">
                    <div class="spin" style="margin:0 auto 10px;"></div>
                    Fetching news…
                </div>
            </div>
        </div>
        <div class="rpanel">
            <div class="rpanel-head">
                <span>🎯 AI Recommendations</span>
                <button class="pill-btn" id="rd-reco-refresh-btn">
                    <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                    </svg>Refresh
                </button>
            </div>
            <div class="rpanel-body" id="rd-reco-body">
                <div class="rd-intel-setup-hint">
                    <div class="spin" style="margin:0 auto 10px;"></div>
                    Generating recommendations…
                </div>
            </div>
        </div>
    </div>

</div><!-- /rb -->
<!-- SETUP OVERLAY (shown on first run) ───────────────────────────── -->
<div id="rd-setup-overlay" style="display:none;">
    <div id="rd-setup-modal">
        <div class="rd-setup-logo">
            <div class="rd-setup-logo-mark">📡</div>
            <div style="font-size:15px;font-weight:700;">BizAxl RADAR</div>
        </div>
        <div class="rd-setup-h">Set Up Business Profile</div>
        <div class="rd-setup-sub">
            Unlock competitor analysis, benchmark scores and AI recommendations
            tailored to your business.
        </div>

        <div class="rd-setup-field">
            <label class="rd-setup-label">Business Name</label>
            <input class="rd-setup-input" id="rd-biz-name" placeholder="e.g. Sarita Footwear Store" />
        </div>

        <div class="rd-setup-field">
            <label class="rd-setup-label">Business Category</label>
            <select class="rd-setup-input" id="rd-biz-category">
                <option value="">— Select your business type —</option>
                <option value="retail_grocery">🛒 Grocery / Supermarket</option>
                <option value="retail_electronics">📱 Electronics / Mobile</option>
                <option value="retail_clothing">👗 Clothing / Fashion</option>
                <option value="retail_footwear">👟 Footwear / Shoes</option>
                <option value="retail_furniture">🪑 Furniture / Home Décor</option>
                <option value="retail_pharmacy">💊 Pharmacy / Medical</option>
                <option value="retail_jewellery">💍 Jewellery</option>
                <option value="retail_hardware">🔨 Hardware / Building</option>
                <option value="retail_books">📚 Books / Stationery</option>
                <option value="restaurant">🍽️ Restaurant / Dhaba</option>
                <option value="cafe">☕ Café / Tea Shop</option>
                <option value="bakery">🥐 Bakery / Sweet Shop</option>
                <option value="salon">💇 Salon / Beauty Parlour</option>
                <option value="auto_repair">🔧 Auto Repair / Garage</option>
                <option value="mobile_repair">📲 Mobile Repair</option>
                <option value="healthcare_clinic">🏥 Clinic / Healthcare</option>
                <option value="education">📖 Education / Coaching</option>
                <option value="wholesale">📦 Wholesale / Distribution</option>
                <option value="hotel">🏨 Hotel / Lodge</option>
                <option value="other">🏪 Other Retail / Service</option>
            </select>
        </div>

        <div class="rd-setup-field">
            <label class="rd-setup-label">Location</label>
            <div class="rd-setup-row">
                <input class="rd-setup-input" id="rd-biz-location"
                    placeholder="Paste Google Maps link  —or—  type your address" />
                <button class="rd-setup-locate-btn" id="rd-locate-btn">📍 Find</button>
            </div>
            <div class="rd-setup-location-preview" id="rd-location-preview"></div>
            <input type="hidden" id="rd-biz-lat" />
            <input type="hidden" id="rd-biz-lng" />
            <input type="hidden" id="rd-biz-city" />
        </div>

        <div class="rd-setup-field">
            <label class="rd-setup-label">Search Radius for Competitors</label>
            <select class="rd-setup-input" id="rd-biz-radius" style="width:auto;">
                <option value="2">2 km — dense city area</option>
                <option value="5" selected>5 km — standard</option>
                <option value="10">10 km — town / semi-urban</option>
                <option value="20">20 km — rural / highway</option>
            </select>
        </div>

        <div class="rd-setup-footer">
            <button class="rd-setup-skip-btn" id="rd-setup-skip-btn">Skip for now</button>
            <button class="rd-setup-save-btn" id="rd-setup-save-btn" disabled>Save &amp; Load Intelligence →</button>
        </div>
    </div>
</div>

<!-- ── FOOTER ──────────────────────────────────────────────────────────── -->
<footer class="rfooter">
	<div class="rf-brand">
		<div class="rf-dot"></div>
		Powered by BizAxl Intelligence
	</div>
	<span class="rf-ver">RADAR v2.0 · Real-time Business Analytics</span>
</footer>

</div><!-- /#rr -->
`);

	// ── HELPERS ────────────────────────────────────────────────────────────────
	var el = (id) => document.getElementById(id);
	var fmt = (v, cur) =>
		(cur || "₹") + "\u00a0" +
		parseFloat(v || 0).toLocaleString("en-IN", {
			minimumFractionDigits: 2, maximumFractionDigits: 2,
		});

	// ── LOAD KPIs ──────────────────────────────────────────────────────────────
	function loadKpis() {
		frappe.call({
			method: "bizaxl_radar.insights.api.get_dashboard_data",
			callback: function (r) {
				if (!r.message) return;
				const d = r.message;
				const cur = d.currency || "₹";

				// Today
				el("kpi-today-val").textContent = fmt(d.sales_today, cur);
				el("kpi-today-sub").textContent = d.sales_today > 0 ? "Live today" : "No sales recorded today";

				// MTD
				el("kpi-mtd-val").textContent = fmt(d.sales_mtd, cur);
				el("kpi-mtd-sub").textContent = "Month to date";

				// Outstanding
				el("kpi-out-val").textContent = fmt(d.outstanding, cur);
				if (d.overdue_count > 0) {
					el("kpi-outstanding").classList.add("danger");
					el("kpi-out-sub").innerHTML =
						`<span class="badge badge-red">${d.overdue_count} overdue</span>` +
						`<span style="margin-left:5px;color:var(--txt3)">${d.unpaid_count} unpaid</span>`;
				} else {
					const parts = [];
					if (d.unpaid_count > 0) parts.push(d.unpaid_count + " unpaid");
					el("kpi-out-sub").textContent = parts.join(" · ") || "All clear";
				}

				// Stock
				el("kpi-stock-val").textContent = d.low_stock_count;
				el("kpi-stock-sub").textContent = d.low_stock_count > 0 ? "Items need reorder" : "All items stocked";
				if (d.low_stock_count > 0) el("kpi-stock").classList.add("warn");

				// Top customer
				if (d.top_customers && d.top_customers.length) {
					const t = d.top_customers[0];
					el("kpi-topcust-val").textContent = t.customer;
					el("kpi-topcust-sub").textContent = fmt(t.total, cur) + " MTD";
				} else {
					el("kpi-topcust-val").textContent = "—";
					el("kpi-topcust-sub").textContent = "No sales this month";
				}

				// Customers table
				const tbl = el("rd-topcust-table");
				if (d.top_customers && d.top_customers.length) {
					tbl.innerHTML = d.top_customers.map((c, i) =>
						`<tr><td>${i+1}</td><td>${c.customer}</td><td>${fmt(c.total, cur)}</td></tr>`
					).join("");
				} else {
					tbl.innerHTML = `<tr><td colspan="3" style="color:var(--txt3);text-align:center;padding:24px 0;font-size:11px;">No customer data this month</td></tr>`;
				}

				// Timestamp
				const now = new Date();
				el("rd-ts").textContent = "Updated " +
					now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
			},
		});
	}

	// ── AI NARRATIVE ───────────────────────────────────────────────────────────
	function loadNarrative() {
		const narEl = el("rd-narrative");
		narEl.className = "narr narr-loading";
		narEl.innerHTML = '<div class="spin"></div><span>Analysing your business data...</span>';

		frappe.call({
			method: "bizaxl_radar.insights.api.get_ai_narrative",
			callback: function (r) {
				narEl.className = "narr";
				if (r.message && r.message.narrative) {
					narEl.textContent = r.message.narrative;
				} else {
					narEl.innerHTML = '<span style="color:var(--txt3);font-size:12px;">AI insight unavailable. ' +
						'Set <code>radar_groq_api_key</code> in site config to enable.</span>';
				}
			},
			error: function () {
				narEl.className = "narr";
				narEl.innerHTML = '<span style="color:var(--txt3);font-size:12px;">Could not load AI insight.</span>';
			},
		});
	}

	// ── CHAT ───────────────────────────────────────────────────────────────────
	const BOT_AV = `<svg viewBox="0 0 24 24" fill="#020913"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
	const USR_AV = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--txt2)" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

	function addMessage(role, content) {
		const wrap = el("rd-chat-messages");
		const isUser = (role === "user");
		const div = document.createElement("div");
		div.className = "msg " + (isUser ? "user" : "bot");

		let body = "";
		if (typeof content === "string") {
			body = content;
		} else if (content && content.rows && content.columns) {
			body = `<div style="margin-bottom:7px;color:var(--txt2);">${content.summary || ""}</div>` +
				`<table class="msg-tbl"><tr>${content.columns.map(c => `<th>${c}</th>`).join("")}</tr>` +
				content.rows.map(row =>
					`<tr>${content.columns.map(c => `<td>${row[c] !== undefined ? row[c] : "—"}</td>`).join("")}</tr>`
				).join("") + `</table>`;
		} else {
			body = JSON.stringify(content);
		}

		div.innerHTML = `<div class="msg-av">${isUser ? USR_AV : BOT_AV}</div><div class="msg-bub">${body}</div>`;
		wrap.appendChild(div);
		wrap.scrollTop = wrap.scrollHeight;
		return div;
	}

	function addThinking() {
		const wrap = el("rd-chat-messages");
		const div = document.createElement("div");
		div.className = "msg bot"; div.id = "rd-thinking";
		div.innerHTML = `<div class="msg-av">${BOT_AV}</div><div class="msg-bub thinking"><span></span><span></span><span></span></div>`;
		wrap.appendChild(div);
		wrap.scrollTop = wrap.scrollHeight;
	}

	function removeThinking() { const thEl = el("rd-thinking"); if (thEl) thEl.remove(); }

	function sendMessage(q) {
		if (!q.trim()) return;
		addMessage("user", q);
		el("rd-chat-input").value = "";
		el("rd-suggestions").style.display = "none";
		addThinking();

		frappe.call({
			method: "bizaxl_radar.assist.api.ask",
			args: { question: q },
			callback: function (r) {
				removeThinking();
				addMessage("bot", r.message || "I couldn't find an answer. Try asking about sales, invoices, stock, or customers.");
			},
			error: function () {
				removeThinking();
				addMessage("bot", "Something went wrong. Please check your RADAR configuration.");
			},
		});
	}

	// ── EVENTS ─────────────────────────────────────────────────────────────────
	el("radar-refresh").onclick      = () => { loadKpis(); loadNarrative(); };
	el("rd-refresh-narr").onclick    = loadNarrative;
	el("rd-send-btn").onclick        = () => sendMessage(el("rd-chat-input").value);
	el("rd-chat-input").onkeydown    = (e) => { if (e.key === "Enter") sendMessage(e.target.value); };
	page.main[0].querySelectorAll(".sugg").forEach(btn =>
		btn.addEventListener("click", function () { sendMessage(this.dataset.q); })
	);

	// ── INIT ───────────────────────────────────────────────────────────────────
	loadKpis();
	loadNarrative();

	// Expose refresh for on_page_show
	wrapper._radarRefresh = loadKpis;
// ── MARKET INTELLIGENCE ─────────────────────────────────────────────────

    // ── Geocoding helper ──────────────────────────────────────────────────────
    function geocodeLocation(query, onResult) {
        var preview = document.getElementById("rd-location-preview");
        if (preview) preview.textContent = "Searching…";
        frappe.call({
            method: "bizaxl_radar.intelligence.api.geocode_location",
            args: { query: query },
            callback: function(r) {
                if (r.message && r.message.ok) {
                    document.getElementById("rd-biz-lat").value  = r.message.lat;
                    document.getElementById("rd-biz-lng").value  = r.message.lng;
                    document.getElementById("rd-biz-city").value = r.message.city || "";
                    if (preview) preview.textContent = "📍 " + r.message.label;
                    if (onResult) onResult(r.message);
                } else {
                    var err = (r.message && r.message.error) || "Location not found.";
                    if (preview) { preview.style.color="#FF4040"; preview.textContent = "✗ " + err; }
                }
            }
        });
    }

    // ── Setup modal ───────────────────────────────────────────────────────────
    function _enableSaveBtn() {
        var ok = document.getElementById("rd-biz-name")     && document.getElementById("rd-biz-name").value.trim()     &&
                 document.getElementById("rd-biz-category") && document.getElementById("rd-biz-category").value        &&
                 document.getElementById("rd-biz-lat")      && document.getElementById("rd-biz-lat").value;
        var btn = document.getElementById("rd-setup-save-btn");
        if (btn) btn.disabled = !ok;
    }

    function showSetupModal(isEdit) {
        var ov = document.getElementById("rd-setup-overlay");
        if (!ov) return;
        ov.style.display = "flex";
        if (!isEdit) {
            // Wire inputs
            var _nameEl = document.getElementById("rd-biz-name");
            var _catEl  = document.getElementById("rd-biz-category");
            if (_nameEl) { _nameEl.onchange = _enableSaveBtn; _nameEl.oninput = _enableSaveBtn; }
            if (_catEl)  { _catEl.onchange  = _enableSaveBtn; }
            document.getElementById("rd-locate-btn").onclick = function() {
                var q = document.getElementById("rd-biz-location").value.trim();
                if (q) geocodeLocation(q, function() { _enableSaveBtn(); });
            };
            document.getElementById("rd-biz-location").addEventListener("keydown", function(e) {
                if (e.key === "Enter") { e.preventDefault(); document.getElementById("rd-locate-btn").click(); }
            });
            document.getElementById("rd-setup-skip-btn").onclick = function() {
                ov.style.display = "none";
                // Show a hint in intelligence panels
                document.querySelectorAll(".rd-intel-setup-hint").forEach(function(el) {
                    el.innerHTML = "Profile not set up. <a id='rd-open-setup'>Configure now →</a>";
                    var a = el.querySelector("#rd-open-setup");
                    if (a) a.onclick = function() { showSetupModal(false); };
                });
            };
            document.getElementById("rd-setup-save-btn").onclick = function() {
                var btn = document.getElementById("rd-setup-save-btn");
                btn.disabled = true; btn.textContent = "Saving…";
                frappe.call({
                    method: "bizaxl_radar.intelligence.api.save_profile",
                    args: {
                        business_name: document.getElementById("rd-biz-name").value.trim(),
                        category:      document.getElementById("rd-biz-category").value,
                        lat:           parseFloat(document.getElementById("rd-biz-lat").value),
                        lng:           parseFloat(document.getElementById("rd-biz-lng").value),
                        city:          document.getElementById("rd-biz-city").value,
                        address:       document.getElementById("rd-biz-location").value.trim(),
                        radius_km:     parseInt(document.getElementById("rd-biz-radius").value)
                    },
                    callback: function(r) {
                        if (r.message && r.message.ok) {
                            ov.style.display = "none";
                            loadIntelligence();
                        }
                    },
                    error: function() {
                        btn.disabled = false;
                        btn.textContent = "Save & Load Intelligence →";
                        frappe.msgprint("Save failed — check console.");
                    }
                });
            };
        }
    }

    // ── Pre-fill settings modal with existing data ────────────────────────────
    function prefillSetupModal(profile) {
        if (document.getElementById("rd-biz-name"))     document.getElementById("rd-biz-name").value     = profile.business_name || "";
        if (document.getElementById("rd-biz-category")) document.getElementById("rd-biz-category").value = profile.category || "";
        if (document.getElementById("rd-biz-radius"))   document.getElementById("rd-biz-radius").value   = profile.radius_km || 5;
        if (document.getElementById("rd-biz-lat"))      document.getElementById("rd-biz-lat").value      = profile.lat || "";
        if (document.getElementById("rd-biz-lng"))      document.getElementById("rd-biz-lng").value      = profile.lng || "";
        if (document.getElementById("rd-biz-city"))     document.getElementById("rd-biz-city").value     = profile.city || "";
        if (document.getElementById("rd-biz-location")) document.getElementById("rd-biz-location").value = profile.address || "";
        if (document.getElementById("rd-location-preview") && profile.address)
            document.getElementById("rd-location-preview").textContent = "📍 " + (profile.address || "").slice(0, 80);
        _enableSaveBtn();
    }

    // ── Render competitors ────────────────────────────────────────────────────
    function renderCompetitors(data, profile) {
        var body = document.getElementById("rd-comp-body");
        var radiusEl = document.getElementById("rd-comp-radius");
        if (!body) return;
        if (radiusEl) radiusEl.textContent = profile.radius_km + " km radius";

        if (!data || data.length === 0) {
            body.innerHTML =
                '<div style="color:var(--txt3);font-size:12px;padding:12px 0;text-align:center">' +
                'No similar businesses found in this area on OpenStreetMap.<br>' +
                '<span style="font-size:10px;opacity:0.7">Data from OpenStreetMap — coverage varies by area</span></div>';
            return;
        }

        var cat_emoji = { restaurant:"🍽️", cafe:"☕", retail_grocery:"🛒",
            retail_electronics:"📱", retail_clothing:"👗", retail_footwear:"👟",
            retail_pharmacy:"💊", retail_jewellery:"💍", salon:"💇", bakery:"🥐" };
        var ico = cat_emoji[profile.category] || "🏪";

        body.innerHTML =
            '<div class="rd-comp-summary">' +
            '<strong>' + data.length + ' similar businesses</strong> found within ' +
            profile.radius_km + ' km using OpenStreetMap data.' +
            '</div>' +
            '<div class="rd-comp-list">' +
            data.map(function(c) {
                var phone = c.phone ? '<span class="rd-comp-addr">📞 ' + c.phone + '</span>' : '';
                var addr  = c.address ? '<span class="rd-comp-addr">' + c.address + '</span>' : '';
                return '<div class="rd-comp-item">' +
                    '<div class="rd-comp-icon">' + ico + '</div>' +
                    '<div style="flex:1;min-width:0">' +
                    '<div class="rd-comp-name">' + c.name + '</div>' +
                    (addr || phone) +
                    '</div></div>';
            }).join("") +
            '</div>';
    }

    // ── Render benchmark ──────────────────────────────────────────────────────
    function renderBenchmark(b, cur) {
        var body = document.getElementById("rd-bench-body");
        if (!body) return;
        var score = b.sales_score;
        var pctClass = score >= 100 ? "above" : "below";
        var pctLabel = score >= 100
            ? "▲ " + (score - 100) + "% above industry avg"
            : "▼ " + (100 - score) + "% below industry avg";
        var barWidth = Math.min(score, 200);

        body.innerHTML =
            '<div class="rd-bench-row">' +
            '<div><div class="rd-bench-score ' + pctClass + '">' + score + '<span style="font-size:18px">%</span></div>' +
            '<div class="rd-bench-label">of benchmark</div></div>' +
            '<div style="text-align:right;font-size:11px;color:var(--txt3);max-width:140px;line-height:1.5">' +
            b.category_label + '<br>' +
            '<span style="color:' + (score >= 100 ? 'var(--mint)' : '#FF4040') + ';font-weight:600">' + pctLabel + '</span>' +
            '</div></div>' +
            '<div class="rd-bench-bar-wrap">' +
            '<div class="rd-bench-bar-label"><span>Your sales</span><span>Industry avg</span></div>' +
            '<div class="rd-bench-track"><div class="rd-bench-fill" style="width:0%" data-width="' + Math.min(barWidth, 100) + '%"></div></div>' +
            '</div>' +
            '<div class="rd-bench-stat">' +
            '<span class="rd-bench-stat-key">Your MTD sales</span>' +
            '<span class="rd-bench-stat-val">' + (cur||"₹") + ' ' + parseFloat(b.sales_mtd).toLocaleString("en-IN",{maximumFractionDigits:0}) + '</span>' +
            '</div>' +
            '<div class="rd-bench-stat">' +
            '<span class="rd-bench-stat-key">Industry benchmark</span>' +
            '<span class="rd-bench-stat-val" style="color:var(--txt3)">' + (cur||"₹") + ' ' + parseFloat(b.bench_monthly).toLocaleString("en-IN",{maximumFractionDigits:0}) + '/mo</span>' +
            '</div>' +
            '<div class="rd-bench-stat">' +
            '<span class="rd-bench-stat-key">Outstanding ratio</span>' +
            '<span class="rd-bench-stat-val ' + (b.out_healthy ? "good" : "warn") + '">' + b.out_ratio_pct + '% ' + (b.out_healthy ? "✓ healthy" : "⚠ high") + '</span>' +
            '</div>';

        // Animate bar after render
        setTimeout(function() {
            var fill = body.querySelector(".rd-bench-fill");
            if (fill) fill.style.width = fill.getAttribute("data-width");
        }, 100);
    }

    // ── Render news ───────────────────────────────────────────────────────────
    function renderNews(news, forex) {
        var body = document.getElementById("rd-news-body");
        if (!body) return;
        var html = "";

        // Forex ticker
        if (forex && forex.USD_INR) {
            html += '<div class="rd-forex-bar">';
            html += '<div class="rd-forex-item"><span class="rd-forex-pair">USD/INR</span><span class="rd-forex-rate">' + forex.USD_INR + '</span></div>';
            if (forex.EUR_INR) html += '<div class="rd-forex-item"><span class="rd-forex-pair">EUR/INR</span><span class="rd-forex-rate">' + forex.EUR_INR + '</span></div>';
            if (forex.GBP_INR) html += '<div class="rd-forex-item"><span class="rd-forex-pair">GBP/INR</span><span class="rd-forex-rate">' + forex.GBP_INR + '</span></div>';
            if (forex.CNY_INR) html += '<div class="rd-forex-item"><span class="rd-forex-pair">CNY/INR</span><span class="rd-forex-rate">' + forex.CNY_INR + '</span></div>';
            html += '</div>';
        }

        if (!news || news.length === 0) {
            html += '<div style="color:var(--txt3);font-size:12px;text-align:center;padding:12px 0">No news loaded. RBI feed may be unavailable.</div>';
        } else {
            html += news.map(function(n) {
                var link = n.url ? '<a href="' + n.url + '" target="_blank">' + n.title + '</a>' : n.title;
                return '<div class="rd-news-item">' +
                    '<div class="rd-news-dot"></div>' +
                    '<div class="rd-news-content">' +
                    '<div class="rd-news-title">' + link + '</div>' +
                    '<div class="rd-news-meta">' + (n.source || "RBI") + (n.date ? " · " + n.date : "") + '</div>' +
                    '</div></div>';
            }).join("");
        }
        body.innerHTML = html;
    }

    // ── Render AI recommendations ─────────────────────────────────────────────
    function loadRecommendations() {
        var body = document.getElementById("rd-reco-body");
        if (body) body.innerHTML = '<div style="display:flex;gap:8px;align-items:center;color:var(--txt3);font-size:12px;padding:4px 0"><div class="spin"></div> Generating AI recommendations…</div>';
        frappe.call({
            method: "bizaxl_radar.intelligence.api.get_ai_recommendations",
            timeout: 60,
            callback: function(r) {
                if (body) {
                    var text = (r.message && r.message.narrative) || "AI service unavailable.";
                    body.innerHTML = '<div class="rd-reco-text">' +
                        text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
                            .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
                            .replace(/\n/g,"<br>") +
                        '</div>';
                }
            },
            error: function() {
                if (body) body.innerHTML = '<div style="color:var(--txt3);font-size:12px;">AI service error. Check radar_groq_api_key.</div>';
            }
        });
    }

    // ── Master intelligence loader ────────────────────────────────────────────
    function loadIntelligence() {
        frappe.call({
            method: "bizaxl_radar.intelligence.api.get_intelligence_data",
            callback: function(r) {
                var d = r.message;
                if (!d || d.setup_required) return; // modal handles this
                var cur = d.benchmark && d.benchmark.currency;
                renderCompetitors(d.competitors, d.profile);
                renderBenchmark(d.benchmark, cur);
                renderNews(d.news, d.forex);
                loadRecommendations();
            },
            error: function() {
                ["rd-comp-body","rd-bench-body","rd-news-body","rd-reco-body"].forEach(function(id) {
                    var el = $(id);
                    if (el) el.innerHTML = '<div style="color:var(--txt3);font-size:12px;padding:8px 0">Failed to load. Retry by refreshing.</div>';
                });
            }
        });
    }

    // ── Check profile on load ─────────────────────────────────────────────────
    frappe.call({
        method: "bizaxl_radar.intelligence.api.get_profile",
        callback: function(r) {
            var p = r.message;
            if (!p || !p.setup_complete) {
                showSetupModal(false);
            } else {
                loadIntelligence();
            }
            // Wire gear button
            var gearBtn = document.getElementById("rd-settings-btn");
            if (gearBtn) {
                if (!p || !p.is_admin) {
                    gearBtn.style.display = "none";
                } else {
                    gearBtn.onclick = function() {
                        showSetupModal(true);
                        if (p) prefillSetupModal(p);
                    };
                }
            }
        }
    });

    // Refresh button for recommendations
    var recoBtn = document.getElementById("rd-reco-refresh-btn");
    if (recoBtn) recoBtn.onclick = loadRecommendations;
};
