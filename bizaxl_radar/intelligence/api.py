"""
BizAxl RADAR — Market Intelligence Backend
All-free implementation: Overpass (OSM), Nominatim, RBI RSS, ExchangeRate API
"""
from __future__ import annotations
import frappe, json, re, urllib.parse
from typing import Optional
try:
    import httpx
except ImportError:
    httpx = None

# ── CATEGORY REGISTRY ─────────────────────────────────────────────────────────
CATEGORIES = [
    {"slug": "retail_grocery",    "label": "🛒 Grocery / Supermarket",    "osm": ("shop","supermarket"),  "keywords": "grocery retail India",          "bench": 800000},
    {"slug": "retail_electronics","label": "📱 Electronics / Mobile",      "osm": ("shop","electronics"),  "keywords": "electronics consumer India",    "bench": 600000},
    {"slug": "retail_clothing",   "label": "👗 Clothing / Fashion",        "osm": ("shop","clothes"),      "keywords": "apparel clothing retail India",  "bench": 400000},
    {"slug": "retail_footwear",   "label": "👟 Footwear / Shoes",          "osm": ("shop","shoes"),        "keywords": "footwear shoes retail India",    "bench": 300000},
    {"slug": "retail_furniture",  "label": "🪑 Furniture / Home Décor",    "osm": ("shop","furniture"),    "keywords": "furniture home decor India",     "bench": 450000},
    {"slug": "retail_pharmacy",   "label": "💊 Pharmacy / Medical",        "osm": ("shop","pharmacy"),     "keywords": "pharmacy medical retail India",  "bench": 350000},
    {"slug": "retail_jewellery",  "label": "💍 Jewellery",                 "osm": ("shop","jewelry"),      "keywords": "jewellery gold silver India",    "bench": 1200000},
    {"slug": "retail_hardware",   "label": "🔨 Hardware / Building",       "osm": ("shop","hardware"),     "keywords": "hardware construction India",    "bench": 350000},
    {"slug": "retail_books",      "label": "📚 Books / Stationery",        "osm": ("shop","books"),        "keywords": "books stationery India",         "bench": 150000},
    {"slug": "restaurant",        "label": "🍽️ Restaurant / Dhaba",       "osm": ("amenity","restaurant"),"keywords": "restaurant food service India",  "bench": 600000},
    {"slug": "cafe",              "label": "☕ Café / Tea Shop",            "osm": ("amenity","cafe"),      "keywords": "cafe coffee beverage India",     "bench": 200000},
    {"slug": "bakery",            "label": "🥐 Bakery / Sweet Shop",       "osm": ("shop","bakery"),       "keywords": "bakery sweets confectionery India","bench": 250000},
    {"slug": "salon",             "label": "💇 Salon / Beauty Parlour",    "osm": ("shop","hairdresser"),  "keywords": "salon beauty parlour India",     "bench": 180000},
    {"slug": "auto_repair",       "label": "🔧 Auto Repair / Garage",      "osm": ("shop","car_repair"),   "keywords": "automobile repair service India","bench": 280000},
    {"slug": "mobile_repair",     "label": "📲 Mobile Repair / Accessories","osm": ("shop","mobile_phone"),"keywords": "mobile phone repair India",      "bench": 150000},
    {"slug": "healthcare_clinic", "label": "🏥 Clinic / Healthcare",       "osm": ("amenity","clinic"),    "keywords": "clinic healthcare medical India","bench": 400000},
    {"slug": "education",         "label": "📖 Education / Coaching",      "osm": ("amenity","school"),    "keywords": "education coaching India",       "bench": 250000},
    {"slug": "wholesale",         "label": "📦 Wholesale / Distribution",  "osm": ("shop","wholesale"),    "keywords": "wholesale distribution India",   "bench": 2000000},
    {"slug": "hotel",             "label": "🏨 Hotel / Lodge",             "osm": ("tourism","hotel"),     "keywords": "hotel hospitality India",        "bench": 800000},
    {"slug": "other",             "label": "🏪 Other Retail / Service",    "osm": ("shop","general"),      "keywords": "retail business India",          "bench": 300000},
]
CAT_MAP = {c["slug"]: c for c in CATEGORIES}

PROFILE_KEY = "radar_business_profile"

# ── PROFILE STORAGE ───────────────────────────────────────────────────────────

def _load_profile() -> Optional[dict]:
    raw = frappe.db.get_default(PROFILE_KEY)
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            return None
    return None

def _is_admin() -> bool:
    return frappe.has_permission("System Settings", "write")

# ── GEOCODING ─────────────────────────────────────────────────────────────────

