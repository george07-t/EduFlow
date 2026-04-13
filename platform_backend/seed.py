"""Seed rich demo data: admin user, deep categories, media assets, and trigger-based articles."""
import os
import re
import math
import wave
import struct
from pathlib import Path

from PIL import Image, ImageDraw

from app.database import SessionLocal, create_tables
from app.models.user import User
from app.models.category import Category
from app.models.media_asset import MediaAsset
from app.models.article import Article
from app.models.side_panel_section import SidePanelSection
from app.models.article_multimedia_content import ArticleMultimediaContent
from app.services.auth_service import hash_password

BASE_DIR = Path(__file__).resolve().parent
SEED_UPLOAD_DIR = BASE_DIR / "uploads" / "seed"


def _compute_read_time(html: str) -> int:
    text = re.sub(r"<[^>]+>", " ", html or "")
    words = len(text.split())
    return max(1, math.ceil(words / 200))


def _ensure_seed_files() -> dict[str, dict[str, str | int]]:
    """Create deterministic local seed assets and return metadata for DB rows."""
    SEED_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    image_path = SEED_UPLOAD_DIR / "cell-structure-overview.png"
    if not image_path.exists():
        img = Image.new("RGB", (1280, 720), "#f1f8ff")
        draw = ImageDraw.Draw(img)
        draw.rectangle((60, 60, 1220, 660), outline="#94a3b8", width=5)
        draw.ellipse((220, 160, 1060, 620), outline="#2563eb", width=8, fill="#dbeafe")
        draw.ellipse((530, 280, 760, 500), outline="#1e3a8a", width=8, fill="#bfdbfe")
        draw.text((95, 95), "Eukaryotic Cell (Seed Asset)", fill="#0f172a")
        draw.text((300, 420), "Cytoplasm", fill="#1e3a8a")
        draw.text((590, 360), "Nucleus", fill="#0f172a")
        draw.text((860, 520), "Mitochondria", fill="#1e3a8a")
        img.save(image_path, format="PNG")

    audio_path = SEED_UPLOAD_DIR / "dna-pronunciation-guide.wav"
    if not audio_path.exists():
        sample_rate = 44100
        duration_seconds = 2.2
        frequency = 440.0
        volume = 0.35
        frame_count = int(sample_rate * duration_seconds)
        with wave.open(str(audio_path), "w") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            for i in range(frame_count):
                value = int(32767 * volume * math.sin(2 * math.pi * frequency * (i / sample_rate)))
                wav_file.writeframesraw(struct.pack("<h", value))

    return {
        "cell_image": {
            "file_path": "./uploads/seed/cell-structure-overview.png",
            "mime_type": "image/png",
            "file_size": image_path.stat().st_size,
        },
        "dna_audio": {
            "file_path": "./uploads/seed/dna-pronunciation-guide.wav",
            "mime_type": "audio/wav",
            "file_size": audio_path.stat().st_size,
        },
    }


def _upsert_admin(db) -> User:
    admin = db.query(User).filter(User.username == "admin").first()
    if admin:
        admin.email = "admin@eduflow.com"
        admin.is_active = True
        admin.role = "admin"
        if not admin.hashed_password:
            admin.hashed_password = hash_password("admin123")
        print("INFO: Admin user already exists: admin / admin123")
        return admin

    admin = User(
        username="admin",
        email="admin@eduflow.com",
        hashed_password=hash_password("admin123"),
        role="admin",
        is_active=True,
    )
    db.add(admin)
    db.flush()
    print("OK: Admin user created: admin / admin123")
    return admin


