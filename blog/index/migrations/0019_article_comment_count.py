# Generated by Django 5.0.2 on 2024-04-21 10:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0018_remove_like_likes_count_article_likes_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='comment_count',
            field=models.IntegerField(default=0),
        ),
    ]
