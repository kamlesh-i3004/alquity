"""
Central dependency injection module for AI-QUITY backend.
"""
from typing import Optional

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, User
from app.exceptions import AuthenticationException

# Re-export get_db for convenience
__all__ = ["get_db", "get_current_user", "get_optional_user"]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def _get_user_from_token(token: str, db: Session) -> User:
    """Decode JWT and fetch the corresponding User from the database."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise AuthenticationException("Token payload missing subject.")
    except JWTError:
        raise AuthenticationException("Could not validate credentials.")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise AuthenticationException("User not found.")
    if not user.is_active:
        raise AuthenticationException("User account is inactive.")
    return user


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Require a valid Bearer token and return the authenticated User."""
    if token is None:
        raise AuthenticationException("Not authenticated.")
    return _get_user_from_token(token, db)


async def get_optional_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Return the authenticated User if a valid token is present, else None."""
    if token is None:
        return None
    try:
        return _get_user_from_token(token, db)
    except AuthenticationException:
        return None
