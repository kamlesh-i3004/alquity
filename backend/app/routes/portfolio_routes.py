import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.deps import get_db, get_current_user
from app.database import User, Portfolio, PortfolioHolding
from app.schemas.portfolio import PortfolioCreate, PortfolioResponse, HoldingCreate, HoldingResponse
from app.exceptions import NotFoundException, AuthorizationException
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("", response_model=list[PortfolioResponse], summary="List portfolios")
def list_portfolios(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all portfolios for the authenticated user."""
    try:
        portfolios = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
        logger.info("Listing %d portfolios for user %s", len(portfolios), current_user.id)
        return portfolios
    except Exception as exc:
        logger.error("Failed to list portfolios for user %s: %s", current_user.id, exc)
        raise


@router.post("", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED, summary="Create portfolio")
def create_portfolio(
    body: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new portfolio for the authenticated user."""
    try:
        portfolio = Portfolio(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            name=body.name,
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        logger.info("Created portfolio %s for user %s", portfolio.id, current_user.id)
        return portfolio
    except Exception as exc:
        db.rollback()
        logger.error("Failed to create portfolio for user %s: %s", current_user.id, exc)
        raise


@router.get("/{portfolio_id}", response_model=PortfolioResponse, summary="Get portfolio")
def get_portfolio(
    portfolio_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single portfolio with its holdings. Verifies ownership."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise NotFoundException(f"Portfolio {portfolio_id} not found.")
    if portfolio.user_id != current_user.id:
        raise AuthorizationException("You do not own this portfolio.")
    return portfolio


@router.post(
    "/{portfolio_id}/holdings",
    response_model=HoldingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add holding",
)
def add_holding(
    portfolio_id: str,
    body: HoldingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a holding to a portfolio. Verifies ownership."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise NotFoundException(f"Portfolio {portfolio_id} not found.")
    if portfolio.user_id != current_user.id:
        raise AuthorizationException("You do not own this portfolio.")

    try:
        holding = PortfolioHolding(
            id=str(uuid.uuid4()),
            portfolio_id=portfolio_id,
            ticker=body.ticker,
            shares=body.shares,
            avg_cost=body.avg_cost,
        )
        db.add(holding)
        db.commit()
        db.refresh(holding)
        logger.info("Added holding %s to portfolio %s", holding.id, portfolio_id)
        return holding
    except Exception as exc:
        db.rollback()
        logger.error("Failed to add holding to portfolio %s: %s", portfolio_id, exc)
        raise


@router.delete(
    "/{portfolio_id}/holdings/{holding_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove holding",
)
def remove_holding(
    portfolio_id: str,
    holding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a holding from a portfolio. Verifies ownership."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise NotFoundException(f"Portfolio {portfolio_id} not found.")
    if portfolio.user_id != current_user.id:
        raise AuthorizationException("You do not own this portfolio.")

    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id,
        PortfolioHolding.portfolio_id == portfolio_id,
    ).first()
    if not holding:
        raise NotFoundException(f"Holding {holding_id} not found in portfolio {portfolio_id}.")

    try:
        db.delete(holding)
        db.commit()
        logger.info("Removed holding %s from portfolio %s", holding_id, portfolio_id)
    except Exception as exc:
        db.rollback()
        logger.error("Failed to remove holding %s: %s", holding_id, exc)
        raise


@router.put("/{portfolio_id}", response_model=PortfolioResponse, summary="Update portfolio")
def update_portfolio(
    portfolio_id: str,
    body: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update portfolio name. Verifies ownership."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise NotFoundException(f"Portfolio {portfolio_id} not found.")
    if portfolio.user_id != current_user.id:
        raise AuthorizationException("You do not own this portfolio.")

    try:
        portfolio.name = body.name
        db.commit()
        db.refresh(portfolio)
        logger.info("Updated portfolio %s", portfolio_id)
        return portfolio
    except Exception as exc:
        db.rollback()
        logger.error("Failed to update portfolio %s: %s", portfolio_id, exc)
        raise


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete portfolio")
def delete_portfolio(
    portfolio_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a portfolio and all its holdings. Verifies ownership."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise NotFoundException(f"Portfolio {portfolio_id} not found.")
    if portfolio.user_id != current_user.id:
        raise AuthorizationException("You do not own this portfolio.")

    try:
        db.delete(portfolio)
        db.commit()
        logger.info("Deleted portfolio %s", portfolio_id)
    except Exception as exc:
        db.rollback()
        logger.error("Failed to delete portfolio %s: %s", portfolio_id, exc)
        raise


@router.patch(
    "/{portfolio_id}/holdings/{holding_id}",
    response_model=HoldingResponse,
    summary="Update holding",
)
def update_holding(
    portfolio_id: str,
    holding_id: str,
    body: HoldingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a holding's shares or avg_cost. Verifies ownership."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise NotFoundException(f"Portfolio {portfolio_id} not found.")
    if portfolio.user_id != current_user.id:
        raise AuthorizationException("You do not own this portfolio.")

    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id,
        PortfolioHolding.portfolio_id == portfolio_id,
    ).first()
    if not holding:
        raise NotFoundException(f"Holding {holding_id} not found in portfolio {portfolio_id}.")

    try:
        holding.ticker = body.ticker
        holding.shares = body.shares
        holding.avg_cost = body.avg_cost
        db.commit()
        db.refresh(holding)
        logger.info("Updated holding %s in portfolio %s", holding_id, portfolio_id)
        return holding
    except Exception as exc:
        db.rollback()
        logger.error("Failed to update holding %s: %s", holding_id, exc)
        raise
