from django.urls import path
from .views import( ArticleListView,
                    ArticleDetailView,
                    ArticleCreateView,
                    ArticleUpdateView,
                    ArticleDeleteView,
                    UserArticleView,
                    
                    
                  )
from . import views



urlpatterns= [
    #Blog main page
    path('', ArticleListView.as_view(), name="index"),
    path('article/<int:pk>/', ArticleDetailView.as_view(), name="article-detail"),
    path('article/new/', ArticleCreateView.as_view(), name="article-create"),
    path('user/<str:username>/', UserArticleView.as_view(), name="user-article"),
    path('article/<int:pk>/update/', ArticleUpdateView.as_view(), name="article-update"),
    path('article/<int:pk>/delete/', ArticleDeleteView.as_view(), name="article-delete"),
   # path('article/<int:pk>/comment/', CommentCreateView.as_view(), name='article_comment'),
    path('like/<int:pk>/', views.like_post, name='like_post'),
    path('like_comment/<int:pk>/', views.like_comment, name='like_comment'),
    path('get_like_count/<int:pk>/', views.get_like_count, name='get_like_count'),
    path('get_comment_like_count/<int:pk>/', views.get_comment_like_count, name='get_comment_like_count'),
    path('get_comment_count/<int:pk>/', views.get_comment_count, name='get_comment_count'),
    path('get_comments/<int:pk>/', views.comment_view, name='article_comment'),
    path('update_comments/<int:pk>/', views.update_comments, name='update_comments'),
    path('delete_comments/<int:pk>/', views.delete_comments, name='delete_comments'),

   # path('update-like-count/', views.save_like, name='update-like-count'),

]