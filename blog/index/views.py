from django.shortcuts import render,get_object_or_404, redirect
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Article, Comments, Like, comment_likes
from .forms import CommentForm
from django.db.models import Prefetch
from django.core.paginator import Paginator
from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
from django.core.serializers import serialize
from django.views.generic import View
from django.views.generic import (ListView,
                                  DetailView,
                                  CreateView,
                                  UpdateView,
                                  DeleteView
                                  )
from django.views.generic.edit import FormView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import (LoginRequiredMixin,
                                        UserPassesTestMixin,
                                        )
from django.utils.timesince import timesince





'''
class ArticleListView(ListView):
    model = Article
    template_name = 'article_list.html'
    context_object_name = 'articles'
    ordering = ['-date_posted']
    paginate_by = 2


    def get_queryset(self):

        queryset = super().get_queryset().prefetch_related(
            Prefetch('comments_set', queryset=Comments.objects.order_by('-created_at'), to_attr='article_comments')
        )

        return queryset
    
    def paginate_comments(self, comments, page_number, per_page):
        paginator = Paginator(comments, per_page)
        try:
            paginated_comments = paginator.page(page_number)
        except PageNotAnInteger:
            paginated_comments = paginator.page(1)
        except EmptyPage:
            paginated_comments = paginator.page(paginator.num_pages)
        return paginated_comments

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        for article in context['articles']:
            article.page_number = self.request.GET.get('page_' + str(article.pk), 1)
            article.paginated_comments = self.paginate_comments(article.comments_set.all(), article.page_number, 3) 
        return context

'''






class ArticleListView(ListView):
    model = Article
    template_name = 'article_list.html'
    context_object_name = 'articles'
    ordering = ['-date_posted']
    paginate_by = 2

    def get_queryset(self):
        # Determine the pagination parameter based on the URL type
        pagetype = self.kwargs.get('pagetype')  # Assuming 'pagetype' is used in the URL
        page_number = self.request.GET.get(f'{pagetype}page')  # Use 'apage' or 'cpage' depending on 'pagetype'

        queryset = super().get_queryset().prefetch_related(
            Prefetch('comments_set', queryset=Comments.objects.order_by('-created_at'), to_attr='article_comments')
        )

        for article in queryset:
            paginator = Paginator(article.article_comments, 3)
            page_obj = paginator.get_page(page_number)
            article.article_comments = page_obj

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        pagetype = self.kwargs.get('pagetype')  # Assuming 'pagetype' is used in the URL
        context['pagetype'] = pagetype
        return context

    


class UserArticleView(ListView):
    model= Article
    context_object_name = 'posts'
    #ordering = ['-date_posted'] order_by can be taken off and added to the filter queryset
    paginate_by = 5


    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs.get('username'))
        return Article.objects.filter(author=user).order_by('-date_posted')
       # print("User:", user)
        #print(queryset)
        #return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = get_object_or_404(User, username=self.kwargs.get('username'))
        context['user_article'] = user
        return context
#override the get_template method to avoid conflict with the previous list view
    def get_template_names(self):
        return ['user_article_list.html']
    




class ArticleDetailView(DetailView):
    model = Article


class ArticleCreateView(LoginRequiredMixin, CreateView):
    model    = Article
    fields = ['title', 'content', 'sub_title', 'preview', 'date_posted', 'image']
    success_url = reverse_lazy('index')

    
    def form_valid(self, form):
        form.instance.author = self.request.user  # Assuming you have authentication set up
        self.object = form.save()
        return super().form_valid(form)


class ArticleUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model    = Article
    fields = ['title', 'content', 'sub_title', 'preview', 'date_posted', 'image']
    success_url = reverse_lazy('index')

    
    def form_valid(self, form):
        form.instance.author = self.request.user  # Assuming you have authentication set up
        return super().form_valid(form)
    
    def test_func(self):
        article = self.get_object()
        if self.request.user == article.author:
            return True
        return False


class ArticleDeleteView(LoginRequiredMixin, UserPassesTestMixin,DeleteView):
    model = Article
    success_url = '/'

    def test_func(self):
        article = self.get_object()
        if self.request.user == article.author:
            return True
        return False




