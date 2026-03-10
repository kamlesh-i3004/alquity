import uuid
from datetime import datetime
from typing import Generator

from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session

from app.config import settings

# ── Engine & Session ──────────────────────────────────────────────────────────
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ── Dependency ────────────────────────────────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── ORM Models ────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: str = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password: str = Column(String(255), nullable=False)
    full_name: str = Column(String(255), nullable=True)
    is_active: bool = Column(Boolean, default=True, nullable=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: str = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name: str = Column(String(255), nullable=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="portfolios")
    holdings = relationship("PortfolioHolding", back_populates="portfolio", cascade="all, delete-orphan")


class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"

    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    portfolio_id: str = Column(String(36), ForeignKey("portfolios.id"), nullable=False, index=True)
    ticker: str = Column(String(20), nullable=False)
    shares: float = Column(Float, nullable=False)
    avg_cost: float = Column(Float, nullable=False)
    added_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)

    portfolio = relationship("Portfolio", back_populates="holdings")


class PredictionCache(Base):
    __tablename__ = "prediction_cache"

    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticker: str = Column(String(20), nullable=False, index=True)
    model_type: str = Column(String(50), nullable=False)
    predicted_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    prediction_json: str = Column(Text, nullable=False)
    expires_at: datetime = Column(DateTime, nullable=False)
