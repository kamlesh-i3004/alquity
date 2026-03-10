from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from app.deps import get_optional_user
from app.services.sentiment_analysis import get_ticker_sentiment
from app.exceptions import ExternalServiceException
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/sentiment", tags=["Sentiment"])


@router.get("/{ticker}", summary="Get sentiment analysis for ticker")
def get_sentiment(
    ticker: str,
    current_user=Depends(get_optional_user),
):
    """Fetch news sentiment analysis for a ticker. Public endpoint."""
    ticker = ticker.upper()
    try:
        data = get_ticker_sentiment(ticker)
        return JSONResponse(content=data)
    except Exception as exc:
        logger.error("Sentiment analysis failed for %s: %s", ticker, exc)
        raise ExternalServiceException(f"Sentiment analysis failed for {ticker}: {exc}") from exc
