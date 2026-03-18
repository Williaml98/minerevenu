from rest_framework import serializers
from django.utils import timezone
from .models import SalesTransaction


class SalesTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesTransaction
        fields = "__all__"
        read_only_fields = (
            "total_amount",
            "is_flagged",
            "created_by",
            "validated_by",
            "validated_at",
            "unit_price",
            "status",
        )

    def validate(self, attrs):
        quantity = attrs.get("quantity")
        payment_method = attrs.get("payment_method")
        date_value = attrs.get("date")
        mine = attrs.get("mine")
        today = timezone.now().date()

        if mine is None:
            raise serializers.ValidationError({"mine": "Mine is required."})
        if date_value is None:
            raise serializers.ValidationError({"date": "Sales date is required."})
        if date_value > today:
            raise serializers.ValidationError({"date": "Sales date cannot be in the future."})
        if quantity is not None and quantity <= 0:
            raise serializers.ValidationError({"quantity": "Must be greater than 0."})
        if payment_method is not None and not str(payment_method).strip():
            raise serializers.ValidationError({"payment_method": "Payment method is required."})
        return attrs
