import logging
import requests
from django_bunny_storage.storage import BunnyStorage
from django.conf import settings
from urllib.parse import urljoin

logger = logging.getLogger(__name__)

class FixedBunnyStorage(BunnyStorage):
    def exists(self, name):
        """
        Check if the file exists on Bunny Storage.
        Using a direct request with a timeout to prevent worker hangs.
        """
        try:
            # Match django-bunny-storage endpoint logic:
            # ny -> ny.storage..., la -> la.storage..., sg -> sg.storage...
            # Default (including 'de') -> storage.bunnycdn.com
            region = settings.BUNNY_REGION.lower() if settings.BUNNY_REGION else "de"
            
            if region == "ny":
                base_api = "ny.storage.bunnycdn.com"
            elif region == "la":
                base_api = "la.storage.bunnycdn.com"
            elif region == "sg":
                base_api = "sg.storage.bunnycdn.com"
            else:
                base_api = "storage.bunnycdn.com"
            
            api_url = f"https://{base_api}/{settings.BUNNY_STORAGE_ZONE}/{name}"
            
            headers = {
                "AccessKey": settings.BUNNY_STORAGE_API_KEY,
                "accept": "*/*"
            }
            
            # HEAD request with shorter timeout for the check
            response = requests.head(api_url, headers=headers, timeout=10)
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"BunnyStorage existence check failed for {name}: {e}")
            # Fail to False (assume it doesn't exist) to avoid Django's infinite loop in get_available_name
            return False

    def url(self, name):
        """
        Return the absolute URL where the file can be accessed.
        """
        if not settings.MEDIA_URL:
            return super().url(name)
        
        return urljoin(settings.MEDIA_URL, name)
