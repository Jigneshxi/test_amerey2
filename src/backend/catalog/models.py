from django.db import models
from django.core.exceptions import ValidationError

class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name="Product Name")
    description = models.TextField(verbose_name="Product Description")
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Product Image")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    def clean(self):
        super().clean()
        if self.name is None or not self.name.strip():
            raise ValidationError("Product name cannot be empty.")
        if len(self.name) > 255:
            raise ValidationError("Product name cannot exceed 255 characters.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name