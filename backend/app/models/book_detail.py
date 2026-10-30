from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base


class BookDetail(Base):
    __tablename__ = "book_details"

    item_id = Column(String(36), ForeignKey("library_items.id", ondelete="CASCADE"), primary_key=True)
    author = Column(String(150), nullable=True, index=True)
    publication_year = Column(Integer, nullable=True, index=True)
    reading_status = Column(String(30), default="want_to_read", nullable=False, index=True)
    current_page = Column(Integer, default=1, nullable=False)
    total_pages = Column(Integer, default=100, nullable=False)
    sample_content = Column(Text, nullable=True)

    library_item = relationship("LibraryItem", back_populates="book_details")
