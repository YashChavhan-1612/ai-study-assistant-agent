from fastapi import APIRouter, HTTPException
from app.schemas.quiz import QuizRequest, QuizResponse, QuizQuestion, QuizOption
from app.services.agent_service import agent

router = APIRouter(prefix="/api/quizzes")


@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    try:
        questions_raw = agent.create_quiz(request.topic, request.subject, request.num_questions)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=f"Quiz generation error: {exc}")

    questions = [
        QuizQuestion(
            id=q["id"],
            question=q["question"],
            options=[QuizOption(key=o["key"], text=o["text"]) for o in q["options"]],
            correct_key=q["correct_key"],
            explanation=q["explanation"],
        )
        for q in questions_raw
    ]
    return QuizResponse(questions=questions, topic=request.topic, subject=request.subject)
