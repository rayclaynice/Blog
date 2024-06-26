# Generated by Django 5.0.2 on 2024-04-18 08:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0014_like'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='like',
            unique_together=set(),
        ),
        migrations.AddField(
            model_name='like',
            name='article_like',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='likes', to='index.article'),
        ),
        migrations.RemoveField(
            model_name='like',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='like',
            name='liked_item_id',
        ),
        migrations.RemoveField(
            model_name='like',
            name='liked_item_type',
        ),
    ]
