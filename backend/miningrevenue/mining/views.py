from rest_framework import viewsets
from .models import Mine, ProductionRecord
from .serializers import MineSerializer, ProductionRecordSerializer


class MineViewSet(viewsets.ModelViewSet):
    queryset = Mine.objects.all()
    serializer_class = MineSerializer


class ProductionRecordViewSet(viewsets.ModelViewSet):
    queryset = ProductionRecord.objects.all()
    serializer_class = ProductionRecordSerializer
