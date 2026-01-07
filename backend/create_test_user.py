import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

email = "test@example.com"
password = "testpassword123"

if not User.objects.filter(email=email).exists():
    User.objects.create_user(username=email, email=email, password=password, first_name="Test", last_name="User", user_type="customer")
    print(f"User {email} created successfully.")
else:
    print(f"User {email} already exists.")
