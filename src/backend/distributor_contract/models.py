from django.db import models
from django.contrib.auth.models import User
import os
import uuid

class DistributorContract(models.Model):
    contract_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='contracts/', max_upload_size=1024 * 1024 * 10)  # 10MB max size
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_contracts')
    distributor = models.CharField(max_length=255, help_text="Name of the distributor")  # or ForeignKey to a Distributor model if available
    
    allowed_formats = ['.pdf', '.doc', '.docx']

    def save(self, *args, **kwargs):
        if self.file:
            file_extension = os.path.splitext(self.file.name)[1].lower()
            if file_extension not in self.allowed_formats:
                raise ValueError(f"Unsupported file format: {file_extension}. Allowed formats are: {', '.join(self.allowed_formats)}")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name