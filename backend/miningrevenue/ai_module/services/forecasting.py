import pandas as pd
import joblib
from statsmodels.tsa.arima.model import ARIMA
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "models/revenue_forecast_model.pkl")

def train_forecasting_model():
    df = pd.read_csv("minerevenue_forecasting_dataset.csv")

    df["Date"] = pd.to_datetime(df["Date"])
    df.set_index("Date", inplace=True)

    revenue_series = df["Total_Revenue_USD"]

    model = ARIMA(revenue_series, order=(1,1,1))
    model_fit = model.fit()

    joblib.dump(model_fit, MODEL_PATH)

    return "Forecasting model trained successfully"


def forecast_next_months(steps=6):
    model = joblib.load(MODEL_PATH)
    forecast = model.forecast(steps=steps)
    return forecast.tolist()
