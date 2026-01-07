from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteViewSet, calculate_financing, check_affordability

router = DefaultRouter()
router.register(r'quotes', QuoteViewSet, basename='quote')

urlpatterns = [
    path('', include(router.urls)),
    path('calculate-financing/', calculate_financing, name='calculate-financing'),
    path('check-affordability/', check_affordability, name='check-affordability'),
]
