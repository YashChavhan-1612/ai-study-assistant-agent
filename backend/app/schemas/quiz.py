from pydantic import BaseModel, Field
from typing import List


class QuizRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=300)
    subject: str = Field(..., min_length=2, max_length=100)
    num_questions: int = Field(default=5, ge=2, le=10)


class QuizOption(BaseModel):
    key: str
    text: str


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[QuizOption]
    correct_key: str
    explanation: str


class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    topic: str
    subject: str
