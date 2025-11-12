import json
import logging
import sys

from loguru import logger

from backend.config import settings


class InterceptHandler(logging.Handler):
    """Redirect standard logging records to loguru."""

    def emit(self, record: logging.LogRecord):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def _json_formatter(record: dict) -> str:
    """Serialize log messages into structured JSON."""

    def serialize(log_record: dict) -> dict:
        payload = {
            "timestamp": log_record["time"].isoformat(),
            "level": log_record["level"].name,
            "message": log_record["message"],
            "name": log_record["name"],
        }
        payload.update(log_record["extra"])
        if log_record["exception"]:
            payload["exception"] = str(log_record["exception"])
        return payload

    record["extra"]["serialized"] = json.dumps(serialize(record))
    return "{extra[serialized]}\n"


def setup_logging() -> None:
    """Configure loguru sinks and intercept stdlib logging."""

    logger.remove()
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    if settings.LOG_FORMAT.lower() == "json":
        logger.add(
            sys.stdout,
            level=settings.LOG_LEVEL.upper(),
            format=_json_formatter,
            serialize=False,
        )
    else:
        logger.add(
            sys.stdout,
            colorize=True,
            level=settings.LOG_LEVEL.upper(),
            format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
            "<level>{message}</level>",
        )

    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_logger.handlers = [InterceptHandler()]
    logging.getLogger("uvicorn.access").handlers = [InterceptHandler()]
    logging.getLogger("uvicorn.error").handlers = [InterceptHandler()]
    logger.info("Loguru logging configured.", log_format=settings.LOG_FORMAT, log_level=settings.LOG_LEVEL)
