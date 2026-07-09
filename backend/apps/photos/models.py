"""
Photo model.

Each Photo belongs to an Event. When uploaded, it is queued for AI processing
(face detection + embedding generation). Selfie is a separate model in the
faceai app since selfies belong to a user, not an event's photo pool.
"""
import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone


class Photo(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('processed', 'Processed'),
        ('failed', 'Failed'),
    )

    id = models.BigAutoField(primary_key=True)
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='photos/%Y/%m/')
    thumbnail = models.ImageField(upload_to='photos/thumbs/%Y/%m/', blank=True, null=True)

    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_photos')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    faces_detected = models.PositiveIntegerField(default=0)
    error_message = models.TextField(blank=True)

    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    file_size_kb = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'photos'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event', 'status']),
        ]

    def __str__(self):
        return f"Photo {self.id} - {self.event.name}"
