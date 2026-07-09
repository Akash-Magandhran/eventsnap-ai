"""
Role-based permissions.

EventSnap has two kinds of authenticated users:
- ADMIN / ORGANIZER: creates events, uploads photos, manages the dashboard
- ATTENDEE: scans a QR code, registers, takes a selfie, finds their own photos

These map to the User.role field defined in apps.accounts.models.
"""
from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allows access only to users with role == 'admin' (event organizers / photographers)."""

    message = "Only event organizers can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsAttendeeRole(BasePermission):
    """Allows access only to users with role == 'attendee'."""

    message = "This action is only available to event attendees."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'attendee'
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level permission: only the owner of an object, or an admin, can touch it."""

    def has_object_permission(self, request, view, obj):
        owner_id = getattr(obj, 'user_id', None) or getattr(obj, 'created_by_id', None)
        return request.user.role == 'admin' or owner_id == request.user.id
