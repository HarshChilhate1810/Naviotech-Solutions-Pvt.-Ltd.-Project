from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base


def utc_now():
    return datetime.now(timezone.utc)


class UserPreference(Base):
    __tablename__ = "user_preferences"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    theme = Column(String(20), default="dark", nullable=False)
    page_turn_sound_enabled = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="preferences")
