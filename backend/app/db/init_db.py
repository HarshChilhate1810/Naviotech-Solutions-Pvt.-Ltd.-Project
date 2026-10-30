from app.db.session import engine, Base
import app.models  # Ensure all models are imported so Base metadata is populated


def init_db():
    """Create all tables in the database if they do not already exist."""
    Base.metadata.create_all(bind=engine)
