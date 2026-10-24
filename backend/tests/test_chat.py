from unittest.mock import patch


def test_chat_missing_message(client):
    resp = client.post("/api/chat", json={})
    assert resp.status_code == 422


def test_chat_empty_message(client):
    resp = client.post("/api/chat", json={"message": ""})
    assert resp.status_code == 422


def test_chat_message_too_long(client):
    resp = client.post("/api/chat", json={"message": "x" * 5000})
    assert resp.status_code == 422


def test_chat_success(client):
    with patch("app.services.gemini_service.chat", return_value="Paris is the capital of France."):
        resp = client.post("/api/chat", json={"message": "What is the capital of France?"})
    assert resp.status_code == 200
    data = resp.json()
    assert "reply" in data
    assert "Paris" in data["reply"]


def test_chat_no_api_key_in_response(client):
    with patch("app.services.gemini_service.chat", return_value="A helpful answer."):
        resp = client.post("/api/chat", json={"message": "Hello"})
    assert resp.status_code == 200
    body = resp.text
    assert "GEMINI_API_KEY" not in body
    assert "AIza" not in body


def test_chat_with_history(client):
    with patch("app.services.gemini_service.chat", return_value="Follow-up answer."):
        resp = client.post("/api/chat", json={
            "message": "Follow up question",
            "history": [
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi there!"}
            ]
        })
    assert resp.status_code == 200
