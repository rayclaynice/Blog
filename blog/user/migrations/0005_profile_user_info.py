# Generated by Django 5.0.2 on 2024-03-07 09:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0004_remove_profile_user_info'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='user_info',
            field=models.CharField(default='', max_length=100),
        ),
    ]
