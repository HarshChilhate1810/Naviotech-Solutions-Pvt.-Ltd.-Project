import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship

from app.models.base import Base


def utc_now():
    return datetime.now(timezone.utc)


class LibraryItem(Base):
    __tablename__ = "library_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    item_type = Column(String(20), index=True, nullable=False) # 'movie' or 'book'
    title = Column(String(255), index=True, nullable=False)
    genre = Column(String(100), index=True, nullable=False)
    rating = Column(Integer, default=5, nullable=False) # 1 to 5
    description = Column(Text, nullable=True)
    cover_image_url = Column(String(1000), nullable=True)
    is_favorite = Column(Boolean, default=False, index=True, nullable=False)
    personal_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_valid_rating"),
        CheckConstraint("item_type IN ('movie', 'book')", name="check_valid_item_type"),
    )

    # Relationships
    owner = relationship("User", back_populates="library_items")
    movie_details = relationship("MovieDetail", back_populates="library_item", uselist=False, cascade="all, delete-orphan")
    book_details = relationship("BookDetail", back_populates="library_item", uselist=False, cascade="all, delete-orphan")
