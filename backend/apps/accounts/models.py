"""
Custom User model.

We use email as the unique login identifier instead of username, and add a
`role` field to distinguish event organizers (admins) from attendees who are
just trying to find their own photos.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, role='attendee', **extra_fields):
        if not email:
            raise ValueError("Email address is required.")
        if not name:
            raise ValueError("Name is required.")

        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', 'Admin / Organizer'),
        ('attendee', 'Attendee'),
    )

    id = models.BigAutoField(primary_key=True)
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='attendee')

    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} <{self.email}> ({self.role})"

    @property
    def is_admin(self):
        return self.role == 'admin'


class PasswordResetToken(models.Model):
    """Short-lived token used for the 'forgot password' flow."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    class Meta:
        db_table = 'password_reset_tokens'

    def is_valid(self):
        from django.conf import settings
        expiry_minutes = 30
        age = (timezone.now() - self.created_at).total_seconds() / 60
        return not self.used and age <= expiry_minutes
