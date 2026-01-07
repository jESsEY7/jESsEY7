from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch
from .models import VINLookupRecord

User = get_user_model()

class VehicleVINLookupViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='dealer', password='pass')

    def test_lookup_cached(self):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(self.user)
        VINLookupRecord.objects.create(vin='1HGCM82633A004352', data={'make':'X'})
        resp = client.get('/api/vehicles/vin/?vin=1HGCM82633A004352')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get('make'), 'X')

    def test_lookup_fetches_and_caches(self):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(self.user)
        with patch('apps.vehicles.services.NHTSAProvider.decode', return_value={'make':'Fetched','model':'M','year':'2019','body_class':'Sedan','raw_data':{}}):
            resp = client.get('/api/vehicles/vin/?vin=1HGCM82633A004352')
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(VINLookupRecord.objects.filter(vin__iexact='1HGCM82633A004352').exists())

    def test_invalid_vin(self):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(self.user)
        resp = client.get('/api/vehicles/vin/?vin=SHORTVIN')
        self.assertEqual(resp.status_code, 400)

    def test_provider_down_returns_503(self):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(self.user)
        with patch('apps.vehicles.services.NHTSAProvider.decode', side_effect=Exception('down')):
            resp = client.get('/api/vehicles/vin-lookup/?vin=1HGCM82633A004352')
            self.assertEqual(resp.status_code, 503)
            self.assertTrue(resp.json().get('manual_entry'))