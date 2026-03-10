"""
AI-QUITY Backend — main.py
FastAPI application entry point with lifespan, middleware, and exception handlers.
"""

import os
import time
import asyncio
import threading
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.config import settings
from app.exceptions import AppException
from app.logging_config import get_logger, setup_logging

# ---------------------------------------------------------------------------
# Logger (module-level; setup_logging() is called inside lifespan startup)
# ---------------------------------------------------------------------------
logger = get_logger("aiquity.main")


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP ──────────────────────────────────────────────────────────────
    setup_logging()
    logger.info("Starting AI-QUITY backend…")

    # Create database tables
    from app.database import Base, engine
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured")

    # Load LSTM model checkpoint if it exists
    checkpoint_path = "lstm_checkpoint.h5"
    if os.path.exists(checkpoint_path):
        try:
            from tensorflow.keras.models import load_model  # type: ignore
            app.state.lstm_model = load_model(checkpoint_path)
            logger.info("LSTM model loaded from checkpoint: %s", checkpoint_path)
        except Exception as exc:
            logger.error("Failed to load LSTM checkpoint: %s", exc)
            app.state.lstm_model = None
    else:
        app.state.lstm_model = None
        logger.warning("No LSTM checkpoint found — predictions will use fallback")

    yield  # ── App runs here ──────────────────────────────────────────────

    # ── SHUTDOWN ─────────────────────────────────────────────────────────────
    logger.info("Shutting down AI-QUITY backend…")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI-QUITY API",
    description="AI-powered stock prediction and analysis",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS middleware
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Rate limiting middleware
# ---------------------------------------------------------------------------
_rate_store: dict[str, list[float]] = {}
_rate_lock = threading.Lock()
_RATE_WINDOW = 60.0  # seconds


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window rate limiter keyed by client IP.
    Limit: settings.RATE_LIMIT_PER_MINUTE requests per 60 s.
    Health-check endpoint is exempt.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip rate limiting for health check
        if request.url.path == "/health":
            return await call_next(request)

        ip: str = request.client.host if request.client else "unknown"
        now = float(time.monotonic())
        window_start = now - _RATE_WINDOW
        limit: int = settings.RATE_LIMIT_PER_MINUTE

        with _rate_lock:
            timestamps = _rate_store.get(ip, [])
            # Prune stale timestamps
            timestamps = [t for t in timestamps if t > window_start]

            if len(timestamps) >= limit:
                _rate_store[ip] = timestamps
                return JSONResponse(
                    status_code=429,
                    content={
                        "error_code": "RATE_LIMIT_EXCEEDED",
                        "detail": "Too many requests — please try again later.",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    },
                )

            timestamps.append(now)
            _rate_store[ip] = timestamps

            # Periodic cleanup: remove IPs with no recent requests
            if len(_rate_store) > 1000:
                stale_keys = [k for k, v in _rate_store.items() if not v or max(v) < window_start]
                for k in stale_keys:
                    del _rate_store[k]

        return await call_next(request)


app.add_middleware(RateLimitMiddleware)


# ---------------------------------------------------------------------------
# Request logging middleware
# ---------------------------------------------------------------------------
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every incoming request with method, path, status code, and duration."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.monotonic()
        response: Response = await call_next(request)
        duration_ms = (time.monotonic() - start) * 1000
        logger.info(
            "%s %s → %d (%.1f ms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response


app.add_middleware(RequestLoggingMiddleware)


# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "detail": exc.detail,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "error_code": "VALIDATION_ERROR",
            "detail": exc.errors(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "INTERNAL_ERROR",
            "detail": "An unexpected error occurred",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


# ---------------------------------------------------------------------------
# API router (aggregates all route groups under /api/v1)
# ---------------------------------------------------------------------------
from app.routes import api_router  # noqa: E402

app.include_router(api_router)


# ---------------------------------------------------------------------------
# Health check endpoint
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
