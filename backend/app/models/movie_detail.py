from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base


class MovieDetail(Base):
    __tablename__ = "movie_details"

    item_id = Column(String(36), ForeignKey("library_items.id", ondelete="CASCADE"), primary_key=True)
    release_year = Column(Integer, nullable=True, index=True)
    director = Column(String(150), nullable=True)
    video_url = Column(String(1000), nullable=True)

    library_item = relationship("LibraryItem", back_populates="movie_details")

