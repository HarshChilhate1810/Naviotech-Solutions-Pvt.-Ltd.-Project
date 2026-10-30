# Athenaeum — Movie & Book Library Web Application

> A modern, secure, and attractive full-stack web application allowing users to curate personal movie and book collections, filter and search items, manage ratings and reviews, and read books through a **realistic interactive 3D book reader** with synthesized physical page-turn acoustics and cross-device PostgreSQL progress syncing.

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client["React Frontend (Vite + Tailwind CSS + Lucide)"]
    API["FastAPI Backend (Python 3.11)"]
    DB[("PostgreSQL Database (Neon / Supabase / SQLAlchemy)")]
    Audio["Web Audio API (Synthesized Paper Flutter)"]

    Client -->|REST API + JWT Bearer| API
    Client -->|Audio Synthesis| Audio
    API -->|Connection Pool & Parameterized Queries| DB
    API -->|Schema Migrations| DB
```

### Technology Stack
- **Frontend**: React 18 with Vite, Tailwind CSS, Lucide React icons, Web Audio API.
- **Backend**: Python 3.11 with FastAPI.
- **Database**: PostgreSQL (tested with SQLAlchemy 2.0 and psycopg2-binary; local SQLite fallback included).
- **ORM & Migrations**: SQLAlchemy 2.0 with connection pooling, Alembic migration pipeline.
- **Security & Auth**: Argon2id password hashing (`argon2-cffi`), short-lived JWT access tokens, rotating refresh tokens stored in database with strict per-user authorization boundaries.

---

## 📸 Key Features

1. **Elegant Design System**:
   - **Dark Mode**: Dark navy and charcoal tones (`#080C16`, `#0C1222`, `#15203B`).
   - **Light Mode**: Warm cream and parchment tones (`#FDFAF4`, `#F7F3E9`, `#ECE4D0`).
   - Clean card typography, star rating meters, responsive grid layouts (desktop, tablet, mobile).

2. **Realistic Interactive Book Reader**:
   - Physical open-book presentation: dual visible pages with center spine shadow crease on desktop; responsive single-page on mobile.
   - Authentic paper textures and comfortable serif typography (Merriweather / Georgia).
   - **Synthesized Page Turn Acoustics**: Web Audio API generates a realistic physical paper rustle/flutter without external MP3 files or network latency.
   - Built-in mute/unmute audio control.
   - Keyboard navigation (`ArrowLeft` / `ArrowRight` / `Escape`) and page-jumping slider.
   - **Cross-Device Progress Synchronization**: Reading page position is immediately persisted to PostgreSQL so users can continue where they left off from another device.
   - Pre-loaded with public domain classics (*The Adventures of Sherlock Holmes* by Arthur Conan Doyle, *Pride and Prejudice* by Jane Austen, *The Time Machine* by H.G. Wells). Users can also paste custom text/excerpts into any book.

3. **Cinematic Movie Theater Player**:
   - Built-in video player modal with dark ambient backlight glow and 16:9 widescreen presentation.
   - One-click "Watch" button on movie cards, detail dialog, and dashboard shelves.
   - Comprehensive playback controls: Play/Pause, Seek bar with buffered progress, Volume & Mute, Fullscreen, Playback Speed (0.5x to 2x), and keyboard shortcuts (`Space`/`k`, `ArrowRight`/`ArrowLeft`, `f`, `m`, `Esc`).
   - Flexible video engine supporting direct stream links (`.mp4`, `.webm`) as well as YouTube/Vimeo embed URLs.
   - Pre-seeded with cinematic open-source film streams (*Tears of Steel*, *Big Buck Bunny*, *Sintel*) with quick stream presets when creating or editing movies.

4. **Complete CRUD Operations**:

   - Create, Read, Update, and Delete movies and books.
   - 1–5 star interactive rating selector.
   - Personal notes and reviews.
   - One-click favorite toggle.
   - Book reading statuses: *Want to Read*, *Currently Reading*, *Completed*.

