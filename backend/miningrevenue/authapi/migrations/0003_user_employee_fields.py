from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authapi", "0002_alter_user_role"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="employee_id",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name="user",
            name="telephone",
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name="user",
            name="location",
            field=models.CharField(blank=True, max_length=120, null=True),
        ),
        migrations.AddField(
            model_name="user",
            name="bachelor_degree",
            field=models.FileField(
                blank=True,
                help_text="Upload bachelor degree document",
                null=True,
                upload_to="degrees/",
            ),
        ),
    ]
