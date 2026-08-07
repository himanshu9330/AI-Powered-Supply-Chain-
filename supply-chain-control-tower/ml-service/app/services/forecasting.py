import os
import numpy as np
import pandas as pd
import joblib
import warnings
import holidays
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
from statsmodels.tsa.arima.model import ARIMA
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple

warnings.filterwarnings('ignore')

MODELS_DIR = os.environ.get("MODELS_DIR", os.path.join(os.path.dirname(__file__), "..", "models"))
os.makedirs(MODELS_DIR, exist_ok=True)

def prepare_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add calendar and holiday features to a DataFrame with a 'date' column."""
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    df['day_of_year'] = df['date'].dt.dayofyear
    df['week_of_year'] = df['date'].dt.isocalendar().week.astype(int)
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    us_holidays = holidays.US()
    df['is_holiday'] = df['date'].apply(lambda x: int(x in us_holidays))
    return df

def add_lag_features(df: pd.DataFrame, n_lags: int = 7) -> pd.DataFrame:
    """Add lag features for the quantity column. Adapts window sizes to available data."""
    df = df.copy().sort_values('date').reset_index(drop=True)
    n = len(df)
    # Use at most n_lags or half the dataset rows, whichever is smaller
    effective_lags = min(n_lags, max(1, n // 3))
    for lag in range(1, effective_lags + 1):
        df[f'lag_{lag}'] = df['quantity'].shift(lag)
    roll7  = min(7,  max(2, n // 4))
    roll30 = min(30, max(2, n // 2))
    df['rolling_mean_7']  = df['quantity'].shift(1).rolling(roll7,  min_periods=1).mean()
    df['rolling_std_7']   = df['quantity'].shift(1).rolling(roll7,  min_periods=1).std().fillna(0)
    df['rolling_mean_30'] = df['quantity'].shift(1).rolling(roll30, min_periods=1).mean()
    df.dropna(inplace=True)
    return df

def compute_metrics(y_true, y_pred) -> Dict:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mape = np.mean(np.abs((y_true - y_pred) / np.maximum(y_true, 1))) * 100
    return {"mae": round(float(mae), 4), "rmse": round(float(rmse), 4), "mape": round(float(mape), 2)}

# ── XGBoost ──────────────────────────────────────────────────────────
class XGBoostForecaster:
    def __init__(self, product_id: str):
        self.product_id = product_id
        self.model_path = os.path.join(MODELS_DIR, f"xgb_{product_id}.pkl")
        self.model = None
        self.feature_cols = None
        self.metrics = {}

    def train(self, history: List[Dict]) -> Dict:
        df = pd.DataFrame(history)
        df = prepare_time_features(df)
        df = add_lag_features(df, n_lags=7)

        feature_cols = [c for c in df.columns if c not in ['date', 'quantity']]
        self.feature_cols = feature_cols
        X = df[feature_cols]
        y = df['quantity']

        # Use at least 2 test rows; fallback to in-sample eval when dataset is very small
        test_size = max(2, int(len(X) * 0.2))
        if len(X) <= test_size + 2:
            # Dataset too small to split — train on all, evaluate in-sample
            self.model = xgb.XGBRegressor(
                n_estimators=100, max_depth=4, learning_rate=0.1,
                subsample=0.9, colsample_bytree=0.9, random_state=42
            )
            self.model.fit(X, y, verbose=False)
            self.metrics = compute_metrics(y.values, self.model.predict(X))
        else:
            X_train, X_test = X.iloc[:-test_size], X.iloc[-test_size:]
            y_train, y_test = y.iloc[:-test_size], y.iloc[-test_size:]
            self.model = xgb.XGBRegressor(
                n_estimators=200, max_depth=6, learning_rate=0.05,
                subsample=0.8, colsample_bytree=0.8, random_state=42
            )
            self.model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
            self.metrics = compute_metrics(y_test.values, self.model.predict(X_test))

        joblib.dump({"model": self.model, "feature_cols": feature_cols, "metrics": self.metrics, "trained_at": datetime.now().isoformat()}, self.model_path)
        return self.metrics

    def predict(self, history: List[Dict], horizon_days: int = 30) -> Tuple[List[Dict], Dict]:
        if os.path.exists(self.model_path):
            saved = joblib.load(self.model_path)
            self.model = saved["model"]
            self.feature_cols = saved["feature_cols"]
            self.metrics = saved.get("metrics", {})
        else:
            self.metrics = self.train(history)

        df = pd.DataFrame(history).copy()
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        df = prepare_time_features(df)

        predictions = []
        last_date = df['date'].max()

        for i in range(horizon_days):
            next_date = last_date + timedelta(days=i + 1)
            row = pd.DataFrame([{'date': next_date, 'quantity': 0}])
            row = prepare_time_features(row)
            for lag in range(1, 8):
                if len(df) >= lag:
                    row[f'lag_{lag}'] = df['quantity'].iloc[-lag]
                else:
                    row[f'lag_{lag}'] = 0
            row['rolling_mean_7'] = df['quantity'].iloc[-7:].mean() if len(df) >= 7 else df['quantity'].mean()
            row['rolling_std_7'] = df['quantity'].iloc[-7:].std() if len(df) >= 7 else 0
            row['rolling_mean_30'] = df['quantity'].iloc[-30:].mean() if len(df) >= 30 else df['quantity'].mean()

            X_pred = row[self.feature_cols].fillna(0)
            pred = max(0, float(self.model.predict(X_pred)[0]))
            std = self.metrics.get('rmse', pred * 0.1)

            predictions.append({
                'date': next_date.strftime('%Y-%m-%d'),
                'predicted_quantity': round(pred, 2),
                'confidence_lower': round(max(0, pred - 1.96 * std), 2),
                'confidence_upper': round(pred + 1.96 * std, 2),
            })
            new_row = pd.DataFrame([{'date': next_date, 'quantity': pred}])
            new_row = prepare_time_features(new_row)
            df = pd.concat([df, new_row[['date', 'quantity']]], ignore_index=True)

        return predictions, self.metrics

    def get_feature_importance(self) -> List[Dict]:
        if not os.path.exists(self.model_path): return []
        saved = joblib.load(self.model_path)
        model = saved['model']
        cols = saved['feature_cols']
        imp = model.feature_importances_
        return sorted([{'feature': c, 'importance': round(float(v), 4)} for c, v in zip(cols, imp)],
                      key=lambda x: x['importance'], reverse=True)

# ── Random Forest ─────────────────────────────────────────────────────
class RandomForestForecaster:
    def __init__(self, product_id: str):
        self.product_id = product_id
        self.model_path = os.path.join(MODELS_DIR, f"rf_{product_id}.pkl")
        self.model = None
        self.feature_cols = None
        self.metrics = {}

    def train(self, history: List[Dict]) -> Dict:
        df = pd.DataFrame(history)
        df = prepare_time_features(df)
        df = add_lag_features(df, n_lags=7)
        feature_cols = [c for c in df.columns if c not in ['date', 'quantity']]
        self.feature_cols = feature_cols
        X = df[feature_cols]
        y = df['quantity']

        test_size = max(2, int(len(X) * 0.2))
        if len(X) <= test_size + 2:
            # Dataset too small — train on all, evaluate in-sample
            self.model = RandomForestRegressor(
                n_estimators=100, max_depth=6, min_samples_leaf=1,
                random_state=42, n_jobs=-1
            )
            self.model.fit(X, y)
            self.metrics = compute_metrics(y.values, self.model.predict(X))
        else:
            X_train, X_test = X.iloc[:-test_size], X.iloc[-test_size:]
            y_train, y_test = y.iloc[:-test_size], y.iloc[-test_size:]
            self.model = RandomForestRegressor(
                n_estimators=200, max_depth=10, min_samples_leaf=3,
                random_state=42, n_jobs=-1
            )
            self.model.fit(X_train, y_train)
            self.metrics = compute_metrics(y_test.values, self.model.predict(X_test))

        joblib.dump({"model": self.model, "feature_cols": feature_cols, "metrics": self.metrics, "trained_at": datetime.now().isoformat()}, self.model_path)
        return self.metrics

    def predict(self, history: List[Dict], horizon_days: int = 30) -> Tuple[List[Dict], Dict]:
        if os.path.exists(self.model_path):
            saved = joblib.load(self.model_path)
            self.model = saved["model"]
            self.feature_cols = saved["feature_cols"]
            self.metrics = saved.get("metrics", {})
        else:
            self.metrics = self.train(history)

        df = pd.DataFrame(history).copy()
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        df = prepare_time_features(df)

        predictions = []
        last_date = df['date'].max()

        for i in range(horizon_days):
            next_date = last_date + timedelta(days=i + 1)
            row = pd.DataFrame([{'date': next_date, 'quantity': 0}])
            row = prepare_time_features(row)
            for lag in range(1, 8):
                row[f'lag_{lag}'] = df['quantity'].iloc[-lag] if len(df) >= lag else 0
            row['rolling_mean_7'] = df['quantity'].iloc[-7:].mean() if len(df) >= 7 else df['quantity'].mean()
            row['rolling_std_7'] = df['quantity'].iloc[-7:].std() if len(df) >= 7 else 0
            row['rolling_mean_30'] = df['quantity'].iloc[-30:].mean() if len(df) >= 30 else df['quantity'].mean()

            X_pred = row[self.feature_cols].fillna(0)
            pred = max(0, float(self.model.predict(X_pred)[0]))
            std = self.metrics.get('rmse', pred * 0.1)

            predictions.append({
                'date': next_date.strftime('%Y-%m-%d'),
                'predicted_quantity': round(pred, 2),
                'confidence_lower': round(max(0, pred - 1.96 * std), 2),
                'confidence_upper': round(pred + 1.96 * std, 2),
            })
            new_row = pd.DataFrame([{'date': next_date, 'quantity': pred}])
            new_row = prepare_time_features(new_row)
            df = pd.concat([df, new_row[['date', 'quantity']]], ignore_index=True)

        return predictions, self.metrics

    def get_feature_importance(self) -> List[Dict]:
        if not os.path.exists(self.model_path): return []
        saved = joblib.load(self.model_path)
        model = saved['model']
        cols = saved['feature_cols']
        imp = model.feature_importances_
        return sorted([{'feature': c, 'importance': round(float(v), 4)} for c, v in zip(cols, imp)],
                      key=lambda x: x['importance'], reverse=True)

# ── ARIMA ─────────────────────────────────────────────────────────────
class ARIMAForecaster:
    def __init__(self, product_id: str):
        self.product_id = product_id
        self.model_path = os.path.join(MODELS_DIR, f"arima_{product_id}.pkl")
        self.metrics = {}

    def train(self, history: List[Dict]) -> Dict:
        df = pd.DataFrame(history).sort_values('date')
        y = df['quantity'].values.astype(float)
        best_aic = np.inf
        best_params = (1, 1, 1)
        for p in range(3):
            for d in range(2):
                for q in range(3):
                    try:
                        model = ARIMA(y, order=(p, d, q))
                        result = model.fit()
                        if result.aic < best_aic:
                            best_aic = result.aic
                            best_params = (p, d, q)
                    except Exception:
                        continue
        model = ARIMA(y, order=best_params)
        result = model.fit()
        y_pred = result.fittedvalues
        self.metrics = compute_metrics(y[-20:], y_pred[-20:])
        joblib.dump({"result": result, "order": best_params, "metrics": self.metrics, "history_len": len(y), "trained_at": datetime.now().isoformat()}, self.model_path)
        return self.metrics

    def predict(self, history: List[Dict], horizon_days: int = 30) -> Tuple[List[Dict], Dict]:
        df = pd.DataFrame(history).sort_values('date')
        y = df['quantity'].values.astype(float)
        last_date = pd.to_datetime(df['date'].max())

        if os.path.exists(self.model_path):
            saved = joblib.load(self.model_path)
            result = saved['result']
            self.metrics = saved.get("metrics", {})
        else:
            self.metrics = self.train(history)
            saved = joblib.load(self.model_path)
            result = saved['result']

        forecast = result.forecast(steps=horizon_days)
        std = self.metrics.get('rmse', np.std(y) * 0.5)

        predictions = []
        for i, pred_val in enumerate(forecast):
            date = (last_date + timedelta(days=i + 1)).strftime('%Y-%m-%d')
            pred = max(0, float(pred_val))
            predictions.append({
                'date': date,
                'predicted_quantity': round(pred, 2),
                'confidence_lower': round(max(0, pred - 1.96 * std), 2),
                'confidence_upper': round(pred + 1.96 * std, 2),
            })

        return predictions, self.metrics


# ── Ensemble Forecaster ───────────────────────────────────────────────
class EnsembleForecaster:
    """
    Ensemble forecaster combining XGBoost, Random Forest, and ARIMA.
    Weights each model based on inverse RMSE for optimal accuracy.
    """
    def __init__(self, product_id: str):
        self.product_id = product_id
        self.xgb = XGBoostForecaster(product_id)
        self.rf = RandomForestForecaster(product_id)
        self.arima = ARIMAForecaster(product_id)

    def train(self, history: List[Dict]) -> Dict:
        m1 = self.xgb.train(history)
        m2 = self.rf.train(history)
        m3 = self.arima.train(history)
        avg_mae = round(float((m1.get('mae', 0) + m2.get('mae', 0) + m3.get('mae', 0)) / 3), 4)
        avg_rmse = round(float((m1.get('rmse', 0) + m2.get('rmse', 0) + m3.get('rmse', 0)) / 3), 4)
        avg_mape = round(float((m1.get('mape', 0) + m2.get('mape', 0) + m3.get('mape', 0)) / 3), 2)
        return {"mae": avg_mae, "rmse": avg_rmse, "mape": avg_mape}

    def predict(self, history: List[Dict], horizon_days: int = 30) -> Tuple[List[Dict], Dict]:
        p_xgb, m_xgb = self.xgb.predict(history, horizon_days)
        p_rf, m_rf = self.rf.predict(history, horizon_days)
        p_arima, m_arima = self.arima.predict(history, horizon_days)

        # Inverse RMSE weighting
        w_xgb = 1.0 / max(m_xgb.get('rmse', 1.0), 0.001)
        w_rf = 1.0 / max(m_rf.get('rmse', 1.0), 0.001)
        w_arima = 1.0 / max(m_arima.get('rmse', 1.0), 0.001)
        total_w = w_xgb + w_rf + w_arima

        w_xgb /= total_w
        w_rf /= total_w
        w_arima /= total_w

        predictions = []
        for i in range(horizon_days):
            d = p_xgb[i]['date']
            val = (w_xgb * p_xgb[i]['predicted_quantity'] +
                   w_rf * p_rf[i]['predicted_quantity'] +
                   w_arima * p_arima[i]['predicted_quantity'])
            low = (w_xgb * p_xgb[i]['confidence_lower'] +
                   w_rf * p_rf[i]['confidence_lower'] +
                   w_arima * p_arima[i]['confidence_lower'])
            high = (w_xgb * p_xgb[i]['confidence_upper'] +
                    w_rf * p_rf[i]['confidence_upper'] +
                    w_arima * p_arima[i]['confidence_upper'])
            predictions.append({
                'date': d,
                'predicted_quantity': round(val, 2),
                'confidence_lower': round(max(0, low), 2),
                'confidence_upper': round(high, 2)
            })

        avg_metrics = {
            "mae": round((m_xgb.get('mae', 0) + m_rf.get('mae', 0) + m_arima.get('mae', 0)) / 3, 4),
            "rmse": round((m_xgb.get('rmse', 0) + m_rf.get('rmse', 0) + m_arima.get('rmse', 0)) / 3, 4),
            "mape": round((m_xgb.get('mape', 0) + m_rf.get('mape', 0) + m_arima.get('mape', 0)) / 3, 2),
        }
        return predictions, avg_metrics


# ── Anomaly Detector ──────────────────────────────────────────────────
class AnomalyDetector:
    """
    Detects demand spikes and supply anomalies in historic quantities using Z-Score & rolling statistics.
    """
    @staticmethod
    def detect(product_id: str, history: List[Dict], sensitivity: float = 2.0) -> Dict:
        df = pd.DataFrame(history)
        if len(df) < 5:
            return {"product_id": product_id, "total_points": len(df), "anomalies_detected": 0, "anomalies": []}

        df['quantity'] = df['quantity'].astype(float)
        mean_val = df['quantity'].mean()
        std_val = df['quantity'].std()
        if std_val == 0: std_val = 0.001

        df['z_score'] = (df['quantity'] - mean_val) / std_val
        anomalies = []

        for _, row in df.iterrows():
            z = abs(row['z_score'])
            if z > sensitivity:
                severity = "high" if z > 3.0 else ("medium" if z > 2.5 else "low")
                anomalies.append({
                    "date": str(row['date']),
                    "quantity": float(row['quantity']),
                    "expected_quantity": round(float(mean_val), 2),
                    "anomaly_score": round(float(z), 2),
                    "is_anomaly": True,
                    "severity": severity
                })

        return {
            "product_id": product_id,
            "total_points": len(df),
            "anomalies_detected": len(anomalies),
            "anomalies": anomalies
        }


# ── Model Registry & Metadata ─────────────────────────────────────────
class ModelRegistryManager:
    """
    Manages persistent model artifacts, versioning status, and trained metrics.
    """
    @staticmethod
    def list_models() -> List[Dict]:
        models = []
        if not os.path.exists(MODELS_DIR):
            return models

        for fname in os.listdir(MODELS_DIR):
            if fname.endswith(".pkl"):
                fpath = os.path.join(MODELS_DIR, fname)
                try:
                    data = joblib.load(fpath)
                    parts = fname.replace(".pkl", "").split("_")
                    model_type = parts[0]
                    product_id = "_".join(parts[1:])
                    models.append({
                        "product_id": product_id,
                        "model_type": model_type,
                        "trained_at": data.get("trained_at", datetime.fromtimestamp(os.path.getmtime(fpath)).isoformat()),
                        "metrics": data.get("metrics", {}),
                        "status": "Active"
                    })
                except Exception:
                    continue
        return models
