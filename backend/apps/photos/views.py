import logging

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from apps.core.permissions import IsAdminRole
from apps.core.responses import api_response
from apps.events.models import Event
from .models import Photo
from .serializers import PhotoSerializer, PhotoUploadSerializer, MyPhotoResultSerializer

logger = logging.getLogger(__name__)


class PhotoUploadView(APIView):
    """
    POST /api/photos/upload/<event_id>/
    multipart/form-data, field name 'images' (multiple files).

    Saves all photos immediately (status=pending) and returns right away,
    then triggers AI processing for each one. For local dev this runs
    synchronously per photo, in order, so very large batches (500-1000
    photos) will take a while - the dashboard polls processed_photos/total
    to show progress.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id, created_by=request.user)

        serializer = PhotoUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        images = serializer.validated_data['images']

        created_photos = []
        for img in images:
            photo = Photo.objects.create(event=event, image=img, uploaded_by=request.user)
            created_photos.append(photo)

        event.total_photos = event.photos.count()
        event.status = 'processing'
        event.save(update_fields=['total_photos', 'status'])

        # Kick off AI processing for each newly uploaded photo.
        from apps.faceai.services import process_photo

        for photo in created_photos:
            try:
                process_photo(photo)
            except Exception as exc:
                logger.exception("Failed to process photo %s: %s", photo.id, exc)
                photo.status = 'failed'
                photo.error_message = str(exc)[:500]
                photo.save(update_fields=['status', 'error_message'])

        event.refresh_from_db()
        if event.processed_photos >= event.total_photos:
            event.status = 'ready'
            event.save(update_fields=['status'])

        return api_response(
            data={
                'uploaded_count': len(created_photos),
                'event': {
                    'id': event.id,
                    'total_photos': event.total_photos,
                    'processed_photos': event.processed_photos,
                    'status': event.status,
                },
                'photos': PhotoSerializer(created_photos, many=True, context={'request': request}).data,
            },
            message=f"{len(created_photos)} photo(s) uploaded and processed.",
            status=status.HTTP_201_CREATED,
        )


class EventPhotoListView(generics.ListAPIView):
    """GET /api/photos/event/<event_id>/ - admin gallery for an event (Pinterest-style grid source)"""
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = PhotoSerializer

    def get_queryset(self):
        event = get_object_or_404(Event, pk=self.kwargs['event_id'], created_by=self.request.user)
        return Photo.objects.filter(event=event)

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page or qs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return api_response(data=serializer.data)


class PhotoDeleteView(generics.DestroyAPIView):
    """DELETE /api/photos/<id>/"""
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = Photo.objects.all()

    def get_queryset(self):
        return Photo.objects.filter(event__created_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        photo = self.get_object()
        event = photo.event
        photo.delete()
        event.total_photos = event.photos.count()
        event.save(update_fields=['total_photos'])
        return api_response(message="Photo deleted successfully.")


class MyPhotosView(APIView):
    """
    GET /api/photos/my-photos/<event_id>/
    Returns ONLY the photos where the logged-in attendee's face was matched
    for this event - this is the core privacy guarantee of the product.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        from apps.faceai.models import FaceMatch, Selfie

        event = get_object_or_404(Event, pk=event_id)

        selfie = Selfie.objects.filter(user=request.user, event=event).order_by('-created_at').first()
        if not selfie:
            return api_response(
                data={'matches': [], 'has_selfie': False},
                message="No selfie captured yet for this event.",
            )

        matches = (
            FaceMatch.objects.filter(selfie=selfie)
            .select_related('photo')
            .order_by('-similarity')
        )

        serialized = MyPhotoResultSerializer(matches, many=True, context={'request': request}).data
        return api_response(data={'matches': serialized, 'has_selfie': True, 'total_matches': len(serialized)})
