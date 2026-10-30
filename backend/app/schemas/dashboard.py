from typing import List
from pydantic import BaseModel

from app.schemas.library import LibraryItemResponse


class DashboardStatsResponse(BaseModel):
    total_movies: int
    total_books: int
    avg_movie_rating: float
    avg_book_rating: float
    favorite_count: int
    currently_reading_count: int
    recent_items: List[LibraryItemResponse]
    favorite_items: List[LibraryItemResponse]
    currently_reading: List[LibraryItemResponse]
