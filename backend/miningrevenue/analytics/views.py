from rest_framework.views import APIView
from rest_framework.response import Response
from ml.forecasting import forecast_next_steps
from .models import RevenueForecast
from datetime import date, timedelta
from .serializers import RevenueForecastSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class GenerateForecastAPIView(APIView):

    def get(self, request):
        predictions = forecast_next_steps(6)

        today = date.today()

        for i, value in enumerate(predictions):
            forecast_date = today + timedelta(days=30*(i+1))

            obj = RevenueForecast.objects.create(
                forecast_date=forecast_date,
                predicted_revenue=value
            )

        return Response(RevenueForecastSerializer(obj, many=True).data)
    

class RevenueForecastViewSet(viewsets.ModelViewSet):
    queryset = RevenueForecast.objects.all()
    serializer_class = RevenueForecastSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.order_by("-forecast_date")