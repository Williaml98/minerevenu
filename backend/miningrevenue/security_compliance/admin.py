from django.contrib import admin

from .models import CompliancePolicy, SecurityIncident


@admin.register(SecurityIncident)
class SecurityIncidentAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "severity", "status", "created_by", "assigned_to", "detected_at")
    list_filter = ("severity", "status")
    search_fields = ("title", "description")


@admin.register(CompliancePolicy)
class CompliancePolicyAdmin(admin.ModelAdmin):
    list_display = ("control_key", "name", "is_enabled", "owner", "last_reviewed_at")
    list_filter = ("is_enabled",)
    search_fields = ("control_key", "name")

