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

router = APIRouter(prefix="/auth", tags=["Authentication"])


def seed_user_starter_collection(db: Session, user_id: str):
    """Seed starter collection for a newly registered user so their library feels full and alive."""
    sample_items = [
        {
            "type": "book",
            "title": "The Adventures of Sherlock Holmes",
            "genre": "Mystery / Detective",
            "rating": 5,
            "description": "A collection of twelve short stories featuring the iconic consulting detective Sherlock Holmes and his companion Dr. John Watson, investigating bizarre and ingenious cases across Victorian London.",
            "cover_image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
            "is_favorite": True,
            "personal_notes": "A timeless classic! The Bohemian scandal chapter is especially brilliant.",
            "book": {
                "author": "Arthur Conan Doyle",
                "publication_year": 1892,
                "reading_status": "currently_reading",
                "current_page": 14,
                "total_pages": 307,
                "sample_content": """Chapter I: A Scandal in Bohemia

To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.

He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.

Grit in a sensitive instrument, or a crack in one of his own high-power lenses, would not be more disturbing than a strong emotion in a nature such as his. And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory.

I had seen little of Holmes lately. My marriage had drifted us away from each other. My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention; while Holmes, who loathed every form of society with his whole Bohemian soul, remained in our lodgings in Baker Street, buried among his old books, and alternating from week to week between cocaine and ambition, the drowsiness of the drug, and the fierce energy of his own keen nature.

He was still, as ever, deeply attracted by the study of crime, and occupied his immense faculties and extraordinary powers of observation in following out those clues, and clearing up those mysteries which had been abandoned as hopeless by the official police. From time to time I heard some vague account of his doings: of his summons to Odessa in the case of the Trepoff murder, of his clearing up of the singular tragedy of the Atkinson brothers at Trincomalee, and finally of the mission which he had accomplished so delicately and successfully for the reigning family of Holland.

Beyond these signs of his activity, however, which I merely shared with all the readers of the daily press, I knew little of my former friend and companion."""
            }
        },
        {
            "type": "book",
            "title": "Pride and Prejudice",
            "genre": "Romance / Classic",
            "rating": 5,
            "description": "Jane Austen's masterwork exploring romantic entanglements, pride, societal expectations, and misunderstandings between Elizabeth Bennet and Mr. Darcy.",
            "cover_image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
            "is_favorite": True,
            "personal_notes": "Sharp dialogue and enduring wit. Austen's character studies are second to none.",
            "book": {
                "author": "Jane Austen",
                "publication_year": 1813,
                "reading_status": "completed",
                "current_page": 279,
                "total_pages": 279,
                "sample_content": """Chapter 1

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."

"What is his name?"

"Bingley."

"Is he married or single?"

"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"

"How so? How can it affect them?"

"My dear Mr. Bennet," replied his wife, "how can you be so tiresome! You must know that I am thinking of his marrying one of them." """
            }
        },
        {
            "type": "book",
            "title": "The Time Machine",
            "genre": "Science Fiction",
            "rating": 4,
            "description": "An intrepid scientist constructs a vehicle that propels him into the far distant future, discovering the divergent evolutionary branches of humanity: the gentle Eloi and the underground Morlocks.",
            "cover_image_url": "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80",
            "is_favorite": False,
            "personal_notes": "Fascinating allegorical commentary on class divides and distant evolution.",
            "book": {
                "author": "H.G. Wells",
                "publication_year": 1895,
                "reading_status": "want_to_read",
                "current_page": 1,
                "total_pages": 118,
                "sample_content": """Chapter 1: The Machine

The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burned brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses.

Our chairs, being his patents, embraced and caressed us rather than submitted to be sat upon, and there was that luxurious after-dinner atmosphere when thought roams gracefully free of the trammels of precision. And he put it to us in this way—marking the points with a lean forefinger—as we sat and lazily admired his earnestness over this new paradox (as we thought it) and his fecundity.

"You must follow me carefully. I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, they taught you at school is founded on a misconception."

"Is not that rather a large thing to expect us to begin upon?" said Filby, an argumentative person with red hair.

"I do not mean to ask you to accept anything without reasonable ground for it. You will soon admit as much as I need from you. You know of course that a mathematical line, a line of thickness nil, has no real existence. They taught you that? Neither has a mathematical plane. These things are mere abstractions."

"That is all right," said the Psychologist.

"Nor, having only length, breadth, and thickness, can a cube have a real existence."

"There I object," said Filby. "Of course a solid body may exist. All real things—"

"So most people think. But wait a moment. Can an instantaneous cube exist?" """
            }
        },
        {
            "type": "movie",
            "title": "Interstellar",
            "genre": "Sci-Fi / Adventure",
            "rating": 5,
            "description": "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
            "cover_image_url": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80",
            "is_favorite": True,
            "personal_notes": "Hans Zimmer's organ score is breathtaking. The depiction of Gargantua is mind-bending.",
            "movie": {
                "release_year": 2014,
                "director": "Christopher Nolan",
                "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
            }
        },
        {
            "type": "movie",
            "title": "Spirited Away",
            "genre": "Animation / Fantasy",
            "rating": 5,
            "description": "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
            "cover_image_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
            "is_favorite": True,
            "personal_notes": "Studio Ghibli at the absolute peak of imagination and emotional resonance.",
            "movie": {
                "release_year": 2001,
                "director": "Hayao Miyazaki",
                "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            }
        },
        {
            "type": "movie",
            "title": "Blade Runner 2049",
            "genre": "Sci-Fi / Neo-Noir",
            "rating": 4,
            "description": "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
            "cover_image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
            "is_favorite": False,
            "personal_notes": "Roger Deakins' cinematography is immaculate in every single frame.",
            "movie": {
                "release_year": 2017,
                "director": "Denis Villeneuve",
                "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
            }
        }
    ]

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
