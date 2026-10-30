from fastapi import APIRouter, Depends
from sqlalchemy import func, desc
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.library_item import LibraryItem
from app.models.book_detail import BookDetail
from app.schemas.dashboard import DashboardStatsResponse
from app.schemas.library import LibraryItemResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Compute real aggregated dashboard statistics from the PostgreSQL database for the current user.
    """
    user_id = current_user.id

    # Total counts and averages
    total_movies = db.query(LibraryItem).filter(
        LibraryItem.user_id == user_id,
        LibraryItem.item_type == "movie"
    ).count()

    total_books = db.query(LibraryItem).filter(
        LibraryItem.user_id == user_id,
        LibraryItem.item_type == "book"
    ).count()

    avg_movie_res = db.query(func.avg(LibraryItem.rating)).filter(
        LibraryItem.user_id == user_id,
        LibraryItem.item_type == "movie"
    ).scalar()
    avg_movie_rating = round(float(avg_movie_res), 1) if avg_movie_res is not None else 0.0

    avg_book_res = db.query(func.avg(LibraryItem.rating)).filter(
        LibraryItem.user_id == user_id,
        LibraryItem.item_type == "book"
    ).scalar()
    avg_book_rating = round(float(avg_book_res), 1) if avg_book_res is not None else 0.0

    favorite_count = db.query(LibraryItem).filter(
        LibraryItem.user_id == user_id,
        LibraryItem.is_favorite == True
    ).count()

    # Currently reading books
    currently_reading_items = (
        db.query(LibraryItem)
        .join(BookDetail, LibraryItem.id == BookDetail.item_id)
        .options(joinedload(LibraryItem.book_details))
        .filter(
            LibraryItem.user_id == user_id,
            LibraryItem.item_type == "book",
            BookDetail.reading_status == "currently_reading"
        )
        .all()
    )

    # Recently added items (limit 6)
    recent_items = (
        db.query(LibraryItem)
        .options(
            joinedload(LibraryItem.movie_details),
            joinedload(LibraryItem.book_details),
        )
        .filter(LibraryItem.user_id == user_id)
        .order_by(desc(LibraryItem.created_at))
        .limit(6)
        .all()
    )

    # Favorite items (limit 6)
    favorite_items = (
        db.query(LibraryItem)
        .options(
            joinedload(LibraryItem.movie_details),
            joinedload(LibraryItem.book_details),
        )
        .filter(
            LibraryItem.user_id == user_id,
            LibraryItem.is_favorite == True
        )
        .order_by(desc(LibraryItem.rating), desc(LibraryItem.created_at))
        .limit(6)
        .all()
    )

    return DashboardStatsResponse(
        total_movies=total_movies,
        total_books=total_books,
        avg_movie_rating=avg_movie_rating,
        avg_book_rating=avg_book_rating,
        favorite_count=favorite_count,
        currently_reading_count=len(currently_reading_items),
        recent_items=[LibraryItemResponse.model_validate(it) for it in recent_items],
        favorite_items=[LibraryItemResponse.model_validate(it) for it in favorite_items],
        currently_reading=[LibraryItemResponse.model_validate(it) for it in currently_reading_items],
    )
