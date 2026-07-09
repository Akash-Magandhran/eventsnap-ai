"""
Event model.

Each event has a unique `slug` that is embedded into a QR code. Scanning the
QR code takes the attendee to FRONTEND_URL/join/<slug>, where they register/
login and then capture a selfie scoped to that specific event.
"""
import uuid
import secrets
from django.conf import settings
from django.db import models
from django.utils import timezone


def generate_slug():
    return secrets.token_urlsafe(8)


class Event(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('processing', 'Processing Photos'),
        ('ready', 'Ready'),
        ('archived', 'Archived'),
    )

    id = models.BigAutoField(primary_key=True)
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    slug = models.SlugField(max_length=32, unique=True, default=generate_slug)

    cover_image = models.ImageField(upload_to='event_covers/', blank=True, null=True)

    event_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events'
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    qr_code_image = models.ImageField(upload_to='qrcodes/', blank=True, null=True)

    total_photos = models.PositiveIntegerField(default=0)
    processed_photos = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.slug})"

    @property
    def join_url(self):
        return f"{settings.FRONTEND_URL}/join/{self.slug}"

    @property
    def processing_progress(self):
        if self.total_photos == 0:
            return 0
        return round((self.processed_photos / self.total_photos) * 100, 1)


class EventAttendance(models.Model):
    """Tracks which users have joined which events (scanned the QR + registered)."""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendances')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_attendances')
    joined_at = models.DateTimeField(auto_now_add=True)
    has_selfie = models.BooleanField(default=False)

    class Meta:
        db_table = 'event_attendances'
        unique_together = ('event', 'user')

    def __str__(self):
        return f"{self.user.name} @ {self.event.name}"
