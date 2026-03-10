from datetime import datetime
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    error_code: str
    detail: str
    timestamp: datetime


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime
