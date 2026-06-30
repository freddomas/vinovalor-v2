from __future__ import annotations

import json
import re
import sqlite3
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


BASE_URL = "https://vinovalor.vercel.app"
ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
RAW = ARTIFACTS / "raw"
PAGES = RAW / "pages"
ASSETS = ARTIFACTS / "assets"
KB = ARTIFACTS / "knowledge_base"

COMMON_ROUTES = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/search",
    "/listings",
    "/listings/demo",
    "/users",
    "/users/demo",
    "/restaurants",
    "/restaurants/demo",
    "/dashboard",
    "/profile",
    "/favorites",
    "/messages",
    "/settings",
    "/sell",
    "/add-listing",
    "/create-listing",
    "/cellar",
    "/my-cellar",
    "/admin",
    "/api/auth/session",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.json",
]

BUSINESS_KEYWORDS = [
    "vin",
    "vino",
    "valor",
    "cave",
    "bouteille",
    "millesime",
    "millésime",
    "cepage",
    "cépage",
    "region",
    "région",
    "chateau",
    "château",
    "domaine",
    "prix",
    "restaurant",
    "favori",
    "marketplace",
    "particulier",
    "vendeur",
    "acheteur",
    "auth",
    "login",
    "register",
    "google",
]

TEXT_EXTENSIONS = {".html", ".js", ".css", ".svg", ".json", ".txt", ".xml"}
VISUAL_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".avif",
    ".svg",
    ".ico",
    ".mp4",
    ".webm",
    ".mov",
    ".m4v",
}


@dataclass
class FetchRecord:
    url: str
    local_path: str | None
    status_code: int | None
    content_type: str | None
    bytes: int
    ok: bool
    error: str | None = None


def ensure_dirs() -> None:
    for directory in [RAW, PAGES, ASSETS, KB]:
        directory.mkdir(parents=True, exist_ok=True)


def safe_name(url: str, default: str = "index") -> str:
    parsed = urlparse(url)
    path = parsed.path.strip("/") or default
    if parsed.query:
        path = f"{path}_{parsed.query}"
    safe = re.sub(r"[^A-Za-z0-9._-]+", "_", path)
    return safe[:180] or default


def local_path_for(url: str, page: bool = False) -> Path:
    name = safe_name(url)
    if page:
        if not Path(name).suffix:
            name = f"{name}.html"
        return PAGES / name
    parsed = urlparse(url)
    suffix = Path(parsed.path).suffix
    if suffix and not name.endswith(suffix):
        name += suffix
    return ASSETS / name


def fetch(session: requests.Session, url: str, out_path: Path | None = None) -> FetchRecord:
    try:
        response = session.get(url, timeout=25)
        content_type = response.headers.get("content-type", "")
        payload = response.content
        if out_path is not None and response.ok:
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(payload)
        return FetchRecord(
            url=url,
            local_path=str(out_path.relative_to(ROOT)) if out_path and response.ok else None,
            status_code=response.status_code,
            content_type=content_type,
            bytes=len(payload),
            ok=response.ok,
        )
    except Exception as exc:  # noqa: BLE001 - capture diagnostics for the manifest.
        return FetchRecord(
            url=url,
            local_path=str(out_path.relative_to(ROOT)) if out_path else None,
            status_code=None,
            content_type=None,
            bytes=0,
            ok=False,
            error=repr(exc),
        )


def extract_refs_from_html(html: str, base: str) -> set[str]:
    refs: set[str] = set()
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.find_all(True):
        for attr in ("src", "href", "poster"):
            value = tag.get(attr)
            if isinstance(value, str) and value and not value.startswith(("data:", "mailto:", "tel:")):
                refs.add(urljoin(base, value))
        srcset = tag.get("srcset")
        if isinstance(srcset, str):
            for item in srcset.split(","):
                candidate = item.strip().split(" ")[0]
                if candidate and not candidate.startswith("data:"):
                    refs.add(urljoin(base, candidate))
    return refs


