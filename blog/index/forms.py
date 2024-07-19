from django import forms
from .models import Comments, Reply
from django.utils.safestring import mark_safe

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comments
        fields = ('c_ment',)
        widgets = {
            'c_ment': forms.Textarea(attrs={'maxlength': 200, 'required': True}),
            
        }


class ReplyForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        comment_author_username = kwargs.pop('comment_author_username', None)
        print("Comment Author Username:", comment_author_username)
        super().__init__(*args, **kwargs)
        if comment_author_username:
            self.comment_author_username = comment_author_username

    reply_text = forms.CharField(
        widget=forms.Textarea(attrs={'maxlength': 200, 'required': True}),
    )

    class Meta:
        model = Reply
        fields = ('reply_text',)

    def clean_reply_text(self):
        reply_text = self.cleaned_data.get('reply_text')
        if self.comment_author_username:
            # Format the username and append it to the reply text
            styled_username = mark_safe(f"<strong><span style='color: green;'>@{self.comment_author_username}</span></strong>")
            reply_text = f"{styled_username} {reply_text}"
        return reply_text
