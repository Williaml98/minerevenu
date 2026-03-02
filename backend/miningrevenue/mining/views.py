from rest_framework import permissions
from rest_framework import viewsets
from .models import Mine, ProductionRecord
from .serializers import MineSerializer, ProductionRecordSerializer


class IsAdminOrOfficerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in {"Admin", "Officer"}


class MineViewSet(viewsets.ModelViewSet):
    queryset = Mine.objects.all()
    serializer_class = MineSerializer
    permission_classes = [IsAdminOrOfficerOrReadOnly]


class ProductionRecordViewSet(viewsets.ModelViewSet):
    queryset = ProductionRecord.objects.all()
    serializer_class = ProductionRecordSerializer
    permission_classes = [IsAdminOrOfficerOrReadOnly]