def _extract_coords_from_url(text: str):
    """Extract lat,lng from a Google Maps URL."""
    # @lat,lng pattern
    m = re.search(r'@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)', text)
    if m:
        return float(m.group(1)), float(m.group(2))
    # ?q=lat,lng
    parsed = urllib.parse.urlparse(text)
    params = urllib.parse.parse_qs(parsed.query)
    q = (params.get('q') or params.get('query') or [None])[0]
    if q:
        m2 = re.match(r'^(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)$', q.strip())
        if m2:
            return float(m2.group(1)), float(m2.group(2))
    return None, None

def _nominatim_geocode(address: str):
    """Convert address to lat/lng/display_name via Nominatim (free)."""
    params = {
        "q": address, "format": "json", "limit": 1,
        "addressdetails": 0, "countrycodes": "in"
    }
    headers = {"User-Agent": "BizAxl-RADAR/2.0 (bizaxl@example.com)"}
    try:
        with httpx.Client(timeout=10) as client:
            r = client.get("https://nominatim.openstreetmap.org/search", params=params, headers=headers)
            r.raise_for_status()
        data = r.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"]), data[0].get("display_name", address)
    except Exception as e:
        frappe.log_error(str(e), "RADAR Nominatim")
    return None, None, address

@frappe.whitelist()
def geocode_location(query: str) -> dict:
    """Geocode a Google Maps URL or plain address. Called from the setup modal."""
    if not query or not query.strip():
        return {"ok": False, "error": "Empty query"}

    # Try URL first
    lat, lng = _extract_coords_from_url(query)
    if lat and lng:
        # Reverse-geocode to get city name
        label = f"{lat:.4f}, {lng:.4f}"
        try:
            headers = {"User-Agent": "BizAxl-RADAR/2.0"}
            with httpx.Client(timeout=8) as client:
                r = client.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    params={"lat": lat, "lon": lng, "format": "json"},
                    headers=headers
                )
                r.raise_for_status()
            d = r.json()
            addr = d.get("address", {})
            city = addr.get("city") or addr.get("town") or addr.get("suburb") or ""
            label = d.get("display_name", label)[:80]
        except Exception:
            city = ""
        return {"ok": True, "lat": lat, "lng": lng, "city": city, "label": label}

    # Plain address
    lat, lng, label = _nominatim_geocode(query)
    if lat and lng:
        city_m = re.search(r',\s*([^,]+),\s*[A-Z][a-z]+\s*\d', label)
        city = city_m.group(1).strip() if city_m else query.split(',')[0].strip()
        return {"ok": True, "lat": lat, "lng": lng, "city": city, "label": label[:80]}

    return {"ok": False, "error": "Could not find that location. Try a more specific address."}

# ── PROFILE ENDPOINTS ─────────────────────────────────────────────────────────

@frappe.whitelist()
def get_profile() -> dict:
    profile = _load_profile()
    if not profile:
        return {"setup_complete": False, "is_admin": _is_admin()}
    return {"setup_complete": True, "is_admin": _is_admin(), **profile}

@frappe.whitelist()
def save_profile(business_name: str, category: str, lat: float,
                 lng: float, city: str, address: str, radius_km: int = 5) -> dict:
    existing = _load_profile()
    # After first setup, only admins can change
    if existing and existing.get("setup_complete") and not _is_admin():
        frappe.throw("Only administrators can change the business profile.")

    cat = CAT_MAP.get(category, CAT_MAP["other"])
    profile = {
        "setup_complete": True,
        "business_name": business_name,
        "category": category,
        "category_label": cat["label"],
        "city": city,
        "address": address,
        "lat": float(lat),
        "lng": float(lng),
        "radius_km": int(radius_km),
        "news_keywords": cat["keywords"],
    }
    frappe.db.set_default(PROFILE_KEY, json.dumps(profile))
    frappe.db.commit()
    return {"ok": True, "profile": profile}

# ── COMPETITORS (Overpass / OpenStreetMap) ────────────────────────────────────

def _get_competitors(lat: float, lng: float, osm_key: str, osm_val: str, radius_m: int) -> list:
    query = f"""
[out:json][timeout:20];
(
  node["{osm_key}"="{osm_val}"](around:{radius_m},{lat},{lng});
  way["{osm_key}"="{osm_val}"](around:{radius_m},{lat},{lng});
);
out center body qt;
"""
    try:
        with httpx.Client(timeout=25) as client:
            r = client.post("https://overpass-api.de/api/interpreter", data={"data": query})
            r.raise_for_status()
        elements = r.json().get("elements", [])
    except Exception as e:
        frappe.log_error(str(e), "RADAR Overpass")
        return []

    results = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name", "").strip()
        if not name:
            continue
        c_lat = el.get("lat") or (el.get("center") or {}).get("lat")
        c_lng = el.get("lon") or (el.get("center") or {}).get("lon")
        results.append({
            "name": name,
            "lat": c_lat,
            "lng": c_lng,
            "address": " ".join(filter(None, [tags.get("addr:street"), tags.get("addr:housenumber")])),
            "phone": tags.get("phone") or tags.get("contact:phone", ""),
            "website": tags.get("website") or tags.get("contact:website", ""),
            "hours": tags.get("opening_hours", ""),
        })
    return results[:30]

