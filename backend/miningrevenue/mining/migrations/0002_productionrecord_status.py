from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mining", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="productionrecord",
            name="status",
            field=models.CharField(
                choices=[
                    ("Pending", "Pending"),
                    ("Approved", "Approved"),
                    ("Rejected", "Rejected"),
                ],
                default="Pending",
                max_length=20,
            ),
        ),
    ]
