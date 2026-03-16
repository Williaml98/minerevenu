from datetime import date, timedelta

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from mining.models import Mine, ProductionRecord


class SalesValidationTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            email="admin@example.com",
            username="Admin User",
            password="StrongPass123!",
            role="Admin",
            status="Active",
        )
        self.client.force_authenticate(user=self.user)
        self.mine = Mine.objects.create(
            name="Alpha Mine",
            location="Zone A",
            license_number="LIC-1001",
            mineral_type="Gold",
            status="Active",
        )

    def test_sales_requires_prior_production(self):
        payload = {
            "mine": self.mine.id,
            "date": date.today().isoformat(),
            "quantity": 5,
            "unit_price": 1000,
            "payment_method": "Bank Transfer",
        }
        response = self.client.post("/api/revenue/transactions/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Production record required before sales", str(response.data))

    def test_sales_cannot_exceed_total_production(self):
        ProductionRecord.objects.create(
            mine=self.mine,
            date=date.today() - timedelta(days=1),
            quantity_produced=10,
            unit_price=1000,
        )

        payload = {
            "mine": self.mine.id,
            "date": date.today().isoformat(),
            "quantity": 15,
            "unit_price": 1000,
            "payment_method": "Bank Transfer",
        }
        response = self.client.post("/api/revenue/transactions/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Sales quantity exceeds total produced quantity", str(response.data))
