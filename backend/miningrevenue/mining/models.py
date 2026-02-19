from django.db import models


class Mine(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100, unique=True)
    mineral_type = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default="Active")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProductionRecord(models.Model):
    mine = models.ForeignKey(Mine, on_delete=models.CASCADE, related_name="productions")
    date = models.DateField()
    quantity_produced = models.FloatField()
    unit_price = models.FloatField()
    total_revenue = models.FloatField(blank=True, null=True)

    def save(self, *args, **kwargs):
        self.total_revenue = self.quantity_produced * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.mine.name} - {self.date}"