def extract_refs_from_text(text: str, base: str) -> set[str]:
    refs: set[str] = set()
    patterns = [
        r"https?://[^\s\"'`<>\\)]+",
        r"/_next/[A-Za-z0-9_./?=&%-]+",
        r"/(?:images|assets|media|videos|api|auth|listings|users|restaurants)/[A-Za-z0-9_./?=&%-]+",
        r"/[A-Za-z0-9_-]+\.(?:png|jpg|jpeg|webp|gif|avif|svg|ico|mp4|webm|mov|json|js|css)",
    ]
    for pattern in patterns:
        for match in re.findall(pattern, text, flags=re.IGNORECASE):
            cleaned = match.rstrip(".,;:")
            if any(token in cleaned for token in ["${", "{", "}", "\\", "`"]):
                continue
            try:
                refs.add(urljoin(base, cleaned))
            except ValueError:
                continue
    return refs


def extract_routes(text: str) -> list[str]:
    routes = set()
    for match in re.findall(r"['\"`](/[A-Za-z0-9_./-]{1,80})['\"`]", text):
        if any(match.startswith(prefix) for prefix in ["/_next", "/static"]):
            continue
        if "." in Path(match).name:
            continue
        routes.add(match)
    return sorted(routes)


def decode_js_string(raw: str) -> str:
    try:
        return bytes(raw, "utf-8").decode("unicode_escape")
    except Exception:
        return raw


def extract_useful_strings(text: str) -> list[str]:
    results: set[str] = set()
    for quote, raw in re.findall(r"([\"'`])((?:\\.|(?!\1).){2,240})\1", text, flags=re.DOTALL):
        value = decode_js_string(raw).strip()
        value = re.sub(r"\s+", " ", value)
        if len(value) < 3 or len(value) > 220:
            continue
        lower = value.lower()
        has_keyword = any(keyword in lower for keyword in BUSINESS_KEYWORDS)
        has_human_text = bool(re.search(r"[A-Za-zÀ-ÿ]{3,}\s+[A-Za-zÀ-ÿ]{2,}", value))
        if has_keyword or has_human_text:
            if not value.startswith(("function ", "return ", "var ", "let ", "const ")):
                results.add(value)
    return sorted(results)


def content_text(path: Path) -> str | None:
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return None
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return None


def discover_and_fetch_assets(session: requests.Session, initial_refs: Iterable[str]) -> list[FetchRecord]:
    seen: set[str] = set()
    queue = list(initial_refs)
    records: list[FetchRecord] = []
    rounds = 0
    while queue and rounds < 4:
        rounds += 1
        current = queue
        queue = []
        for url in current:
            parsed = urlparse(url)
            if parsed.netloc and parsed.netloc != urlparse(BASE_URL).netloc:
                continue
            clean_url = url.split("#", 1)[0]
            if clean_url in seen:
                continue
            seen.add(clean_url)
            out_path = local_path_for(clean_url)
            record = fetch(session, clean_url, out_path)
            records.append(record)
            if record.ok and record.local_path:
                text = content_text(ROOT / record.local_path)
                if text:
                    for ref in extract_refs_from_text(text, BASE_URL):
                        if ref not in seen:
                            queue.append(ref)
            time.sleep(0.05)
    return records


def build_sqlite(
    route_records: list[FetchRecord],
    asset_records: list[FetchRecord],
    strings: list[dict],
    routes: list[str],
) -> None:
    db_path = KB / "vinovalor_capture.sqlite"
    if db_path.exists():
        db_path.unlink()
    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(
            """
            CREATE TABLE routes (
                url TEXT PRIMARY KEY,
                local_path TEXT,
                status_code INTEGER,
                content_type TEXT,
                bytes INTEGER,
                ok INTEGER,
                error TEXT
            );
            CREATE TABLE assets (
                url TEXT PRIMARY KEY,
                local_path TEXT,
                status_code INTEGER,
                content_type TEXT,
                bytes INTEGER,
                ok INTEGER,
                error TEXT,
                asset_type TEXT
            );
            CREATE TABLE extracted_strings (
                source TEXT,
                value TEXT,
                PRIMARY KEY (source, value)
            );
            CREATE TABLE discovered_routes (
                route TEXT PRIMARY KEY
            );
            """
        )
        conn.executemany(
            "INSERT OR REPLACE INTO routes VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                (
                    r.url,
                    r.local_path,
                    r.status_code,
                    r.content_type,
                    r.bytes,
                    1 if r.ok else 0,
                    r.error,
                )
                for r in route_records
            ],
        )
        conn.executemany(
            "INSERT OR REPLACE INTO assets VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                (
                    r.url,
                    r.local_path,
                    r.status_code,
                    r.content_type,
                    r.bytes,
                    1 if r.ok else 0,
                    r.error,
                    classify_asset(r),
                )
                for r in asset_records
            ],
        )
        conn.executemany(
            "INSERT OR REPLACE INTO extracted_strings VALUES (?, ?)",
            [(item["source"], item["value"]) for item in strings],
        )
        conn.executemany(
            "INSERT OR REPLACE INTO discovered_routes VALUES (?)",
            [(route,) for route in routes],
        )
        conn.commit()
    finally:
        conn.close()


