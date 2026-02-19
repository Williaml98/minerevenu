import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "models/anomaly_model.pkl")

def train_anomaly_model():
    df = pd.read_csv("minerevenue_transactions_dataset.csv")

    features = df[[
        "Quantity_Tons",
        "Unit_Price_USD",
        "Total_Amount_USD",
        "Allocation_Percentage"
    ]]

    model = IsolationForest(
        contamination=0.07,
        random_state=42
    )

    model.fit(features)

    joblib.dump(model, MODEL_PATH)

    return "Anomaly model trained successfully"


def detect_anomalies(new_data_df):
    model = joblib.load(MODEL_PATH)
    predictions = model.predict(new_data_df)

    return predictions.tolist()
