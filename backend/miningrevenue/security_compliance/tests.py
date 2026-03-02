from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from authapi.models import User


class SecurityCompliancePermissionTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="AdminPass123!",
            role="Admin",
        )
        self.officer = User.objects.create_user(
            username="officer",
            email="officer@example.com",
            password="OfficerPass123!",
            role="Officer",
        )
        self.stakeholder = User.objects.create_user(
            username="stakeholder",
            email="stakeholder@example.com",
            password="StakeholderPass123!",
            role="Stakeholder",
        )

    def test_stakeholder_denied_security_summary(self):
        self.client.force_authenticate(user=self.stakeholder)
        res = self.client.get(reverse("security-summary"))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_officer_can_view_security_summary(self):
        self.client.force_authenticate(user=self.officer)
        res = self.client.get(reverse("security-summary"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_admin_can_create_incident(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(
            reverse("security-incidents"),
            {
                "title": "Suspicious login pattern",
                "description": "Multiple failed attempts from one IP",
                "severity": "high",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

