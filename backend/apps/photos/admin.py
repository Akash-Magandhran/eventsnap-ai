from django.contrib import admin
from .models import Photo


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'event', 'status', 'faces_detected', 'created_at')
    list_filter = ('status', 'event')
    readonly_fields = ('faces_detected', 'width', 'height', 'file_size_kb', 'processed_at')