4. **Server-Side Pagination & Database Search**:
   - Default page size: 12 items.
   - Page count indicators, result ranges (e.g. "Showing 1–12 of 34 items"), and boundary checks.
   - Debounced search across movie/book titles, authors, and directors.
   - Filtering by genre, rating range, favorite status, reading status, and publication/release year.
   - Sorting by Title (A–Z, Z–A), Recently Added, Rating (Highest/Lowest), and Year.

5. **Personalized Dashboard**:
   - Dynamic real-time statistics computed by PostgreSQL:
     - Total Movies & Total Books count
     - Average Movie Rating & Average Book Rating
     - Currently Reading Books Shelf with page progress bars & instant "Resume Reading" button
     - Favorite Highlights and Recently Added shelves

6. **Enterprise Security & User Isolation**:
   - Passwords hashed with state-of-the-art **Argon2id** algorithm.
   - JWT tokens with token rotation and revocation tracking in database.
   - Strict server-side user context enforcement: every query is scoped to `current_user.id`. User A can never inspect, modify, or delete records belonging to User B.
   - Automated tests verifying multi-user data isolation.

---

## 🗄️ Relational Database Schema

```mermaid
erDiagram
    users ||--o{ refresh_tokens : has
    users ||--o{ library_items : owns
    users ||--o| user_preferences : configures
    library_items ||--o| movie_details : contains
    library_items ||--o| book_details : contains

    users {
        string id PK "UUID"
        string name
        string email UK "Indexed"
        string password_hash
        datetime created_at
        datetime updated_at
    }

    refresh_tokens {
        string id PK "UUID"
        string user_id FK
        string token_hash "Indexed"
        datetime expires_at
        datetime revoked_at
        datetime created_at
    }

    library_items {
        string id PK "UUID"
        string user_id FK "Indexed"
        string item_type "movie | book"
        string title "Indexed"
        string genre "Indexed"
        integer rating "1 to 5"
        text description
        string cover_image_url
        boolean is_favorite "Indexed"
        text personal_notes
        datetime created_at "Indexed"
        datetime updated_at
    }

    movie_details {
        string item_id PK, FK
        integer release_year "Indexed"
        string director
    }

    book_details {
        string item_id PK, FK
        string author "Indexed"
        integer publication_year "Indexed"
        string reading_status "Indexed"
        integer current_page
        integer total_pages
        text sample_content
    }

    user_preferences {
        string user_id PK, FK
        string theme "dark | light"
        boolean page_turn_sound_enabled
        datetime updated_at
    }
```

---

## 🔍 Example SQL Queries (Demonstrating Section 8)

The application utilizes SQLAlchemy 2.0 parameterized queries under the hood. Below are equivalent SQL statements demonstrating how pagination, filtering, and aggregation operate on PostgreSQL:

### 1. Filtered, Sorted, and Paginated Library Query
```sql
-- Retrieve Page 1 (12 items) filtered by Genre, Rating >= 4, and Search query
SELECT 
    li.id, li.user_id, li.item_type, li.title, li.genre, li.rating, 
    li.is_favorite, li.cover_image_url, li.created_at,
    md.release_year, md.director,
    bd.author, bd.publication_year, bd.reading_status, bd.current_page, bd.total_pages
FROM library_items li
LEFT OUTER JOIN movie_details md ON li.id = md.item_id
LEFT OUTER JOIN book_details bd ON li.id = bd.item_id
WHERE li.user_id = :user_id
  AND (
      LOWER(li.title) LIKE LOWER(:search_term) 
      OR LOWER(bd.author) LIKE LOWER(:search_term)
      OR LOWER(md.director) LIKE LOWER(:search_term)
  )
  AND LOWER(li.genre) = LOWER(:genre)
  AND li.rating >= :min_rating
ORDER BY li.created_at DESC
LIMIT 12 OFFSET 0;
```

