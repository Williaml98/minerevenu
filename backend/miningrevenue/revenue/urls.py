from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import RevenueSummaryAPIView, SalesTransactionViewSet, StakeholderInsightsAPIView, PublicStatsAPIView

router = DefaultRouter()
router.register(r"transactions", SalesTransactionViewSet)

urlpatterns = [
    path("summary/", RevenueSummaryAPIView.as_view(), name="revenue-summary"),
    path("stakeholder-insights/", StakeholderInsightsAPIView.as_view(), name="stakeholder-insights"),
    path("public-stats/", PublicStatsAPIView.as_view(), name="public-stats"),
] + router.urls
