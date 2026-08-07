from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import forecast, health

app = FastAPI(
    title="Supply Chain Control Tower — ML Service",
    description="Inventory forecasting via XGBoost, Random Forest, ARIMA, and Ensemble Models with Anomaly Detection & Model Registry",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(forecast.router, tags=["Forecasting"])

@app.on_event("startup")
async def startup_event():
    print("🤖 ML Service started. Models ready for training and inference.")
