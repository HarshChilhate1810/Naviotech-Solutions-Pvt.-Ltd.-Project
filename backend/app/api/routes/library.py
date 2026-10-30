from app.core.demo_data import DEMO_MOVIES
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, desc, asc, func
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.library_item import LibraryItem
from app.models.movie_detail import MovieDetail
from app.models.book_detail import BookDetail
from app.schemas.library import (
    LibraryItemCreate,
    LibraryItemUpdate,
    LibraryItemResponse,
    PaginatedLibraryResponse,
    ReadingProgressUpdate,
)

router = APIRouter(prefix="/library-items", tags=["Library Items"])


@router.get("", response_model=PaginatedLibraryResponse)
def list_library_items(
    search: Optional[str] = Query(None, description="Search by title or author"),
    item_type: Optional[str] = Query(None, description="Filter by 'movie' or 'book'"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    min_rating: Optional[int] = Query(None, ge=1, le=5),
    max_rating: Optional[int] = Query(None, ge=1, le=5),
    is_favorite: Optional[bool] = Query(None),
    reading_status: Optional[str] = Query(None, description="Book reading status"),
    year: Optional[int] = Query(None, description="Release or publication year"),
    sort_by: str = Query("recently_added", description="Sort option: recently_added, title_asc, title_desc, rating_high, rating_low, year_newest, year_oldest"),
    page: int = Query(1, ge=1, description="Page number, 1-indexed"),
    page_size: int = Query(12, ge=1, le=100, description="Items per page, default 12"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List library items belonging strictly to the authenticated user.
    Demonstrates server-side pagination, parameterized filtering, and joins.
    """
    # Base query strictly restricted to current user
    query = (
        db.query(LibraryItem)
        .outerjoin(MovieDetail, LibraryItem.id == MovieDetail.item_id)
        .outerjoin(BookDetail, LibraryItem.id == BookDetail.item_id)
        .filter(LibraryItem.user_id == current_user.id)
    )

    # Search filter (Title or Author)
    if search:
        search_pattern = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(LibraryItem.title).like(search_pattern),
                func.lower(BookDetail.author).like(search_pattern),
                func.lower(MovieDetail.director).like(search_pattern),
            )
        )

    # Item Type filter
    if item_type:
        query = query.filter(LibraryItem.item_type == item_type)

    # Genre filter
    if genre:
        query = query.filter(func.lower(LibraryItem.genre) == genre.strip().lower())

    # Rating range
    if min_rating is not None:
        query = query.filter(LibraryItem.rating >= min_rating)
    if max_rating is not None:
        query = query.filter(LibraryItem.rating <= max_rating)

    # Favorite filter
    if is_favorite is not None:
        query = query.filter(LibraryItem.is_favorite == is_favorite)

    # Reading status filter (for books)
    if reading_status:
        query = query.filter(BookDetail.reading_status == reading_status)

    # Year filter
    if year:
        query = query.filter(
            or_(
                MovieDetail.release_year == year,
                BookDetail.publication_year == year,
            )
        )

    # Sorting logic
    if sort_by == "title_asc":
        query = query.order_by(asc(func.lower(LibraryItem.title)))
    elif sort_by == "title_desc":
        query = query.order_by(desc(func.lower(LibraryItem.title)))
    elif sort_by == "rating_high":
        query = query.order_by(desc(LibraryItem.rating), desc(LibraryItem.created_at))
    elif sort_by == "rating_low":
        query = query.order_by(asc(LibraryItem.rating), desc(LibraryItem.created_at))
    elif sort_by == "year_newest":
        query = query.order_by(
            desc(func.coalesce(MovieDetail.release_year, BookDetail.publication_year, 0)),
            desc(LibraryItem.created_at)
        )
    elif sort_by == "year_oldest":
        query = query.order_by(
            asc(func.coalesce(MovieDetail.release_year, BookDetail.publication_year, 9999)),
            desc(LibraryItem.created_at)
        )
    else:  # recently_added default
        query = query.order_by(desc(LibraryItem.created_at))

    # Total matching records count before pagination
    total_records = query.count()

    # Pagination: offset and limit
    offset = (page - 1) * page_size
    items = (
        query.options(
            joinedload(LibraryItem.movie_details),
            joinedload(LibraryItem.book_details),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    total_pages = (total_records + page_size - 1) // page_size if total_records > 0 else 1

    return PaginatedLibraryResponse(
        items=[LibraryItemResponse.model_validate(it) for it in items],
        total=total_records,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )


@router.get("/{item_id}", response_model=LibraryItemResponse)
def get_library_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve full details for a single library item, enforcing user ownership."""
    item = (
        db.query(LibraryItem)
        .options(
            joinedload(LibraryItem.movie_details),
            joinedload(LibraryItem.book_details),
        )
        .filter(LibraryItem.id == item_id, LibraryItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Library item not found in your collection"
        )
    return LibraryItemResponse.model_validate(item)


@router.post("", response_model=LibraryItemResponse, status_code=status.HTTP_201_CREATED)
def create_library_item(
    data: LibraryItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new movie or book in the authenticated user's library."""
    item = LibraryItem(
        user_id=current_user.id,
        item_type=data.item_type,
        title=data.title.strip(),
        genre=data.genre.strip(),
        rating=data.rating,
        description=data.description.strip() if data.description else None,
        cover_image_url=data.cover_image_url.strip() if data.cover_image_url else None,
        is_favorite=data.is_favorite,
        personal_notes=data.personal_notes.strip() if data.personal_notes else None,
    )
    db.add(item)
    db.flush()

    if data.item_type == "movie":
        m_details = data.movie_details
        movie_detail = MovieDetail(
            item_id=item.id,
            release_year=m_details.release_year if m_details else None,
            director=m_details.director.strip() if m_details and m_details.director else None,
            video_url=m_details.video_url.strip() if m_details and m_details.video_url else None,
        )
        db.add(movie_detail)
    elif data.item_type == "book":
        b_details = data.book_details
        book_detail = BookDetail(
            item_id=item.id,
            author=b_details.author.strip() if b_details and b_details.author else None,
            publication_year=b_details.publication_year if b_details else None,
            reading_status=b_details.reading_status if b_details else "want_to_read",
            current_page=b_details.current_page if b_details else 1,
            total_pages=b_details.total_pages if b_details else 100,
            sample_content=b_details.sample_content if b_details else None,
        )
        db.add(book_detail)

    db.commit()
    db.refresh(item)
    return LibraryItemResponse.model_validate(item)


@router.put("/{item_id}", response_model=LibraryItemResponse)
def update_library_item(
    item_id: str,
    data: LibraryItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing movie or book record, enforcing ownership."""
    item = (
        db.query(LibraryItem)
        .options(
            joinedload(LibraryItem.movie_details),
            joinedload(LibraryItem.book_details),
        )
        .filter(LibraryItem.id == item_id, LibraryItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found or access denied"
        )

    if data.title is not None:
        item.title = data.title.strip()
    if data.genre is not None:
        item.genre = data.genre.strip()
    if data.rating is not None:
        item.rating = data.rating
    if data.description is not None:
        item.description = data.description.strip() if data.description else None
    if data.cover_image_url is not None:
        item.cover_image_url = data.cover_image_url.strip() if data.cover_image_url else None
    if data.is_favorite is not None:
        item.is_favorite = data.is_favorite
    if data.personal_notes is not None:
        item.personal_notes = data.personal_notes.strip() if data.personal_notes else None

    # Update subtype details
    if item.item_type == "movie" and data.movie_details:
        if not item.movie_details:
            item.movie_details = MovieDetail(item_id=item.id)
            db.add(item.movie_details)
        if data.movie_details.release_year is not None:
            item.movie_details.release_year = data.movie_details.release_year
        if data.movie_details.director is not None:
            item.movie_details.director = data.movie_details.director.strip() if data.movie_details.director else None
        if data.movie_details.video_url is not None:
            item.movie_details.video_url = data.movie_details.video_url.strip() if data.movie_details.video_url else None


    elif item.item_type == "book" and data.book_details:
        if not item.book_details:
            item.book_details = BookDetail(item_id=item.id)
            db.add(item.book_details)
        if data.book_details.author is not None:
            item.book_details.author = data.book_details.author.strip() if data.book_details.author else None
        if data.book_details.publication_year is not None:
            item.book_details.publication_year = data.book_details.publication_year
        if data.book_details.reading_status is not None:
            item.book_details.reading_status = data.book_details.reading_status
        if data.book_details.current_page is not None:
            item.book_details.current_page = data.book_details.current_page
        if data.book_details.total_pages is not None:
            item.book_details.total_pages = data.book_details.total_pages
        if data.book_details.sample_content is not None:
            item.book_details.sample_content = data.book_details.sample_content

    db.commit()
    db.refresh(item)
    return LibraryItemResponse.model_validate(item)


@router.delete("/{item_id}")
def delete_library_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a library item with cascade deletion of related details."""
    item = db.query(LibraryItem).filter(
        LibraryItem.id == item_id,
        LibraryItem.user_id == current_user.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found or access denied"
        )

    db.delete(item)
    db.commit()
    return {"message": "Library item successfully deleted"}


@router.patch("/{item_id}/favorite", response_model=LibraryItemResponse)
def toggle_favorite(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle the favorite status of a book or movie."""
    item = (
        db.query(LibraryItem)
        .options(
            joinedload(LibraryItem.movie_details),
            joinedload(LibraryItem.book_details),
        )
        .filter(LibraryItem.id == item_id, LibraryItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found or access denied"
        )

    item.is_favorite = not item.is_favorite
    db.commit()
    db.refresh(item)
    return LibraryItemResponse.model_validate(item)


@router.patch("/{item_id}/reading-progress", response_model=LibraryItemResponse)
def update_reading_progress(
    item_id: str,
    data: ReadingProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Save reading progress from the realistic interactive book reader to the database.
    Enables cross-device reading continuity.
    """
    item = (
        db.query(LibraryItem)
        .options(joinedload(LibraryItem.book_details))
        .filter(
            LibraryItem.id == item_id,
            LibraryItem.user_id == current_user.id,
            LibraryItem.item_type == "book",
        )
        .first()
    )
    if not item or not item.book_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found in your collection"
        )

    item.book_details.current_page = data.current_page

    # Update reading status automatically or from user payload
    if data.reading_status:
        item.book_details.reading_status = data.reading_status
    elif item.book_details.current_page >= item.book_details.total_pages:
        item.book_details.reading_status = "completed"
    elif item.book_details.current_page > 1:
        item.book_details.reading_status = "currently_reading"

    db.commit()
    db.refresh(item)
    return LibraryItemResponse.model_validate(item)


@router.post("/seed-demo-movies")
def seed_demo_movies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Populates or updates high-quality playable demo movies for the authenticated user
    so their movie theater is rich and immediately playable.
    """
    added_count = 0
    updated_count = 0

    for demo in DEMO_MOVIES:
        existing = (
            db.query(LibraryItem)
            .options(joinedload(LibraryItem.movie_details))
            .filter(
                LibraryItem.user_id == current_user.id,
                LibraryItem.item_type == "movie",
                func.lower(LibraryItem.title) == demo["title"].lower(),
            )
            .first()
        )

        m_info = demo["movie"]

        if existing:
            if not existing.movie_details:
                existing.movie_details = MovieDetail(
                    item_id=existing.id,
                    release_year=m_info.get("release_year"),
                    director=m_info.get("director"),
                    video_url=m_info.get("video_url"),
                )
            else:
                existing.movie_details.video_url = m_info.get("video_url")
                existing.movie_details.director = m_info.get("director")
                existing.movie_details.release_year = m_info.get("release_year")
            existing.cover_image_url = demo["cover_image_url"]
            existing.description = demo["description"]
            updated_count += 1
        else:
            new_item = LibraryItem(
                user_id=current_user.id,
                item_type="movie",
                title=demo["title"],
                genre=demo["genre"],
                rating=demo["rating"],
                description=demo["description"],
                cover_image_url=demo["cover_image_url"],
                is_favorite=demo["is_favorite"],
                personal_notes=demo["personal_notes"],
            )
            db.add(new_item)
            db.flush()

            movie_detail = MovieDetail(
                item_id=new_item.id,
                release_year=m_info.get("release_year"),
                director=m_info.get("director"),
                video_url=m_info.get("video_url"),
            )
            db.add(movie_detail)
            added_count += 1

    db.commit()
    return {
        "status": "success",
        "message": f"Demo movies synchronized: {added_count} added, {updated_count} updated",
        "added": added_count,
        "updated": updated_count,
        "total_demo_movies": len(DEMO_MOVIES),
    }
