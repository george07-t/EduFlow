from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SidePanelSection(Base):
    __tablename__ = "side_panel_sections"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    label = Column(String(200), nullable=False)
    content_html = Column(Text, nullable=False, default="")
    order = Column(Integer, default=0, nullable=False)
    is_expanded_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    article = relationship("Article", back_populates="side_panel_sections")
