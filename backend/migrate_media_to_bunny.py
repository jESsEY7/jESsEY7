import os
import django
from django.core.files.storage import default_storage
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def migrate_media():
    base_dir = Path('media')
    if not base_dir.exists():
        print("No media directory found.")
        return

    print(f"Starting migration to {default_storage.__class__.__name__}...")
    
    # We only care about car_images and thumbnails based on the directory structure
    targets = ['car_images', 'thumbnails']
    
    for target in targets:
        target_path = base_dir / target
        if not target_path.exists():
            continue
            
        print(f"Migrating {target}...")
        for file_path in target_path.rglob('*'):
            if file_path.is_file():
                relative_path = file_path.relative_to(base_dir)
                storage_path = str(relative_path).replace('\\', '/')
                
                if default_storage.exists(storage_path):
                    print(f"Skipping {storage_path} (already exists)")
                    continue
                
                print(f"Uploading {storage_path}...")
                with open(file_path, 'rb') as f:
                    default_storage.save(storage_path, f)
    
    print("Migration complete!")

if __name__ == '__main__':
    migrate_media()
