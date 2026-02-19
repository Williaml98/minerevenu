from rest_framework import viewsets
from .models import SalesTransaction
from .serializers import SalesTransactionSerializer
from ml.anomaly import detect_anomalies
import pandas as pd


class SalesTransactionViewSet(viewsets.ModelViewSet):
    queryset = SalesTransaction.objects.all()
    serializer_class = SalesTransactionSerializer

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
