import os
import io
import urllib
from PIL import Image
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from .models import Photo


def _download_image(url):
    # Support file:// and relative paths for local tests
    if url.startswith('file://'):
        path = url[len('file://'):]
        with open(path, 'rb') as f:
            return f.read()
    if url.startswith('/') or url.startswith(str(settings.MEDIA_ROOT)):
        path = url
        with open(path, 'rb') as f:
            return f.read()

    # HTTP/HTTPS
    try:
        import requests
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        return r.content
    except Exception:
        return None


def _upload_thumbnail(content_bytes, filename):
    # Try S3 if configured via default_storage
    try:
        path = f"thumbnails/{filename}"
        content = ContentFile(content_bytes)
        name = default_storage.save(path, content)
        url = default_storage.url(name)
        return url, name
    except Exception:
        # Fallback: write to MEDIA_ROOT/thumbnails
        thumb_dir = os.path.join(settings.MEDIA_ROOT, 'thumbnails')
        os.makedirs(thumb_dir, exist_ok=True)
        path = os.path.join(thumb_dir, filename)
        with open(path, 'wb') as f:
            f.write(content_bytes)
        return settings.MEDIA_URL + f"thumbnails/{filename}", path


def process_photo(photo_id, thumbnail_size=(400, 300)):
    try:
        photo = Photo.objects.get(id=photo_id)
    except Photo.DoesNotExist:
        return False

    img_bytes = _download_image(photo.url)
    if not img_bytes:
        return False

    try:
        img = Image.open(io.BytesIO(img_bytes))
        img = img.convert('RGB')

        # compute perceptual hash (dhash)
        def compute_dhash(image, hash_size=8):
            # resize to (hash_size+1, hash_size)
            small = image.resize((hash_size + 1, hash_size), Image.LANCZOS).convert('L')
            pixels = list(small.getdata())
            # compare adjacent columns
            difference = []
            for row in range(hash_size):
                row_start = row * (hash_size + 1)
                for col in range(hash_size):
                    left = pixels[row_start + col]
                    right = pixels[row_start + col + 1]
                    difference.append(1 if left > right else 0)
            # convert bits to hex string
            dhash_value = 0
            for bit in difference:
                dhash_value = (dhash_value << 1) | bit
            return f"{dhash_value:0{hash_size * hash_size // 4}x}"

        phash_val = compute_dhash(img, hash_size=8)

        # check duplicates by exact hash match
        existing = Photo.objects.filter(phash=phash_val).exclude(id=photo.id).first()
        if existing:
            # mark as duplicate and borrow existing thumbnail if available
            photo.is_duplicate = True
            photo.phash = phash_val
            photo.metadata = photo.metadata or {}
            photo.metadata.update({'duplicate_of': existing.id})
            if existing.thumbnail_url:
                photo.thumbnail_url = existing.thumbnail_url
                photo.processed = True
            photo.save()
            return True

        img.thumbnail(thumbnail_size)
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=85)
        buf.seek(0)
        filename = f"photo_{photo_id}_thumb.jpg"
        url, saved_key = _upload_thumbnail(buf.read(), filename)

        photo.thumbnail_url = url
        photo.file_key = photo.file_key or getattr(photo, 'file_key', '') or ''
        photo.processed = True
        photo.phash = phash_val
        # save thumbnail metadata
        photo.metadata = photo.metadata or {}
        photo.metadata.update({'thumbnail_key': saved_key})
        photo.save()
        return True
    except Exception:
        return False


# Async wrapper that uses Celery if available
try:
    from celery import shared_task

    @shared_task
    def process_photo_task(photo_id):
        return process_photo(photo_id)

    def process_photo_async(photo_id):
        return process_photo_task.delay(photo_id)
except Exception:
    # Celery not installed/configured - fall back to immediate processing
    def process_photo_async(photo_id):
        return process_photo(photo_id)