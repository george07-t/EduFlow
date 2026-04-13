from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    slug = Column(String(350), unique=True, nullable=False, index=True)
    summary = Column(Text, nullable=True)
    body_html = Column(Text, nullable=False, default="")
    category_id = Column(
        Integer,
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # draft | published | archived
    status = Column(String(20), default="draft", nullable=False)
    featured = Column(Boolean, default=False, nullable=False)
    read_time = Column(Integer, nullable=True)
    created_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="articles")
    side_panel_sections = relationship(
        "SidePanelSection",
        back_populates="article",
        order_by="SidePanelSection.order",
        cascade="all, delete-orphan",
    )
    multimedia_contents = relationship(
        "ArticleMultimediaContent",
        back_populates="article",
        order_by="ArticleMultimediaContent.order",
        cascade="all, delete-orphan",
    )
    author = relationship("User", foreign_keys=[created_by])
