from django_bunny_storage.storage import BunnyStorage
from django.conf import settings
from urllib.parse import urljoin

class FixedBunnyStorage(BunnyStorage):
    def url(self, name):
        """
        Return the absolute URL where the file can be accessed.
        """
        if not settings.MEDIA_URL:
            return super().url(name)
        
        return urljoin(settings.MEDIA_URL, name)
