import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
from .config import ANOMALY_DATA_PATH, ANOMALY_MODEL_PATH


def train_anomaly_model():
    print("Loading anomaly dataset...")

    df = pd.read_csv(ANOMALY_DATA_PATH)

    features = df[[
        "Quantity_Tons",
        "Unit_Price_USD",
        "Total_Amount_USD",
        "Allocation_Percentage"
    ]]

    labels = df["Is_Anomaly"]

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)

    model = IsolationForest(
        contamination=0.07,
        random_state=42
    )

    model.fit(scaled_features)

    predictions = model.predict(scaled_features)
    predictions = [1 if p == -1 else 0 for p in predictions]

    print("Classification Report:")
    print(classification_report(labels, predictions))

    joblib.dump({
        "model": model,
        "scaler": scaler
    }, ANOMALY_MODEL_PATH)

    print("✅ Anomaly model saved")

    return "Anomaly model trained"


def detect_anomalies(new_data_df):
    bundle = joblib.load(ANOMALY_MODEL_PATH)
    model = bundle["model"]
    scaler = bundle["scaler"]

    scaled = scaler.transform(new_data_df)
    predictions = model.predict(scaled)

    return [1 if p == -1 else 0 for p in predictions]
