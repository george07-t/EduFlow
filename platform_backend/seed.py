"""Seed initial data: admin user + sample categories, media, and articles."""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, create_tables
from app.models.user import User
from app.models.category import Category
from app.models.media_asset import MediaAsset
from app.models.article import Article
from app.models.side_panel_section import SidePanelSection
from app.services.auth_service import hash_password

def seed():
    create_tables()
    db = SessionLocal()

    try:
        # Admin user
        if not db.query(User).filter(User.username == "admin").first():
            admin = User(
                username="admin",
                email="admin@eduflow.com",
                hashed_password=hash_password("admin123"),
                role="admin",
            )
            db.add(admin)
            db.flush()
            admin_id = admin.id
            print("✅ Admin user created: admin / admin123")
        else:
            admin_id = db.query(User).filter(User.username == "admin").first().id
            print("ℹ️  Admin user already exists")

        # Categories
        if db.query(Category).count() == 0:
            science = Category(name="Science", slug="science", depth=0, order=0, description="All science topics")
            db.add(science)
            db.flush()

            biology = Category(name="Biology", slug="biology", parent_id=science.id, depth=1, order=0)
            chemistry = Category(name="Chemistry", slug="chemistry", parent_id=science.id, depth=1, order=1)
            db.add_all([biology, chemistry])
            db.flush()

            cell_bio = Category(name="Cell Biology", slug="cell-biology", parent_id=biology.id, depth=2, order=0)
            db.add(cell_bio)
            db.flush()

            tech = Category(name="Technology", slug="technology", depth=0, order=1)
            db.add(tech)
            db.flush()
            print("✅ Categories seeded")

        # Media assets
        if db.query(MediaAsset).count() == 0:
            m1 = MediaAsset(
                title="Introduction Video",
                type="youtube",
                url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                alt_text="Sample YouTube video",
                created_by=admin_id,
            )
            m2 = MediaAsset(
                title="Cell Structure Explanation",
                type="text",
                content="<p>The cell is the basic structural and functional unit of all known living organisms.</p><p>Cells consist of cytoplasm enclosed within a membrane, which contains many biomolecules such as proteins and nucleic acids.</p>",
                created_by=admin_id,
            )
            m3 = MediaAsset(
                title="Science Overview",
                type="youtube",
                url="https://www.youtube.com/watch?v=9_IUFHOzhbY",
                alt_text="Science overview video",
                created_by=admin_id,
            )
            db.add_all([m1, m2, m3])
            db.flush()
            media_ids = [m1.id, m2.id, m3.id]
            print(f"✅ Media assets seeded (IDs: {media_ids})")
        else:
            media = db.query(MediaAsset).all()
            media_ids = [m.id for m in media[:3]]

        # Articles
        if db.query(Article).count() == 0:
            biology_cat = db.query(Category).filter(Category.slug == "biology").first()
            m1_id = media_ids[0] if media_ids else 1
            m2_id = media_ids[1] if len(media_ids) > 1 else 2

            article = Article(
                title="Introduction to Cell Biology",
                slug="introduction-to-cell-biology",
                summary="Explore the fundamental building blocks of life — cells.",
                body_html=f"""<h2>What is a Cell?</h2>
<p>The cell is the basic structural and functional unit of all known living organisms [[media:{m2_id}]].
It is the smallest unit of life that can replicate independently.</p>
<h2>Watch This Overview</h2>
<p>Learn more about cellular structures in this video [[media:{m1_id}]].</p>
<h2>Types of Cells</h2>
<p>There are two primary types of cells: <strong>prokaryotic</strong> and <strong>eukaryotic</strong>.</p>
<ul>
<li>Prokaryotic cells lack a nucleus</li>
<li>Eukaryotic cells have a membrane-bound nucleus</li>
</ul>""",
                category_id=biology_cat.id if biology_cat else None,
                status="published",
                featured=True,
                read_time=5,
                created_by=admin_id,
            )
            db.add(article)
            db.flush()

            sections = [
                SidePanelSection(
                    article_id=article.id,
                    label="Introduction",
                    content_html="<p>Cells are the <strong>fundamental units of life</strong>. Every living organism is composed of cells, from single-celled bacteria to complex multicellular organisms like humans.</p>",
                    order=0,
                    is_expanded_default=True,
                ),
                SidePanelSection(
                    article_id=article.id,
                    label="Detailed Explanation",
                    content_html=f"<p>The cell theory, developed in 1839 by Schleiden and Schwann, states that all living things are made of cells. Click here to learn more [[media:{m2_id}]].</p><p>Key organelles include:</p><ul><li>Nucleus — controls cell activities</li><li>Mitochondria — powerhouse of the cell</li><li>Ribosomes — protein synthesis</li></ul>",
                    order=1,
                    is_expanded_default=False,
                ),
                SidePanelSection(
                    article_id=article.id,
                    label="Additional Resources",
                    content_html="<p>For further reading, explore our Science category. Watch overview videos to reinforce your understanding.</p>",
                    order=2,
                    is_expanded_default=False,
                ),
            ]
            db.add_all(sections)
            db.commit()
            print(f"✅ Sample article seeded: 'Introduction to Cell Biology'")
        else:
            print("ℹ️  Articles already exist")

        print("\n🎉 Seed complete!")
        print("   Admin credentials: admin / admin123")
        print("   API docs: http://localhost:8000/docs")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
