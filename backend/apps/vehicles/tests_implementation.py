from django.test import TestCase
from django.conf import settings
from .models import Vehicle, Listing, Photo
from .serializers import ListingSerializer
from .views import ListingFilter
from rest_framework.test import APIRequestFactory

class ImplementationTestCase(TestCase):
    def setUp(self):
        self.vehicle = Vehicle.objects.create(
            make="Toyota", model="Camry", year=2022, price=25000, 
            body_type="sedan", fuel_type="gasoline"
        )
        self.listing = Listing.objects.create(vehicle=self.vehicle, price=25000, status='active')

    def test_whatsapp_link_in_serializer(self):
        serializer = ListingSerializer(self.listing)
        self.assertIn('whatsapp_link', serializer.data)
        self.assertEqual(serializer.data['whatsapp_link'], settings.WHATSAPP_COMMUNITY_URL)

    def test_photo_primary_logic(self):
        # Create first primary photo
        p1 = Photo.objects.create(vehicle=self.vehicle, url="http://example.com/1.jpg", is_primary=True)
        self.assertTrue(p1.is_primary)

        # Create second primary photo
        p2 = Photo.objects.create(vehicle=self.vehicle, url="http://example.com/2.jpg", is_primary=True)
        
        # Reload p1
        p1.refresh_from_db()
        self.assertFalse(p1.is_primary)
        self.assertTrue(p2.is_primary)

        # Create third non-primary photo
        p3 = Photo.objects.create(vehicle=self.vehicle, url="http://example.com/3.jpg", is_primary=False)
        p2.refresh_from_db()
        self.assertTrue(p2.is_primary)
        self.assertFalse(p3.is_primary)

    def test_listing_filter(self):
        # Create another vehicle for filtering
        v2 = Vehicle.objects.create(
            make="Honda", model="Civic", year=2020, price=20000, 
            body_type="sedan"
        )
        l2 = Listing.objects.create(vehicle=v2, price=20000, status='active')

        # Test Filter
        qs = Listing.objects.all()
        
        # Filter by year 2022
        f = ListingFilter({'year': 2022}, queryset=qs)
        self.assertTrue(f.is_valid())
        self.assertEqual(f.qs.count(), 1)
        self.assertEqual(f.qs.first().vehicle.year, 2022)

        # Filter by price range
        f = ListingFilter({'min_price': 22000}, queryset=qs)
        self.assertEqual(f.qs.count(), 1) # only Camry (25000)

        f = ListingFilter({'max_price': 22000}, queryset=qs)
        self.assertEqual(f.qs.count(), 1) # only Civic (20000)

        # Filter by body_type
        f = ListingFilter({'body_type': 'sedan'}, queryset=qs)
        self.assertEqual(f.qs.count(), 2)
