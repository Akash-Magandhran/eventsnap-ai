from django.contrib import admin
from .models import Selfie, FaceEmbedding, FaceMatch


@admin.register(Selfie)
class SelfieAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'event', 'status', 'detection_score', 'created_at')
    list_filter = ('status', 'event')
    readonly_fields = ('embedding', 'embedding_dim', 'detection_score')


@admin.register(FaceEmbedding)
class FaceEmbeddingAdmin(admin.ModelAdmin):
    list_display = ('id', 'photo', 'detection_score', 'created_at')
    readonly_fields = ('embedding', 'embedding_dim')


@admin.register(FaceMatch)
class FaceMatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'selfie', 'photo', 'similarity', 'created_at')
    list_filter = ('photo__event',)
