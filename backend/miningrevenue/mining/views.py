from rest_framework import generics, permissions, filters, status
from rest_framework import viewsets
from .models import Mine, ProductionRecord
from .serializers import MineSerializer, ProductionRecordSerializer


class MineViewSet(viewsets.ModelViewSet):
    queryset = Mine.objects.all()
    serializer_class = MineSerializer
    permission_classes = [permissions.IsOfficer]
    
    

class ProductionRecordViewSet(viewsets.ModelViewSet):
    queryset = ProductionRecord.objects.all()
    serializer_class = ProductionRecordSerializer
    permission_classes = [permissions.IsOfficer]
    
