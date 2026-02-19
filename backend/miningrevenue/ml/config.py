import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models")

FORECAST_DATA_PATH = os.path.join(DATA_DIR, "minerevenue_forecasting_dataset.csv")
ANOMALY_DATA_PATH = os.path.join(DATA_DIR, "minerevenue_transactions_dataset.csv")

FORECAST_MODEL_PATH = os.path.join(MODEL_DIR, "revenue_forecast_model.pkl")
ANOMALY_MODEL_PATH = os.path.join(MODEL_DIR, "anomaly_model.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)
