from django.urls import path
from . import views
from apps.core.views import AdminDashboardView

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('', views.EventListCreateView.as_view(), name='event-list-create'),
    path('<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    path('<int:pk>/regenerate-qr/', views.RegenerateQRView.as_view(), name='event-regenerate-qr'),
    path('<int:pk>/attendees/', views.EventAttendeesView.as_view(), name='event-attendees'),
    path('<int:pk>/analytics/', views.EventAnalyticsView.as_view(), name='event-analytics'),
    path('join/<slug:slug>/', views.EventPublicView.as_view(), name='event-public'),
    path('join/<slug:slug>/confirm/', views.JoinEventView.as_view(), name='event-join'),
]
