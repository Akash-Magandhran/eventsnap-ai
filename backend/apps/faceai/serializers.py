from rest_framework import serializers
from .models import Selfie, FaceMatch


class SelfieUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()


class SelfieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Selfie
        fields = ['id', 'public_id', 'image', 'status', 'detection_score', 'error_message', 'created_at']
        read_only_fields = ['id', 'public_id', 'status', 'detection_score', 'error_message', 'created_at']


class FaceMatchSerializer(serializers.ModelSerializer):
    photo_image = serializers.ImageField(source='photo.image', read_only=True)

    class Meta:
        model = FaceMatch
        fields = ['id', 'photo', 'photo_image', 'similarity', 'created_at']
