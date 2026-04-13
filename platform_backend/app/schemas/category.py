from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None
    description: Optional[str] = None
    order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None
    description: Optional[str] = None
    order: Optional[int] = None


class CategoryRead(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    depth: int
    order: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CategoryTree(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    depth: int
    order: int
    children: List["CategoryTree"] = []

    model_config = {"from_attributes": True}


CategoryTree.model_rebuild()


class ArticleSummary(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str] = None
    read_time: Optional[int] = None
    status: str

    model_config = {"from_attributes": True}


class CategoryDetail(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    depth: int
    breadcrumb: List[dict] = []
    children: List[CategoryTree] = []
    articles: List[ArticleSummary] = []

    model_config = {"from_attributes": True}
