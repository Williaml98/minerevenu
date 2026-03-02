from rest_framework import serializers

from AuditLog.models import AuditLog
from authapi.models import User
from .models import CompliancePolicy, SecurityIncident


class SecurityIncidentSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True)

    class Meta:
        model = SecurityIncident
        fields = (
            "id",
            "title",
            "description",
            "severity",
            "status",
            "created_by",
            "created_by_email",
            "assigned_to",
            "assigned_to_email",
            "detected_at",
            "resolved_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_by", "resolved_at", "created_at", "updated_at")


class IncidentStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityIncident
        fields = ("status", "assigned_to")

    def update(self, instance, validated_data):
        status_value = validated_data.get("status", instance.status)
        instance.status = status_value
        if "assigned_to" in validated_data:
            instance.assigned_to = validated_data["assigned_to"]
        if status_value == "resolved" and instance.resolved_at is None:
            from django.utils import timezone

            instance.resolved_at = timezone.now()
        if status_value != "resolved":
            instance.resolved_at = None
        instance.save()
        return instance


class CompliancePolicySerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = CompliancePolicy
        fields = (
            "id",
            "control_key",
            "name",
            "description",
            "is_enabled",
            "owner",
            "owner_email",
            "last_reviewed_at",
            "updated_at",
        )
        read_only_fields = ("updated_at",)


class CompliancePolicyControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompliancePolicy
        fields = ("is_enabled", "last_reviewed_at", "owner")


class SecurityEventSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    target_user_email = serializers.EmailField(source="target_user.email", read_only=True)

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "action",
            "timestamp",
            "ip_address",
            "user",
            "user_email",
            "target_user",
            "target_user_email",
            "additional_data",
        )


class SecuritySummarySerializer(serializers.Serializer):
    risk_score = serializers.IntegerField()
    failed_logins_last_24h = serializers.IntegerField()
    open_incidents = serializers.IntegerField()
    critical_open_incidents = serializers.IntegerField()
    users_inactive = serializers.IntegerField()
    latest_critical_events = SecurityEventSerializer(many=True)


class AccessReviewSerializer(serializers.Serializer):
    user_totals = serializers.DictField(child=serializers.IntegerField())
    privileged_users = serializers.ListField(child=serializers.DictField())
    inactive_admin_count = serializers.IntegerField()
    active_admin_count = serializers.IntegerField()


def build_access_review_payload():
    users_by_role = {
        "Admin": User.objects.filter(role="Admin").count(),
        "Officer": User.objects.filter(role="Officer").count(),
        "Stakeholder": User.objects.filter(role="Stakeholder").count(),
    }
    privileged_qs = User.objects.filter(role="Admin").values(
        "id", "email", "username", "is_active"
    )
    payload = {
        "user_totals": users_by_role,
        "privileged_users": list(privileged_qs),
        "inactive_admin_count": User.objects.filter(role="Admin", is_active=False).count(),
        "active_admin_count": User.objects.filter(role="Admin", is_active=True).count(),
    }
    return payload

