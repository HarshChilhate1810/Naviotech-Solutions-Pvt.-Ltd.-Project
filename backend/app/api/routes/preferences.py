from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.user_preference import UserPreference
from app.schemas.user_preference import UserPreferenceUpdate, UserPreferenceResponse

router = APIRouter(prefix="/preferences", tags=["User Preferences"])


@router.get("", response_model=UserPreferenceResponse)
def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve theme and reading settings for the logged-in user."""
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        # Create default preference if none exists
        pref = UserPreference(user_id=current_user.id, theme="dark", page_turn_sound_enabled=True)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return UserPreferenceResponse.model_validate(pref)


@router.put("", response_model=UserPreferenceResponse)
def update_user_preferences(
    data: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update and persist theme or sound preferences across devices in PostgreSQL."""
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(
            user_id=current_user.id,
            theme=data.theme or "dark",
            page_turn_sound_enabled=data.page_turn_sound_enabled if data.page_turn_sound_enabled is not None else True,
        )
        db.add(pref)
    else:
        if data.theme is not None:
            pref.theme = data.theme
        if data.page_turn_sound_enabled is not None:
            pref.page_turn_sound_enabled = data.page_turn_sound_enabled

    db.commit()
    db.refresh(pref)
    return UserPreferenceResponse.model_validate(pref)