def classify_asset(record: FetchRecord) -> str:
    path = urlparse(record.url).path
    suffix = Path(path).suffix.lower()
    if suffix in {".js", ".css", ".json", ".html", ".xml", ".txt"}:
        return "code_or_text"
    if suffix in {".woff", ".woff2", ".ttf", ".otf"}:
        return "font"
    if suffix in {".mp4", ".webm", ".mov", ".m4v"}:
        return "video"
    if suffix in VISUAL_EXTENSIONS:
        return "image_or_icon"
    return "other"


def main() -> None:
    ensure_dirs()
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "Codex research capture for owner-side reconstruction; contact: local audit",
            "Accept": "*/*",
        }
    )

    route_records: list[FetchRecord] = []
    html_refs: set[str] = set()
    for route in COMMON_ROUTES:
        url = urljoin(BASE_URL, route)
        out_path = local_path_for(url, page=True)
        record = fetch(session, url, out_path)
        route_records.append(record)
        if record.ok and record.local_path:
            text = (ROOT / record.local_path).read_text(encoding="utf-8", errors="ignore")
            html_refs |= extract_refs_from_html(text, url)
            html_refs |= extract_refs_from_text(text, url)
        time.sleep(0.05)

    asset_records = discover_and_fetch_assets(session, html_refs)

    all_text_files = [path for path in ASSETS.rglob("*") if path.is_file() and path.suffix.lower() in TEXT_EXTENSIONS]
    all_text_files += [path for path in PAGES.rglob("*") if path.is_file()]

    string_items: list[dict] = []
    discovered_routes: set[str] = set(COMMON_ROUTES)
    external_refs: set[str] = set()
    api_refs: set[str] = set()
    for path in all_text_files:
        text = content_text(path)
        if not text:
            continue
        rel = str(path.relative_to(ROOT))
        for value in extract_useful_strings(text):
            string_items.append({"source": rel, "value": value})
        for route in extract_routes(text):
            discovered_routes.add(route)
        for ref in extract_refs_from_text(text, BASE_URL):
            if "/api/" in urlparse(ref).path:
                api_refs.add(ref)
            if urlparse(ref).netloc and urlparse(ref).netloc != urlparse(BASE_URL).netloc:
                external_refs.add(ref)

    route_records_json = [asdict(item) for item in route_records]
    asset_records_json = [asdict(item) | {"asset_type": classify_asset(item)} for item in asset_records]
    visual_assets = [
        item
        for item in asset_records_json
        if item["ok"] and item.get("asset_type") in {"image_or_icon", "video"}
    ]

    (KB / "route_probe.json").write_text(
        json.dumps(route_records_json, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (KB / "asset_inventory.json").write_text(
        json.dumps(asset_records_json, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (KB / "visual_assets.json").write_text(
        json.dumps(visual_assets, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (KB / "string_inventory.json").write_text(
        json.dumps(string_items, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (KB / "discovered_routes.json").write_text(
        json.dumps(sorted(discovered_routes), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (KB / "api_inventory.json").write_text(
        json.dumps(sorted(api_refs), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (KB / "external_refs.json").write_text(
        json.dumps(sorted(external_refs), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    build_sqlite(route_records, asset_records, string_items, sorted(discovered_routes))

    summary = {
        "base_url": BASE_URL,
        "routes_probed": len(route_records),
        "routes_ok": sum(1 for item in route_records if item.ok),
        "assets_downloaded_ok": sum(1 for item in asset_records if item.ok),
        "visual_assets_ok": len(visual_assets),
        "strings_extracted": len(string_items),
        "routes_discovered": len(discovered_routes),
        "api_refs": len(api_refs),
        "external_refs": len(external_refs),
        "sqlite": str((KB / "vinovalor_capture.sqlite").relative_to(ROOT)),
    }
    (KB / "capture_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
