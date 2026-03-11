from fastapi import APIRouter
from app.routes.auth_routes import router as auth_router
from app.routes.stock_routes import router as stock_router
from app.routes.prediction_routes import router as prediction_router
from app.routes.sentiment_routes import router as sentiment_router
from app.routes.portfolio_routes import router as portfolio_router
from app.routes.model_performance_routes import router as model_performance_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(stock_router)
api_router.include_router(prediction_router)
api_router.include_router(sentiment_router)
api_router.include_router(portfolio_router)
api_router.include_router(model_performance_router)
