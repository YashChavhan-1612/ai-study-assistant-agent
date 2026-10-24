from fastapi import APIRouter
from app.schemas.notes import NotesRequest, NotesResponse
from app.services.agent_service import agent

router = APIRouter(prefix="/api/notes")


@router.post("/generate", response_model=NotesResponse)
async def generate_notes(request: NotesRequest):
    notes = agent.create_notes(
        request.topic, request.subject, request.difficulty, request.length
    )
    return NotesResponse(notes=notes, topic=request.topic, subject=request.subject)
