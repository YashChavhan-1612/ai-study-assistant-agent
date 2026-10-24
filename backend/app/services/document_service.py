"""Secure PDF extraction and retrieval service."""
import io
import logging
from typing import List

logger = logging.getLogger(__name__)

MAX_CHARS_PER_CHUNK = 1500
MAX_CHUNKS = 20


def extract_text_from_pdf(pdf_bytes: bytes) -> List[str]:
    """
    Extract text from a PDF and return a list of text chunks.
    Raises ValueError for malformed or unreadable PDFs.
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise RuntimeError("PyMuPDF (fitz) is not installed.")

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as exc:
        raise ValueError(f"Could not open PDF: {exc}") from exc

    full_text_parts = []
    for page_num in range(len(doc)):
        try:
            page = doc.load_page(page_num)
            text = page.get_text()
            if text.strip():
                full_text_parts.append(text.strip())
        except Exception:
            logger.warning("Failed to extract text from page %d", page_num)
            continue

    doc.close()

    if not full_text_parts:
        raise ValueError(
            "No readable text found in this PDF. "
            "It may be a scanned image PDF. Please upload a text-based PDF."
        )

    full_text = "\n\n".join(full_text_parts)
    chunks = _chunk_text(full_text, MAX_CHARS_PER_CHUNK)
    return chunks[:MAX_CHUNKS]


def retrieve_relevant_chunks(question: str, chunks: List[str], top_k: int = 5) -> List[str]:
    """
    Simple keyword-based retrieval: score each chunk by keyword overlap
    with the question and return the top_k most relevant chunks.
    """
    question_words = set(question.lower().split())
    scored = []
    for chunk in chunks:
        chunk_words = set(chunk.lower().split())
        score = len(question_words & chunk_words)
        scored.append((score, chunk))

    scored.sort(key=lambda x: -x[0])
    # Always include first chunk (often contains title/intro)
    top = [c for _, c in scored[:top_k]]
    if chunks and chunks[0] not in top:
        top = [chunks[0]] + top[: top_k - 1]
    return top


def _chunk_text(text: str, chunk_size: int) -> List[str]:
    """Split text into chunks of approximately chunk_size characters at paragraph boundaries."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current = ""
    for para in paragraphs:
        if len(current) + len(para) + 2 <= chunk_size:
            current = (current + "\n\n" + para).strip()
        else:
            if current:
                chunks.append(current)
            if len(para) > chunk_size:
                # Hard-split long paragraphs
                for i in range(0, len(para), chunk_size):
                    chunks.append(para[i : i + chunk_size])
                current = ""
            else:
                current = para
    if current:
        chunks.append(current)
    return chunks
