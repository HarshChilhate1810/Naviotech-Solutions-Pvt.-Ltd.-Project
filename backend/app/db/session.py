import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

database_url = settings.normalized_database_url

# Configure engine with connection pooling and ping check
engine_kwargs = {"echo": False}
if "sqlite" in database_url:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
        "pool_recycle": 1800,
    })

try:
    engine = create_engine(database_url, **engine_kwargs)
except Exception as e:
    logger.error(f"Failed to initialize database engine for {database_url}: {e}")
    # Fallback to local sqlite if postgres fails to initialize locally
    engine = create_engine("sqlite:///./library.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that provides a SQLAlchemy session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
