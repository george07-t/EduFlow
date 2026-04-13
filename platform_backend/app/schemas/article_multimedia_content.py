from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MultimediaAssetRead(BaseModel):
    id: int
    type: str
    title: str
    url: Optional[str] = None
    alt_text: Optional[str] = None
    content: Optional[str] = None


class ArticleMultimediaContentCreate(BaseModel):
    media_asset_id: int
    order: int = 0


class ArticleMultimediaContentRead(BaseModel):
    id: int
    article_id: int
    media_asset_id: int
    order: int
    media: MultimediaAssetRead
    created_at: Optional[datetime] = None
