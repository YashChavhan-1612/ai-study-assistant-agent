import io
from unittest.mock import patch


def make_pdf_bytes():
    """Return a minimal valid PDF byte string."""
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n"
        b"xref\n0 4\n0000000000 65535 f\n"
        b"trailer\n<< /Root 1 0 R /Size 4 >>\nstartxref\n0\n%%EOF"
    )


def test_upload_non_pdf(client):
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("test.txt", b"hello world", "text/plain")}
    )
    assert resp.status_code == 400


def test_upload_file_too_large(client):
    big_pdf = b"%PDF-1.4 " + b"x" * (11 * 1024 * 1024)
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("big.pdf", big_pdf, "application/pdf")}
    )
    assert resp.status_code == 413


def test_upload_valid_pdf(client):
    with patch("app.api.documents.extract_text_from_pdf", return_value=["chunk1", "chunk2"]):
        resp = client.post(
            "/api/documents/upload",
            files={"file": ("test.pdf", make_pdf_bytes(), "application/pdf")}
        )
    assert resp.status_code == 200
    data = resp.json()
    assert "doc_id" in data
    assert data["chunks"] == 2


def test_ask_unknown_doc(client):
    resp = client.post("/api/documents/ask", json={
        "doc_id": "nonexistent123",
        "question": "What is this about?"
    })
    assert resp.status_code == 404


def test_ask_empty_question(client):
    resp = client.post("/api/documents/ask", json={
        "doc_id": "somedocid",
        "question": "ab"
    })
    assert resp.status_code == 422
