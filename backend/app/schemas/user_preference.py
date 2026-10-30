from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict


class UserPreferenceUpdate(BaseModel):
    theme: Optional[Literal["dark", "light"]] = None
    page_turn_sound_enabled: Optional[bool] = None


class UserPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    theme: str
    page_turn_sound_enabled: bool
    updated_at: datetime

