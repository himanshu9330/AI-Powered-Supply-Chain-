from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "supply-chain-ml-service",
        "timestamp": datetime.utcnow().isoformat(),
        "models": ["xgboost", "random_forest", "arima"],
    }
