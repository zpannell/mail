# Generated by Django 4.2.10 on 2024-02-20 17:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mail", "0002_alter_email_read"),
    ]

    operations = [
        migrations.AlterField(
            model_name="email",
            name="read",
            field=models.BooleanField(default=False),
        ),
    ]
