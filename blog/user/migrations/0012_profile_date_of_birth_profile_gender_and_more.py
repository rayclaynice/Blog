# Generated by Django 5.0.2 on 2024-05-20 08:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0011_profile_country'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='gender',
            field=models.CharField(blank=True, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], max_length=1),
        ),
        migrations.AddField(
            model_name='profile',
            name='phone_number',
            field=models.CharField(blank=True, max_length=15),
        ),
    ]