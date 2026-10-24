from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.agent_service import agent

router = APIRouter(prefix="/api")


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    history = [m.model_dump() for m in (request.history or [])]
    reply = agent.answer_question(request.message, history)
    return ChatResponse(reply=reply)
