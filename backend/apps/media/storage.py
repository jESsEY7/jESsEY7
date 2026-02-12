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
            
            logger.info(f"Checking Bunny storage: {api_url}")
            print(f"BUNNY_DEBUG: Checking {api_url}")
            
            headers = {
                "AccessKey": settings.BUNNY_STORAGE_API_KEY,
                "accept": "*/*"
            }
            
            # AGGRESSIVE timeout to prevent worker kills
            response = requests.head(api_url, headers=headers, timeout=3)
            logger.info(f"Bunny existence response for {name}: {response.status_code}")
            return response.status_code == 200
        except requests.exceptions.Timeout:
            logger.warning(f"BunnyStorage TIMEOUT for {name}. Assuming False to proceed.")
            print(f"BUNNY_DEBUG: TIMEOUT for {name}")
            return False
        except Exception as e:
            logger.warning(f"BunnyStorage error for {name}: {e}")
            print(f"BUNNY_DEBUG: Error {e}")
            return False

    def url(self, name):
        """
        Return the absolute URL where the file can be accessed.
        """
        if not settings.MEDIA_URL:
            return super().url(name)
        
        return urljoin(settings.MEDIA_URL, name)
