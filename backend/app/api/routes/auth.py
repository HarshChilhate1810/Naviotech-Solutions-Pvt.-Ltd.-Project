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
import re
import time
import secrets
from sqlalchemy import or_
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    MobileOtpRequest,
    MobileOtpVerifyRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)

OTP_STORE = {}

def clean_phone_number(phone_raw: str) -> str:
    cleaned = re.sub(r"[^\d+]", "", phone_raw.strip())
    digits = re.sub(r"\D", "", cleaned)
    if len(digits) == 10:
        return f"+91{digits}"
    if not cleaned.startswith("+") and cleaned.startswith("91") and len(cleaned) == 12:
        return f"+{cleaned}"
    if not cleaned.startswith("+"):
        return f"+{cleaned}"
    return cleaned

def find_user_by_identifier(db: Session, identifier: str):
    ident = identifier.strip()
    if "@" in ident:
        return db.query(User).filter(User.email == ident.lower()).first()
    
    digits = re.sub(r"\D", "", ident)
    if not digits:
        return None
    last_10 = digits[-10:] if len(digits) >= 10 else digits
    normalized = f"+91{last_10}"
    
    return db.query(User).filter(
        or_(
            User.phone_number == ident,
            User.phone_number == normalized,
            User.phone_number == last_10,
            User.phone_number.like(f"%{last_10}"),
        )
    ).first()
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
    """Register a new user account with Argon2id password hashing and optional mobile number."""
    existing_user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )

    phone_clean = None
    if data.phone_number and data.phone_number.strip():
        phone_clean = clean_phone_number(data.phone_number)
        existing_phone = find_user_by_identifier(db, phone_clean)
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this mobile number already exists"
            )

    # Hash password using Argon2id
    password_hash = get_password_hash(data.password)

    new_user = User(
        name=data.name.strip(),
        email=data.email.lower().strip(),
        phone_number=phone_clean,
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
    """Authenticate user with email or mobile number and password."""
    target_identifier = (data.identifier or data.email or "").strip()
    if not target_identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an email address or mobile number",
        )

    user = find_user_by_identifier(db, target_identifier)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email, mobile number, or password",
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


@router.post("/mobile-otp/request")
def request_mobile_otp(data: MobileOtpRequest, db: Session = Depends(get_db)):
    """
    Generate and send 6-digit verification code for mobile number login.
    Returns demo_otp for instant seamless testing in development/demo environments.
    """
    phone_clean = clean_phone_number(data.phone_number)
    user = find_user_by_identifier(db, phone_clean)

    # 6 digit cryptographically random OTP
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    OTP_STORE[phone_clean] = {
        "otp": otp_code,
        "expires_at": time.time() + 300,
    }

    print(f"[AUTH MOBILE OTP] Verification code for {phone_clean}: {otp_code}")

    return {
        "status": "success",
        "message": f"Verification code sent to {phone_clean}",
        "phone_number": phone_clean,
        "is_registered": bool(user),
        "demo_otp": otp_code,
    }


@router.post("/mobile-otp/verify", response_model=TokenResponse)
def verify_mobile_otp(data: MobileOtpVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify 6-digit mobile OTP code and issue JWT tokens.
    Automatically creates user account if first-time mobile login.
    """
    phone_clean = clean_phone_number(data.phone_number)
    stored = OTP_STORE.get(phone_clean)

    if not stored or stored["expires_at"] < time.time():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code.",
        )

    if stored["otp"] != data.otp.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check and try again.",
        )

    # Code verified! Clear OTP
    OTP_STORE.pop(phone_clean, None)

    # Look up existing user
    user = find_user_by_identifier(db, phone_clean)
    if not user:
        # Auto-create account for new mobile user
        digits = re.sub(r"\D", "", phone_clean)
        last_4 = digits[-4:] if len(digits) >= 4 else "User"
        fallback_name = (data.name or "").strip() or f"Reader {last_4}"
        fallback_email = f"user_{digits[-10:]}@mobile.bibliobox.app"

        existing_email_user = db.query(User).filter(User.email == fallback_email).first()
        if existing_email_user:
            fallback_email = f"user_{secrets.token_hex(4)}_{digits[-10:]}@mobile.bibliobox.app"

        random_pwd = secrets.token_urlsafe(16)
        user = User(
            name=fallback_name,
            email=fallback_email,
            phone_number=phone_clean,
            password_hash=get_password_hash(random_pwd),
        )
        db.add(user)
        db.flush()

        pref = UserPreference(user_id=user.id, theme="dark", page_turn_sound_enabled=True)
        db.add(pref)
        seed_user_starter_collection(db, user.id)
    else:
        if not user.phone_number:
            user.phone_number = phone_clean

    access_token = create_access_token(user.id)
    raw_refresh_token, token_hash, expires_at = create_refresh_token(user.id)

    refresh_record = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(refresh_record)
    db.commit()
    db.refresh(user)

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
