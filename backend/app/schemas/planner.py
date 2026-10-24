from pydantic import BaseModel, Field
from typing import List, Optional


class PlannerRequest(BaseModel):
    subjects: List[str] = Field(..., min_length=1, max_length=10)
    exam_date: str = Field(..., min_length=6, max_length=20)
    hours_per_day: float = Field(..., ge=0.5, le=16)
    topics: Optional[str] = Field(default="", max_length=2000)


class PlannerResponse(BaseModel):
    plan: str
    subjects: List[str]
    exam_date: str
