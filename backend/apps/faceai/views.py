import logging

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from apps.core.permissions import IsAdminRole
from apps.core.responses import api_response
from apps.events.models import Event
from .models import Selfie
from .serializers import SelfieUploadSerializer, SelfieSerializer
from .services import process_selfie

logger = logging.getLogger(__name__)


class SelfieCaptureView(APIView):
    """
    POST /api/faceai/selfie/<event_id>/
    multipart/form-data, field name 'image'.

    This is the core AI moment of the product from the attendee's side:
    capture a selfie -> detect face -> generate embedding -> match against
    every face in this event's photos -> return match count immediately.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id)

        serializer = SelfieUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        selfie = Selfie.objects.create(
            user=request.user,
            event=event,
            image=serializer.validated_data['image'],
        )

        try:
            process_selfie(selfie)
        except Exception as exc:
            logger.exception("Selfie processing failed for selfie %s: %s", selfie.id, exc)
            return api_response(
                data=SelfieSerializer(selfie).data,
                message=selfie.error_message or "Face processing failed. Please try again.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if selfie.status == 'failed':
            return api_response(
                data=SelfieSerializer(selfie).data,
                message=selfie.error_message,
                status=status.HTTP_400_BAD_REQUEST,
            )

        match_count = selfie.matches.count()
        return api_response(
            data={
                'selfie': SelfieSerializer(selfie).data,
                'match_count': match_count,
            },
            message=f"Face matched! Found {match_count} photo(s) of you.",
            status=status.HTTP_201_CREATED,
        )


class ReprocessEventView(APIView):
    """
    POST /api/faceai/reprocess/<event_id>/
    Admin utility: re-runs face detection on every photo in the event
    (useful after changing the detection threshold, or if photos failed).
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, event_id):
        from apps.photos.models import Photo
        from .services import process_photo
        from .models import FaceEmbedding

        event = get_object_or_404(Event, pk=event_id, created_by=request.user)
        photos = Photo.objects.filter(event=event)

        reprocessed, failed = 0, 0
        for photo in photos:
            FaceEmbedding.objects.filter(photo=photo).delete()
            try:
                process_photo(photo)
                reprocessed += 1
            except Exception as exc:
                logger.exception("Reprocess failed for photo %s: %s", photo.id, exc)
                failed += 1

        event.processed_photos = event.photos.filter(status='processed').count()
        event.status = 'ready' if event.processed_photos >= event.total_photos else 'processing'
        event.save(update_fields=['processed_photos', 'status'])

        return api_response(
            data={'reprocessed': reprocessed, 'failed': failed, 'total': photos.count()},
            message=f"Reprocessed {reprocessed} photo(s), {failed} failed.",
        )
