import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.core.seed import seed_database
from app.api.api_router import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("floodguard")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and Seed Authentic Historical Dataset
    logger.info("Initializing FloodGuard AI database...")
    init_db()
    try:
        event_id = seed_database()
        logger.info("FloodGuard AI initialized successfully. Primary Event ID: %s", event_id)
    except Exception as e:
        logger.error("Database seeding encountered error: %s", e)
    yield
    # Shutdown
    logger.info("Shutting down FloodGuard AI backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multimodal Disaster Response Intelligence Platform — Mapping Flood Damage from Space",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "FloodGuard AI",
        "tagline": "From Space to Safety. Intelligence That Saves Lives.",
        "hackathon": "Multimodal AI Hackathon 2026",
        "track": "Track B — Mapping Flood Damage from Space",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
