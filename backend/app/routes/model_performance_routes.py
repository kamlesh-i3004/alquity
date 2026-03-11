"""
Model Performance Routes
Endpoints for model performance metrics.
"""
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.database import User
from app.services.model_performance import calculate_model_metrics
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/models", tags=["Model Performance"])


@router.get("/performance", summary="Get model performance metrics")
def get_model_performance(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get comprehensive model performance metrics including:
    - ML and DL model accuracy, precision, recall, F1 score
    - Feature importance rankings
    - Training history (accuracy over epochs)
    - Loss history (train/val loss over epochs)
    - Confusion matrix
    
    Requires authentication.
    """
    try:
        metrics = calculate_model_metrics()
        return JSONResponse(content=metrics)
    except Exception as exc:
        logger.error("Failed to get model performance: %s", exc)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to retrieve model performance metrics",
                "detail": str(exc),
            },
        )
