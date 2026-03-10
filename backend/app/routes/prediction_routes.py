import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.database import User, PredictionCache
from app.schemas.prediction import PredictionRequest
from app.exceptions import ExternalServiceException
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/predictions", tags=["Predictions"])

CACHE_TTL_MINUTES = 5


def _get_cached(db: Session, ticker: str) -> dict | None:
    """Return a cached prediction dict if one exists and has not expired."""
    now = datetime.utcnow()
    entry = (
        db.query(PredictionCache)
        .filter(PredictionCache.ticker == ticker, PredictionCache.expires_at > now)
        .order_by(PredictionCache.predicted_at.desc())
        .first()
    )
    if entry:
        logger.info("Prediction cache HIT for %s (expires %s)", ticker, entry.expires_at)
        return json.loads(entry.prediction_json)
    return None


def _save_cache(db: Session, ticker: str, result: dict) -> None:
    """Persist a prediction result to the cache table."""
    import uuid
    now = datetime.utcnow()
    entry = PredictionCache(
        id=str(uuid.uuid4()),
        ticker=ticker,
        model_type="linear_extrapolation",
        predicted_at=now,
        prediction_json=json.dumps(result),
        expires_at=now + timedelta(minutes=CACHE_TTL_MINUTES),
    )
    db.add(entry)
    db.commit()
    logger.info("Prediction cached for %s (TTL %d min)", ticker, CACHE_TTL_MINUTES)


def _compute_prediction(ticker: str) -> dict:
    from app.services.prediction_model import predict_stock_price
    return predict_stock_price(ticker)


@router.post("", summary="Run stock prediction")
def create_prediction(
    body: PredictionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run a price prediction for a given ticker. Uses cache if available. Requires authentication."""
    ticker = body.ticker.upper()

    cached = _get_cached(db, ticker)
    if cached:
        return JSONResponse(content=cached)

    try:
        result = _compute_prediction(ticker)
        _save_cache(db, ticker, result)
        return JSONResponse(content=result)
    except Exception as exc:
        logger.error("Prediction failed for %s: %s", ticker, exc)
        raise ExternalServiceException(f"Prediction failed for {ticker}: {exc}") from exc


@router.get("/{ticker}", summary="Quick prediction for ticker")
def get_prediction(
    ticker: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Quick GET prediction. Uses 5-minute cache to avoid redundant Yahoo Finance calls. Requires authentication."""
    ticker = ticker.upper()

    cached = _get_cached(db, ticker)
    if cached:
        return JSONResponse(content=cached)

    try:
        result = _compute_prediction(ticker)
        _save_cache(db, ticker, result)
        return JSONResponse(content=result)
    except Exception as exc:
        logger.error("Prediction failed for %s: %s", ticker, exc)
        raise ExternalServiceException(f"Prediction failed for {ticker}: {exc}") from exc


@router.delete("/{ticker}/cache", summary="Invalidate prediction cache for ticker")
def clear_prediction_cache(
    ticker: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete all cached predictions for a ticker, forcing a fresh compute on next request."""
    ticker = ticker.upper()
    deleted = db.query(PredictionCache).filter(PredictionCache.ticker == ticker).delete()
    db.commit()
    logger.info("Cleared %d cache entries for %s by user %s", deleted, ticker, current_user.id)
    return {"ticker": ticker, "entries_cleared": deleted}
