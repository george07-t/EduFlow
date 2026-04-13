from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SidePanelSectionCreate(BaseModel):
    label: str
    content_html: str = ""
    order: int = 0
    is_expanded_default: bool = False


class SidePanelSectionUpdate(BaseModel):
    label: Optional[str] = None
    content_html: Optional[str] = None
    order: Optional[int] = None
    is_expanded_default: Optional[bool] = None


class SidePanelSectionRead(BaseModel):
    id: int
    article_id: int
    label: str
    content_html: str
    order: int
    is_expanded_default: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
