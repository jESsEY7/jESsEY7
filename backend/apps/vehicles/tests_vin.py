from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch
from .services import VINLookupService
from .models import VINLookupRecord

User = get_user_model()

class VINLookupServiceTests(TestCase):
    def test_decode_and_cache_creates_record(self):
        service = VINLookupService()
        fake = {'make':'TestMake','model':'T','year':'2020','body_class':'Sedan','raw_data':{}}

        with patch.object(service.provider, 'decode', return_value=fake) as mock_decode:
            data, created = service.get_vehicle_data('1HGCM82633A004352')
            self.assertTrue(created)
            self.assertEqual(data['make'], 'TestMake')
            # second call should use cache
            data2, created2 = service.get_vehicle_data('1HGCM82633A004352')
            self.assertFalse(created2)
            mock_decode.assert_called_once()

    def test_invalid_vin_raises(self):
        service = VINLookupService()
        with self.assertRaises(ValueError):
            service.get_vehicle_data('BADVIN')

    def test_provider_failure_raises(self):
        service = VINLookupService()
        with patch.object(service.provider, 'decode', side_effect=Exception('down')):
            with self.assertRaises(Exception):
                service.get_vehicle_data('1HGCM82633A004352')

class VINLookupViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='dealer', password='pass')

    def test_fetch_endpoint_creates_record(self):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(self.user)
        with patch('apps.vehicles.services.NHTSAProvider.decode', return_value={'make':'A','model':'B','year':'2019','body_class':'Sedan','raw_data':{}}):
            resp = client.post('/api/vehicles/vin-lookup/fetch/', {'vin':'1HGCM82633A004352'}, format='json')
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(VINLookupRecord.objects.filter(vin__iexact='1HGCM82633A004352').exists())

    def test_fetch_endpoint_provider_down(self):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(self.user)
        with patch('apps.vehicles.services.NHTSAProvider.decode', side_effect=Exception('down')):
            resp = client.post('/api/vehicles/vin-lookup/fetch/', {'vin':'1HGCM82633A004352'}, format='json')
            self.assertEqual(resp.status_code, 503)
            self.assertEqual(resp.json().get('manual_entry'), True)
