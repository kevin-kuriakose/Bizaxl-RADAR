"""
LLM client using Groq (free tier) for intent classification only.

Get your key at https://console.groq.com -> API Keys.
Set it with:  bench --site <site> set-config radar_groq_api_key gsk_...
"""

from __future__ import annotations
import json
import frappe
import requests

_API_URL = "https://api.groq.com/openai/v1/chat/completions"
_MODEL = "llama-3.1-8b-instant"
_TIMEOUT = 20


def classify(question: str, intent_menu: str) -> dict:
    api_key = frappe.conf.get("radar_groq_api_key")
    if not api_key:
        frappe.throw("RADAR: Groq API key not configured. Run: "
                     "bench --site <site> set-config radar_groq_api_key gsk_...")

    system = (
        "You route a business user's question to exactly one intent from the "
        "menu, and extract its parameters. Respond with ONLY a JSON object: "
        '{"intent": "<key or null>", "params": {<typed params>}}. '
        "No prose, no markdown, no code fences. If no intent fits, use null. "
        "Dates as YYYY-MM-DD, months as YYYY-MM. Never invent parameters that "
        "the user did not state.\n\nINTENT MENU:\n" + intent_menu
    )

    resp = requests.post(
        _API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": _MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": question},
            ],
            "max_tokens": 300,
            "temperature": 0,
        },
        timeout=_TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()

    text = data["choices"][0]["message"]["content"].strip()
    if text.startswith("```"):
        text = text.strip("`").lstrip("json").strip()
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        return {"intent": None, "params": {}}

    return {
        "intent": parsed.get("intent"),
        "params": parsed.get("params") or {},
    }
