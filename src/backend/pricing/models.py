from django.db import models
from django.contrib.auth.models import User

class PricingRule(models.Model):
    product_id = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.TextField(blank=True, null=True)  # For complex rules
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pricing Rule for Product {self.product_id}: {self.price}"

    def clean(self):
        super().clean()
        if self.price <= 0:
            raise ValueError("Price must be greater than zero.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)