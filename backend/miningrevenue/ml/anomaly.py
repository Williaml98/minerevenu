import os
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
from .config import ANOMALY_DATA_PATH, ANOMALY_MODEL_PATH
from .registry import mark_model_ready

MODEL_VERSION = "IForest_v1"


def train_anomaly_model():
    print("Loading anomaly dataset...")
    if not os.path.exists(ANOMALY_DATA_PATH):
        raise FileNotFoundError(
            f"Anomaly dataset not found at {ANOMALY_DATA_PATH}. Upload data before training."
        )
    df = pd.read_csv(ANOMALY_DATA_PATH)

    features = df[
        [
            "Quantity_Tons",
            "Unit_Price_USD",
            "Total_Amount_USD",
            "Allocation_Percentage",
        ]
    ]

    labels = df["Is_Anomaly"]

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)

    model = IsolationForest(contamination=0.07, random_state=42)
    model.fit(scaled_features)

    predictions = model.predict(scaled_features)
    predictions = [1 if p == -1 else 0 for p in predictions]

    report = classification_report(labels, predictions, output_dict=True, zero_division=0)

    joblib.dump({"model": model, "scaler": scaler}, ANOMALY_MODEL_PATH)

    metrics = {
        "precision": float(report.get("weighted avg", {}).get("precision", 0.0)),
        "recall": float(report.get("weighted avg", {}).get("recall", 0.0)),
        "f1": float(report.get("weighted avg", {}).get("f1-score", 0.0)),
    }

    mark_model_ready(
        "anomaly",
        model_version=MODEL_VERSION,
        data_points=int(len(features)),
        metrics=metrics,
    )

    print("OK: Anomaly model saved")

    return "Anomaly model trained"


def detect_anomalies(new_data_df):
    if not os.path.exists(ANOMALY_MODEL_PATH):
        raise FileNotFoundError(
            f"Anomaly model not found at {ANOMALY_MODEL_PATH}. Train the model first."
        )
    bundle = joblib.load(ANOMALY_MODEL_PATH)
    model = bundle["model"]
    scaler = bundle["scaler"]

    scaled = scaler.transform(new_data_df)
    predictions = model.predict(scaled)

    return [1 if p == -1 else 0 for p in predictions]
