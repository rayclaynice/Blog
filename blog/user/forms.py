from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
#from django.core.exceptions import ValidationError
from django import forms
from django.contrib.auth.admin import UserAdmin
from .models import Profile
from phonenumber_field.formfields import PhoneNumberField
from phonenumber_field.widgets import PhoneNumberPrefixWidget



class CreateUserForm(UserCreationForm):
    phone_number = PhoneNumberField(
        widget=PhoneNumberPrefixWidget(attrs={'class': 'form-control', 'placeholder': 'Enter your phone number'})
    )
    gender = forms.ChoiceField(
        choices=[('', 'Select your gender')] + Profile.GENDER_CHOICES,
        required=True,
        help_text='Select your gender.'
    )
    date_of_birth = forms.DateField(
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'date', 'placeholder': 'Enter your date of birth'}),
        help_text='Enter your date of birth.'
    )






    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password1', 'password2']
        widgets = {
            'first_name': forms.TextInput(attrs={'placeholder': 'Enter your first name'}),
            'last_name': forms.TextInput(attrs={'placeholder': 'Enter your last name'}),
            'username': forms.TextInput(attrs={'placeholder': 'Enter a unique username (letters, numbers, and underscores)'}),
            'email': forms.EmailInput(attrs={'placeholder': 'Enter your email'}),
            'password1': forms.PasswordInput(attrs={'placeholder': 'Enter a password'}),
            'password2': forms.PasswordInput(attrs={'placeholder': 'Confirm your password'}),
            'phone_number': forms.TextInput(attrs={'placeholder': 'Enter your Phone number'}),
            'gender': forms.Select(attrs={'placeholder': 'Select your gender'}),
            
        }
    


        
    def __init__(self, *args, **kwargs):
        super(CreateUserForm, self).__init__(*args, **kwargs)   #super().__init__(name)  super(<YourModelName>, self).__init__(*args, **kwargs) 
        self.fields['email'].required = True
        self.fields['first_name'].required = True
        self.fields['last_name'].required = True
        self.fields['phone_number'].required = True
        self.fields['gender'].required = True
        self.fields['gender'].required = True
        self.fields['date_of_birth'].required = True
        self.fields['password1'].help_text = 'Your password must be 8 characters long containing a mix of uppercase and lower case letters, numbers, and special characters'
        self.fields['username'].help_text = 'Enter a unique username. only letters, numbers and underscores are allowed.'


        #email validation

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():  #filters the available users and if its equal to the one it input field it raises a validation error 
            raise forms.ValidationError('this email is invalid')
        if len(email) >= 350:
            raise forms.ValidationError("your email is too long")
        return email
    

class UserUpdateForm(forms.ModelForm):
    email = forms.EmailField()

    class Meta:
        model=User
        fields=['username', 'email']


class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['bio', 'image', 'country']