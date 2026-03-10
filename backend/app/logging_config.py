import logging

from app.config import settings

_LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

_NOISY_LOGGERS = [
    "uvicorn.access",
    "httpx",
    "httpcore",
    "multipart",
    "passlib",
]


def setup_logging() -> None:
    """Configure root logger and silence noisy third-party loggers."""
    level = logging.DEBUG if settings.DEBUG else logging.INFO

    logging.basicConfig(
        level=level,
        format=_LOG_FORMAT,
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Ensure root logger level is set
    logging.getLogger().setLevel(level)

    # Silence noisy third-party loggers
    for name in _NOISY_LOGGERS:
        logging.getLogger(name).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger. Call setup_logging() once at startup first."""
    return logging.getLogger(name)
