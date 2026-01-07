from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Vehicle, Listing, Photo, ConditionReport, VINLookupRecord, Offer, TestDrive
from .tasks import process_photo
import os

User = get_user_model()

class VehiclesModelsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='dealer', password='pass')
        self.vehicle = Vehicle.objects.create(make='Toyota', model='Camry', year=2018, price=15000.00)

    def test_create_listing(self):
        listing = Listing.objects.create(vehicle=self.vehicle, price=14999.99, is_published=True)
        self.assertEqual(listing.vehicle, self.vehicle)
        self.assertTrue(listing.is_published)

    def test_photo_and_ordering(self):
        p1 = Photo.objects.create(vehicle=self.vehicle, url='http://example.com/1.jpg', order=1)
        p2 = Photo.objects.create(vehicle=self.vehicle, url='http://example.com/2.jpg', order=0)
        photos = list(self.vehicle.photos.all())
        self.assertEqual(photos[0], p2)

    def test_condition_report(self):
        cr = ConditionReport.objects.create(vehicle=self.vehicle, engine_health='good', bodywork='excellent', tire_tread='good')
        self.assertEqual(cr.engine_health, 'good')

    def test_vin_lookup_record(self):
        rec = VINLookupRecord.objects.create(vin='1HGCM82633A004352', data={'make':'Honda'})
        self.assertEqual(rec.vin, '1HGCM82633A004352')

    def test_offer_and_testdrive(self):
        listing = Listing.objects.create(vehicle=self.vehicle, price=15000)
        buyer = User.objects.create_user(username='buyer', password='pass')
        offer = Offer.objects.create(listing=listing, buyer=buyer, amount=14000)
        td = TestDrive.objects.create(listing=listing, requester=buyer, scheduled_for='2030-01-01T10:00:00Z')
        self.assertEqual(offer.amount, 14000)
        self.assertEqual(td.requester, buyer)

    def test_publish_requires_verification(self):
        listing = Listing.objects.create(vehicle=self.vehicle, price=15000)
        # no VIN lookup and no condition report
        from rest_framework.test import APIClient
        c = APIClient()
        c.force_authenticate(self.user)
        resp = c.post(f'/api/vehicles/listings/{listing.id}/publish/')
        self.assertEqual(resp.status_code, 400)
        # now ensure vehicle has a VIN and add vin lookup and a good condition report
        self.vehicle.vin = '1HGCM82633A004352'
        self.vehicle.save()
        VINLookupRecord.objects.create(vin=self.vehicle.vin, data={'make':'Toyota'})
        ConditionReport.objects.create(vehicle=self.vehicle, engine_health='good', bodywork='excellent', tire_tread='good', completed=True, score=85)
        resp2 = c.post(f'/api/vehicles/listings/{listing.id}/publish/')
        self.assertEqual(resp2.status_code, 200)

    def test_monthly_filter(self):
        # Create listings with different prices
        l1 = Listing.objects.create(vehicle=self.vehicle, price=12000)
        self.vehicle2 = Vehicle.objects.create(make='Honda', model='Civic', year=2017, price=24000)
        l2 = Listing.objects.create(vehicle=self.vehicle2, price=24000)
        from rest_framework.test import APIClient
        c = APIClient()
        resp = c.get('/api/vehicles/listings/?monthly_max=250&interest=3&term_months=60')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # Handle both paginated and non-paginated responses
        items = data.get('results') if isinstance(data, dict) and 'results' in data else data
        ids = [str(item['id']) for item in items]
        # expect l1 to be included and l2 excluded given the monthly_max
        self.assertIn(str(l1.id), ids)
        self.assertNotIn(str(l2.id), ids)

    def test_process_photo_task(self):
        # Create a temporary image file and point a Photo to it using a file:// URL
        from PIL import Image
        import tempfile
        tmpdir = tempfile.mkdtemp()
        img_path = os.path.join(tmpdir, 'test.jpg')
        img = Image.new('RGB', (800, 600), color=(155, 0, 0))
        img.save(img_path, 'JPEG')

        p = Photo.objects.create(vehicle=self.vehicle, url=f'file://{img_path}')
        # Call processing directly (synchronous)
        from .tasks import process_photo
        ok = process_photo(p.id)
        p.refresh_from_db()
        self.assertTrue(ok)
        self.assertTrue(p.processed)
        self.assertTrue(p.thumbnail_url)

    def test_deduplication(self):
        # create two identical images and ensure dedupe marks second as duplicate
        from PIL import Image
        import tempfile, shutil
        tmpdir = tempfile.mkdtemp()
        img_path1 = os.path.join(tmpdir, 'test1.jpg')
        img_path2 = os.path.join(tmpdir, 'test2.jpg')
        img = Image.new('RGB', (640, 480), color=(10, 100, 200))
        img.save(img_path1, 'JPEG')
        # copy to second path (identical bytes)
        shutil.copy(img_path1, img_path2)

        p1 = Photo.objects.create(vehicle=self.vehicle, url=f'file://{img_path1}')
        ok1 = process_photo(p1.id)
        p1.refresh_from_db()
        self.assertTrue(ok1)
        self.assertTrue(p1.processed)
        self.assertTrue(p1.phash)
        self.assertTrue(p1.thumbnail_url)

        p2 = Photo.objects.create(vehicle=self.vehicle, url=f'file://{img_path2}')
        ok2 = process_photo(p2.id)
        p2.refresh_from_db()
        self.assertTrue(ok2)
        self.assertTrue(p2.processed)
        self.assertTrue(p2.is_duplicate)
        self.assertEqual(p2.metadata.get('duplicate_of'), p1.id)
        self.assertEqual(p2.thumbnail_url, p1.thumbnail_url)

    def test_celery_app_import(self):
        # Ensure that the Celery app is importable
        from config import celery_app
        self.assertIsNotNone(celery_app)


