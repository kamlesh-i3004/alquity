from datetime import datetime
from typing import Optional, List
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


# Model Performance Schemas
class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class TrainingHistory(BaseModel):
    epoch: int
    accuracy: float
    val_accuracy: float


class LossHistory(BaseModel):
    epochs: List[int]
    train_loss: List[float]
    val_loss: List[float]


class ModelPerformanceResponse(BaseModel):
    ml_metrics: ModelMetrics
    dl_metrics: ModelMetrics
    feature_importance: List[FeatureImportance]
    training_history: List[TrainingHistory]
    loss_history: LossHistory
    confusion_matrix: List[List[int]]
    last_updated: str
