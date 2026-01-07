from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, RegisterSerializer, FavoriteSerializer
from .models import Favorite, Car

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get/update current user profile"""
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class FavoriteListView(generics.ListAPIView):
    """List user's favorites"""
    serializer_class = FavoriteSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('car')


class FavoriteToggleView(APIView):
    """Toggle favorite status for a car"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        # Accept either 'vehicle_id' or 'car_id' for compatibility
        car_id = request.data.get('vehicle_id') or request.data.get('car_id')
        
        if not car_id:
            return Response(
                {"error": "vehicle_id or car_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            car = Car.objects.get(id=car_id)
        except Car.DoesNotExist:
            return Response(
                {"error": "Car not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Toggle: delete if exists, create if not
        favorite, created = Favorite.objects.get_or_create(
            user=request.user, 
            car=car
        )
        
        if not created:
            favorite.delete()
            return Response({
                "status": "removed", 
                "is_favorited": False,
                "car_id": car_id
            })
        
        return Response({
            "status": "added", 
            "is_favorited": True,
            "car_id": car_id
        })
