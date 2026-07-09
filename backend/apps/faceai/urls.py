from django.urls import path
from . import views

urlpatterns = [
    path('selfie/<int:event_id>/', views.SelfieCaptureView.as_view(), name='selfie-capture'),
    path('reprocess/<int:event_id>/', views.ReprocessEventView.as_view(), name='reprocess-event'),
]
