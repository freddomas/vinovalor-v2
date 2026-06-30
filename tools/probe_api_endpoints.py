from __future__ import annotations

import json
import pathlib
import re
from urllib.parse import urljoin

import requests


ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE_URL = "https://vinovalor.vercel.app"
OUT = ROOT / "artifacts" / "knowledge_base" / "api_probe.json"
TEXT_OUT = ROOT / "artifacts" / "knowledge_base" / "api_inventory.bundle.json"


def extract_endpoints() -> list[str]:
    endpoints: set[str] = set()
    for path in (ROOT / "artifacts" / "assets").glob("*.js"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        for pattern in [r'"(/api/[^"]+)"', r"'(/api/[^']+)'", r"`(/api/[^`]+)`"]:
            for value in re.findall(pattern, text):
                if "${" not in value and "<" not in value and len(value) < 140:
                    endpoints.add(value)
    return sorted(endpoints)


def probe(session: requests.Session, endpoint: str) -> dict:
    url = urljoin(BASE_URL, endpoint)
    try:
        response = session.get(url, allow_redirects=False, timeout=20)
        body = response.text[:500] if response.text else ""
        return {
            "endpoint": endpoint,
            "method": "GET",
            "status_code": response.status_code,
            "content_type": response.headers.get("content-type"),
            "location": response.headers.get("location"),
            "body_sample": body,
        }
    except Exception as exc:  # noqa: BLE001 - endpoint diagnostics must be preserved.
        return {"endpoint": endpoint, "method": "GET", "error": repr(exc)}


def main() -> None:
    endpoints = extract_endpoints()
    TEXT_OUT.write_text(json.dumps(endpoints, ensure_ascii=False, indent=2), encoding="utf-8")
    session = requests.Session()
    session.headers.update({"User-Agent": "Codex API endpoint probe"})
    records = [probe(session, endpoint) for endpoint in endpoints]
    OUT.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"endpoints": len(endpoints), "probed": len(records)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