# ── NEWS (RBI RSS — free, no key) ─────────────────────────────────────────────

def _get_rbi_news() -> list:
    try:
        import xml.etree.ElementTree as ET
        headers = {"User-Agent": "BizAxl-RADAR/2.0"}
        with httpx.Client(timeout=10) as client:
            r = client.get("https://www.rbi.org.in/scripts/rss.aspx", headers=headers)
            r.raise_for_status()
        root = ET.fromstring(r.content)
        items = []
        for item in root.findall(".//item")[:8]:
            title = (item.findtext("title") or "").strip()
            link  = (item.findtext("link") or "").strip()
            date  = (item.findtext("pubDate") or "").strip()[:16]
            if title:
                items.append({"title": title, "url": link, "date": date, "source": "RBI"})
        return items
    except Exception as e:
        frappe.log_error(str(e), "RADAR RBI RSS")
        return []

def _get_gnews(keywords: str) -> list:
    """Optional: GNews free tier (100/day). Key stored in site_config as radar_gnews_key."""
    key = frappe.conf.get("radar_gnews_key")
    if not key or not keywords:
        return []
    try:
        params = {"q": keywords, "lang": "en", "country": "in",
                  "max": 6, "apikey": key}
        with httpx.Client(timeout=10) as client:
            r = client.get("https://gnews.io/api/v4/search", params=params)
            r.raise_for_status()
        arts = r.json().get("articles", [])
        return [{"title": a.get("title"), "url": a.get("url"),
                 "date": (a.get("publishedAt") or "")[:10],
                 "source": a.get("source", {}).get("name", "GNews")} for a in arts]
    except Exception as e:
        frappe.log_error(str(e), "RADAR GNews")
        return []

# ── FOREX (free, no key) ──────────────────────────────────────────────────────

def _get_forex() -> dict:
    cache_key = "radar_forex"
    cached = frappe.cache().get_value(cache_key)
    if cached:
        return json.loads(cached)
    try:
        with httpx.Client(timeout=8) as client:
            r = client.get("https://open.er-api.com/v6/latest/USD",
                           headers={"User-Agent": "BizAxl-RADAR/2.0"})
            r.raise_for_status()
        rates = r.json().get("rates", {})
        inr = rates.get("INR", 0)
        result = {
            "USD_INR": round(inr, 2),
            "EUR_INR": round(inr / rates.get("EUR", 1), 2) if rates.get("EUR") else None,
            "GBP_INR": round(inr / rates.get("GBP", 1), 2) if rates.get("GBP") else None,
            "CNY_INR": round(inr / rates.get("CNY", 1), 2) if rates.get("CNY") else None,
        }
        frappe.cache().set_value(cache_key, json.dumps(result), expires_in_sec=3600)
        return result
    except Exception:
        return {}

# ── BENCHMARK ─────────────────────────────────────────────────────────────────

def _get_benchmark(profile: dict) -> dict:
    cat = CAT_MAP.get(profile.get("category", "other"), CAT_MAP["other"])
    bench_monthly = cat["bench"]

    month_start = frappe.utils.get_first_day(frappe.utils.nowdate())
    sales_data = frappe.db.sql("""
        SELECT COALESCE(SUM(grand_total),0) total, COUNT(*) cnt
        FROM `tabBA Sales Invoice`
        WHERE posting_date>=%s AND docstatus=1
    """, month_start, as_dict=True)[0]
    outstanding_data = frappe.db.sql("""
        SELECT COALESCE(SUM(outstanding_amount),0) total, COUNT(*) cnt
        FROM `tabBA Sales Invoice`
        WHERE status IN ('Unpaid','Overdue') AND docstatus=1
    """, as_dict=True)[0]

    sales_mtd    = float(sales_data.total or 0)
    out_total    = float(outstanding_data.total or 0)
    sales_score  = min(round((sales_mtd / bench_monthly) * 100), 250) if bench_monthly > 0 else 0
    out_ratio    = round((out_total / sales_mtd) * 100, 1) if sales_mtd > 0 else 0
    out_healthy  = out_ratio <= 15

    return {
        "sales_mtd":        sales_mtd,
        "bench_monthly":    bench_monthly,
        "sales_score":      sales_score,
        "invoice_count":    int(sales_data.cnt or 0),
        "outstanding":      out_total,
        "outstanding_count":int(outstanding_data.cnt or 0),
        "out_ratio_pct":    out_ratio,
        "out_healthy":      out_healthy,
        "category_label":   cat["label"],
    }

