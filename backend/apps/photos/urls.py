from django.urls import path
from . import views

urlpatterns = [
    path('upload/<int:event_id>/', views.PhotoUploadView.as_view(), name='photo-upload'),
    path('event/<int:event_id>/', views.EventPhotoListView.as_view(), name='event-photo-list'),
    path('my-photos/<int:event_id>/', views.MyPhotosView.as_view(), name='my-photos'),
    path('<int:pk>/', views.PhotoDeleteView.as_view(), name='photo-delete'),
]
