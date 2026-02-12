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
        # FORCED BYPASS FOR DEBUGGING: 
        # return False 
        
        try:
            region = settings.BUNNY_REGION.lower() if settings.BUNNY_REGION else "de"
            base_api = "ny.storage.bunnycdn.com" if region == "ny" else \
                       "la.storage.bunnycdn.com" if region == "la" else \
                       "sg.storage.bunnycdn.com" if region == "sg" else \
                       "storage.bunnycdn.com"
            
            api_url = f"https://{base_api}/{settings.BUNNY_STORAGE_ZONE}/{name}"
            headers = {"AccessKey": settings.BUNNY_STORAGE_API_KEY, "accept": "*/*"}
            
            # 5s timeout for existence check
            response = requests.head(api_url, headers=headers, timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"BunnyStorage exists error: {e}")
            return False

    def _save(self, name, content):
        """
        Override the default save to add a timeout and robust headers.
        """
        try:
            region = settings.BUNNY_REGION.lower() if settings.BUNNY_REGION else "de"
            base_api = "ny.storage.bunnycdn.com" if region == "ny" else \
                       "la.storage.bunnycdn.com" if region == "la" else \
                       "sg.storage.bunnycdn.com" if region == "sg" else \
                       "storage.bunnycdn.com"
            
            api_url = f"https://{base_api}/{settings.BUNNY_STORAGE_ZONE}/{name}"
            
            # DIAGNOSTIC: Log masked key info to help user verify
            key = settings.BUNNY_STORAGE_API_KEY or ""
            masked_key = f"{key[:2]}...{key[-2:]}" if len(key) > 4 else "****"
            logger.info(f"Storage Debug - Zone: {settings.BUNNY_STORAGE_ZONE}, KeyLength: {len(key)}, KeyMask: {masked_key}")
            
            # Ensure we are at the start of the file
            content.seek(0)
            
            headers = {
                "AccessKey": key,
                "Content-Type": "application/octet-stream",
                "accept": "application/json"
            }
            
            logger.info(f"Saving to Bunny: {api_url}")
            # 30s timeout for the actual upload
            response = requests.put(api_url, data=content.read(), headers=headers, timeout=30)
            
            if response.status_code != 201 and response.status_code != 200:
                logger.error(f"Bunny Storage rejection ({response.status_code}): {response.text}")
                response.raise_for_status()
                
            return name
        except Exception as e:
            logger.error(f"BunnyStorage save failed for {name}: {e}")
            raise

    def url(self, name):
        """
        Return the absolute URL where the file can be accessed.
        """
        if not settings.MEDIA_URL:
            return super().url(name)
        
        return urljoin(settings.MEDIA_URL, name)
