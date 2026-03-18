from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
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

    def perform_create(self, serializer):
        serializer.save(status=ProductionRecord.STATUS_PENDING)

    def perform_update(self, serializer):
        instance = serializer.save()
        if self.request.user.role == "Officer":
            if instance.status != ProductionRecord.STATUS_PENDING:
                instance.status = ProductionRecord.STATUS_PENDING
                instance.save(update_fields=["status"])

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        if request.user.role != "Admin":
            return Response(
                {"detail": "Only admins can update production status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        production = self.get_object()
        new_status = request.data.get("status")

        allowed_statuses = {
            ProductionRecord.STATUS_PENDING,
            ProductionRecord.STATUS_APPROVED,
            ProductionRecord.STATUS_REJECTED,
        }

        if new_status not in allowed_statuses:
            return Response(
                {
                    "detail": "Invalid status. Use one of: Pending, Approved, Rejected."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        production.status = new_status
        production.save(update_fields=["status"])
        serializer = self.get_serializer(production)
        return Response(serializer.data, status=status.HTTP_200_OK)
