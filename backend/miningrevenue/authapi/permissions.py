from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Admin"


class IsOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Officer"


class IsStakeholder(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Stakeholder"


class IsAdminOrStakeholder(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_stakeholder = IsStakeholder().has_permission(request, view)
        return is_admin or is_stakeholder


class IsAdminOrStakeholderOrOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_stakeholder = IsStakeholder().has_permission(request, view)
        is_officer = IsOfficer().has_permission(request, view)
        return is_admin or is_stakeholder or is_officer