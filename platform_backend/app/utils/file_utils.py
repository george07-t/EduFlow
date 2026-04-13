import os
import uuid
import mimetypes
from datetime import datetime
from pathlib import Path
from fastapi import HTTPException, UploadFile
from app.config import settings

ALLOWED_MIME_TYPES = {
    "image": {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"},
    "audio": {"audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4", "audio/aac"},
    "local_video": {"video/mp4", "video/webm", "video/ogg", "video/quicktime"},
}

MAX_SIZE_MB = {
    "image": 10,
    "audio": 25,
    "local_video": 200,
}


def get_upload_path(filename: str) -> str:
    now = datetime.now()
    year = now.strftime("%Y")
    month = now.strftime("%m")
    upload_dir = Path(settings.UPLOAD_DIR) / year / month
    upload_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return str(upload_dir / unique_name)


def validate_and_save(file: UploadFile, asset_type: str) -> tuple[str, str, int]:
    """Returns (file_path, mime_type, file_size)."""
    content = file.file.read()
    file_size = len(content)

    # MIME type from extension + content sniff
    mime_type, _ = mimetypes.guess_type(file.filename or "")
    if not mime_type:
        mime_type = "application/octet-stream"

    allowed = ALLOWED_MIME_TYPES.get(asset_type, set())
    if allowed and mime_type not in allowed:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{mime_type}' for asset type '{asset_type}'",
        )

    max_mb = MAX_SIZE_MB.get(asset_type, 50)
    if file_size > max_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max {max_mb}MB allowed for {asset_type}",
        )

    file_path = get_upload_path(file.filename or "upload")
    with open(file_path, "wb") as f:
        f.write(content)

    return file_path, mime_type, file_size
