from fastapi import APIRouter, HTTPException
from datetime import datetime, date
from app.schemas.planner import PlannerRequest, PlannerResponse
from app.services.agent_service import agent

router = APIRouter(prefix="/api/planner")


@router.post("/generate", response_model=PlannerResponse)
async def generate_plan(request: PlannerRequest):
    # Basic date validation
    try:
        exam_dt = datetime.strptime(request.exam_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=422, detail="exam_date must be in YYYY-MM-DD format")

    if exam_dt < date.today():
        raise HTTPException(status_code=422, detail="exam_date must be in the future")

    plan = agent.create_study_plan(
        request.subjects, request.exam_date, request.hours_per_day, request.topics or ""
    )
    return PlannerResponse(plan=plan, subjects=request.subjects, exam_date=request.exam_date)
