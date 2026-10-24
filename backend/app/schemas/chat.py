from pydantic import BaseModel, Field
from typing import Optional, List


class Message(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: Optional[List[Message]] = Field(default=[], max_length=20)


class ChatResponse(BaseModel):
    reply: str
    tokens_used: Optional[int] = None
