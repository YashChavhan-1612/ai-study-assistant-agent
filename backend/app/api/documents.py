import io
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.config import get_settings
from app.services.document_service import extract_text_from_pdf, retrieve_relevant_chunks
from app.services.agent_service import agent

router = APIRouter(prefix="/api/documents")

# In-memory document store (keyed by session; resets on server restart)
_document_store: dict[str, list[str]] = {}


class AskRequest(BaseModel):
    doc_id: str = Field(..., min_length=1, max_length=64)
    question: str = Field(..., min_length=3, max_length=1000)


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    settings = get_settings()
    max_bytes = settings.max_upload_mb * 1024 * 1024

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.max_upload_mb} MB.",
        )

    try:
        chunks = extract_text_from_pdf(contents)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    import hashlib, time
    doc_id = hashlib.sha256(f"{file.filename}{time.time()}".encode()).hexdigest()[:16]
    _document_store[doc_id] = chunks

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "chunks": len(chunks),
        "message": "Document processed successfully.",
    }


@router.post("/ask")
async def ask_document(request: AskRequest):
    chunks = _document_store.get(request.doc_id)
    if not chunks:
        raise HTTPException(
            status_code=404,
            detail="Document not found. Please re-upload your PDF (uploads are temporary).",
        )

    relevant = retrieve_relevant_chunks(request.question, chunks)
    answer = agent.answer_from_document(request.question, relevant)
    return {"answer": answer, "doc_id": request.doc_id}
