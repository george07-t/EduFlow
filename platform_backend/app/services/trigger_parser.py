import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.media_asset import MediaAsset
from app.config import settings

TRIGGER_PATTERN = re.compile(r"\[\[media:(\d+)\]\]")


def extract_media_ids(html: str) -> List[int]:
    if not html:
        return []
    return [int(m) for m in TRIGGER_PATTERN.findall(html)]


def resolve_asset_url(asset: MediaAsset) -> str:
    if asset.url:
        return asset.url
    if asset.file_path:
        clean_path = asset.file_path.lstrip("./").lstrip("/")
        return f"{settings.BASE_URL}/{clean_path}"
    return ""


def build_media_map(assets: List[MediaAsset]) -> Dict[str, Any]:
    return {
        str(asset.id): {
            "id": asset.id,
            "type": asset.type,
            "title": asset.title,
            "url": resolve_asset_url(asset),
            "alt_text": asset.alt_text,
            "content": asset.content,
        }
        for asset in assets
    }


def parse_triggers(html_fields: List[str], db: Session) -> Dict[str, Any]:
    """Given a list of HTML strings, extract all [[media:N]] IDs,
    bulk-fetch the assets, and return the media_map dict."""
    all_ids: List[int] = []
    for html in html_fields:
        all_ids.extend(extract_media_ids(html))

    unique_ids = list(set(all_ids))
    if not unique_ids:
        return {}

    assets = db.query(MediaAsset).filter(MediaAsset.id.in_(unique_ids)).all()
    return build_media_map(assets)
