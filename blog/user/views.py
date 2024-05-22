from django.shortcuts import render, redirect
from django.http import HttpResponse
from .forms import CreateUserForm, UserUpdateForm, ProfileUpdateForm
from django.contrib.sites.shortcuts import get_current_site
from .token import user_tokenizer_generate
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Profile
from django.shortcuts import get_object_or_404
from index.models import Article
from django.http import JsonResponse

# Create your views here.

def register(request):
    form = CreateUserForm()
    if request.method == 'POST':
        form = CreateUserForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.is_active = False   #any account created will be activated untill user verifis his email address
            user.save()
        
            current_site = get_current_site(request)  #The get_current_site(request) method is commonly used in Django projects to retrieve the current site object based on the request. This is particularly useful in scenarios where your application supports multiple sites with different domains or where the domain name is dynamically determined based on the request.
            subject ='Account verification email'
            message = render_to_string('email-verification.html', {   #render_to_string(template_name, context, request=none)
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': user_tokenizer_generate.make_token(user),

            })
            user.email_user(subject=subject, message=message)
            username = form.cleaned_data.get('username')
            messages.success(request, f'Acount created for {username}!')

            return JsonResponse({'success': True})
    context = {"form": form}

    return render(request, 'register.html', context)



def email_verification(request, uidb64, token):
    #uniqueID
    unique_id = force_str(urlsafe_base64_decode(uidb64))
    user = User.objects.get(pk=unique_id)


    #success
    if user and user_tokenizer_generate.check_token(user, token):
        user.is_active =True
        user.save()
        return redirect('email-verification-success')


    #failed
    else:
        return redirect('email-verification-failed')

    
    




def email_verification_sent(request):

    return render(request, 'email-verification-sent.html')
 


def email_verification_success(request):

    return render(request, 'email-verification-success.html')



def email_verification_failed(request):

    return render(request, 'email-verification-failed.html')


#log out redirect to profile views
@login_required
def profile_page(request):
    all_profiles = Profile.objects.all()
    context = {
        'all_profiles':all_profiles
    }
    return render(request, 'profile.html', context)

@login_required
def profile_update(request):
    if request.method == "POST":
        profile_instance = get_object_or_404(Profile, user=request.user)
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(request.POST, request.FILES, instance=profile_instance)

        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            username = u_form.cleaned_data.get('username')
            messages.success(request, f' profile updated for {username}!')
            return redirect('profile')
    else:
        u_form = UserUpdateForm(instance=request.user)
        profile_instance = get_object_or_404(Profile, user=request.user)
        p_form = ProfileUpdateForm(instance=profile_instance)

    requested_user = request.user
    article = Article.objects.filter(author = requested_user)
     

    context ={
        'u_form':u_form,
        'p_form': p_form,
        'article':article,

    }

    return render(request, 'profile-update.html', context)

