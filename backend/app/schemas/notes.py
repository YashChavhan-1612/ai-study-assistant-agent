from pydantic import BaseModel, Field
from typing import Literal


class NotesRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=300)
    subject: str = Field(..., min_length=2, max_length=100)
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    length: Literal["brief", "standard", "comprehensive"] = "standard"


class NotesResponse(BaseModel):
    notes: str
    topic: str
    subject: str
