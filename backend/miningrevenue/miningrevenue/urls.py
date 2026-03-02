from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("authapi.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/mining/", include("mining.urls")),
    path("api/revenue/", include("revenue.urls")), 
    path('api/', include('communication.urls')), 
    path("api/", include("AuditLog.urls")),
    path("api/security/", include("security_compliance.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
