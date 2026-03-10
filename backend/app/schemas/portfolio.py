from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class HoldingCreate(BaseModel):
    ticker: str
    shares: float = Field(gt=0)
    avg_cost: float = Field(gt=0)

    @field_validator("ticker")
    @classmethod
    def ticker_to_upper(cls, v: str) -> str:
        return v.upper()


class HoldingResponse(BaseModel):
    id: str
    ticker: str
    shares: float
    avg_cost: float
    added_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PortfolioCreate(BaseModel):
    name: str = Field(min_length=1)


class PortfolioResponse(BaseModel):
    id: str
    name: str
    holdings: list[HoldingResponse]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
