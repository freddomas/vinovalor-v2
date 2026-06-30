from __future__ import annotations

import csv
import json
import re
import sqlite3
from collections import Counter
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import requests
from PIL import Image, ImageEnhance, ImageFilter


BASE_URL = "https://vinovalor.vercel.app"
ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
RAW_API = ARTIFACTS / "raw" / "api"
KB = ARTIFACTS / "knowledge_base"
VISUALS = ARTIFACTS / "visuals"
ORIGINALS = VISUALS / "original"
ENHANCED = VISUALS / "enhanced"
PROMPTS = VISUALS / "prompts"

ENHANCEMENT_PROMPT = """Ultra-realistic image restoration and enhancement. Restore the uploaded blurry or low-quality image into a sharp, clean, highly detailed, photorealistic result while preserving the original image exactly. Preserve 100% of the subject’s identity, facial structure, apparent age, skin tone, expression, gaze, hair, facial hair, teeth, pose, body proportions, clothing, accessories, background, framing, camera angle, lighting direction, and overall composition. Do not redraw, beautify, stylize, replace, remove, add, reinterpret, or alter the person’s appearance in any way. Do not invent artificial facial features, fake details, overly perfect skin, generic AI textures, or synthetic reconstruction artifacts. Improve only the technical image quality: natural sharpness, clarity, realistic facial and texture detail, skin pores, hair strands, eyes, lips, clothing texture, object edges, blur reduction, noise reduction, compression artifact reduction, pixelation reduction, contrast, depth, dynamic range, and balanced lighting, while preserving the original atmosphere. The output must remain strictly photorealistic. No beauty filter, no plastic skin, no excessive sharpening, no exaggerated HDR, and no fabricated details. Keep everything visually identical to the source image. Enhance image quality only.
For multiple images attached, do parallel operation for each of them and give exact number of images as output. Do not skip miss an image and do not make a collage of all pictures."""


def ensure_dirs() -> None:
    for directory in [RAW_API, KB, ORIGINALS, ENHANCED, PROMPTS]:
        directory.mkdir(parents=True, exist_ok=True)


def get_json(session: requests.Session, path: str, params: dict[str, Any] | None = None) -> Any:
    response = session.get(f"{BASE_URL}{path}", params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def save_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def file_slug(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:90] or "asset"


def stable_visual_name(url: str, index: int) -> str:
    parsed = urlparse(url)
    stem = file_slug(Path(parsed.path).stem or f"visual-{index:03d}")
    query = dict(parse_qsl(parsed.query))
    width = query.get("w")
    height = query.get("h")
    suffix = Path(parsed.path).suffix.lower() or ".jpg"
    if suffix not in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico"}:
        suffix = ".jpg"
    size_part = f"-{width}x{height}" if width and height else ""
    return f"{index:03d}-{stem}{size_part}{suffix}"


def upgrade_unsplash_resolution(url: str) -> str:
    parsed = urlparse(url)
    if "images.unsplash.com" not in parsed.netloc:
        return url
    query = dict(parse_qsl(parsed.query))
    query["w"] = "1600"
    query["h"] = "2000" if int(query.get("h", "500") or 500) >= int(query.get("w", "400") or 400) else "1000"
    query["fit"] = query.get("fit", "crop")
    return urlunparse(parsed._replace(query=urlencode(query)))


def download_visuals(session: requests.Session, urls: list[str]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for index, original_url in enumerate(urls, start=1):
        source_url = upgrade_unsplash_resolution(original_url)
        filename = stable_visual_name(source_url, index)
        out = ORIGINALS / filename
        record: dict[str, Any] = {
            "index": index,
            "original_url": original_url,
            "download_url": source_url,
            "original_path": str(out.relative_to(ROOT)),
            "enhanced_path": None,
            "prompt_path": None,
            "status": "pending",
            "bytes": 0,
            "width": None,
            "height": None,
            "content_type": None,
        }
        try:
            response = session.get(source_url, timeout=45)
            if not response.ok and source_url != original_url:
                source_url = original_url
                record["download_url"] = source_url
                response = session.get(source_url, timeout=45)
            response.raise_for_status()
            out.write_bytes(response.content)
            record["bytes"] = len(response.content)
            record["content_type"] = response.headers.get("content-type")
            if out.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                with Image.open(out) as img:
                    record["width"], record["height"] = img.size
            record["status"] = "downloaded"
        except Exception as exc:  # noqa: BLE001 - manifest must keep failures.
            record["status"] = "download_failed"
            record["error"] = repr(exc)
        records.append(record)
    return records


def enhance_image(source: Path, destination: Path) -> dict[str, Any]:
    with Image.open(source) as img:
        working = img.convert("RGB")
        # Deterministic technical restoration: no hallucinated pixels, only conservative tone/sharpness cleanup.
        working = working.filter(ImageFilter.MedianFilter(size=3))
        working = ImageEnhance.Contrast(working).enhance(1.06)
        working = ImageEnhance.Color(working).enhance(1.03)
        working = ImageEnhance.Sharpness(working).enhance(1.28)
        working = working.filter(ImageFilter.UnsharpMask(radius=1.2, percent=105, threshold=3))
        destination.parent.mkdir(parents=True, exist_ok=True)
        working.save(destination, quality=94, optimize=True)
        return {"width": working.width, "height": working.height}


def enhance_visuals(records: list[dict[str, Any]]) -> None:
    for record in records:
        original_path = ROOT / record["original_path"]
        prompt_path = PROMPTS / f"{Path(record['original_path']).stem}.prompt.txt"
        prompt_path.write_text(ENHANCEMENT_PROMPT, encoding="utf-8")
        record["prompt_path"] = str(prompt_path.relative_to(ROOT))
        if record["status"] != "downloaded":
            continue
        if original_path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            record["enhancement_status"] = "skipped_non_raster"
            continue
        destination = ENHANCED / f"{original_path.stem}-enhanced.jpg"
        try:
            dimensions = enhance_image(original_path, destination)
            record["enhanced_path"] = str(destination.relative_to(ROOT))
            record["enhancement_status"] = "enhanced_deterministic"
            record["enhanced_width"] = dimensions["width"]
            record["enhanced_height"] = dimensions["height"]
        except Exception as exc:  # noqa: BLE001
            record["enhancement_status"] = "enhancement_failed"
            record["enhancement_error"] = repr(exc)


def collect_visual_urls(listings: list[dict[str, Any]], restaurants: list[dict[str, Any]], users: list[dict[str, Any]]) -> list[str]:
    urls: list[str] = []
    for listing in listings:
        for photo in listing.get("photos") or []:
            url = photo.get("cdnUrl") or photo.get("url")
            if url:
                urls.append(url)
    for restaurant in restaurants:
        if restaurant.get("photoUrl"):
            urls.append(restaurant["photoUrl"])
    for user in users:
        if user.get("avatarUrl"):
            urls.append(user["avatarUrl"])
    unique = []
    seen = set()
    for url in urls:
        if url not in seen:
            seen.add(url)
            unique.append(url)
    return unique


def normalize_listings(pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    listings: list[dict[str, Any]] = []
    seen = set()
    for page in pages:
        for listing in page.get("listings", []):
            if listing["id"] in seen:
                continue
            seen.add(listing["id"])
            listings.append(listing)
    return listings


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    keys = sorted({key for row in rows for key in row.keys()})
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=keys)
        writer.writeheader()
        writer.writerows(rows)


def flatten_listing(listing: dict[str, Any]) -> dict[str, Any]:
    seller = listing.get("seller") or {}
    photos = listing.get("photos") or []
    return {
        "id": listing.get("id"),
        "wineName": listing.get("wineName"),
        "wineType": listing.get("wineType"),
        "vintage": listing.get("vintage"),
        "appellation": listing.get("appellation"),
        "region": listing.get("region"),
        "grapeVariety": listing.get("grapeVariety"),
        "volume": listing.get("volume"),
        "isOrganic": listing.get("isOrganic"),
        "hasWoodCase": listing.get("hasWoodCase"),
        "price": listing.get("price"),
        "quantity": listing.get("quantity"),
        "condition": listing.get("condition"),
        "saleMode": listing.get("saleMode"),
        "allowOffers": listing.get("allowOffers"),
        "status": listing.get("status"),
        "reservePrice": listing.get("reservePrice"),
        "targetPrice": listing.get("targetPrice"),
        "restaurantId": listing.get("restaurantId"),
        "sellerId": listing.get("sellerId"),
        "sellerName": " ".join(part for part in [seller.get("firstName"), seller.get("lastName")] if part).strip(),
        "sellerCertified": seller.get("isCertified"),
        "photoCount": len(photos),
        "primaryPhotoUrl": (photos[0].get("url") if photos else None),
    }


def build_sqlite(
    listings: list[dict[str, Any]],
    restaurants: list[dict[str, Any]],
    users: list[dict[str, Any]],
    visual_records: list[dict[str, Any]],
    oauth: dict[str, Any],
) -> None:
    db_path = KB / "vinovalor_knowledge.sqlite"
    if db_path.exists():
        db_path.unlink()
    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(
            """
            CREATE TABLE listings (
                id TEXT PRIMARY KEY,
                seller_id TEXT,
                restaurant_id TEXT,
                wine_name TEXT,
                wine_type TEXT,
                vintage INTEGER,
                appellation TEXT,
                region TEXT,
                grape_variety TEXT,
                volume INTEGER,
                is_organic INTEGER,
                has_wood_case INTEGER,
                price REAL,
                quantity INTEGER,
                condition_status TEXT,
                sale_mode TEXT,
                allow_offers INTEGER,
                status TEXT,
                reserve_price REAL,
                target_price REAL,
                evin_message TEXT,
                is_boosted INTEGER,
                created_at TEXT,
                updated_at TEXT,
                raw_json TEXT
            );
            CREATE TABLE listing_photos (
                id TEXT PRIMARY KEY,
                listing_id TEXT,
                url TEXT,
                cdn_url TEXT,
                position INTEGER
            );
            CREATE TABLE restaurants (
                id TEXT PRIMARY KEY,
                owner_id TEXT,
                name TEXT,
                description TEXT,
                street TEXT,
                city TEXT,
                country TEXT,
                phone TEXT,
                photo_url TEXT,
                rating REAL,
                bottle_count INTEGER,
                raw_json TEXT
            );
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                first_name TEXT,
                last_name TEXT,
                bio TEXT,
                avatar_url TEXT,
                is_certified INTEGER,
                listing_count INTEGER,
                created_at TEXT,
                raw_json TEXT
            );
            CREATE TABLE visual_assets (
                idx INTEGER PRIMARY KEY,
                original_url TEXT,
                download_url TEXT,
                original_path TEXT,
                enhanced_path TEXT,
                prompt_path TEXT,
                status TEXT,
                enhancement_status TEXT,
                bytes INTEGER,
                width INTEGER,
                height INTEGER,
                content_type TEXT
            );
            CREATE TABLE auth_observations (
                key TEXT PRIMARY KEY,
                value TEXT
            );
            """
        )
        conn.executemany(
            """
            INSERT INTO listings VALUES (
                :id, :sellerId, :restaurantId, :wineName, :wineType, :vintage, :appellation,
                :region, :grapeVariety, :volume, :isOrganic, :hasWoodCase, :price, :quantity,
                :condition, :saleMode, :allowOffers, :status, :reservePrice, :targetPrice,
                :evinMessage, :isBoosted, :createdAt, :updatedAt, :raw_json
            )
            """,
            [
                {
                    **listing,
                    "raw_json": json.dumps(listing, ensure_ascii=False),
                }
                for listing in listings
            ],
        )
        photos = []
        for listing in listings:
            for photo in listing.get("photos") or []:
                photos.append(
                    {
                        "id": photo.get("id") or f"{listing['id']}-{photo.get('position', 0)}",
                        "listing_id": listing["id"],
                        "url": photo.get("url"),
                        "cdn_url": photo.get("cdnUrl"),
                        "position": photo.get("position"),
                    }
                )
        conn.executemany(
            "INSERT OR REPLACE INTO listing_photos VALUES (:id, :listing_id, :url, :cdn_url, :position)",
            photos,
        )
        conn.executemany(
            """
            INSERT INTO restaurants VALUES (
                :id, :ownerId, :name, :description, :street, :city, :country,
                :phone, :photoUrl, :rating, :bottleCount, :raw_json
            )
            """,
            [
                {
                    **restaurant,
                    "raw_json": json.dumps(restaurant, ensure_ascii=False),
                }
                for restaurant in restaurants
            ],
        )
        conn.executemany(
            """
            INSERT INTO users VALUES (
                :id, :firstName, :lastName, :bio, :avatarUrl, :isCertified,
                :listingCount, :createdAt, :raw_json
            )
            """,
            [
                {
                    "bio": None,
                    "avatarUrl": None,
                    **user,
                    "raw_json": json.dumps(user, ensure_ascii=False),
                }
                for user in users
            ],
        )
        conn.executemany(
            """
            INSERT INTO visual_assets VALUES (
                :index, :original_url, :download_url, :original_path, :enhanced_path,
                :prompt_path, :status, :enhancement_status, :bytes, :width, :height, :content_type
            )
            """,
            [
                {
                    "enhancement_status": None,
                    **record,
                }
                for record in visual_records
            ],
        )
        conn.executemany(
            "INSERT INTO auth_observations VALUES (?, ?)",
            [(key, json.dumps(value, ensure_ascii=False) if not isinstance(value, str) else value) for key, value in oauth.items()],
        )
        conn.commit()
    finally:
        conn.close()


def infer_business_summary(listings: list[dict[str, Any]], restaurants: list[dict[str, Any]], users: list[dict[str, Any]]) -> dict[str, Any]:
    sale_modes = Counter(item.get("saleMode") for item in listings)
    wine_types = Counter(item.get("wineType") for item in listings)
    regions = Counter(item.get("region") for item in listings if item.get("region"))
    certified_users = sum(1 for user in users if user.get("isCertified"))
    prices = [float(item["price"]) for item in listings if item.get("price") is not None]
    return {
        "listings_count": len(listings),
        "restaurants_count": len(restaurants),
        "users_count": len(users),
        "certified_users_count": certified_users,
        "sale_modes": dict(sale_modes),
        "wine_types": dict(wine_types),
        "top_regions": dict(regions.most_common(10)),
        "min_price": min(prices) if prices else None,
        "max_price": max(prices) if prices else None,
        "average_price": round(sum(prices) / len(prices), 2) if prices else None,
        "listings_with_restaurant": sum(1 for item in listings if item.get("restaurantId")),
        "listings_with_photos": sum(1 for item in listings if item.get("photos")),
        "auction_listings": sum(1 for item in listings if item.get("saleMode") == "AUCTION"),
        "fixed_price_listings": sum(1 for item in listings if item.get("saleMode") == "FIXED"),
    }


def probe_oauth(session: requests.Session) -> dict[str, Any]:
    try:
        response = session.get(f"{BASE_URL}/api/auth/oauth/google", timeout=20, allow_redirects=False)
        return {
            "endpoint": "/api/auth/oauth/google",
            "status_code": response.status_code,
            "location": response.headers.get("location"),
            "set_cookie_present": "set-cookie" in {key.lower(): value for key, value in response.headers.items()},
            "verified": response.status_code in {301, 302, 303, 307, 308}
            and "accounts.google.com" in (response.headers.get("location") or ""),
        }
    except Exception as exc:  # noqa: BLE001
        return {"endpoint": "/api/auth/oauth/google", "error": repr(exc), "verified": False}


def main() -> None:
    ensure_dirs()
    session = requests.Session()
    session.headers.update({"User-Agent": "Codex local audit capture"})

    first_page = get_json(session, "/api/listings", {"page": 1})
    total_pages = int(first_page.get("totalPages", 1))
    listing_pages = [first_page]
    save_json(RAW_API / "listings-page-1.json", first_page)
    for page in range(2, total_pages + 1):
        payload = get_json(session, "/api/listings", {"page": page})
        listing_pages.append(payload)
        save_json(RAW_API / f"listings-page-{page}.json", payload)

    restaurants_payload = get_json(session, "/api/restaurants")
    users_payload = get_json(session, "/api/users")
    save_json(RAW_API / "restaurants.json", restaurants_payload)
    save_json(RAW_API / "users.json", users_payload)

    listings = normalize_listings(listing_pages)
    restaurants = restaurants_payload.get("restaurants", [])
    users = users_payload.get("users", [])

    details = {"listings": {}, "restaurants": {}, "users": {}}
    for listing in listings:
        try:
            details["listings"][listing["id"]] = get_json(session, f"/api/listings/{listing['id']}")
        except Exception as exc:  # noqa: BLE001
            details["listings"][listing["id"]] = {"error": repr(exc)}
    for restaurant in restaurants:
        try:
            details["restaurants"][restaurant["id"]] = get_json(session, f"/api/restaurants/{restaurant['id']}")
        except Exception as exc:  # noqa: BLE001
            details["restaurants"][restaurant["id"]] = {"error": repr(exc)}
    for user in users:
        try:
            details["users"][user["id"]] = get_json(session, f"/api/users/{user['id']}")
        except Exception as exc:  # noqa: BLE001
            details["users"][user["id"]] = {"error": repr(exc)}
    save_json(RAW_API / "details-by-id.json", details)

    oauth = probe_oauth(session)
    save_json(KB / "auth_oauth_probe.json", oauth)

    visual_urls = collect_visual_urls(listings, restaurants, users)
    visual_records = download_visuals(session, visual_urls)
    enhance_visuals(visual_records)

    write_csv(KB / "listings.csv", [flatten_listing(item) for item in listings])
    write_csv(KB / "restaurants.csv", restaurants)
    write_csv(KB / "users.csv", users)
    save_json(KB / "listings.all.json", listings)
    save_json(KB / "restaurants.all.json", restaurants)
    save_json(KB / "users.all.json", users)
    save_json(KB / "visual_manifest.json", visual_records)

    summary = infer_business_summary(listings, restaurants, users)
    summary.update(
        {
            "visual_urls_unique": len(visual_urls),
            "visuals_downloaded": sum(1 for item in visual_records if item["status"] == "downloaded"),
            "visuals_enhanced": sum(1 for item in visual_records if item.get("enhancement_status") == "enhanced_deterministic"),
            "oauth_google_redirect_verified": oauth.get("verified"),
            "knowledge_sqlite": str((KB / "vinovalor_knowledge.sqlite").relative_to(ROOT)),
        }
    )
    save_json(KB / "business_summary.json", summary)
    build_sqlite(listings, restaurants, users, visual_records, oauth)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
