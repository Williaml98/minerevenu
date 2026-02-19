from .forecasting import train_forecasting_model
from .anomaly import train_anomaly_model


def train_all_models():
    print("Starting training process...\n")

    forecast_metrics = train_forecasting_model()
    anomaly_status = train_anomaly_model()

    print("\n🎉 All models trained successfully!")

    return {
        "forecast_metrics": forecast_metrics,
        "anomaly_status": anomaly_status
    }
