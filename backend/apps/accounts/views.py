import logging

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from apps.core.responses import api_response
from .models import PasswordResetToken
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, tokens_for_user

User = get_user_model()
logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = tokens_for_user(user)
        return api_response(
            data={'user': UserSerializer(user).data, 'tokens': tokens},
            message="Account created successfully.",
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/auth/login/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = tokens_for_user(user)
        return api_response(
            data={'user': UserSerializer(user).data, 'tokens': tokens},
            message="Logged in successfully.",
        )


class LogoutView(APIView):
    """POST /api/auth/logout/ - blacklists the supplied refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return api_response(message="Refresh token is required.", status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            pass  # already invalid/expired - logout is idempotent either way
        return api_response(message="Logged out successfully.")


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/  { "email": "..." }
    Creates a reset token. In production this would email a reset link;
    here we return the token directly so the dev flow is fully testable
    without an SMTP server configured.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower()
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            # Don't leak whether an email exists
            return api_response(message="If that email exists, a reset link has been sent.")

        reset = PasswordResetToken.objects.create(user=user)
        logger.info("Password reset token for %s: %s", email, reset.token)

        return api_response(
            data={'reset_token': str(reset.token)},
            message="If that email exists, a reset link has been sent. (Dev mode: token returned directly)",
        )


class ResetPasswordView(APIView):
    """POST /api/auth/reset-password/  { "token": "...", "new_password": "..." }"""
    permission_classes = [AllowAny]

    def post(self, request):
        token_value = request.data.get('token')
        new_password = request.data.get('new_password')

        if not token_value or not new_password:
            return api_response(message="Token and new_password are required.", status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return api_response(message="Password must be at least 8 characters.", status=status.HTTP_400_BAD_REQUEST)

        reset = PasswordResetToken.objects.filter(token=token_value).first()
        if not reset or not reset.is_valid():
            return api_response(message="This reset link is invalid or has expired.", status=status.HTTP_400_BAD_REQUEST)

        user = reset.user
        user.set_password(new_password)
        user.save(update_fields=['password'])

        reset.used = True
        reset.save(update_fields=['used'])

        return api_response(message="Password reset successfully. You can now log in.")
