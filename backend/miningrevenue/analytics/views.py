from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Sum, Avg
import pandas as pd

from ml.forecasting import forecast_next_steps, train_forecasting_model
from ml.anomaly import detect_anomalies, train_anomaly_model
from .models import RevenueForecast
from revenue.models import SalesTransaction
from .serializers import RevenueForecastSerializer
from authapi.permissions import IsAdmin

class GenerateForecastAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        predictions = forecast_next_steps(6)

        today = date.today()

        created_forecasts = []
        for i, value in enumerate(predictions):
            forecast_date = today + timedelta(days=30*(i+1))

            obj = RevenueForecast.objects.create(
                forecast_date=forecast_date,
                predicted_revenue=value
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
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)
        prev_30 = today - timedelta(days=60)

        last_30_tx = SalesTransaction.objects.filter(date__gte=last_30, date__lte=today)
        prev_30_tx = SalesTransaction.objects.filter(date__gte=prev_30, date__lt=last_30)

        last_30_revenue = last_30_tx.aggregate(total=Sum("total_amount"))["total"] or 0
        prev_30_revenue = prev_30_tx.aggregate(total=Sum("total_amount"))["total"] or 0

        # Simple month‑over‑month growth rate
        if prev_30_revenue > 0:
            growth_rate = (last_30_revenue - prev_30_revenue) / prev_30_revenue
        else:
            growth_rate = 0.0

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
        stability_score = 100.0
        if avg_rev > 0 and variance > 0:
            # Invert normalized variance and clamp 0‑100
            normalized_volatility = min(variance / (avg_rev**2), 2.0)
            stability_score = max(0.0, min(100.0, (1.0 - normalized_volatility) * 100))

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
                df["Allocation_Percentage"] = (
                    df["Total_Amount_USD"] / total_sum
                ) * 100.0

                anomaly_flags = detect_anomalies(df)
                anomaly_count = int(sum(anomaly_flags))
        except Exception:
            # If the anomaly model is not trained yet, we just return 0
            anomaly_count = 0

        # Forecast accuracy proxy: compare latest forecast vs realized revenue
        forecast_accuracy = None
        try:
            latest_forecasts = RevenueForecast.objects.order_by("-forecast_date")[:6]
            if latest_forecasts and last_30_revenue > 0:
                avg_forecast = (
                    sum(f.predicted_revenue for f in latest_forecasts)
                    / len(latest_forecasts)
                )
                error_ratio = abs(avg_forecast - last_30_revenue) / max(
                    last_30_revenue, 1.0
                )
                forecast_accuracy = max(0.0, min(1.0, 1.0 - error_ratio)) * 100.0
        except Exception:
            forecast_accuracy = None

        data = {
            "summary": {
                "last_30_revenue": last_30_revenue,
                "prev_30_revenue": prev_30_revenue,
                "growth_rate": growth_rate,
                "stability_score": stability_score,
                "anomaly_count": anomaly_count,
                "forecast_accuracy": forecast_accuracy,
            },
        }
        return Response(data, status=status.HTTP_200_OK)


class AnomalyInsightsAPIView(APIView):
    """
    Returns the most anomalous recent transactions with basic explanations.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)

        tx_qs = (
            SalesTransaction.objects.filter(date__gte=last_30, date__lte=today)
            .select_related("mine")
            .order_by("-date")
        )

        if not tx_qs.exists():
            return Response({"anomalies": []}, status=status.HTTP_200_OK)

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
            return Response({"anomalies": []}, status=status.HTTP_200_OK)

        df["is_anomaly"] = flags
        anomalies_df = df[df["is_anomaly"] == 1].copy()

        anomalies = []
        for _, row in anomalies_df.head(20).iterrows():
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

        return Response({"anomalies": anomalies}, status=status.HTTP_200_OK)


class RecommendationAPIView(APIView):
    """
    High‑level AI recommendations derived from forecast, anomaly rate and revenue trends.
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
                    "detail": "Revenue has decreased compared to the previous month. Review collection efficiency and potential leak points at under‑performing sites.",
                }
            )
        else:
            recommendations.append(
                {
                    "title": "Maintain and scale high‑performing sites",
                    "impact": "medium",
                    "detail": "Revenue is trending positively. Consider increasing capacity or optimizing logistics at consistently high‑performing mines.",
                }
            )

        if stability < 70:
            recommendations.append(
                {
                    "title": "Reduce revenue volatility",
                    "impact": "medium",
                    "detail": "Revenue stability score is moderate. Standardize pricing and contract terms across sites to reduce unexpected swings.",
                }
            )

        if anomaly_count > 0:
            recommendations.append(
                {
                    "title": "Prioritize anomaly investigation",
                    "impact": "high",
                    "detail": f"{anomaly_count} anomalous transactions were detected in the last 30 days. Prioritize audit for sites with repeated anomalies and enforce stricter approval workflows.",
                }
            )

        if forecast_accuracy is not None and forecast_accuracy < 75:
            recommendations.append(
                {
                    "title": "Retrain forecasting model",
                    "impact": "medium",
                    "detail": "Forecast accuracy is below 75%. Retrain the model with the latest data and review feature quality (e.g., missing or delayed transactions).",
                }
            )

        if not recommendations:
            recommendations.append(
                {
                    "title": "System operating within normal parameters",
                    "impact": "low",
                    "detail": "No critical AI alerts at this time. Continue monitoring revenue, anomalies, and forecasts regularly.",
                }
            )

        return Response({"recommendations": recommendations}, status=status.HTTP_200_OK)


class TrainModelsAPIView(APIView):
    """
    Trigger retraining of forecasting and anomaly models from the latest data.
    Intended to be called by admins from the AI Analytics dashboard.
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        forecast_metrics = train_forecasting_model()
        anomaly_status = train_anomaly_model()

        return Response(
            {
                "message": "Models retrained successfully.",
                "forecast_metrics": forecast_metrics,
                "anomaly_status": anomaly_status,
            },
            status=status.HTTP_200_OK,
        )