@login_required
def comment_view(request, pk):
    article = get_object_or_404(Article, pk=pk)
    comments = Comments.objects.filter(post=article)

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = article
            comment.author = request.user
            comment.save()
            return JsonResponse({'success': True, 'message': 'Comment submitted successfully'}) 
            #eturn redirect('index') 

    return JsonResponse({'success': False})



        
@login_required
def like_post(request, pk):
    article = get_object_or_404(Article, pk=pk)
    
    user = request.user
    
    # Check if the user has already liked the article
    has_liked = Like.objects.filter(post=article, user=user).exists()
    
    if has_liked:
        # If the user has already liked the article, remove the like
        Like.objects.filter(post=article, user=user).delete()
        message = 'You have unliked this post.'
        liked = False
    else:
        # If the user hasn't liked the article, add a like
        Like.objects.create(post=article, user=user)
        message = 'You have liked this post.'
        liked =  True

    # Update the likes count for the article

    # Return JSON response with updated likes count and message
    return JsonResponse({'liked': liked, 'message': message})


def get_like_count(request, pk):
    article = get_object_or_404(Article, pk=pk)
    likes_count = article.likes.count()
    #print('like counts:', likes_count)
    return JsonResponse({'likes_count': likes_count})


@login_required
def like_comment(request, pk):
    comment = get_object_or_404(Comments, pk=pk)
    
    user = request.user
    
    # Check if the user has already liked the article
    has_liked = comment_likes.objects.filter(comment=comment, user=user).exists()
    
    if has_liked:
        # If the user has already liked the article, remove the like
        comment_likes.objects.filter(comment=comment, user=user).delete()
        message = 'You have unliked this post.'
        liked = False
    else:
        # If the user hasn't liked the article, add a like
        comment_likes.objects.create(comment=comment, user=user)
        message = 'You have liked this post.'
        liked =  True

    # Update the likes count for the article

    # Return JSON response with updated likes count and message
    return JsonResponse({'liked': liked, 'message': message})


def get_comment_like_count(request, pk):
    comment = get_object_or_404(Comments, pk=pk)
    commment_likes_count = comment.comment_likes.count()
    return JsonResponse({'comment_likes_count': commment_likes_count})






def get_comment_count(request, pk):
    article = get_object_or_404(Article, pk=pk)
    comment_count = article.comments_set.count()
    return JsonResponse({'comment_count': comment_count})





def update_comments(request, pk):
    # Retrieve the article instance using its primary key (pk)
    article = get_object_or_404(Article, pk=pk)
    comments = Comments.objects.filter(post=article).order_by('-created_at')

    paginator = Paginator(comments, 3)
    page_number = request.GET.get('page')
    
    try:
        comments = paginator.page(page_number)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        comments = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        comments = paginator.page(paginator.num_pages)
        
    comments_data = []
    for comment in comments:
        comment_data = {
            'id': comment.pk,
            'author': comment.author.username,
            'author_image_url': comment.author.profile.image.url,
            'c_ment': comment.c_ment,
            'created_at': timesince(comment.created_at),  # Format created_at as needed
            'comment_likes_count': comment.comment_likes.count(),
        }
        comments_data.append(comment_data)

    current_user_data = None
    if request.user.is_authenticated:
        current_user_data = {
            'id': request.user.id,
            'username': request.user.username,
        }

    return JsonResponse({
        'article': {'author_username': article.author.username,},
        'current_user': current_user_data, 
        'comments': comments_data,
        'has_next': comments.has_next(),
        'has_previous': comments.has_previous(),
        'page_number': comments.number,
        'num_pages': paginator.num_pages,

    })


@login_required
def delete_comments(request, pk):
    comment = get_object_or_404(Comments, pk=pk)

    if request.user == comment.author:
        if request.method == 'POST':
            comment.delete()
            return JsonResponse({'message': 'Comment deleted successfully'})
        else:
            return JsonResponse({'message': 'Please send a POST request to delete this comment'}, status=400)
    else:
        return JsonResponse({'message': 'You are not authorized to delete this comment'}, status=403)
    