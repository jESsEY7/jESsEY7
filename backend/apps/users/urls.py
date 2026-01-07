from django.urls import path
from .views import RegisterView, UserProfileView, FavoriteListView, FavoriteToggleView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('me/', UserProfileView.as_view(), name='me'),
    path('favorites/', FavoriteListView.as_view(), name='favorites-list'),
    path('favorites/toggle/', FavoriteToggleView.as_view(), name='favorites-toggle'),
    path('', RegisterView.as_view(), name='user-list-create'), # Handling base /api/users/ for POST
]
