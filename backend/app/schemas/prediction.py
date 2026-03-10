from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator, Field


class PredictionRequest(BaseModel):
    ticker: str
    days: int = Field(default=7, ge=1, le=30)

    @field_validator("ticker")
    @classmethod
    def ticker_to_upper(cls, v: str) -> str:
        return v.upper()


class PredictionDataPoint(BaseModel):
    date: str
    predicted_price: float
    confidence_lower: float
    confidence_upper: float


class PredictionResponse(BaseModel):
    ticker: str
    model_type: str
    predictions: list[PredictionDataPoint]
    generated_at: datetime
    model_accuracy: Optional[float] = None
