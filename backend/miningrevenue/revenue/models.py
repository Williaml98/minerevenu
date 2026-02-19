from django.db import models
from mining.models import Mine
from django.conf import settings


class SalesTransaction(models.Model):
    mine = models.ForeignKey(Mine, on_delete=models.CASCADE)
    date = models.DateField()
    quantity = models.FloatField()
    unit_price = models.FloatField()
    total_amount = models.FloatField(blank=True, null=True)
    payment_method = models.CharField(max_length=100)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    is_flagged = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Transaction {self.id}"
