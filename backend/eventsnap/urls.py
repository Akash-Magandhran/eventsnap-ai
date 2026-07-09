"""
EventSnap AI - Root URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth & accounts
    path('api/auth/', include('apps.accounts.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Domain apps
    path('api/events/', include('apps.events.urls')),
    path('api/photos/', include('apps.photos.urls')),
    path('api/faceai/', include('apps.faceai.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
