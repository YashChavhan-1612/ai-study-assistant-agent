"""Security utilities – input sanitisation and safe error responses."""
import re
from typing import Any


def sanitize_text(text: str, max_length: int = 8000) -> str:
    """Strip null bytes and truncate to max_length."""
    text = text.replace("\x00", "")
    return text[:max_length]


def safe_error(detail: str) -> dict[str, Any]:
    """Return a JSON-safe error payload that never leaks secrets."""
    return {"detail": detail}
