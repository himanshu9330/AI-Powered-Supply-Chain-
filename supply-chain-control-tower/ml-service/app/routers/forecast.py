from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.schemas.forecast_schemas import (
    ForecastRequest, ForecastResponse, TrainRequest, TrainResponse,
    MetricsResponse, FeatureImportanceResponse, AnomalyDetectionRequest,
    AnomalyDetectionResponse, ForecastComparisonResponse, ForecastComparisonItem,
    ModelRegistryResponse, ModelRegistryEntry, AutoRetrainRequest
)
from app.services.forecasting import (
    XGBoostForecaster, RandomForestForecaster, ARIMAForecaster,
    EnsembleForecaster, AnomalyDetector, ModelRegistryManager
)
import os, joblib

router = APIRouter()

MODELS_DIR = os.environ.get("MODELS_DIR", os.path.join(os.path.dirname(__file__), "..", "models"))

def get_forecaster(model_type: str, product_id: str):
    if model_type == "xgboost":
        return XGBoostForecaster(product_id)
    elif model_type == "random_forest":
        return RandomForestForecaster(product_id)
    elif model_type == "arima":
        return ARIMAForecaster(product_id)
    elif model_type == "ensemble":
        return EnsembleForecaster(product_id)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown model type: {model_type}")


@router.post("/forecast", response_model=ForecastResponse)
async def forecast_inventory(request: ForecastRequest):
    """
    Generate an inventory demand forecast for a product (XGBoost, Random Forest, ARIMA, or Ensemble).
    """
    if len(request.history) < 10:
        raise HTTPException(status_code=400, detail="Need at least 10 historical data points for forecasting")

    history = [{"date": str(p.date), "quantity": p.quantity} for p in request.history]
    forecaster = get_forecaster(request.model_type, request.product_id)

    try:
        predictions, metrics = forecaster.predict(history, request.horizon_days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting failed: {str(e)}")

    predicted_total = sum(p["predicted_quantity"] for p in predictions)
    lower_sum = sum(p["confidence_lower"] for p in predictions)
    upper_sum = sum(p["confidence_upper"] for p in predictions)

    return ForecastResponse(
        product_id=request.product_id,
        model_type=request.model_type,
        horizon_days=request.horizon_days,
        predicted_total=round(predicted_total, 2),
        confidence_lower=round(lower_sum, 2),
        confidence_upper=round(upper_sum, 2),
        mae=metrics.get("mae"),
        rmse=metrics.get("rmse"),
        mape=metrics.get("mape"),
        predictions=predictions,
    )


@router.post("/train", response_model=TrainResponse)
async def train_model(request: TrainRequest):
    """
    Retrain a forecasting model with fresh historical data.
    """
    if len(request.history) < 20:
        raise HTTPException(status_code=400, detail="Need at least 20 data points to train")

    history = [{"date": str(p.date), "quantity": p.quantity} for p in request.history]

    if request.model_type == "all":
        xgb = XGBoostForecaster(request.product_id).train(history)
        rf = RandomForestForecaster(request.product_id).train(history)
        arima = ARIMAForecaster(request.product_id).train(history)
        return TrainResponse(
            success=True,
            model_type="all",
            product_id=request.product_id,
            message=f"All models (XGB, RF, ARIMA) retrained successfully for product {request.product_id}",
            metrics={"xgb": xgb, "rf": rf, "arima": arima}
        )

    forecaster = get_forecaster(request.model_type, request.product_id)
    try:
        metrics = forecaster.train(history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

    return TrainResponse(
        success=True,
        model_type=request.model_type,
        product_id=request.product_id,
        message=f"{request.model_type} model trained successfully for product {request.product_id}",
        metrics=metrics,
    )


@router.post("/autotrain")
async def auto_retrain_all(request: AutoRetrainRequest):
    """
    Automatic retraining pipeline across all specified products.
    """
    results = {}
    for pid, hist in request.products_history.items():
        if len(hist) >= 20:
            history = [{"date": str(p.date), "quantity": p.quantity} for p in hist]
            ens = EnsembleForecaster(pid)
            metrics = ens.train(history)
            results[pid] = metrics

    return {"status": "completed", "products_trained": len(results), "metrics": results}


@router.post("/anomalies", response_model=AnomalyDetectionResponse)
async def detect_anomalies(request: AnomalyDetectionRequest):
    """
    Identify demand spikes or supply anomalies using Z-score outlier detection.
    """
    history = [{"date": str(p.date), "quantity": p.quantity} for p in request.history]
    result = AnomalyDetector.detect(request.product_id, history, request.sensitivity)
    return AnomalyDetectionResponse(**result)


@router.post("/compare", response_model=ForecastComparisonResponse)
async def compare_forecasts(request: ForecastRequest):
    """
    Compare XGBoost, Random Forest, ARIMA, and Ensemble models side-by-side.
    """
    if len(request.history) < 10:
        raise HTTPException(status_code=400, detail="Need at least 10 historical data points for forecasting")

    history = [{"date": str(p.date), "quantity": p.quantity} for p in request.history]
    models = ["xgboost", "random_forest", "arima", "ensemble"]
    comparison_items = []
    best_model = "ensemble"
    lowest_rmse = float("inf")

    for m in models:
        fc = get_forecaster(m, request.product_id)
        preds, metrics = fc.predict(history, request.horizon_days)
        pred_total = sum(p["predicted_quantity"] for p in preds)
        rmse = metrics.get("rmse", float("inf"))
        if rmse < lowest_rmse:
            lowest_rmse = rmse
            best_model = m

        comparison_items.append(ForecastComparisonItem(
            model_type=m,
            predicted_total=round(pred_total, 2),
            mae=metrics.get("mae"),
            rmse=metrics.get("rmse"),
            mape=metrics.get("mape"),
            predictions=preds
        ))

    return ForecastComparisonResponse(
        product_id=request.product_id,
        horizon_days=request.horizon_days,
        models=comparison_items,
        best_model=best_model
    )


@router.get("/registry", response_model=ModelRegistryResponse)
async def get_model_registry():
    """
    Returns list of all active models, trained timestamp, and metrics.
    """
    models = ModelRegistryManager.list_models()
    return ModelRegistryResponse(models=[ModelRegistryEntry(**m) for m in models])


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics(
    model_type: str = Query(default="xgboost"),
    product_id: str = Query(...),
):
    """Return stored model accuracy metrics."""
    model_prefix = {"xgboost": "xgb", "random_forest": "rf", "arima": "arima"}.get(model_type, model_type)
    model_path = os.path.join(MODELS_DIR, f"{model_prefix}_{product_id}.pkl")

    if not os.path.exists(model_path):
        return MetricsResponse(model_type=model_type, is_trained=False)

    saved = joblib.load(model_path)
    m = saved.get("metrics", {})
    return MetricsResponse(
        model_type=model_type,
        mae=m.get("mae"),
        rmse=m.get("rmse"),
        mape=m.get("mape"),
        is_trained=True,
    )


@router.get("/feature-importance", response_model=FeatureImportanceResponse)
async def get_feature_importance(
    model_type: str = Query(default="xgboost"),
    product_id: str = Query(...),
):
    """Return feature importance from tree-based models."""
    if model_type in ["arima", "ensemble"]:
        raise HTTPException(status_code=400, detail=f"{model_type} does not have standard single feature importance")

    forecaster = get_forecaster(model_type, product_id)
    features = forecaster.get_feature_importance()
    return FeatureImportanceResponse(model_type=model_type, features=features)
