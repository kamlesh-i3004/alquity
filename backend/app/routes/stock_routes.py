from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from app.deps import get_optional_user
from app.services.data_collector import get_stock_data
from app.exceptions import ExternalServiceException, NotFoundException
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/stocks", tags=["Stocks"])

_TIMEFRAME_MAP = {
    "1d": "1D", "5d": "1W", "1mo": "1M", "3mo": "3M",
    "6mo": "3M", "1y": "1Y", "2y": "1Y", "5y": "1Y", "10y": "1Y", "ytd": "1M", "max": "1Y",
}

ALLOWED_PERIODS = {"1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"}


@router.get("/{ticker}", summary="Get stock data")
def get_stock(
    ticker: str,
    period: str = Query(default="1mo", description="Time period"),
    current_user=Depends(get_optional_user),
):
    """Fetch full OHLCV + indicator data for a ticker. Public endpoint."""
    ticker = ticker.upper()
    if period not in ALLOWED_PERIODS:
        period = "1mo"
    timeframe = _TIMEFRAME_MAP.get(period, "1M")
    try:
        data = get_stock_data(ticker, timeframe)
    except Exception as exc:
        logger.error("Failed to fetch stock data for %s: %s", ticker, exc)
        raise ExternalServiceException(f"Could not retrieve data for {ticker}: {exc}") from exc

    if not data.get("candleData"):
        raise NotFoundException(f"No data found for ticker {ticker}")

    return JSONResponse(content=data)


@router.get("/{ticker}/history", summary="Get stock price history")
def get_stock_history(
    ticker: str,
    period: str = Query(default="3mo", description="Time period (e.g. 1mo, 3mo, 1y)"),
    current_user=Depends(get_optional_user),
):
    """Fetch historical OHLCV + indicator data for a ticker. Public endpoint."""
    ticker = ticker.upper()
    if period not in ALLOWED_PERIODS:
        period = "3mo"
    timeframe = _TIMEFRAME_MAP.get(period, "3M")
    try:
        data = get_stock_data(ticker, timeframe)
    except Exception as exc:
        logger.error("Failed to fetch history for %s: %s", ticker, exc)
        raise ExternalServiceException(f"Could not retrieve history for {ticker}: {exc}") from exc

    if not data.get("candleData"):
        raise NotFoundException(f"No data found for ticker {ticker}")

    return JSONResponse(content=data)
