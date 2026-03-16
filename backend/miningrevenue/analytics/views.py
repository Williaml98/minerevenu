from datetime import date, timedelta

import pandas as pd
from django.db.models import Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from authapi.permissions import IsAdmin
from ml.anomaly import detect_anomalies, train_anomaly_model
from ml.forecasting import forecast_next_steps, train_forecasting_model, MODEL_VERSION_ARIMA as FORECAST_MODEL_VERSION
from ml.registry import get_model_info
from revenue.models import SalesTransaction
from .models import RevenueForecast
from .serializers import RevenueForecastSerializer
from django.core.management import call_command


class GenerateForecastAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    throttle_scope = "forecast_generate"

    def post(self, request):
        try:
            steps = int(request.data.get("steps", 6))
        except (TypeError, ValueError):
            steps = 6
        steps = max(1, min(24, steps))

        try:
            predictions = forecast_next_steps(steps)
        except Exception:
            return Response(
                {"detail": "Forecast model is not available. Train the model first."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        today = date.today()

        created_forecasts = []
        replace = bool(request.data.get("replace", False))
        if replace:
            RevenueForecast.objects.filter(forecast_date__gte=today).delete()

        model_info = get_model_info("forecast")
        model_version = model_info.get("model_version") or FORECAST_MODEL_VERSION

        for i, value in enumerate(predictions):
            forecast_date = today + timedelta(days=30 * (i + 1))

            obj = RevenueForecast.objects.create(
                forecast_date=forecast_date,
                predicted_revenue=value,
                model_version=model_version,
            )

            created_forecasts.append(obj)

        return Response(RevenueForecastSerializer(created_forecasts, many=True).data)


class RevenueForecastViewSet(viewsets.ModelViewSet):
    queryset = RevenueForecast.objects.all()
    serializer_class = RevenueForecastSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.order_by("-forecast_date")


class AnalyticsSummaryAPIView(APIView):
    """
    High-level AI analytics summary used by the admin AI Analytics dashboard.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        mine_id = request.query_params.get("mine_id")
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)
        prev_30 = today - timedelta(days=60)

        last_30_tx = SalesTransaction.objects.filter(date__gte=last_30, date__lte=today)
        prev_30_tx = SalesTransaction.objects.filter(date__gte=prev_30, date__lt=last_30)
        if mine_id:
            last_30_tx = last_30_tx.filter(mine_id=mine_id)
            prev_30_tx = prev_30_tx.filter(mine_id=mine_id)

        last_30_revenue = last_30_tx.aggregate(total=Sum("total_amount"))["total"] or 0
        prev_30_revenue = prev_30_tx.aggregate(total=Sum("total_amount"))["total"] or 0

        # Simple month-over-month growth rate
        if prev_30_revenue > 0:
            growth_rate = (last_30_revenue - prev_30_revenue) / prev_30_revenue
        elif last_30_revenue > 0:
            growth_rate = None
        else:
            growth_rate = None

        # Revenue stability: lower volatility => higher stability score
        daily_revenue = (
            last_30_tx.values("date")
            .order_by("date")
            .annotate(total=Sum("total_amount"))
        )
        revenues = [row["total"] or 0 for row in daily_revenue]
        avg_rev = sum(revenues) / len(revenues) if revenues else 0
        variance = (
            sum((r - avg_rev) ** 2 for r in revenues) / len(revenues)
            if revenues
            else 0
        )
        stability_score = None
        if len(revenues) >= 5 and avg_rev > 0 and variance > 0:
            # Invert normalized variance and clamp 0-100
            normalized_volatility = min(variance / (avg_rev**2), 2.0)
            stability_score = max(0.0, min(100.0, (1.0 - normalized_volatility) * 100))
        elif len(revenues) >= 5 and avg_rev > 0 and variance == 0:
            stability_score = 100.0

        # Basic anomaly statistics using the trained anomaly model (if available)
        anomaly_count = 0
        try:
            if last_30_tx.exists():
                df = pd.DataFrame(
                    list(
                        last_30_tx.values(
                            "quantity",
                            "unit_price",
                            "total_amount",
                        )
                    )
                )
                # Map to training feature names expected by the anomaly model
                df.rename(
                    columns={
                        "quantity": "Quantity_Tons",
                        "unit_price": "Unit_Price_USD",
                        "total_amount": "Total_Amount_USD",
                    },
                    inplace=True,
                )
                # Derive a simple allocation percentage as a proxy
                total_sum = float(df["Total_Amount_USD"].sum() or 0) or 1.0
                df["Allocation_Percentage"] = (df["Total_Amount_USD"] / total_sum) * 100.0

                anomaly_flags = detect_anomalies(df)
                anomaly_count = int(sum(anomaly_flags))
        except Exception:
            anomaly_count = 0

        # Forecast accuracy: evaluate only on past forecast windows
        forecast_accuracy = None
        forecast_accuracy_provisional = None
        forecast_accuracy_basis = None
        try:
            past_forecasts = (
                RevenueForecast.objects.filter(forecast_date__lte=today)
                .order_by("-forecast_date")[:6]
            )
            errors = []
            for f in past_forecasts:
                window_start = f.forecast_date - timedelta(days=30)
                actual_qs = SalesTransaction.objects.filter(
                    date__gt=window_start, date__lte=f.forecast_date
                )
                if mine_id:
                    actual_qs = actual_qs.filter(mine_id=mine_id)
                actual_total = actual_qs.aggregate(total=Sum("total_amount"))["total"] or 0
                if actual_total > 0:
                    errors.append(abs(f.predicted_revenue - actual_total) / actual_total)
            if errors:
                mape = sum(errors) / len(errors)
                forecast_accuracy = max(0.0, min(1.0, 1.0 - mape)) * 100.0
                forecast_accuracy_basis = "mature"
            else:
                # Provisional accuracy: compare latest forecasts to last 30 days revenue
                latest_forecasts = RevenueForecast.objects.order_by("-forecast_date")[:6]
                if latest_forecasts and last_30_revenue > 0 and last_30_tx.count() >= 3:
                    avg_forecast = (
                        sum(f.predicted_revenue for f in latest_forecasts)
                        / len(latest_forecasts)
                    )
                    error_ratio = abs(avg_forecast - last_30_revenue) / max(
                        last_30_revenue, 1.0
                    )
                    if error_ratio <= 1.0:
                        forecast_accuracy_provisional = max(0.0, min(1.0, 1.0 - error_ratio)) * 100.0
                        forecast_accuracy_basis = "provisional"
        except Exception:
            forecast_accuracy = None
            forecast_accuracy_provisional = None
            forecast_accuracy_basis = None

        data = {
            "summary": {
                "last_30_revenue": last_30_revenue,
                "prev_30_revenue": prev_30_revenue,
                "growth_rate": growth_rate,
                "stability_score": stability_score,
                "anomaly_count": anomaly_count,
                "forecast_accuracy": forecast_accuracy,
                "forecast_accuracy_provisional": forecast_accuracy_provisional,
                "forecast_accuracy_basis": forecast_accuracy_basis,
                "model_status": {
                    "forecast": get_model_info("forecast"),
                    "anomaly": get_model_info("anomaly"),
                },
            },
        }
        return Response(data, status=status.HTTP_200_OK)


class AnomalyInsightsAPIView(APIView):
    """
    Returns the most anomalous recent transactions with basic explanations.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        mine_id = request.query_params.get("mine_id")
        try:
            limit = int(request.query_params.get("limit", 20))
        except (TypeError, ValueError):
            limit = 20
        limit = max(1, min(100, limit))
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)

        tx_qs = (
            SalesTransaction.objects.filter(date__gte=last_30, date__lte=today)
            .select_related("mine")
            .order_by("-date")
        )
        if mine_id:
            tx_qs = tx_qs.filter(mine_id=mine_id)

        if not tx_qs.exists():
            model_info = get_model_info("anomaly")
            return Response(
                {
                    "anomalies": [],
                    "model_ready": bool(model_info.get("ready")),
                    "model_version": model_info.get("model_version"),
                },
                status=status.HTTP_200_OK,
            )

        df = pd.DataFrame(
            list(
                tx_qs.values(
                    "id",
                    "mine__name",
                    "date",
                    "quantity",
                    "unit_price",
                    "total_amount",
                )
            )
        )

        df_features = df[["quantity", "unit_price", "total_amount"]].copy()
        df_features.rename(
            columns={
                "quantity": "Quantity_Tons",
                "unit_price": "Unit_Price_USD",
                "total_amount": "Total_Amount_USD",
            },
            inplace=True,
        )
        total_sum = float(df_features["Total_Amount_USD"].sum() or 0) or 1.0
        df_features["Allocation_Percentage"] = (
            df_features["Total_Amount_USD"] / total_sum
        ) * 100.0

        try:
            flags = detect_anomalies(df_features)
        except Exception:
            model_info = get_model_info("anomaly")
            return Response(
                {
                    "anomalies": [],
                    "model_ready": False,
                    "model_version": model_info.get("model_version"),
                },
                status=status.HTTP_200_OK,
            )

        df["is_anomaly"] = flags
        anomalies_df = df[df["is_anomaly"] == 1].copy()

        anomalies = []
        for _, row in anomalies_df.head(limit).iterrows():
            anomalies.append(
                {
                    "transaction_id": row["id"],
                    "mine_name": row["mine__name"],
                    "date": row["date"],
                    "amount": row["total_amount"],
                    "quantity": row["quantity"],
                    "unit_price": row["unit_price"],
                    "reason": "Unusual revenue pattern detected compared to recent history.",
                }
            )

        return Response(
            {
                "anomalies": anomalies,
                "model_ready": True,
                "model_version": get_model_info("anomaly").get("model_version"),
            },
            status=status.HTTP_200_OK,
        )


class RecommendationAPIView(APIView):
    """
    High-level AI recommendations derived from forecast, anomaly rate and revenue trends.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Reuse summary metrics so recommendations stay consistent with the dashboard
        summary_response = AnalyticsSummaryAPIView().get(request)
        summary = summary_response.data.get("summary", {})

        growth = float(summary.get("growth_rate") or 0.0)
        stability = float(summary.get("stability_score") or 0.0)
        anomaly_count = int(summary.get("anomaly_count") or 0)
        forecast_accuracy = summary.get("forecast_accuracy")

        recommendations = []

        if growth < 0:
            recommendations.append(
                {
                    "title": "Investigate declining revenue trend",
                    "impact": "high",
                    "detail": (
                        "Revenue has decreased compared to the previous month. Review collection "
                        "efficiency and potential leak points at under-performing sites."
                    ),
                }
            )
        else:
            recommendations.append(
                {
                    "title": "Maintain and scale high-performing sites",
                    "impact": "medium",
                    "detail": (
                        "Revenue is trending positively. Consider increasing capacity or optimizing "
                        "logistics at consistently high-performing mines."
                    ),
                }
            )

        if stability < 70:
            recommendations.append(
                {
                    "title": "Reduce revenue volatility",
                    "impact": "medium",
                    "detail": (
                        "Revenue stability score is moderate. Standardize pricing and contract "
                        "terms across sites to reduce unexpected swings."
                    ),
                }
            )

        if anomaly_count > 0:
            recommendations.append(
                {
                    "title": "Prioritize anomaly investigation",
                    "impact": "high",
                    "detail": (
                        f"{anomaly_count} anomalous transactions were detected in the last 30 days. "
                        "Prioritize audit for sites with repeated anomalies and enforce stricter "
                        "approval workflows."
                    ),
                }
            )

        if forecast_accuracy is not None and forecast_accuracy < 75:
            recommendations.append(
                {
                    "title": "Retrain forecasting model",
                    "impact": "medium",
                    "detail": (
                        "Forecast accuracy is below 75%. Retrain the model with the latest data and "
                        "review feature quality (e.g., missing or delayed transactions)."
                    ),
                }
            )

        if not recommendations:
            recommendations.append(
                {
                    "title": "System operating within normal parameters",
                    "impact": "low",
                    "detail": (
                        "No critical AI alerts at this time. Continue monitoring revenue, "
                        "anomalies, and forecasts regularly."
                    ),
                }
            )

        return Response({"recommendations": recommendations}, status=status.HTTP_200_OK)


class TrainModelsAPIView(APIView):
    """
    Trigger retraining of forecasting and anomaly models from the latest data.
    Intended to be called by admins from the AI Analytics dashboard.
    """

    permission_classes = [IsAuthenticated, IsAdmin]
    throttle_scope = "train_models"

    def post(self, request):
        try:
            forecast_metrics = train_forecasting_model()
            anomaly_status = train_anomaly_model()
        except Exception as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Models retrained successfully.",
                "forecast_metrics": forecast_metrics,
                "anomaly_status": anomaly_status,
                "model_status": {
                    "forecast": get_model_info("forecast"),
                    "anomaly": get_model_info("anomaly"),
                },
            },
            status=status.HTTP_200_OK,
        )


class SyncModelsAPIView(APIView):
    """
    Export DB transactions to CSV and retrain models, then refresh forecasts.
    Intended for real-time updates after production/sales changes.
    """

    permission_classes = [IsAuthenticated, IsAdmin]
    throttle_scope = "train_models"

    def post(self, request):
        try:
            # 1) Export DB -> CSV datasets
            call_command("export_ml_csv")

            # 2) Retrain models from CSV
            forecast_metrics = train_forecasting_model()
            anomaly_status = train_anomaly_model()

            # 3) Regenerate forecasts (replace future forecasts)
            predictions = forecast_next_steps(6)
            today = date.today()
            RevenueForecast.objects.filter(forecast_date__gte=today).delete()
            model_info = get_model_info("forecast")
            model_version = model_info.get("model_version") or FORECAST_MODEL_VERSION
            created_forecasts = []
            for i, value in enumerate(predictions):
                forecast_date = today + timedelta(days=30 * (i + 1))
                created_forecasts.append(
                    RevenueForecast.objects.create(
                        forecast_date=forecast_date,
                        predicted_revenue=value,
                        model_version=model_version,
                    )
                )
        except Exception as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "CSV exported, models retrained, forecasts regenerated.",
                "forecast_metrics": forecast_metrics,
                "anomaly_status": anomaly_status,
                "model_status": {
                    "forecast": get_model_info("forecast"),
                    "anomaly": get_model_info("anomaly"),
                },
                "forecasts": RevenueForecastSerializer(created_forecasts, many=True).data,
            },
            status=status.HTTP_200_OK,
        )
