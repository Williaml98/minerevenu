from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    GenerateForecastAPIView,
    RevenueForecastViewSet,
    AnalyticsSummaryAPIView,
    AnomalyInsightsAPIView,
    RecommendationAPIView,
    TrainModelsAPIView,
)

router = DefaultRouter()
router.register(r"forecasts", RevenueForecastViewSet, basename="forecast")

urlpatterns = [
    path("generate-forecast/", GenerateForecastAPIView.as_view(), name="generate-forecast"),
    path("train-models/", TrainModelsAPIView.as_view(), name="train-models"),
    path("summary/", AnalyticsSummaryAPIView.as_view(), name="analytics-summary"),
    path("anomalies/", AnomalyInsightsAPIView.as_view(), name="analytics-anomalies"),
    path("recommendations/", RecommendationAPIView.as_view(), name="analytics-recommendations"),
    path("forecasts/", RevenueForecastViewSet.as_view({"get": "list"}), name="forecast-list"),
]
