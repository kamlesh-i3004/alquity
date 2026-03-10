from datetime import datetime
from typing import Literal
from pydantic import BaseModel, field_validator


class SentimentQuery(BaseModel):
    ticker: str

    @field_validator("ticker")
    @classmethod
    def ticker_to_upper(cls, v: str) -> str:
        return v.upper()


class NewsItem(BaseModel):
    title: str
    source: str
    url: str
    published_at: str
    sentiment_score: float
    sentiment_label: Literal["bullish", "bearish", "neutral"]


class SentimentResponse(BaseModel):
    ticker: str
    overall_sentiment: float
    sentiment_label: str
    news_count: int
    news: list[NewsItem]
    analyzed_at: datetime
