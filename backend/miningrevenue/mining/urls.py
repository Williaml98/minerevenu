from rest_framework.routers import DefaultRouter
from .views import MineViewSet, ProductionRecordViewSet

router = DefaultRouter()
router.register(r"mines", MineViewSet)
router.register(r"production", ProductionRecordViewSet)

urlpatterns = router.urls
