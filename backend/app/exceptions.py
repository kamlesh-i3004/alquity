from typing import Any, Optional


class AppException(Exception):
    """Base exception for all application errors."""

    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"

    def __init__(
        self,
        detail: str = "An unexpected error occurred.",
        status_code: Optional[int] = None,
        error_code: Optional[str] = None,
    ) -> None:
        self.detail = detail
        if status_code is not None:
            self.status_code = status_code
        if error_code is not None:
            self.error_code = error_code
        super().__init__(self.detail)


class NotFoundException(AppException):
    status_code = 404
    error_code = "NOT_FOUND"

    def __init__(self, detail: str = "Resource not found.", **kwargs: Any) -> None:
        super().__init__(detail=detail, **kwargs)


class AuthenticationException(AppException):
    status_code = 401
    error_code = "AUTHENTICATION_FAILED"

    def __init__(self, detail: str = "Authentication failed.", **kwargs: Any) -> None:
        super().__init__(detail=detail, **kwargs)


class AuthorizationException(AppException):
    status_code = 403
    error_code = "FORBIDDEN"

    def __init__(self, detail: str = "You do not have permission to perform this action.", **kwargs: Any) -> None:
        super().__init__(detail=detail, **kwargs)


class ValidationException(AppException):
    status_code = 422
    error_code = "VALIDATION_ERROR"

    def __init__(self, detail: str = "Validation error.", **kwargs: Any) -> None:
        super().__init__(detail=detail, **kwargs)


class ExternalServiceException(AppException):
    status_code = 502
    error_code = "EXTERNAL_SERVICE_ERROR"

    def __init__(self, detail: str = "An external service returned an error.", **kwargs: Any) -> None:
        super().__init__(detail=detail, **kwargs)


class RateLimitException(AppException):
    status_code = 429
    error_code = "RATE_LIMIT_EXCEEDED"

    def __init__(self, detail: str = "Rate limit exceeded. Please try again later.", **kwargs: Any) -> None:
        super().__init__(detail=detail, **kwargs)
