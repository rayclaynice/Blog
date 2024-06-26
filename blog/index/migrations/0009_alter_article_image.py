# Generated by Django 5.0.2 on 2024-03-21 13:57

import django_resized.forms
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0008_alter_article_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='image',
            field=django_resized.forms.ResizedImageField(crop=['middle', 'center'], default='profile_pics/profile-picture.jpg', force_format='JPEG', keep_meta=True, quality=150, scale=0.5, size=[900, 380], upload_to='article_images/'),
        ),
    ]
