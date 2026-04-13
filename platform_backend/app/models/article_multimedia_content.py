from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ArticleMultimediaContent(Base):
    __tablename__ = "article_multimedia_contents"
    __table_args__ = (
        UniqueConstraint("article_id", "media_asset_id", name="uq_article_multimedia_asset"),
    )

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    media_asset_id = Column(
        Integer,
        ForeignKey("media_assets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    article = relationship("Article", back_populates="multimedia_contents")
    media_asset = relationship("MediaAsset", back_populates="article_multimedia_links")
