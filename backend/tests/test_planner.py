from unittest.mock import patch
from datetime import date, timedelta


def get_future_date(days=30):
    return (date.today() + timedelta(days=days)).strftime("%Y-%m-%d")


def test_planner_missing_fields(client):
    resp = client.post("/api/planner/generate", json={"subjects": ["Math"]})
    assert resp.status_code == 422


def test_planner_past_date(client):
    resp = client.post("/api/planner/generate", json={
        "subjects": ["Math"],
        "exam_date": "2020-01-01",
        "hours_per_day": 4
    })
    assert resp.status_code == 422


def test_planner_invalid_date_format(client):
    resp = client.post("/api/planner/generate", json={
        "subjects": ["Math"],
        "exam_date": "not-a-date",
        "hours_per_day": 4
    })
    assert resp.status_code == 422


def test_planner_success(client):
    with patch("app.services.gemini_service.generate_plan", return_value="# Study Plan\n\nDay 1: Math"):
        resp = client.post("/api/planner/generate", json={
            "subjects": ["Math", "Physics"],
            "exam_date": get_future_date(30),
            "hours_per_day": 4,
            "topics": "Algebra, Mechanics"
        })
    assert resp.status_code == 200
    data = resp.json()
    assert "plan" in data
