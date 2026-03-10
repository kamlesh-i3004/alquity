from typing import Optional
from pydantic import BaseModel, field_validator

ALLOWED_PERIODS = {"1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"}


class StockQuery(BaseModel):
    ticker: str
    period: str = "1mo"

    @field_validator("ticker")
    @classmethod
    def ticker_to_upper(cls, v: str) -> str:
        return v.upper()

    @field_validator("period")
    @classmethod
    def period_allowed(cls, v: str) -> str:
        if v not in ALLOWED_PERIODS:
            raise ValueError(f"period must be one of {ALLOWED_PERIODS}")
        return v


class StockDataPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockResponse(BaseModel):
    ticker: str
    period: str
    data: list[StockDataPoint]
    current_price: float
    change_percent: float
    market_cap: Optional[float] = None
