from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health")
async def root_health():
    return {
        "status": "ok",
        "service": "AI Study Assistant Agent",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/api/health")
async def api_health():
    return {
        "status": "ok",
        "service": "AI Study Assistant Agent",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
