from django.contrib import admin
from .models import Article, Comments,Like, Reply

# Register your models here.
admin.site.register(Article)
admin.site.register(Comments)
admin.site.register(Like)
admin.site.register(Reply)
