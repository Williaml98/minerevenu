import os
import pandas as pd
import joblib
from statsmodels.tsa.arima.model import ARIMA  # type: ignore
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np
from .config import FORECAST_DATA_PATH, FORECAST_MODEL_PATH
from .registry import mark_model_ready

MODEL_VERSION_ARIMA = "ARIMA_v1"
MODEL_VERSION_NAIVE = "NAIVE_v1"


def train_forecasting_model():
    print("Loading forecasting dataset...")
    if not os.path.exists(FORECAST_DATA_PATH):
        raise FileNotFoundError(
            f"Forecast dataset not found at {FORECAST_DATA_PATH}. Upload data before training."
        )
    df = pd.read_csv(FORECAST_DATA_PATH)
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date")
    df = df.groupby("Date", as_index=False)["Total_Revenue_USD"].sum()
    df.set_index("Date", inplace=True)

    revenue = df["Total_Revenue_USD"]
    if len(revenue) < 3:
        # Fallback to naive model when data is too small
        last_value = float(revenue.iloc[-1]) if len(revenue) > 0 else 0.0
        joblib.dump({"type": "naive", "last": last_value}, FORECAST_MODEL_PATH)
        mark_model_ready(
            "forecast",
            model_version=MODEL_VERSION_NAIVE,
            data_points=int(len(revenue)),
            metrics={"mae": None, "rmse": None},
        )
        return {
            "MAE": None,
            "RMSE": None,
            "model_version": MODEL_VERSION_NAIVE,
        }

    # Train/Test Split (80/20)
    train_size = int(len(revenue) * 0.8)
    train, test = revenue[:train_size], revenue[train_size:]

    print("Training ARIMA model...")

    try:
        model = ARIMA(train, order=(1, 1, 1))
        model_fit = model.fit()
    except Exception:
        last_value = float(revenue.iloc[-1]) if len(revenue) > 0 else 0.0
        joblib.dump({"type": "naive", "last": last_value}, FORECAST_MODEL_PATH)
        mark_model_ready(
            "forecast",
            model_version=MODEL_VERSION_NAIVE,
            data_points=int(len(revenue)),
            metrics={"mae": None, "rmse": None},
        )
        return {
            "MAE": None,
            "RMSE": None,
            "model_version": MODEL_VERSION_NAIVE,
        }

    # Forecast on test set
    predictions = model_fit.forecast(steps=len(test))

    # Evaluation
    mae = mean_absolute_error(test, predictions)
    rmse = np.sqrt(mean_squared_error(test, predictions))

    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")

    # Retrain on full dataset
    try:
        final_model = ARIMA(revenue, order=(1, 1, 1)).fit()
        joblib.dump({"type": "arima", "model": final_model}, FORECAST_MODEL_PATH)
    except Exception:
        last_value = float(revenue.iloc[-1]) if len(revenue) > 0 else 0.0
        joblib.dump({"type": "naive", "last": last_value}, FORECAST_MODEL_PATH)
        mark_model_ready(
            "forecast",
            model_version=MODEL_VERSION_NAIVE,
            data_points=int(len(revenue)),
            metrics={"mae": None, "rmse": None},
        )
        return {
            "MAE": None,
            "RMSE": None,
            "model_version": MODEL_VERSION_NAIVE,
        }

    mark_model_ready(
        "forecast",
        model_version=MODEL_VERSION_ARIMA,
        data_points=int(len(revenue)),
        metrics={"mae": float(mae), "rmse": float(rmse)},
    )

    print("OK: Forecasting model saved")

    return {
        "MAE": float(mae),
        "RMSE": float(rmse),
        "model_version": MODEL_VERSION_ARIMA,
    }


def forecast_next_steps(steps=6):
    if not os.path.exists(FORECAST_MODEL_PATH):
        raise FileNotFoundError(
            f"Forecast model not found at {FORECAST_MODEL_PATH}. Train the model first."
        )
    model_bundle = joblib.load(FORECAST_MODEL_PATH)
    if isinstance(model_bundle, dict) and model_bundle.get("type") == "naive":
        last_value = float(model_bundle.get("last", 0.0))
        return [last_value for _ in range(steps)]
    model = model_bundle["model"] if isinstance(model_bundle, dict) else model_bundle
    forecast = model.forecast(steps=steps)
    return forecast.tolist()
