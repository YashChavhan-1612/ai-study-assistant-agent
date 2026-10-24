import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


@pytest.fixture
def mock_settings(monkeypatch):
    """Patch settings so tests never need a real API key."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-123")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-1.5-flash")
    monkeypatch.setenv("FRONTEND_ORIGIN", "http://localhost:5173")


@pytest.fixture
def client(mock_settings):
    # Clear settings cache so patched env vars are picked up
    from app.config import get_settings
    get_settings.cache_clear()
    from app.main import app
    return TestClient(app)