# ── AI RECOMMENDATIONS ────────────────────────────────────────────────────────

def _call_groq(messages: list, system: str = "") -> str:
    key = frappe.conf.get("radar_groq_api_key") or frappe.conf.get("groq_api_key")
    if not key:
        return "Set **radar_groq_api_key** in site_config to enable AI recommendations."
    msgs = ([{"role":"system","content":system}] if system else []) + messages
    try:
        with httpx.Client(timeout=30) as client:
            r = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={"model": "llama-3.3-70b-versatile", "messages": msgs,
                      "max_tokens": 500, "temperature": 0.3}
            )
            r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "RADAR AI Recommendations")
        return f"AI service error: {str(e)[:80]}"

# ── MASTER ENDPOINTS ──────────────────────────────────────────────────────────

@frappe.whitelist()
def get_intelligence_data() -> dict:
    """Master endpoint — returns competitors, news, benchmark, forex."""
    profile = _load_profile()
    if not profile or not profile.get("setup_complete"):
        return {"setup_required": True}

    cat = CAT_MAP.get(profile["category"], CAT_MAP["other"])
    lat, lng = profile["lat"], profile["lng"]
    radius_m = int(profile.get("radius_km", 5)) * 1000

    # Competitors (cache 2 hours — Overpass is rate-limited)
    comp_key = f"radar_comp_{lat:.3f}_{lng:.3f}_{profile['category']}"
    comp_raw = frappe.cache().get_value(comp_key)
    if comp_raw:
        competitors = json.loads(comp_raw)
    else:
        competitors = _get_competitors(lat, lng, *cat["osm"], radius_m)
        frappe.cache().set_value(comp_key, json.dumps(competitors), expires_in_sec=7200)

    # News (cache 30 min)
    news_key = f"radar_news_{profile['category']}"
    news_raw = frappe.cache().get_value(news_key)
    if news_raw:
        news = json.loads(news_raw)
    else:
        news = _get_gnews(cat["keywords"]) or _get_rbi_news()
        frappe.cache().set_value(news_key, json.dumps(news), expires_in_sec=1800)

    benchmark = _get_benchmark(profile)
    forex = _get_forex()

    return {
        "profile":     profile,
        "competitors": competitors,
        "competitor_count": len(competitors),
        "news":        news,
        "benchmark":   benchmark,
        "forex":       forex,
    }

@frappe.whitelist()
def get_ai_recommendations() -> dict:
    """Extended AI using all intelligence context."""
    profile = _load_profile()
    if not profile or not profile.get("setup_complete"):
        return {"narrative": "Set up your business profile to get AI recommendations."}

    cat = CAT_MAP.get(profile["category"], CAT_MAP["other"])
    bench = _get_benchmark(profile)
    forex = _get_forex()

    comp_key = f"radar_comp_{profile['lat']:.3f}_{profile['lng']:.3f}_{profile['category']}"
    comp_raw = frappe.cache().get_value(comp_key)
    comp_count = len(json.loads(comp_raw)) if comp_raw else "unknown"

    news = _get_rbi_news()[:4]
    news_text = "\n".join(f"• {n['title']}" for n in news) if news else "No recent policy news available."

    cur = frappe.defaults.get_global_default("currency") or "INR"
    biz = profile.get("business_name", "this business")
    city = profile.get("city", "India")
    cat_name = cat["label"].split(None, 1)[-1]

    system = f"""You are a sharp business analyst for {biz}, a {cat_name} in {city}.

INTERNAL PERFORMANCE THIS MONTH:
• Sales: {cur} {bench['sales_mtd']:,.2f}  (industry average: {cur} {bench['bench_monthly']:,.2f}/month)
• vs Benchmark: {bench['sales_score']}% of average {'— OUTPERFORMING ✓' if bench['sales_score'] >= 100 else '— BELOW AVERAGE ✗'}
• Outstanding receivables: {cur} {bench['outstanding']:,.2f} ({bench['out_ratio_pct']}% of sales — {'healthy ✓' if bench['out_healthy'] else 'HIGH RISK ✗'})
• Invoices this month: {bench['invoice_count']}

LOCAL MARKET:
• {comp_count} similar {cat_name} businesses found within {profile.get('radius_km', 5)}km

EXCHANGE RATES (USD/INR: {forex.get('USD_INR', 'N/A')}, EUR/INR: {forex.get('EUR_INR', 'N/A')})

RECENT RBI/POLICY UPDATES:
{news_text}

Write a concise intelligence report (max 180 words):
1. One-line performance verdict
2. Biggest risk or opportunity right now
3. Three specific, numbered, actionable steps for this week"""

    narrative = _call_groq([{"role":"user","content":"Generate my weekly business intelligence report."}], system)
    return {"narrative": narrative, "benchmark": bench, "competitor_count": comp_count}
