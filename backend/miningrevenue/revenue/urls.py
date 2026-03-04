from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import RevenueSummaryAPIView, SalesTransactionViewSet, StakeholderInsightsAPIView

router = DefaultRouter()
router.register(r"transactions", SalesTransactionViewSet)

urlpatterns = [
    path("summary/", RevenueSummaryAPIView.as_view(), name="revenue-summary"),
    path("stakeholder-insights/", StakeholderInsightsAPIView.as_view(), name="stakeholder-insights"),
] + router.urls