def _upsert_categories(db) -> dict[str, Category]:
    specs = [
        {
            "slug": "science",
            "name": "Science",
            "description": "Scientific exploration across biology, physics, and chemistry.",
            "parent_slug": None,
            "order": 0,
        },
        {
            "slug": "biology",
            "name": "Biology",
            "description": "Living systems, cells, genes, and organisms.",
            "parent_slug": "science",
            "order": 0,
        },
        {
            "slug": "cell-biology",
            "name": "Cell Biology",
            "description": "Cell structures, organelles, and biological processes.",
            "parent_slug": "biology",
            "order": 0,
        },
        {
            "slug": "genetics",
            "name": "Genetics",
            "description": "DNA, inheritance, and molecular genetics.",
            "parent_slug": "biology",
            "order": 1,
        },
        {
            "slug": "physics",
            "name": "Physics",
            "description": "Motion, energy, forces, and matter.",
            "parent_slug": "science",
            "order": 1,
        },
        {
            "slug": "technology",
            "name": "Technology",
            "description": "Computing, modern digital systems, and innovation.",
            "parent_slug": None,
            "order": 1,
        },
        {
            "slug": "computer-science",
            "name": "Computer Science",
            "description": "Algorithms, software, and systems thinking.",
            "parent_slug": "technology",
            "order": 0,
        },
        {
            "slug": "machine-learning",
            "name": "Machine Learning",
            "description": "Data-driven models and intelligent prediction systems.",
            "parent_slug": "computer-science",
            "order": 0,
        },
        {
            "slug": "cybersecurity",
            "name": "Cybersecurity",
            "description": "Security principles, threats, and defense strategies.",
            "parent_slug": "computer-science",
            "order": 1,
        },
        {
            "slug": "mathematics",
            "name": "Mathematics",
            "description": "Foundations for scientific and computational reasoning.",
            "parent_slug": None,
            "order": 2,
        },
        {
            "slug": "algebra",
            "name": "Algebra",
            "description": "Expressions, equations, and symbolic reasoning.",
            "parent_slug": "mathematics",
            "order": 0,
        },
    ]

    categories_by_slug: dict[str, Category] = {}

    for spec in specs:
        parent = categories_by_slug.get(spec["parent_slug"]) if spec["parent_slug"] else None
        depth = (parent.depth + 1) if parent else 0

        cat = db.query(Category).filter(Category.slug == spec["slug"]).first()
        if not cat:
            cat = Category(slug=spec["slug"])
            db.add(cat)

        cat.name = spec["name"]
        cat.description = spec["description"]
        cat.parent_id = parent.id if parent else None
        cat.depth = depth
        cat.order = spec["order"]

        db.flush()
        categories_by_slug[spec["slug"]] = cat

    print(f"OK: Categories upserted ({len(categories_by_slug)})")
    return categories_by_slug


def _upsert_media_assets(db, admin_id: int, local_assets: dict[str, dict[str, str | int]]) -> dict[str, MediaAsset]:
    specs = [
        {
            "key": "cell_image",
            "title": "Cell Structure Diagram",
            "type": "image",
            "alt_text": "A simplified diagram of a eukaryotic cell with labeled regions.",
            "file_path": local_assets["cell_image"]["file_path"],
            "mime_type": local_assets["cell_image"]["mime_type"],
            "file_size": local_assets["cell_image"]["file_size"],
        },
        {
            "key": "dna_audio",
            "title": "DNA Pronunciation Guide",
            "type": "audio",
            "alt_text": "Short pronunciation tone used as an audio seed sample.",
            "transcript": "Audio seed sample used for modal playback testing.",
            "file_path": local_assets["dna_audio"]["file_path"],
            "mime_type": local_assets["dna_audio"]["mime_type"],
            "file_size": local_assets["dna_audio"]["file_size"],
        },
        {
            "key": "micro_scope_video",
            "title": "Microscope Motion Clip",
            "type": "local_video",
            "url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            "alt_text": "Short sample clip for local video renderer testing.",
        },
        {
            "key": "khan_cells_youtube",
            "title": "Cell Basics (YouTube)",
            "type": "youtube",
            "url": "https://www.youtube.com/watch?v=URUJD5NEXC8",
            "alt_text": "Introductory explanation of cell structure and function.",
        },
        {
            "key": "ml_intro_youtube",
            "title": "Intro to Machine Learning (YouTube)",
            "type": "youtube",
            "url": "https://www.youtube.com/watch?v=ukzFI9rgwfU",
            "alt_text": "Short machine learning introduction video.",
        },
        {
            "key": "bio_glossary_text",
            "title": "Biology Glossary",
            "type": "text",
            "content": (
                "<h3>Core Terms</h3>"
                "<ul>"
                "<li><strong>Cell</strong>: Basic unit of life.</li>"
                "<li><strong>DNA</strong>: Molecule containing genetic instructions.</li>"
                "<li><strong>Mitochondria</strong>: Energy-producing organelles.</li>"
                "</ul>"
                "<p>This text asset is rendered directly inside the global modal.</p>"
            ),
        },
    ]

    media_by_key: dict[str, MediaAsset] = {}

    for spec in specs:
        asset = (
            db.query(MediaAsset)
            .filter(MediaAsset.title == spec["title"], MediaAsset.type == spec["type"])
            .first()
        )

        if not asset:
            asset = MediaAsset(title=spec["title"], type=spec["type"])
            db.add(asset)

        asset.title = spec["title"]
        asset.type = spec["type"]
        asset.alt_text = spec.get("alt_text")
        asset.transcript = spec.get("transcript")
        asset.content = spec.get("content")
        asset.url = spec.get("url")
        asset.created_by = admin_id

        if spec.get("file_path"):
            asset.file_path = str(spec["file_path"])
            asset.mime_type = str(spec.get("mime_type") or "")
            asset.file_size = int(spec.get("file_size") or 0)
        else:
            asset.file_path = None
            asset.mime_type = None
            asset.file_size = None

        db.flush()
        media_by_key[spec["key"]] = asset

    print(f"OK: Media assets upserted ({len(media_by_key)})")
    return media_by_key


