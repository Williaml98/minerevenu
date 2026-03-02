from datetime import timedelta

from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from AuditLog.models import AuditLog
from AuditLog.audit_log_utils import log_action
from authapi.models import User
from .models import CompliancePolicy, SecurityIncident
from .permissions import IsAdminOnly, IsAdminOrOfficer
from .serializers import (
    AccessReviewSerializer,
    CompliancePolicyControlSerializer,
    CompliancePolicySerializer,
    IncidentStatusUpdateSerializer,
    SecurityEventSerializer,
    SecurityIncidentSerializer,
    SecuritySummarySerializer,
    build_access_review_payload,
)


class SecuritySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOfficer]
    throttle_scope = "security"

    def get(self, request):
        now = timezone.now()
        start_24h = now - timedelta(hours=24)

        failed_logins = AuditLog.objects.filter(
            action="LOGIN",
            timestamp__gte=start_24h,
        ).filter(
            Q(additional_data__status="failed")
            | Q(additional_data__reason="invalid_credentials")
            | Q(additional_data__reason="account_deactivated")
        )
        open_incidents = SecurityIncident.objects.filter(status__in=["open", "investigating"])
        critical_open = open_incidents.filter(severity="critical")
        inactive_users = User.objects.filter(is_active=False).count()

        latest_critical_events = AuditLog.objects.filter(
            action__in=["USER_DELETE", "USER_DEACTIVATE", "PASSWORD_RESET_COMPLETE"]
        ).order_by("-timestamp")[:10]

        risk_score = min(
            100,
            (failed_logins.count() * 2)
            + (open_incidents.count() * 5)
            + (critical_open.count() * 12)
            + min(inactive_users, 10),
        )

        payload = {
            "risk_score": risk_score,
            "failed_logins_last_24h": failed_logins.count(),
            "open_incidents": open_incidents.count(),
            "critical_open_incidents": critical_open.count(),
            "users_inactive": inactive_users,
            "latest_critical_events": latest_critical_events,
        }
        serializer = SecuritySummarySerializer(payload)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SecurityEventListView(generics.ListAPIView):
    serializer_class = SecurityEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOfficer]
    throttle_scope = "security"

    def get_queryset(self):
        qs = AuditLog.objects.select_related("user", "target_user").all()
        action = self.request.query_params.get("action")
        user_id = self.request.query_params.get("user")
        since_days = self.request.query_params.get("since_days")

        if action:
            qs = qs.filter(action=action)
        if user_id:
            qs = qs.filter(user_id=user_id)
        if since_days:
            try:
                days = int(since_days)
                if days > 0:
                    qs = qs.filter(timestamp__gte=timezone.now() - timedelta(days=days))
            except ValueError:
                pass

        return qs.order_by("-timestamp")


class SecurityIncidentListCreateView(generics.ListCreateAPIView):
    queryset = SecurityIncident.objects.select_related("created_by", "assigned_to").all()
    serializer_class = SecurityIncidentSerializer
    throttle_scope = "security"

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdminOrOfficer()]
        return [permissions.IsAuthenticated(), IsAdminOrOfficer()]

    def perform_create(self, serializer):
        incident = serializer.save(created_by=self.request.user)
        log_action(
            self.request,
            "SECURITY_INCIDENT_CREATE",
            additional_data={"incident_id": incident.id, "severity": incident.severity},
        )


class SecurityIncidentStatusUpdateView(generics.UpdateAPIView):
    queryset = SecurityIncident.objects.all()
    serializer_class = IncidentStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    throttle_scope = "security"

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        log_action(
            request,
            "SECURITY_INCIDENT_STATUS_UPDATE",
            additional_data={"incident_id": instance.id, "status": instance.status},
        )
        return response


class CompliancePolicyListView(generics.ListAPIView):
    queryset = CompliancePolicy.objects.select_related("owner").all()
    serializer_class = CompliancePolicySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOfficer]
    throttle_scope = "security"


class CompliancePolicyControlUpdateView(generics.UpdateAPIView):
    queryset = CompliancePolicy.objects.all()
    serializer_class = CompliancePolicyControlSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    throttle_scope = "security"

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        log_action(
            request,
            "COMPLIANCE_POLICY_UPDATE",
            additional_data={
                "policy_id": instance.id,
                "control_key": instance.control_key,
                "is_enabled": instance.is_enabled,
            },
        )
        return response


class AccessReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    throttle_scope = "security"

    def get(self, request):
        payload = build_access_review_payload()
        serializer = AccessReviewSerializer(payload)
        return Response(serializer.data, status=status.HTTP_200_OK)

