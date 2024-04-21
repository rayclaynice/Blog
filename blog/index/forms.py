from django import forms
from .models import Comments

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comments
        fields = ('c_ment',)
        widgets = {
            'c_ment': forms.Textarea(attrs={'maxlength': 200, 'required': True}),
        }
