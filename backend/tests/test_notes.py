from unittest.mock import patch


def test_notes_missing_fields(client):
    resp = client.post("/api/notes/generate", json={"topic": "Newton's Laws"})
    assert resp.status_code == 422


def test_notes_topic_too_short(client):
    resp = client.post("/api/notes/generate", json={"topic": "A", "subject": "Physics"})
    assert resp.status_code == 422


def test_notes_success(client):
    with patch("app.services.gemini_service.generate_notes", return_value="# Newton's Laws\n\nContent here."):
        resp = client.post("/api/notes/generate", json={
            "topic": "Newton's Laws",
            "subject": "Physics",
            "difficulty": "intermediate",
            "length": "standard"
        })
    assert resp.status_code == 200
    data = resp.json()
    assert "notes" in data
    assert data["topic"] == "Newton's Laws"


def test_notes_invalid_difficulty(client):
    resp = client.post("/api/notes/generate", json={
        "topic": "Newton's Laws",
        "subject": "Physics",
        "difficulty": "expert"
    })
    assert resp.status_code == 422
