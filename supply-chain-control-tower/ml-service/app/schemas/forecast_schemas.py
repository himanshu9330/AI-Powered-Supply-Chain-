from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any
from datetime import date

class HistoryPoint(BaseModel):
    date: str
    quantity: float

class ForecastRequest(BaseModel):
    product_id: str
    horizon_days: int = 30
    model_type: Literal["xgboost", "random_forest", "arima", "ensemble"] = "xgboost"
    history: List[HistoryPoint]

class TrainRequest(BaseModel):
    product_id: str
    model_type: Literal["xgboost", "random_forest", "arima", "all"] = "all"
    history: List[HistoryPoint]

class PredictionPoint(BaseModel):
    date: str
    predicted_quantity: float
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None

class ForecastResponse(BaseModel):
    product_id: str
    model_type: str
    horizon_days: int
    predicted_total: float
    confidence_lower: float
    confidence_upper: float
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None
    predictions: List[PredictionPoint]

class TrainResponse(BaseModel):
    success: bool
    model_type: str
    product_id: str
    message: str
    metrics: Optional[dict] = None

class MetricsResponse(BaseModel):
    model_type: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None
    is_trained: bool

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class FeatureImportanceResponse(BaseModel):
    model_type: str
    features: List[FeatureImportanceItem]

# --- New Models for Advanced ML Features ---

class AnomalyPoint(BaseModel):
    date: str
    quantity: float
    expected_quantity: float
    anomaly_score: float
    is_anomaly: bool
    severity: Literal["low", "medium", "high"]

class AnomalyDetectionRequest(BaseModel):
    product_id: str
    history: List[HistoryPoint]
    sensitivity: float = 2.0  # z-score threshold

class AnomalyDetectionResponse(BaseModel):
    product_id: str
    total_points: int
    anomalies_detected: int
    anomalies: List[AnomalyPoint]

class ForecastComparisonItem(BaseModel):
    model_type: str
    predicted_total: float
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None
    predictions: List[PredictionPoint]

class ForecastComparisonResponse(BaseModel):
    product_id: str
    horizon_days: int
    models: List[ForecastComparisonItem]
    best_model: str

class ModelRegistryEntry(BaseModel):
    product_id: str
    model_type: str
    trained_at: str
    metrics: Dict[str, Any]
    status: str

class ModelRegistryResponse(BaseModel):
    models: List[ModelRegistryEntry]

class AutoRetrainRequest(BaseModel):
    products_history: Dict[str, List[HistoryPoint]]
