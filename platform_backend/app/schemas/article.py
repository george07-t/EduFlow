from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.side_panel_section import SidePanelSectionCreate, SidePanelSectionRead
from app.schemas.article_multimedia_content import (
    ArticleMultimediaContentCreate,
    ArticleMultimediaContentRead,
)


class ArticleCreate(BaseModel):
    title: str
    category_id: Optional[int] = None
    summary: Optional[str] = None
    body_html: str = ""
    status: str = "draft"
    featured: bool = False
    side_panel_sections: List[SidePanelSectionCreate] = []
    multimedia_contents: List[ArticleMultimediaContentCreate] = []


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    category_id: Optional[int] = None
    summary: Optional[str] = None
    body_html: Optional[str] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
    side_panel_sections: Optional[List[SidePanelSectionCreate]] = None
    multimedia_contents: Optional[List[ArticleMultimediaContentCreate]] = None


class ArticleStatusUpdate(BaseModel):
    status: str


class AuthorRead(BaseModel):
    username: str

    model_config = {"from_attributes": True}


class CategoryMinimal(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class ArticleRead(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str] = None
    status: str
    featured: bool
    read_time: Optional[int] = None
    category: Optional[CategoryMinimal] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ArticleDetail(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str] = None
    body_html: str
    status: str
    featured: bool
    read_time: Optional[int] = None
    category: Optional[CategoryMinimal] = None
    breadcrumb: List[Dict[str, Any]] = []
    side_panel_sections: List[SidePanelSectionRead] = []
    multimedia_contents: List[ArticleMultimediaContentRead] = []
    media_map: Dict[str, Any] = {}
    author: Optional[AuthorRead] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PaginatedArticles(BaseModel):
    items: List[ArticleRead]
    total: int
    page: int
    per_page: int
    pages: int
