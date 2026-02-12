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
            # Construct API URL based on region
            region_prefix = f"{settings.BUNNY_REGION}." if settings.BUNNY_REGION and settings.BUNNY_REGION != 'ny' else ""
            api_url = f"https://{region_prefix}storage.bunnycdn.com/{settings.BUNNY_STORAGE_ZONE}/{name}"
            
            headers = {
                "AccessKey": settings.BUNNY_STORAGE_API_KEY,
                "accept": "*/*"
            }
            
            # HEAD request is fast and only gets headers
            response = requests.head(api_url, headers=headers, timeout=5)
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
