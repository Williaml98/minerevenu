from django.urls import path

from .views import (
    AccessReviewView,
    CompliancePolicyControlUpdateView,
    CompliancePolicyListView,
    SecurityEventListView,
    SecurityIncidentListCreateView,
    SecurityIncidentStatusUpdateView,
    SecuritySummaryView,
)

urlpatterns = [
    path("summary/", SecuritySummaryView.as_view(), name="security-summary"),
    path("events/", SecurityEventListView.as_view(), name="security-events"),
    path("incidents/", SecurityIncidentListCreateView.as_view(), name="security-incidents"),
    path(
        "incidents/<int:pk>/status/",
        SecurityIncidentStatusUpdateView.as_view(),
        name="security-incident-status",
    ),
    path("policies/", CompliancePolicyListView.as_view(), name="security-policies"),
    path(
        "policies/<int:pk>/control/",
        CompliancePolicyControlUpdateView.as_view(),
        name="security-policy-control",
    ),
    path("access-reviews/", AccessReviewView.as_view(), name="security-access-reviews"),
]

