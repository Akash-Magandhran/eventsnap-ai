from django.contrib import admin
from .models import Event, EventAttendance


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_by', 'status', 'total_photos', 'processed_photos', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'slug')
    readonly_fields = ('slug', 'qr_code_image', 'total_photos', 'processed_photos')


@admin.register(EventAttendance)
class EventAttendanceAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'joined_at', 'has_selfie')
    list_filter = ('has_selfie',)
