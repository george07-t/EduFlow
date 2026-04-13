from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pathlib import Path
from app.dependencies.db import get_db
from app.dependencies.auth import require_authenticated_user
from app.models.media_asset import MediaAsset
from app.models.user import User
from app.schemas.media_asset import MediaAssetRead, MediaAssetUpdate, ALLOWED_TYPES
from app.utils.file_utils import validate_and_save
from app.services.trigger_parser import resolve_asset_url
from app.config import settings
import math

router = APIRouter(prefix="/api/media", tags=["media"])


def _safe_delete_local_file(file_path: str) -> None:
    target = Path(file_path).resolve()
    upload_root = Path(settings.UPLOAD_DIR).resolve()

    if upload_root == target or upload_root in target.parents:
        target.unlink(missing_ok=True)


@router.get("", response_model=dict)
def list_media(
    type: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(MediaAsset)
    if type:
        q = q.filter(MediaAsset.type == type)
    if search:
        q = q.filter(MediaAsset.title.ilike(f"%{search}%"))

    total = q.count()
    items = q.order_by(MediaAsset.id.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [_to_public(a) for a in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": math.ceil(total / per_page) if total else 0,
    }


@router.get("/{media_id}", response_model=MediaAssetRead)
def get_media(media_id: int, db: Session = Depends(get_db)):
    asset = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Media not found")
    return asset


@router.post("", status_code=201)
def upload_media(
    title: str = Form(...),
    type: str = Form(...),
    url: Optional[str] = Form(default=None),
    alt_text: Optional[str] = Form(default=None),
    transcript: Optional[str] = Form(default=None),
    content: Optional[str] = Form(default=None),
    file: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated_user),
):
    if type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid type. Allowed: {ALLOWED_TYPES}")

    asset = MediaAsset(
        title=title,
        type=type,
        alt_text=alt_text,
        transcript=transcript,
        content=content,
        created_by=user.id,
    )

    if type == "youtube":
        if not url:
            raise HTTPException(status_code=400, detail="URL required for YouTube type")
        asset.url = url
    elif type == "text":
        if not content:
            raise HTTPException(status_code=400, detail="Content required for text type")
    else:
        if not file:
            raise HTTPException(status_code=400, detail="File required for this media type")
        file_path, mime_type, file_size = validate_and_save(file, type)
        asset.file_path = file_path
        asset.mime_type = mime_type
        asset.file_size = file_size

    db.add(asset)
    db.commit()
    db.refresh(asset)
    return _to_public(asset)


@router.put("/{media_id}")
def update_media(
    media_id: int,
    body: MediaAssetUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated_user),
):
    asset = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Media not found")
    if body.title is not None:
        asset.title = body.title
    if body.alt_text is not None:
        asset.alt_text = body.alt_text
    if body.transcript is not None:
        asset.transcript = body.transcript
    if body.content is not None:
        asset.content = body.content
    db.commit()
    db.refresh(asset)
    return _to_public(asset)


@router.delete("/{media_id}", status_code=204)
def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated_user),
):
    asset = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Media not found")
    if asset.file_path:
        _safe_delete_local_file(asset.file_path)
    db.delete(asset)
    db.commit()


def _to_public(asset: MediaAsset) -> dict:
    return {
        "id": asset.id,
        "title": asset.title,
        "type": asset.type,
        "url": resolve_asset_url(asset),
        "mime_type": asset.mime_type,
        "file_size": asset.file_size,
        "alt_text": asset.alt_text,
        "content": asset.content,
        "created_at": asset.created_at.isoformat() if asset.created_at else None,
    }
