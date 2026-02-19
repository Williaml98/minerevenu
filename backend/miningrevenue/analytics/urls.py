from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import GenerateForecastAPIView, RevenueForecastViewSet

router = DefaultRouter()
router.register(r'forecasts', RevenueForecastViewSet, basename='forecast')

urlpatterns = [
    path("generate-forecast/", GenerateForecastAPIView.as_view()),
    path("forecasts/", RevenueForecastViewSet.as_view({'get': 'list'}), name='forecast-list'),
]
