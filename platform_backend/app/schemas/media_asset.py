from pydantic import BaseModel
from typing import Optional
from datetime import datetime

ALLOWED_TYPES = {"text", "image", "audio", "local_video", "youtube"}


class MediaAssetCreate(BaseModel):
    title: str
    type: str
    url: Optional[str] = None       # for youtube / external
    alt_text: Optional[str] = None
    transcript: Optional[str] = None
    content: Optional[str] = None   # for text type


class MediaAssetUpdate(BaseModel):
    title: Optional[str] = None
    alt_text: Optional[str] = None
    transcript: Optional[str] = None
    content: Optional[str] = None


class MediaAssetRead(BaseModel):
    id: int
    title: str
    type: str
    file_path: Optional[str] = None
    url: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    alt_text: Optional[str] = None
    transcript: Optional[str] = None
    content: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MediaAssetPublic(BaseModel):
    """Compact version returned inside media_map on article responses."""
    id: int
    title: str
    type: str
    url: Optional[str] = None       # resolved full URL
    alt_text: Optional[str] = None
    content: Optional[str] = None

    model_config = {"from_attributes": True}
