from unittest.mock import patch


SAMPLE_QUIZ = [
    {
        "id": 1,
        "question": "What is 2+2?",
        "options": [
            {"key": "A", "text": "3"},
            {"key": "B", "text": "4"},
            {"key": "C", "text": "5"},
            {"key": "D", "text": "6"},
        ],
        "correct_key": "B",
        "explanation": "2+2 equals 4."
    },
    {
        "id": 2,
        "question": "What is 3+3?",
        "options": [
            {"key": "A", "text": "5"},
            {"key": "B", "text": "6"},
            {"key": "C", "text": "7"},
            {"key": "D", "text": "8"},
        ],
        "correct_key": "B",
        "explanation": "3+3 equals 6."
    },
]


def test_quiz_missing_fields(client):
    resp = client.post("/api/quizzes/generate", json={"topic": "Math"})
    assert resp.status_code == 422


def test_quiz_too_many_questions(client):
    resp = client.post("/api/quizzes/generate", json={
        "topic": "Math", "subject": "Mathematics", "num_questions": 15
    })
    assert resp.status_code == 422


def test_quiz_success(client):
    with patch("app.services.gemini_service.generate_quiz", return_value=SAMPLE_QUIZ):
        resp = client.post("/api/quizzes/generate", json={
            "topic": "Math", "subject": "Mathematics", "num_questions": 2
        })
    assert resp.status_code == 200
    data = resp.json()
    assert "questions" in data
    assert len(data["questions"]) == 2
    assert data["questions"][0]["correct_key"] == "B"
