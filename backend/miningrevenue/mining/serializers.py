from rest_framework import serializers
from .models import Mine, ProductionRecord


class MineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mine
        fields = "__all__"


class ProductionRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionRecord
        fields = "__all__"
