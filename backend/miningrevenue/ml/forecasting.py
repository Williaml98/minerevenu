import pandas as pd
import joblib
from statsmodels.tsa.arima.model import ARIMA # type: ignore
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np
from .config import FORECAST_DATA_PATH, FORECAST_MODEL_PATH


def train_forecasting_model():
    print("Loading forecasting dataset...")

    df = pd.read_csv(FORECAST_DATA_PATH)
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date")
    df.set_index("Date", inplace=True)

    revenue = df["Total_Revenue_USD"]

    # Train/Test Split (80/20)
    train_size = int(len(revenue) * 0.8)
    train, test = revenue[:train_size], revenue[train_size:]

    print("Training ARIMA model...")

    model = ARIMA(train, order=(1, 1, 1))
    model_fit = model.fit()

    # Forecast on test set
    predictions = model_fit.forecast(steps=len(test))

    # Evaluation
    mae = mean_absolute_error(test, predictions)
    rmse = np.sqrt(mean_squared_error(test, predictions))

    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")

    # Retrain on full dataset
    final_model = ARIMA(revenue, order=(1, 1, 1)).fit()

    joblib.dump(final_model, FORECAST_MODEL_PATH)

    print("✅ Forecasting model saved")

    return {
        "MAE": mae,
        "RMSE": rmse
    }


def forecast_next_steps(steps=6):
    model = joblib.load(FORECAST_MODEL_PATH)
    forecast = model.forecast(steps=steps)
    return forecast.tolist()
