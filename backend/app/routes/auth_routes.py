"""
Authentication routes for AI-QUITY backend.
Handles user registration, login, OAuth, and current-user retrieval.
"""
import secrets
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.database import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse, UserUpdateRequest, PasswordChangeRequest
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.exceptions import AuthenticationException, ValidationException, NotFoundException
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegister, db: Session = Depends(get_db)) -> UserResponse:
    """
    Register a new user.

    Args:
        req: Registration payload containing name, email and password.
        db: Database session.

    Returns:
        The newly created user as a ``UserResponse``.

    Raises:
        ValidationException: If the email address is already taken.
    """
    try:
        existing = db.query(User).filter(User.email == req.email).first()
        if existing:
            logger.warning("Registration failed — email already in use: %s", req.email)
            raise ValidationException(f"Email '{req.email}' is already registered.")

        user = User(
            email=req.email,
            full_name=req.full_name,
            hashed_password=get_password_hash(req.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("New user registered: id=%s email=%s", user.id, user.email)
        return UserResponse.model_validate(user)
    except (ValidationException, AuthenticationException):
        raise
    except Exception as exc:
        logger.error("Unexpected error during registration: %s", exc, exc_info=True)
        raise


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(req: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    """
    Authenticate a user and return a JWT access token.

    Args:
        req: Login payload containing email and password.
        db: Database session.

    Returns:
        A ``TokenResponse`` with the access token and token type.

    Raises:
        AuthenticationException: If credentials are invalid.
    """
    try:
        user = db.query(User).filter(User.email == req.email).first()
        if not user or not verify_password(req.password, user.hashed_password):
            logger.warning("Failed login attempt for email: %s", req.email)
            raise AuthenticationException("Invalid email or password.")

        token = create_access_token(subject=str(user.id))
        logger.info("User logged in: id=%s email=%s", user.id, user.email)
        return TokenResponse(access_token=token, token_type="bearer")
    except (AuthenticationException, ValidationException):
        raise
    except Exception as exc:
        logger.error("Unexpected error during login: %s", exc, exc_info=True)
        raise


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """
    Return the profile of the currently authenticated user.

    Args:
        current_user: Injected from the Bearer token via ``get_current_user``.

    Returns:
        The authenticated user as a ``UserResponse``.
    """
    logger.info("GET /auth/me for user id=%s", current_user.id)
    return UserResponse.model_validate(current_user)


@router.post("/oauth", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def oauth_login(
    provider: str = Query(..., description="OAuth provider (google, github)"),
    name: str = Query(..., description="User display name"),
    email: str = Query(..., description="User email address"),
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Find or create a user via OAuth and return a JWT access token.

    Args:
        provider: The OAuth provider name (google, github).
        name: The display name returned by the provider.
        email: The email address returned by the provider.
        db: Database session.

    Returns:
        A ``TokenResponse`` with the access token and token type.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Generate a short random password for OAuth users (bcrypt has 72-byte limit)
        user = User(
            email=email,
            full_name=name,
            hashed_password=get_password_hash(secrets.token_hex(16)),  # 32 chars, well under limit
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("OAuth user created: id=%s email=%s provider=%s", user.id, user.email, provider)
    else:
        logger.info("OAuth user found: id=%s email=%s provider=%s", user.id, user.email, provider)

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, token_type="bearer")


@router.patch("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_profile(
    body: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Update the current user's profile (name only for now)."""
    if body.full_name is not None:
        current_user.full_name = body.full_name
    db.commit()
    db.refresh(current_user)
    logger.info("Profile updated for user id=%s", current_user.id)
    return UserResponse.model_validate(current_user)


@router.put("/password", status_code=status.HTTP_200_OK)
def change_password(
    body: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change the current user's password."""
    if not verify_password(body.current_password, current_user.hashed_password):
        raise AuthenticationException("Current password is incorrect.")
    current_user.hashed_password = get_password_hash(body.new_password)
    db.commit()
    logger.info("Password changed for user id=%s", current_user.id)
    return {"message": "Password updated successfully."}


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Permanently delete the current user's account and all associated data."""
    db.delete(current_user)
    db.commit()
    logger.info("Account deleted for user id=%s", current_user.id)


# ---------------------------------------------------------------------------
# Admin/User Management Endpoints
# ---------------------------------------------------------------------------

@router.patch("/users/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_user_by_id(
    user_id: str,
    body: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Update a user's profile by user ID.
    
    - **Authorization**: Only the user themselves or an admin can update.
    - **Fields updatable**: full_name
    
    To update other fields like email or password, use the specific endpoints.
    
    Example - Update user's full name:
        PATCH /api/v1/auth/users/{user_id}
        Body: {"full_name": "John Doe"}
    
    Example - Update using Python:
        ```python
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine("sqlite:///./aiquity.db")
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        user = db.query(User).filter(User.id == "user-id-here").first()
        user.full_name = "New Name"
        user.email = "new@email.com"
        db.commit()
        ```
    """
    # Check if user has permission (only the user themselves can update)
    if current_user.id != user_id:
        logger.warning("User %s attempted to update profile of user %s", current_user.id, user_id)
        raise AuthenticationException("You can only update your own profile.")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException(f"User with id '{user_id}' not found.")
    
    # Update only provided fields
    if body.full_name is not None:
        user.full_name = body.full_name
    
    db.commit()
    db.refresh(user)
    logger.info("User %s updated their profile", user_id)
    return UserResponse.model_validate(user)


@router.put("/users/{user_id}/email", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_user_email(
    user_id: str,
    body: dict,  # {"email": "new@email.com"}
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Update a user's email address.
    
    Example:
        PUT /api/v1/auth/users/{user_id}/email
        Body: {"email": "newemail@example.com"}
    """
    if current_user.id != user_id:
        raise AuthenticationException("You can only update your own email.")
    
    new_email = body.get("email")
    if not new_email:
        raise ValidationException("Email is required.")
    
    # Check if email is already taken
    existing = db.query(User).filter(User.email == new_email, User.id != user_id).first()
    if existing:
        raise ValidationException(f"Email '{new_email}' is already in use.")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException(f"User with id '{user_id}' not found.")
    
    user.email = new_email
    db.commit()
    db.refresh(user)
    logger.info("User %s updated their email to %s", user_id, new_email)
    return UserResponse.model_validate(user)
