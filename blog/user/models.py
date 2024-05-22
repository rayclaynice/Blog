from django.db import models
from django.contrib.auth.models import User
from django_countries.fields import CountryField
from PIL import Image

# Create your models here.
class Profile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default='profile_pics/profile-picture.jpg', upload_to='profile_pics/')
    bio = models.TextField(blank=True)
    country = CountryField(default='US')
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)

    def __str__(self):
        return f'{self.user.username} Profile'
    


    def save(self, *args, **kwargs):
        # Call the original save method
        super().save(*args, **kwargs)

        img = Image.open(self.image.path)
        #check if our current image is greater than 300pixel
        if img.height>200 or img.width >200:

            output_size = (200, 200)

            img.thumbnail(output_size)

            # Save the resized image, overwriting the original image file
            img.save(self.image.path)