### 2. Matching Records Count (for Pagination Total)
```sql
SELECT COUNT(*) AS total_count
FROM library_items li
LEFT OUTER JOIN movie_details md ON li.id = md.item_id
LEFT OUTER JOIN book_details bd ON li.id = bd.item_id
WHERE li.user_id = :user_id
  AND LOWER(li.genre) = LOWER(:genre);
```

### 3. Aggregated Dashboard Statistics
```sql
SELECT 
    COUNT(CASE WHEN item_type = 'movie' THEN 1 END) AS total_movies,
    COUNT(CASE WHEN item_type = 'book' THEN 1 END) AS total_books,
    ROUND(AVG(CASE WHEN item_type = 'movie' THEN rating END)::numeric, 1) AS avg_movie_rating,
    ROUND(AVG(CASE WHEN item_type = 'book' THEN rating END)::numeric, 1) AS avg_book_rating,
    COUNT(CASE WHEN is_favorite = true THEN 1 END) AS total_favorites
FROM library_items
WHERE user_id = :user_id;
```

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup (FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Alembic database migrations
python -m alembic upgrade head

# Run automated tests
pytest -v

# Start FastAPI development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API documentation is automatically available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health check: `http://127.0.0.1:8000/api/health`

### 2. Frontend Setup (React + Vite)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🌐 Cloud Deployment & Cross-Device Access

To make your library accessible across any device with an internet connection:

### 1. Cloud PostgreSQL Setup (Neon / Supabase)
1. Create a free PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy your connection URI (e.g. `postgresql://username:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require`).
3. Set `DATABASE_URL` in your backend environment variables.

### 2. Backend Deployment (Render / Railway)
1. Push your repository to GitHub.
2. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service** connected to your repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   - `DATABASE_URL`: Your hosted PostgreSQL connection string.
   - `JWT_SECRET_KEY`: A secure random string (minimum 32 characters).
   - `FRONTEND_ORIGIN`: Your deployed frontend URL (e.g. `https://my-library.vercel.app`).

### 3. Frontend Deployment (Vercel / Netlify)
1. In [Vercel](https://vercel.com) or [Netlify](https://netlify.com), import your repository.
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Set Environment Variable:
   - `VITE_API_URL`: Your deployed backend API URL (e.g. `https://my-library-api.onrender.com/api`).

### 4. Cross-Device Verification Workflow
1. **Device 1 (Laptop / Desktop)**:
   - Navigate to the application URL.
   - Register an account (e.g. `jane@example.com`).
   - Add a book and a movie. Open the interactive reader and flip to page 15.
2. **Device 2 (Phone / Tablet)**:
   - Open the application URL in mobile browser.
   - Log in with the same account (`jane@example.com`).
   - View Dashboard: observe that the added book and movie are present.
   - Open the book reader: verify that it resumes automatically from page 15 in mobile single-page view.
   - Toggle theme to light cream mode: reload on Device 1 to observe the synced theme preference.

---

## 🧪 Automated Test Suite

Run the full automated test suite covering authentication, token rotation, CRUD, pagination, filtering, and multi-user data isolation:
```bash
cd backend
python -m pytest -v
```

Test coverage includes:
- `test_register_success` — Registration and Argon2id hash verification
- `test_register_duplicate_email_fails` — Unique constraint enforcement
- `test_login_success` & `test_login_invalid_password` — Credential validation
- `test_refresh_token_rotation` — Refresh token security & reuse prevention
- `test_create_and_get_movie` — Movie relational storage and retrieval
- `test_create_and_update_book` — Book reading status & page tracking
- `test_pagination_and_filtering` — Server-side limits, offsets, and search
- `test_user_data_isolation` — **Strict guarantee that User 2 cannot access, edit, or delete User 1's records**
- `test_dashboard_stats` — Real-time database metric calculations

---

## 📄 License
MIT License. Created for portfolio and educational demonstration.
