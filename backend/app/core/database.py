import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

# Attempt to connect to PostgreSQL; fallback to SQLite if connection fails
engine = None
try:
    test_engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    with test_engine.connect() as conn:
        logger.info("Successfully connected to primary database: %s", settings.DATABASE_URL)
    engine = test_engine
except Exception as e:
    logger.warning("Primary database connection failed (%s). Falling back to SQLite.", e)
    sqlite_url = "sqlite:///./floodguard.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
