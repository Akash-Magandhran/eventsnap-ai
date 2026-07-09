"""
Management command: seed_demo

Creates a demo admin (organizer) account and one demo event with a
generated QR code, so you can immediately test the upload + selfie +
matching flow without manually clicking through registration.

Usage:
    python manage.py seed_demo
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from apps.events.models import Event
from apps.events.qr_utils import generate_qr_for_event

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds a demo admin user and a demo event with a QR code."

    def handle(self, *args, **options):
        admin_email = "admin@eventsnap.ai"
        admin, created = User.objects.get_or_create(
            email=admin_email,
            defaults={'name': 'Demo Organizer', 'role': 'admin', 'is_staff': True},
        )
        if created:
            admin.set_password('Admin@12345')
            admin.save()
            self.stdout.write(self.style.SUCCESS(f"Created admin user: {admin_email} / Admin@12345"))
        else:
            self.stdout.write(self.style.WARNING(f"Admin user already exists: {admin_email}"))

        event, created = Event.objects.get_or_create(
            name="EventSnap Demo Wedding",
            created_by=admin,
            defaults={'description': 'Demo event for local testing', 'status': 'draft'},
        )
        if created:
            generate_qr_for_event(event)
            event.save()
            self.stdout.write(self.style.SUCCESS(f"Created demo event: {event.name}"))
            self.stdout.write(self.style.SUCCESS(f"Join URL: {event.join_url}"))
        else:
            self.stdout.write(self.style.WARNING(f"Demo event already exists: {event.name}"))
            self.stdout.write(self.style.WARNING(f"Join URL: {event.join_url}"))

        self.stdout.write(self.style.SUCCESS("\nDemo data ready. Login at /api/auth/login/ with:"))
        self.stdout.write(f"  email: {admin_email}")
        self.stdout.write(f"  password: Admin@12345")
