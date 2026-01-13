from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Admin"


class IsOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Officer"


class IsAuditor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Auditor"
    
class IsStakeholder(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Stakeholder"


class IsAdminOrAuditor(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_auditor = IsAuditor().has_permission(request, view)
        return is_admin or is_auditor


class IsAdminOrOfficerOrAuditorOrStakeholder(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_officer = IsOfficer().has_permission(request, view)
        is_auditor = IsAuditor().has_permission(request, view)
        is_stakeholder = IsStakeholder().has_permission(request, view)
        return is_admin or is_officer or is_auditor or is_stakeholder
