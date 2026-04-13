import re
from pathlib import Path
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
        file_path = Path(asset.file_path).as_posix()
        upload_root = Path(settings.UPLOAD_DIR).as_posix().rstrip("/")

        relative_path = ""
        if upload_root and file_path.startswith(f"{upload_root}/"):
            relative_path = file_path[len(upload_root) + 1 :]
        else:
            normalized = file_path.lstrip("./")
            marker = "uploads/"
            marker_index = normalized.find(marker)
            if marker_index != -1:
                relative_path = normalized[marker_index + len(marker) :]
            elif "/uploads/" in file_path:
                relative_path = file_path.split("/uploads/", 1)[1]
            else:
                relative_path = Path(file_path).name

        base_url = settings.BASE_URL.rstrip("/")
        return f"{base_url}/uploads/{relative_path.lstrip('/')}"
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
