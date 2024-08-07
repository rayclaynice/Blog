from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from django.utils.timesince import timesince
from django.contrib.auth.models import User
from PIL import Image
from django.urls import reverse
from django_resized import ResizedImageField
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFit
from django.contrib.humanize.templatetags import humanize

# Create your models here
class Article(models.Model):
    title = models.CharField(max_length=100)
    sub_title = models.CharField(max_length =2000, default="enjoy your reading")
    preview = models.TextField(default="Click on continue reading to read all")
    content = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete = models.CASCADE)
    image = ResizedImageField(size=[1000,400 ], crop=['middle', 'center'], default='profile_pics/profile-picture.jpg', upload_to='article_images/')
    likes_count = models.IntegerField(default=0) 
    comment_count = models.IntegerField(default=0) 




    def get_date(self):
        now = timezone.now()
        time_difference = now - self.date_posted

        if time_difference < timedelta(days=1):
            hours = time_difference.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif time_difference < timedelta(weeks=1):
            days = time_difference.days
            return f"{days} day{'s' if days != 1 else ''} ago"
        elif time_difference < timedelta(days=30):
            weeks = time_difference.days // 7
            return f"{weeks} week{'s' if weeks != 1 else ''} ago"
        else:
            months = time_difference.days // 30
            return f"{months} month{'s' if months != 1 else ''} ago"

    def __str__(self):
        return self.title


    def get_absolute_url(self):
        return reverse('post-detail', kwargs={'pk': self.pk})




class Comments(models.Model):
    post = models.ForeignKey(Article, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    c_ment = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    comment_likes_count = models.IntegerField(default=0) 


    def get_date(self):
        now = timezone.now()
        time_difference = now - self.created_at

        if time_difference < timedelta(days=1):
            hours = time_difference.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif time_difference < timedelta(weeks=1):
            days = time_difference.days
            return f"{days} day{'s' if days != 1 else ''} ago"
        elif time_difference < timedelta(days=30):
            weeks = time_difference.days // 7
            return f"{weeks} week{'s' if weeks != 1 else ''} ago"
        else:
            months = time_difference.days // 30
            return f"{months} month{'s' if months != 1 else ''} ago"

    def __str__(self):
        return f"Comment by {self.author.username} on {self.created_at}: {self.c_ment}"
    


class Reply(models.Model):
    replies = models.ForeignKey(Comments, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    reply_text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    reply_count =models.IntegerField(default=0)


    def get_date(self):
        now = timezone.now()
        time_difference = now - self.created_at

        if time_difference < timedelta(days=1):
            hours = time_difference.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif time_difference < timedelta(weeks=1):
            days = time_difference.days
            return f"{days} day{'s' if days != 1 else ''} ago"
        elif time_difference < timedelta(days=30):
            weeks = time_difference.days // 7
            return f"{weeks} week{'s' if weeks != 1 else ''} ago"
        else:
            months = time_difference.days // 30
            return f"{months} month{'s' if months != 1 else ''} ago"

    def __str__(self):
        return f"Comment by {self.author.username} on {self.created_at}: {self.reply_text}"


    def __str__(self):
        return f"reply by {self.author.username} on {self.created_at}"







    

class Like(models.Model):
    post = models.ForeignKey(Article, related_name='likes', on_delete=models.CASCADE, default =1)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.post.likes_count = self.post.likes.count()
        self.post.save()

    def delete(self, *args, **kwargs):
        post = self.post
        super().delete(*args, **kwargs)
        post.likes_count = post.likes.count()
        post.save()

    @property
    def total_likes(self):
        return self.likes.count()


class comment_likes(models.Model):
    comment = models.ForeignKey(Comments, related_name='comment_likes', on_delete=models.CASCADE, default =1)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.comment.likes_count = self.comment.comment_likes.count()
        self.comment.save()

    def delete(self, *args, **kwargs):
        comment = self.comment
        super().delete(*args, **kwargs)
        comment.likes_count = comment.likes.count()
        comment.save()

    @property
    def total_likes(self):
        return self.comments_likes.count()
    




class reply_likes(models.Model):
    reply = models.ForeignKey(Reply, related_name='reply_likes', on_delete=models.CASCADE, default =1)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.reply.likes_count = self.reply.reply_likes.count()
        self.reply.save()

    def delete(self, *args, **kwargs):
        reply = self.reply
        super().delete(*args, **kwargs)
        reply.likes_count = reply.likes.count()
        reply.save()

    @property
    def total_likes(self):
        return self.reply_likes.count()
    