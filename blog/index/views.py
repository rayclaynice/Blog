from django.shortcuts import render,get_object_or_404, redirect
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Article, Comments, Like
from .forms import CommentForm
from django.db.models import Prefetch
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.core.serializers import serialize
from django.views.generic import View
from django.views.generic import (ListView,
                                  DetailView,
                                  CreateView,
                                  UpdateView,
                                  DeleteView
                                  )
from django.urls import reverse_lazy
from django.contrib.auth.mixins import (LoginRequiredMixin,
                                        UserPassesTestMixin,
                                        )


class ArticleListView(ListView):
    model = Article
    template_name = 'article_list.html'
    context_object_name = 'articles'
    ordering = ['-date_posted']
    paginate_by = 2



    def get_queryset(self):
        # Prefetch related comments for each article
        queryset = super().get_queryset().prefetch_related(
            Prefetch('comments_set', queryset=Comments.objects.all(), to_attr='article_comments')
        )
        return queryset



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
            return JsonResponse({'success': True}) 

        else:
             return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    
    context = {
        'article': article,
        'comments': comments,
        'form': form,
    }

    return render(request, 'article_list.html', context)

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
    return JsonResponse({'likes_count': likes_count})
'''
@login_required
def like_post(request, pk):
    post = get_object_or_404(Article, pk=pk)
    user = request.user
    like, created = Like.objects.get_or_create(post=post, user=user)
    if created:
        post.likes_count += 1
        post.save()
        likes_count = post.likes_count
        message = 'Post liked successfully.'
    else:
        likes_count = post.likes_count
        message = 'You have already liked this post.'
    return JsonResponse({'likes': likes_count, 'message': message})

'''
'''
def save_like(request):
    if request.method == 'POST':
        user = request.user  # Assuming the user is authenticated
        liked_item_id = request.POST.get('liked_item_id')
        liked_item_type = request.POST.get('liked_item_type')

        # Check if the like already exists
        if Like.objects.filter(user=user, liked_item_id=liked_item_id, liked_item_type=liked_item_type).exists():
            return JsonResponse({'status': 'error', 'message': 'Like already exists'}, status=400)
        
        # Create and save the like
        like = Like(user=user, liked_item_id=liked_item_id, liked_item_type=liked_item_type)
        like.save()

        # You can return any additional data you want to the JavaScript
        return JsonResponse({'status': 'success', 'message': 'Like saved successfully'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

'''


'''
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
            return redirect('index') 

    else:
        form = CommentForm()
    context = {
        'article': article,
        'comments': comments,
        'form': form,
    }

    return render(request, 'article_list.html', context)

'''





# views.py
'''
from django.shortcuts import render, get_object_or_404
from .models import Article

def article_detail(request, pk):
    # Retrieve the article object
    article = get_object_or_404(Article, pk=pk)
    # Retrieve the total number of comments for this article
    total_comments = article.comments_set.count()
    context = {
        'article': article,
        'total_comments': total_comments,
    }
    return render(request, 'article_detail.html', context)

'''

##codes not used because it rendered json instead of html








'''
class ArticleAjaxView(View):
    def get(self, request, *args, **kwargs):
        articles = Article.objects.all().order_by('-date_posted')
        paginator = Paginator(articles, 2)
        page_number = request.GET.get('page')
        
        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        articles_list = []
        for article in page_obj:
            articles_list.append({
                'id': article.id,
                'title': article.title,
                'sub_title': article.sub_title,
                'date_posted': article.date_posted.strftime("%B %d, %Y"),
                'author': article.author.username,
                'author_username': article.author.username,
                'author_profile_image': article.author.profile.image.url,
                'author_image': article.author.profile.image.url,
                'preview': article.preview,
                'image': article.image.url,
            })

        data = {
            'articles': articles_list,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'num_pages': paginator.num_pages,
            'current_page_number': page_obj.number,
        }
        return JsonResponse(data)
'''