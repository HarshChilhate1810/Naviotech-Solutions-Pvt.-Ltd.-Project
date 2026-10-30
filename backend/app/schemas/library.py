from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict


class MovieDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    release_year: Optional[int] = Field(None, ge=1880, le=2100)
    director: Optional[str] = Field(None, max_length=150)
    video_url: Optional[str] = Field(None, max_length=1000)



class BookDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    author: Optional[str] = Field(None, max_length=150)
    publication_year: Optional[int] = Field(None, ge=1000, le=2100)
    reading_status: Literal["want_to_read", "currently_reading", "completed"] = "want_to_read"
    current_page: int = Field(1, ge=1)
    total_pages: int = Field(100, ge=1)
    sample_content: Optional[str] = None



class LibraryItemCreate(BaseModel):
    item_type: Literal["movie", "book"]
    title: str = Field(..., min_length=1, max_length=255)
    genre: str = Field(..., min_length=1, max_length=100)
    rating: int = Field(5, ge=1, le=5)
    description: Optional[str] = None
    cover_image_url: Optional[str] = Field(None, max_length=1000)
    is_favorite: bool = False
    personal_notes: Optional[str] = None
    movie_details: Optional[MovieDetailSchema] = None
    book_details: Optional[BookDetailSchema] = None


class LibraryItemUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    genre: Optional[str] = Field(None, min_length=1, max_length=100)
    rating: Optional[int] = Field(None, ge=1, le=5)
    description: Optional[str] = None
    cover_image_url: Optional[str] = Field(None, max_length=1000)
    is_favorite: Optional[bool] = None
    personal_notes: Optional[str] = None
    movie_details: Optional[MovieDetailSchema] = None
    book_details: Optional[BookDetailSchema] = None


class LibraryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    item_type: str
    title: str
    genre: str
    rating: int
    description: Optional[str]
    cover_image_url: Optional[str]
    is_favorite: bool
    personal_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    movie_details: Optional[MovieDetailSchema] = None
    book_details: Optional[BookDetailSchema] = None



class PaginatedLibraryResponse(BaseModel):
    items: List[LibraryItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool


class ReadingProgressUpdate(BaseModel):
    current_page: int = Field(..., ge=1)
    reading_status: Optional[Literal["want_to_read", "currently_reading", "completed"]] = None
