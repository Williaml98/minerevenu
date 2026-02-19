from rest_framework import serializers
from .models import RevenueForecast


class RevenueForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueForecast
        fields = "__all__"
