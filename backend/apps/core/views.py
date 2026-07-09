from django.db.models import Sum, Count
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import IsAdminRole
from apps.core.responses import api_response
from apps.events.models import Event
from apps.photos.models import Photo
from apps.faceai.models import FaceMatch, Selfie


class AdminDashboardView(APIView):
    """
    GET /api/events/dashboard/
    High-level numbers for the admin dashboard landing page.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        events = Event.objects.filter(created_by=request.user)

        total_events = events.count()
        totals = events.aggregate(total_photos=Sum('total_photos'), processed_photos=Sum('processed_photos'))
        total_attendees = sum(e.attendances.count() for e in events)
        total_matches = FaceMatch.objects.filter(photo__event__in=events).count()

        recent_events = events.order_by('-created_at')[:5]

        return api_response(data={
            'total_events': total_events,
            'total_photos': totals['total_photos'] or 0,
            'total_processed_photos': totals['processed_photos'] or 0,
            'total_attendees': total_attendees,
            'total_face_matches': total_matches,
            'recent_events': [
                {
                    'id': e.id,
                    'name': e.name,
                    'status': e.status,
                    'total_photos': e.total_photos,
                    'processed_photos': e.processed_photos,
                    'created_at': e.created_at,
                }
                for e in recent_events
            ],
        })
