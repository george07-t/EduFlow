from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.config import settings
from app.database import create_tables
from app.routers import auth, categories, media, articles, users

settings.validate_runtime()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    create_tables()
    # Ensure uploads dir exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="Interactive Teaching Platform API",
    version="1.0.0",
    description="Headless CMS for multimedia educational content",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
uploads_dir = settings.UPLOAD_DIR
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(media.router)
app.include_router(articles.router)
app.include_router(users.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Interactive Teaching Platform API"}
