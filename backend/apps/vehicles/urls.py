from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehicleViewSet, ListingViewSet, PhotoViewSet,
    ConditionReportViewSet, VINLookupRecordViewSet,
    OfferViewSet, TestDriveViewSet, presign_upload,
    InquiryViewSet, recommendations, match_vehicles
)

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet)
router.register(r'listings', ListingViewSet)
router.register(r'photos', PhotoViewSet)
router.register(r'condition-reports', ConditionReportViewSet)
router.register(r'vin-lookup', VINLookupRecordViewSet, basename='vinlookup')
router.register(r'offers', OfferViewSet)
router.register(r'test-drives', TestDriveViewSet)
router.register(r'inquiries', InquiryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('media/presign/', presign_upload, name='media-presign'),
    path('recommendations/', recommendations, name='vehicle-recommendations'),
    path('match/', match_vehicles, name='vehicle-match'),
]