def _upsert_articles(db, admin_id: int, categories_by_slug: dict[str, Category], media_by_key: dict[str, MediaAsset]) -> None:
    media_ids = {k: v.id for k, v in media_by_key.items()}

    article_specs = [
        {
            "slug": "interactive-cell-biology-foundations",
            "title": "Interactive Cell Biology Foundations",
            "summary": "Explore cells with text, image, audio, and video trigger points.",
            "category_slug": "cell-biology",
            "status": "published",
            "featured": True,
            "body_html": (
                "<h2>Why Cells Matter</h2>"
                "<p>Cells are the structural and functional units of life [[media:{bio_glossary_text}]]. "
                "In this lesson, we inspect organelles visually [[media:{cell_image}]] and compare behavior using a short clip [[media:{micro_scope_video}]].</p>"
                "<h2>Learn by Hearing and Seeing</h2>"
                "<p>Play the pronunciation helper [[media:{dna_audio}]] and watch the guided lesson [[media:{khan_cells_youtube}]].</p>"
                "<p>Use these anchors while reading to build multi-modal memory.</p>"
            ),
            "sections": [
                {
                    "label": "Introduction",
                    "is_expanded_default": True,
                    "content_html": (
                        "<p>This article demonstrates the inline trigger pipeline. "
                        "Click the diagram marker [[media:{cell_image}]] to open the global modal.</p>"
                    ),
                },
                {
                    "label": "Detailed Explanation",
                    "is_expanded_default": False,
                    "content_html": (
                        "<p>The nucleus regulates gene expression. The mitochondrion drives ATP production. "
                        "Use glossary support [[media:{bio_glossary_text}]] for term-level reinforcement.</p>"
                    ),
                },
                {
                    "label": "Additional Resources",
                    "is_expanded_default": False,
                    "content_html": (
                        "<p>Watch the supplemental video [[media:{khan_cells_youtube}]] and replay the audio cue [[media:{dna_audio}]].</p>"
                    ),
                },
            ],
            "multimedia_keys": ["bio_glossary_text", "cell_image", "dna_audio", "micro_scope_video", "khan_cells_youtube"],
        },
        {
            "slug": "genetics-and-information-flow",
            "title": "Genetics and Information Flow",
            "summary": "Understand how DNA information is encoded, copied, and expressed.",
            "category_slug": "genetics",
            "status": "published",
            "featured": False,
            "body_html": (
                "<h2>From DNA to Traits</h2>"
                "<p>DNA stores instructions for proteins, which influence observable traits. "
                "Review the quick audio cue [[media:{dna_audio}]] and glossary entry [[media:{bio_glossary_text}]].</p>"
                "<h2>Modeling Inheritance</h2>"
                "<p>Visual learners can reference the same cellular diagram [[media:{cell_image}]] when connecting DNA to nucleus function.</p>"
            ),
            "sections": [
                {
                    "label": "Introduction",
                    "is_expanded_default": True,
                    "content_html": "<p>Genes are DNA segments that code for functional products.</p>",
                },
                {
                    "label": "Detailed Explanation",
                    "is_expanded_default": False,
                    "content_html": "<p>Replication, transcription, and translation are the core information pathways in molecular biology.</p>",
                },
                {
                    "label": "Additional Resources",
                    "is_expanded_default": False,
                    "content_html": "<p>For a broader refresher, revisit the cell lesson [[media:{khan_cells_youtube}]].</p>",
                },
            ],
            "multimedia_keys": ["bio_glossary_text", "cell_image", "dna_audio", "micro_scope_video", "khan_cells_youtube"],
        },
        {
            "slug": "machine-learning-from-patterns-to-predictions",
            "title": "Machine Learning: From Patterns to Predictions",
            "summary": "A practical introduction to models, training, and evaluation.",
            "category_slug": "machine-learning",
            "status": "published",
            "featured": True,
            "body_html": (
                "<h2>What Is Machine Learning?</h2>"
                "<p>Machine learning builds models that learn from historical data to make predictions on new inputs. "
                "Start with the primer video [[media:{ml_intro_youtube}]].</p>"
                "<h2>Training and Validation</h2>"
                "<p>Split data into train/validation/test sets. Compare metrics and tune hyperparameters iteratively.</p>"
                "<p>As a cross-domain analogy, a cell processes signals much like a model transforms features [[media:{cell_image}]].</p>"
            ),
            "sections": [
                {
                    "label": "Introduction",
                    "is_expanded_default": True,
                    "content_html": "<p>Supervised learning maps input features to labeled outputs.</p>",
                },
                {
                    "label": "Detailed Explanation",
                    "is_expanded_default": False,
                    "content_html": "<p>Bias-variance tradeoff explains underfitting versus overfitting in model behavior.</p>",
                },
                {
                    "label": "Additional Resources",
                    "is_expanded_default": False,
                    "content_html": "<p>Replay the introductory walkthrough [[media:{ml_intro_youtube}]] before building your first model.</p>",
                },
            ],
            "multimedia_keys": ["bio_glossary_text", "cell_image", "dna_audio", "micro_scope_video", "ml_intro_youtube"],
        },
    ]

    category_bulk_specs = [
        {
            "category_slug": "cell-biology",
            "series_prefix": "Cell Biology Learning Sprint",
            "summary_prefix": "Short focused lesson on organelles, signaling, and cellular systems",
            "base_body": (
                "<h2>Core Concept</h2>"
                "<p>This lesson expands your foundation with compact explanations and media checkpoints "
                "[[media:{bio_glossary_text}]] [[media:{cell_image}]].</p>"
                "<h2>Practice Loop</h2>"
                "<p>Reinforce pronunciation and terminology with audio [[media:{dna_audio}]] and a quick visual clip "
                "[[media:{micro_scope_video}]].</p>"
            ),
            "youtube_key": "khan_cells_youtube",
        },
        {
            "category_slug": "genetics",
            "series_prefix": "Genetics Fundamentals Drill",
            "summary_prefix": "Targeted module on inheritance, DNA flow, and molecular reasoning",
            "base_body": (
                "<h2>DNA Information Pathways</h2>"
                "<p>Track how instructions move from DNA to proteins while revisiting glossary support "
                "[[media:{bio_glossary_text}]] and reference visuals [[media:{cell_image}]].</p>"
                "<h2>Retrieval Practice</h2>"
                "<p>Use short auditory prompts [[media:{dna_audio}]] and video recaps [[media:{micro_scope_video}]] "
                "to accelerate long-term retention.</p>"
            ),
            "youtube_key": "khan_cells_youtube",
        },
        {
            "category_slug": "machine-learning",
            "series_prefix": "Machine Learning Studio",
            "summary_prefix": "Applied lesson on datasets, models, and prediction systems",
            "base_body": (
                "<h2>Modeling Workflow</h2>"
                "<p>Frame each task as input-output mapping and compare model behavior under different assumptions. "
                "For guided context, open the text panel [[media:{bio_glossary_text}]].</p>"
                "<h2>Learning Through Modalities</h2>"
                "<p>Switch between diagram reference [[media:{cell_image}]], quick audio cue [[media:{dna_audio}]], and "
                "short clip [[media:{micro_scope_video}]] while studying model intuition.</p>"
            ),
            "youtube_key": "ml_intro_youtube",
        },
    ]

    for bulk in category_bulk_specs:
        for idx in range(1, 13):
            article_specs.append(
                {
                    "slug": f"{bulk['category_slug']}-module-{idx:02d}",
                    "title": f"{bulk['series_prefix']} {idx:02d}",
                    "summary": f"{bulk['summary_prefix']} - module {idx:02d}.",
                    "category_slug": bulk["category_slug"],
                    "status": "published",
                    "featured": idx % 6 == 0,
                    "body_html": (
                        f"<h1>{bulk['series_prefix']} {idx:02d}</h1>"
                        + bulk["base_body"]
                        + f"<p>Finish with the recap video [[media:{{{bulk['youtube_key']}}}]].</p>"
                    ),
                    "sections": [
                        {
                            "label": "Introduction",
                            "is_expanded_default": True,
                            "content_html": "<p>Use this section to map core terms before moving deeper.</p>",
                        },
                        {
                            "label": "Detailed Explanation",
                            "is_expanded_default": False,
                            "content_html": "<p>Compare definitions, examples, and edge cases using the inline modal markers.</p>",
                        },
                        {
                            "label": "Additional Resources",
                            "is_expanded_default": False,
                            "content_html": f"<p>Open the guided recap [[media:{{{bulk['youtube_key']}}}]] when reviewing this module.</p>",
                        },
                    ],
                    "multimedia_keys": [
                        "bio_glossary_text",
                        "cell_image",
                        "dna_audio",
                        "micro_scope_video",
                        bulk["youtube_key"],
                    ],
                }
            )

    for spec in article_specs:
        category = categories_by_slug[spec["category_slug"]]
        body_html = spec["body_html"].format(**media_ids)

        article = db.query(Article).filter(Article.slug == spec["slug"]).first()
        if not article:
            article = Article(slug=spec["slug"])
            db.add(article)

        article.title = spec["title"]
        article.summary = spec["summary"]
        article.body_html = body_html
        article.category_id = category.id
        article.status = spec["status"]
        article.featured = spec["featured"]
        article.read_time = _compute_read_time(body_html)
        article.created_by = admin_id

        db.flush()

        db.query(SidePanelSection).filter(SidePanelSection.article_id == article.id).delete()
        for i, section in enumerate(spec["sections"]):
            db.add(
                SidePanelSection(
                    article_id=article.id,
                    label=section["label"],
                    content_html=section["content_html"].format(**media_ids),
                    order=i,
                    is_expanded_default=section["is_expanded_default"],
                )
            )

        db.query(ArticleMultimediaContent).filter(ArticleMultimediaContent.article_id == article.id).delete()
        for i, multimedia_key in enumerate(spec.get("multimedia_keys", [])):
            media_asset = media_by_key.get(multimedia_key)
            if not media_asset:
                continue
            db.add(
                ArticleMultimediaContent(
                    article_id=article.id,
                    media_asset_id=media_asset.id,
                    order=i,
                )
            )

    print(f"OK: Articles upserted ({len(article_specs)})")


def seed() -> None:
    create_tables()
    db = SessionLocal()

    try:
        local_assets = _ensure_seed_files()
        admin = _upsert_admin(db)
        categories_by_slug = _upsert_categories(db)
        media_by_key = _upsert_media_assets(db, admin.id, local_assets)
        _upsert_articles(db, admin.id, categories_by_slug, media_by_key)

        db.commit()

        print("\nSeed completed successfully.")
        print("Admin credentials: admin / admin123")
        print("API docs: http://localhost:8000/docs")
    except Exception as exc:
        db.rollback()
        print(f"Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
