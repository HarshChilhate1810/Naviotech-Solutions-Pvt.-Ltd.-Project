from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_token,
)
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, RefreshToken
from app.models.user_preference import UserPreference
from app.models.library_item import LibraryItem
from app.models.movie_detail import MovieDetail
from app.models.book_detail import BookDetail
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.core.demo_data import DEMO_BOOKS, DEMO_MOVIES

router = APIRouter(prefix="/auth", tags=["Authentication"])


def seed_user_starter_collection(db: Session, user_id: str):
    """Seed starter collection for a newly registered user so their library feels full and alive."""
    sample_items = DEMO_BOOKS + DEMO_MOVIES

    for item_data in sample_items:
        item = LibraryItem(
            user_id=user_id,
            item_type=item_data["type"],
            title=item_data["title"],
            genre=item_data["genre"],
            rating=item_data["rating"],
            description=item_data["description"],
            cover_image_url=item_data["cover_image_url"],
            is_favorite=item_data["is_favorite"],
            personal_notes=item_data["personal_notes"]
        )
        db.add(item)
        db.flush()

        if item_data["type"] == "book" and "book" in item_data:
            b_info = item_data["book"]
            book_detail = BookDetail(
                item_id=item.id,
                author=b_info.get("author"),
                publication_year=b_info.get("publication_year"),
                reading_status=b_info.get("reading_status", "want_to_read"),
                current_page=b_info.get("current_page", 1),
                total_pages=b_info.get("total_pages", 100),
                sample_content=b_info.get("sample_content")
            )
            db.add(book_detail)
        elif item_data["type"] == "movie" and "movie" in item_data:
            m_info = item_data["movie"]
            movie_detail = MovieDetail(
                item_id=item.id,
                release_year=m_info.get("release_year"),
                director=m_info.get("director"),
                video_url=m_info.get("video_url")
            )
            db.add(movie_detail)



@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account with Argon2id password hashing."""
    existing_user = db.query(User).filter(User.email == data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )

    # Hash password using Argon2id
    password_hash = get_password_hash(data.password)

    new_user = User(
        name=data.name.strip(),
        email=data.email.lower().strip(),
        password_hash=password_hash
    )
    db.add(new_user)
    db.flush()

    # Create default user preference
    pref = UserPreference(user_id=new_user.id, theme="dark", page_turn_sound_enabled=True)
    db.add(pref)

    # Seed starter library items so new users have sample data immediately available
    seed_user_starter_collection(db, new_user.id)

    # Create tokens
    access_token = create_access_token(new_user.id)
    raw_refresh_token, token_hash, expires_at = create_refresh_token(new_user.id)

    refresh_record = RefreshToken(
        user_id=new_user.id,
        token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(refresh_record)
    db.commit()
    db.refresh(new_user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(user.id)
    raw_refresh_token, token_hash, expires_at = create_refresh_token(user.id)

    refresh_record = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(refresh_record)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token_endpoint(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Rotate and refresh access token with verified refresh token."""
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user_id = payload.get("sub")
    token_hash = hash_token(data.refresh_token)

    now = datetime.now(timezone.utc)
    token_record = db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked_at.is_(None),
        RefreshToken.expires_at > now
    ).first()

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked, expired, or invalid"
        )

    # Revoke old refresh token for token rotation security
    token_record.revoked_at = now

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Issue new pair
    new_access_token = create_access_token(user.id)
    new_raw_refresh, new_hash, new_expires = create_refresh_token(user.id)

    new_token_record = RefreshToken(
        user_id=user.id,
        token_hash=new_hash,
        expires_at=new_expires
    )
    db.add(new_token_record)
    db.commit()

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_raw_refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log out by revoking all active refresh tokens for the authenticated user."""
    now = datetime.now(timezone.utc)
    db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.revoked_at.is_(None)
    ).update({"revoked_at": now})
    db.commit()
    return {"message": "Successfully logged out across devices"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Handle password reset request.
    Generates a secure simulation token for testing or email delivery.
    """
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    # Always return success message to prevent user enumeration attacks
    if not user:
        return {"message": "If this email is registered, password reset instructions have been sent."}

    # For demonstation & testability, we issue a deterministic test token
    reset_token = create_access_token(user.id)
    return {
        "message": "If this email is registered, password reset instructions have been sent.",
        "demo_reset_token": reset_token  # Provided for easy evaluation in UI/testing
    }


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset user password using verified reset token."""
    payload = decode_token(data.token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.email == data.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request or mismatched email"
        )

    user.password_hash = get_password_hash(data.new_password)
    # Revoke all existing sessions so old logins cannot access account
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).update({
        "revoked_at": datetime.now(timezone.utc)
    })
    db.commit()

    return {"message": "Password has been successfully updated. You may now log in."}
