import requests
from abc import ABC, abstractmethod
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
from .models import VINLookupRecord


class VINProvider(ABC):
    @abstractmethod
    def decode(self, vin: str):
        """Return normalized dict with at least make, model, year, body_class, raw_data"""
        pass


class NHTSAProvider(VINProvider):
    """Free government data (best for technical specs)."""
    URL = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{}?format=json"

    def decode(self, vin: str):
        response = requests.get(self.URL.format(vin), timeout=5)
        response.raise_for_status()
        data = response.json().get('Results', [{}])[0]
        return {
            "make": data.get("Make"),
            "model": data.get("Model"),
            "year": data.get("ModelYear"),
            "body_class": data.get("BodyClass"),
            "raw_data": data,
        }


class VINLookupService:
    def __init__(self):
        # Load provider from settings if present, else default to NHTSAProvider
        provider_path = getattr(settings, 'VIN_PROVIDER', None)
        provider = None
        if provider_path:
            # allow class path like 'apps.vehicles.services.NHTSAProvider'
            module_path, _, cls_name = provider_path.rpartition('.')
            if module_path:
                try:
                    mod = __import__(module_path, fromlist=[cls_name])
                    provider = getattr(mod, cls_name)()
                except Exception:
                    provider = NHTSAProvider()
            else:
                provider = NHTSAProvider()
        else:
            provider = NHTSAProvider()
        self.provider = provider

        # Cache duration for VIN lookups (days)
        self.cache_days = getattr(settings, 'VIN_CACHE_DAYS', 30)

    def get_vehicle_data(self, vin: str):
        vin = (vin or '').strip().upper()
        if not vin or len(vin) != 17 or not vin.isalnum():
            raise ValueError('VIN must be 17 alphanumeric characters')

        # Cache-first: check VINLookupRecord within cache_days
        cutoff = timezone.now() - timedelta(days=self.cache_days)
        rec = VINLookupRecord.objects.filter(vin__iexact=vin, fetched_at__gte=cutoff).first()
        if rec:
            return rec.data, False  # False indicates not freshly fetched

        # Fetch from provider
        try:
            data = self.provider.decode(vin)
        except requests.exceptions.RequestException:
            # Failover behavior: raise a specific exception to be converted to 503 by view
            raise

        # Atomic record create/update
        rec, _ = VINLookupRecord.objects.update_or_create(
            vin=vin,
            defaults={
                'data': data,
                'source': self.provider.__class__.__name__,
                'fetched_at': timezone.now(),
            }
        )
        return rec.data, True
