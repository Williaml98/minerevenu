from rest_framework import permissions, viewsets
from .models import SalesTransaction
from .serializers import SalesTransactionSerializer
from ml.anomaly import detect_anomalies
import pandas as pd


class IsAdminOrOfficerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in {"Admin", "Officer"}


class SalesTransactionViewSet(viewsets.ModelViewSet):
    queryset = SalesTransaction.objects.all()
    serializer_class = SalesTransactionSerializer
    permission_classes = [IsAdminOrOfficerOrReadOnly]

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)

        # Prepare data for anomaly detection
        data = pd.DataFrame([{
            "Quantity_Tons": instance.quantity,
            "Unit_Price_USD": instance.unit_price,
            "Total_Amount_USD": instance.total_amount,
            "Allocation_Percentage": 10 
        }])

        result = detect_anomalies(data)

        if result[0] == 1:
            instance.is_flagged = True
            instance.save()
