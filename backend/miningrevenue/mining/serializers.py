from rest_framework import serializers
from django.utils import timezone
from .models import Mine, ProductionRecord


class MineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mine
        fields = "__all__"


class ProductionRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionRecord
        fields = "__all__"
        read_only_fields = ("total_revenue", "status")

    def validate(self, attrs):
        quantity = attrs.get("quantity_produced")
        unit_price = attrs.get("unit_price")
        date_value = attrs.get("date")
        today = timezone.now().date()

        if quantity is not None and quantity <= 0:
            raise serializers.ValidationError({"quantity_produced": "Must be greater than 0."})
        if unit_price is not None and unit_price <= 0:
            raise serializers.ValidationError({"unit_price": "Must be greater than 0."})
        if date_value is None:
            raise serializers.ValidationError({"date": "Production date is required."})
        if date_value > today:
            raise serializers.ValidationError({"date": "Production date cannot be in the future."})
        return attrs
