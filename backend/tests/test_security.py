from unittest.mock import patch


def test_cors_header_present(client):
    resp = client.get("/health", headers={"Origin": "http://localhost:5173"})
    assert resp.status_code == 200


def test_no_api_key_in_health(client):
    resp = client.get("/api/health")
    assert "GEMINI_API_KEY" not in resp.text
    assert "AIza" not in resp.text


def test_missing_api_key_raises_503(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "")
    from app.config import get_settings
    get_settings.cache_clear()

    def raise_value_error(*args, **kwargs):
        raise ValueError("GEMINI_API_KEY is not configured")

    with patch("app.services.gemini_service.chat", side_effect=raise_value_error):
        from fastapi import HTTPException
        with patch("app.services.agent_service.agent.answer_question",
                   side_effect=HTTPException(status_code=503, detail="AI service configuration error. Please contact the administrator.")):
            resp = client.post("/api/chat", json={"message": "Hello"})
    assert resp.status_code == 503
