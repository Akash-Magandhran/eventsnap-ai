from rest_framework import serializers
from .models import Photo


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = [
            'id', 'public_id', 'event', 'image', 'thumbnail', 'status',
            'faces_detected', 'error_message', 'width', 'height',
            'file_size_kb', 'created_at', 'processed_at',
        ]
        read_only_fields = ['id', 'public_id', 'status', 'faces_detected', 'created_at', 'processed_at']


class PhotoUploadSerializer(serializers.Serializer):
    """Handles multi-file upload: images = [file1, file2, ...]"""
    images = serializers.ListField(
        child=serializers.ImageField(),
        allow_empty=False,
        max_length=200,  # sanity cap per request batch; admins can call multiple times for 1000+
    )


class MyPhotoResultSerializer(serializers.Serializer):
    """What an attendee sees in 'My Photos' - the photo plus match confidence."""
    photo_id = serializers.IntegerField(source='photo.id')
    public_id = serializers.UUIDField(source='photo.public_id')
    image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    similarity = serializers.FloatField()
    matched_at = serializers.DateTimeField(source='created_at')

    def get_image(self, obj):
        request = self.context.get('request')
        url = obj.photo.image.url if obj.photo.image else None
        return request.build_absolute_uri(url) if (request and url) else url

    def get_thumbnail(self, obj):
        request = self.context.get('request')
        url = obj.photo.thumbnail.url if obj.photo.thumbnail else None
        return request.build_absolute_uri(url) if (request and url) else url
