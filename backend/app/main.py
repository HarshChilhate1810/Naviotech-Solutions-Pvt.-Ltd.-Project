import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.api import api_router
from app.db.init_db import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("athenaeum")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure database schema tables are initialized
    logger.info("Initializing database tables...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization warning: {e}")
    yield
    # Shutdown
    logger.info("Application shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A modern, secure Movie & Book Library API with Argon2id authentication, PostgreSQL storage, server-side pagination, and realistic interactive book reader support.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Configuration
origins = settings.BACKEND_CORS_ORIGINS + [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Centralized exception handler to prevent leaking raw internal errors."""
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# Mount API Router under prefix
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "Welcome to BiblioBox Movie & Book Library API",
        "docs": "/docs",
        "health": "/api/health",
    }
