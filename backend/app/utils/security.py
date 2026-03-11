"""
Security utilities for AI-QUITY backend.
Provides password hashing and JWT token creation/decoding.
"""
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import jwt

from app.config import settings
from app.logging_config import get_logger

logger = get_logger(__name__)


def get_password_hash(password: str) -> str:
    """Hash a plain-text password using bcrypt.
    
    Bcrypt has a 72-byte limit, so we truncate longer passwords.
    """
    # Bcrypt truncates at 72 bytes, so we limit the password length
    password_bytes = password.encode('utf-8')[:72]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against a bcrypt hash.
    
    Bcrypt has a 72-byte limit, so we truncate longer passwords for verification.
    """
    # Apply same truncation as hashing for consistent verification
    password_bytes = plain.encode('utf-8')[:72]
    try:
        return bcrypt.checkpw(password_bytes, hashed.encode('utf-8'))
    except Exception:
        return False


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        subject: The user UUID (stored in the ``sub`` claim).
        expires_delta: Optional custom expiry duration.

    Returns:
        Encoded JWT string.
    """
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {"sub": str(subject), "exp": expire}
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.debug("Access token created for subject=%s exp=%s", subject, expire)
    return token
