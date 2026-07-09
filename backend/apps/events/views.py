from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView

from apps.core.permissions import IsAdminRole
from apps.core.responses import api_response
from .models import Event, EventAttendance
from .qr_utils import generate_qr_for_event
from .serializers import (
    EventSerializer, EventCreateSerializer, EventPublicSerializer, EventAttendanceSerializer
)


class EventListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/events/         -> admin's own events
    POST /api/events/create/  -> create a new event (also generates QR)
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        return Event.objects.filter(created_by=self.request.user)

    def get_serializer_class(self):
        return EventCreateSerializer if self.request.method == 'POST' else EventSerializer

    def perform_create(self, serializer):
        event = serializer.save(created_by=self.request.user)
        generate_qr_for_event(event)
        event.save()
        self._created_event = event

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return api_response(
            data=EventSerializer(self._created_event, context={'request': request}).data,
            message="Event created and QR code generated.",
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(qs)
        serializer = EventSerializer(page or qs, many=True, context={'request': request})
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return api_response(data=serializer.data)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/events/<id>/ - admin only, must own the event"""
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = EventSerializer
    queryset = Event.objects.all()

    def get_queryset(self):
        return Event.objects.filter(created_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return api_response(data=self.get_serializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return api_response(message="Event deleted successfully.")


class RegenerateQRView(APIView):
    """POST /api/events/<id>/regenerate-qr/"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        event = get_object_or_404(Event, pk=pk, created_by=request.user)
        generate_qr_for_event(event)
        event.save()
        return api_response(data=EventSerializer(event).data, message="QR code regenerated.")


class EventPublicView(APIView):
    """
    GET /api/events/join/<slug>/
    Public lookup used right after a QR scan - no auth required, minimal fields.
    """
    permission_classes = [AllowAny]

    def get(self, request, slug):
        event = get_object_or_404(Event, slug=slug)
        if event.status == 'archived':
            return api_response(message="This event is no longer active.", status=404)
        return api_response(data=EventPublicSerializer(event).data)


class JoinEventView(APIView):
    """
    POST /api/events/join/<slug>/
    Authenticated attendee confirms they're joining this event (called right
    after login/register on the join page, before the selfie capture step).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        event = get_object_or_404(Event, slug=slug)
        attendance, _created = EventAttendance.objects.get_or_create(event=event, user=request.user)
        return api_response(
            data=EventAttendanceSerializer(attendance).data,
            message="Joined event successfully.",
        )


class EventAttendeesView(generics.ListAPIView):
    """GET /api/events/<id>/attendees/ - admin dashboard list of who has joined"""
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = EventAttendanceSerializer

    def get_queryset(self):
        event = get_object_or_404(Event, pk=self.kwargs['pk'], created_by=self.request.user)
        return EventAttendance.objects.filter(event=event).select_related('user')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return api_response(data=self.get_serializer(qs, many=True).data)


class EventAnalyticsView(APIView):
    """GET /api/events/<id>/analytics/"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, pk):
        event = get_object_or_404(Event, pk=pk, created_by=request.user)
        attendances = EventAttendance.objects.filter(event=event)
        from apps.photos.models import Photo
        from apps.faceai.models import FaceMatch

        total_attendees = attendances.count()
        selfies_captured = attendances.filter(has_selfie=True).count()
        total_matches = FaceMatch.objects.filter(photo__event=event).count()
        avg_matches_per_attendee = round(total_matches / selfies_captured, 1) if selfies_captured else 0

        return api_response(data={
            'event_name': event.name,
            'status': event.status,
            'total_photos': event.total_photos,
            'processed_photos': event.processed_photos,
            'processing_progress': event.processing_progress,
            'total_attendees': total_attendees,
            'selfies_captured': selfies_captured,
            'total_face_matches': total_matches,
            'avg_matches_per_attendee': avg_matches_per_attendee,
        })
