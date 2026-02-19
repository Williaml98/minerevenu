from rest_framework.routers import DefaultRouter
from .views import SalesTransactionViewSet

router = DefaultRouter()
router.register(r"transactions", SalesTransactionViewSet)

urlpatterns = router.urls
