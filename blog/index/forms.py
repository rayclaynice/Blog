from django import forms
from .models import Comments, Reply

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
        super().__init__(*args, **kwargs)
        if comment_author_username:
            self.fields['reply_text'].initial = f'Replying to {comment_author_username}: '

    reply_text = forms.CharField(
        widget=forms.Textarea(attrs={'maxlength': 200, 'required': True}),
    )

    class Meta:
        model = Reply
        fields = ('reply_text',)

    def clean_reply_text(self):
        reply_text = self.cleaned_data.get('reply_text')
        # No need to prepend @username here since it's handled in the initial value
        comment_author_username = self.instance.replies.author.username
        reply_text = f"@{comment_author_username} {reply_text}"
        return reply_text