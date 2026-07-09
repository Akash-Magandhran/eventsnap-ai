from rest_framework import serializers
from .models import Event, EventAttendance


class EventSerializer(serializers.ModelSerializer):
    join_url = serializers.ReadOnlyField()
    processing_progress = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'public_id', 'name', 'description', 'slug', 'cover_image',
            'event_date', 'location', 'status', 'qr_code_image',
            'total_photos', 'processed_photos', 'processing_progress',
            'join_url', 'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'public_id', 'slug', 'status', 'qr_code_image',
            'total_photos', 'processed_photos', 'created_at', 'updated_at',
        ]


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['name', 'description', 'cover_image', 'event_date', 'location']

    def validate_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Event name must be at least 3 characters.")
        return value.strip()


class EventPublicSerializer(serializers.ModelSerializer):
    """What an attendee sees when they land on /join/<slug> - no sensitive fields."""

    class Meta:
        model = Event
        fields = ['public_id', 'name', 'description', 'cover_image', 'event_date', 'location', 'status']


class EventAttendanceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = EventAttendance
        fields = ['id', 'user_name', 'user_email', 'joined_at', 'has_selfie']
