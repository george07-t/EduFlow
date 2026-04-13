from slugify import slugify as _slugify
from sqlalchemy.orm import Session


def make_slug(text: str) -> str:
    return _slugify(text, max_length=100)


def unique_slug(text: str, model_class, db: Session, exclude_id: int = None) -> str:
    base = make_slug(text)
    slug = base
    counter = 1
    while True:
        query = db.query(model_class).filter(model_class.slug == slug)
        if exclude_id:
            query = query.filter(model_class.id != exclude_id)
        if not query.first():
            return slug
        slug = f"{base}-{counter}"
        counter += 1
