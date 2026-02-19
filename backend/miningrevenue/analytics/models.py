from django.db import models


class RevenueForecast(models.Model):
    forecast_date = models.DateField()
    predicted_revenue = models.FloatField()
    model_version = models.CharField(max_length=100, default="ARIMA_v1")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.forecast_date)
