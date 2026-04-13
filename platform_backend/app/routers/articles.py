from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
import math

from app.dependencies.db import get_db
from app.dependencies.auth import require_admin, get_current_user_optional
from app.models.article import Article
from app.models.category import Category
from app.models.side_panel_section import SidePanelSection
from app.models.user import User
from app.schemas.article import (
    ArticleCreate,
    ArticleUpdate,
    ArticleStatusUpdate,
    ArticleRead,
    ArticleDetail,
    PaginatedArticles,
    CategoryMinimal,
    AuthorRead,
)
from app.schemas.side_panel_section import SidePanelSectionRead
from app.utils.slugify import unique_slug
from app.services.trigger_parser import parse_triggers
from app.routers.categories import build_breadcrumb

router = APIRouter(prefix="/api/articles", tags=["articles"])


def compute_read_time(html: str) -> int:
    import re
    text = re.sub(r"<[^>]+>", " ", html)
    words = len(text.split())
    return max(1, math.ceil(words / 200))


def article_to_read(a: Article) -> ArticleRead:
    return ArticleRead(
        id=a.id,
        title=a.title,
        slug=a.slug,
        summary=a.summary,
        status=a.status,
        featured=a.featured,
        read_time=a.read_time,
        category=CategoryMinimal.model_validate(a.category) if a.category else None,
        created_at=a.created_at,
        updated_at=a.updated_at,
    )


def article_to_detail(a: Article, db: Session) -> ArticleDetail:
    html_fields = [a.body_html] + [s.content_html for s in a.side_panel_sections]
    media_map = parse_triggers(html_fields, db)

    breadcrumb = build_breadcrumb(a.category, db) if a.category else []

    return ArticleDetail(
        id=a.id,
        title=a.title,
        slug=a.slug,
        summary=a.summary,
        body_html=a.body_html,
        status=a.status,
        featured=a.featured,
        read_time=a.read_time,
        category=CategoryMinimal.model_validate(a.category) if a.category else None,
        breadcrumb=breadcrumb,
        side_panel_sections=[SidePanelSectionRead.model_validate(s) for s in a.side_panel_sections],
        media_map=media_map,
        author=AuthorRead.model_validate(a.author) if a.author else None,
        created_at=a.created_at,
        updated_at=a.updated_at,
    )


# ── Public endpoints ──────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedArticles)
def list_articles(
    category_slug: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    featured: Optional[bool] = Query(default=None),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    q = db.query(Article)

    # Non-admins only see published
    if not current_user or current_user.role != "admin":
        q = q.filter(Article.status == "published")

    if category_slug:
        cat = db.query(Category).filter(Category.slug == category_slug).first()
        if cat:
            q = q.filter(Article.category_id == cat.id)
    if search:
        q = q.filter(Article.title.ilike(f"%{search}%"))
    if featured is not None:
        q = q.filter(Article.featured == featured)

    total = q.count()
    items = q.order_by(Article.id.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return PaginatedArticles(
        items=[article_to_read(a) for a in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 0,
    )


@router.get("/{slug}", response_model=ArticleDetail)
def get_article(
    slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    q = db.query(Article).filter(Article.slug == slug)
    if not current_user or current_user.role != "admin":
        q = q.filter(Article.status == "published")
    article = q.first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article_to_detail(article, db)


# ── Admin endpoints ───────────────────────────────────────────────────────────

@router.post("", response_model=ArticleDetail, status_code=201)
def create_article(
    body: ArticleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    slug = unique_slug(body.title, Article, db)
    article = Article(
        title=body.title,
        slug=slug,
        summary=body.summary,
        body_html=body.body_html,
        category_id=body.category_id,
        status=body.status,
        featured=body.featured,
        read_time=compute_read_time(body.body_html),
        created_by=admin.id,
    )
    db.add(article)
    db.flush()

    for i, sec in enumerate(body.side_panel_sections):
        db.add(SidePanelSection(
            article_id=article.id,
            label=sec.label,
            content_html=sec.content_html,
            order=sec.order if sec.order else i,
            is_expanded_default=sec.is_expanded_default,
        ))

    db.commit()
    db.refresh(article)
    return article_to_detail(article, db)


@router.put("/{article_id}", response_model=ArticleDetail)
def update_article(
    article_id: int,
    body: ArticleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if body.title is not None:
        article.title = body.title
        article.slug = unique_slug(body.title, Article, db, exclude_id=article_id)
    if body.summary is not None:
        article.summary = body.summary
    if body.body_html is not None:
        article.body_html = body.body_html
        article.read_time = compute_read_time(body.body_html)
    if body.category_id is not None:
        article.category_id = body.category_id
    if body.status is not None:
        article.status = body.status
    if body.featured is not None:
        article.featured = body.featured

    if body.side_panel_sections is not None:
        db.query(SidePanelSection).filter(SidePanelSection.article_id == article_id).delete()
        for i, sec in enumerate(body.side_panel_sections):
            db.add(SidePanelSection(
                article_id=article_id,
                label=sec.label,
                content_html=sec.content_html,
                order=sec.order if sec.order else i,
                is_expanded_default=sec.is_expanded_default,
            ))

    db.commit()
    db.refresh(article)
    return article_to_detail(article, db)


@router.patch("/{article_id}/status", response_model=dict)
def update_article_status(
    article_id: int,
    body: ArticleStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if body.status not in ("draft", "published", "archived"):
        raise HTTPException(status_code=400, detail="Invalid status")
    article.status = body.status
    db.commit()
    return {"id": article.id, "status": article.status}


@router.delete("/{article_id}", status_code=204)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    db.delete(article)
    db.commit()
