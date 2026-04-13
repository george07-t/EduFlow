from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.dependencies.db import get_db
from app.dependencies.auth import require_authenticated_user
from app.models.category import Category
from app.models.article import Article
from app.models.user import User
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryRead,
    CategoryTree,
    CategoryDetail,
    ArticleSummary,
)
from app.utils.slugify import unique_slug

router = APIRouter(prefix="/api/categories", tags=["categories"])


def build_tree(categories: List[Category]) -> List[CategoryTree]:
    """Build a nested tree from a flat list of categories."""
    cat_map = {c.id: CategoryTree.model_validate(c) for c in categories}
    roots = []
    for c in categories:
        node = cat_map[c.id]
        if c.parent_id and c.parent_id in cat_map:
            cat_map[c.parent_id].children.append(node)
        else:
            roots.append(node)
    return roots


def build_breadcrumb(category: Category, db: Session) -> List[dict]:
    crumbs = []
    current = category
    while current:
        crumbs.insert(0, {"id": current.id, "name": current.name, "slug": current.slug})
        if current.parent_id:
            current = db.query(Category).filter(Category.id == current.parent_id).first()
        else:
            break
    return crumbs


def build_subtree(parent_id: int, all_categories: List[Category], depth_map: dict[int, int]) -> List[CategoryTree]:
    grouped: dict[int | None, List[Category]] = {}
    for cat in all_categories:
        grouped.setdefault(cat.parent_id, []).append(cat)

    def make_node(cat: Category) -> CategoryTree:
        return CategoryTree(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            parent_id=cat.parent_id,
            depth=depth_map.get(cat.id, cat.depth),
            order=cat.order,
            children=[make_node(child) for child in grouped.get(cat.id, [])],
        )

    direct_children = grouped.get(parent_id, [])
    return [make_node(child) for child in direct_children]


@router.get("", response_model=dict)
def get_category_tree(db: Session = Depends(get_db)):
    cats = db.query(Category).order_by(Category.depth, Category.order).all()
    tree = build_tree(cats)
    return {"tree": [t.model_dump() for t in tree]}


@router.get("/{slug}", response_model=CategoryDetail)
def get_category(slug: str, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    all_categories = db.query(Category).order_by(Category.depth, Category.order).all()
    depth_map = {c.id: c.depth - cat.depth for c in all_categories if c.depth >= cat.depth}
    children_nodes = build_subtree(cat.id, all_categories, depth_map)

    articles = (
        db.query(Article)
        .filter(Article.category_id == cat.id, Article.status == "published")
        .all()
    )

    breadcrumb = build_breadcrumb(cat, db)

    return CategoryDetail(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        parent_id=cat.parent_id,
        depth=cat.depth,
        breadcrumb=breadcrumb,
        children=children_nodes,
        articles=[ArticleSummary.model_validate(a) for a in articles],
    )


@router.post("", response_model=CategoryRead, status_code=201)
def create_category(
    body: CategoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated_user),
):
    depth = 0
    if body.parent_id:
        parent = db.query(Category).filter(Category.id == body.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
        depth = parent.depth + 1

    slug = unique_slug(body.name, Category, db)
    cat = Category(
        name=body.name,
        slug=slug,
        description=body.description,
        parent_id=body.parent_id,
        depth=depth,
        order=body.order,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{cat_id}", response_model=CategoryRead)
def update_category(
    cat_id: int,
    body: CategoryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated_user),
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    if body.name is not None:
        cat.name = body.name
        cat.slug = unique_slug(body.name, Category, db, exclude_id=cat_id)
    if body.parent_id is not None:
        parent = db.query(Category).filter(Category.id == body.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent not found")
        cat.parent_id = body.parent_id
        cat.depth = parent.depth + 1
    if body.description is not None:
        cat.description = body.description
    if body.order is not None:
        cat.order = body.order

    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{cat_id}", status_code=204)
def delete_category(
    cat_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated_user),
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    # Orphan children to root
    db.query(Category).filter(Category.parent_id == cat_id).update({"parent_id": None, "depth": 0})
    db.delete(cat)
    db.commit()
