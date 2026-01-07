import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.users.models import User, Car, Price, Listing, CarImage
from decimal import Decimal

def create_data():
    # Helper to clean up
    User.objects.all().delete()
    Car.objects.all().delete() # Cascades to Price, Listing
    
    # Create Dealer
    user = User.objects.create_user(
        username='dealer1', 
        email='dealer1@example.com', 
        password='password123',
        role='dealer',
        dealer_name='Luxury Motors',
        dealer_license='LIC-12345',
        phone='+254700000000'
    )
    print(f"Created User: {user}")

    # Create Car
    car = Car.objects.create(
        vin='ABC1234567890XYZ',
        make='Mercedes-Benz',
        model='C-Class',
        year=2024,
        mileage=5000,
        body_type='sedan',
        condition='used',
        fuel_type='petrol',
        transmission='automatic',
        engine_cc=2000,
        color='Black',
        seller=user,
        description='A beautiful luxury car',
        features=['Leather Seats', 'Sunroof']
    )
    print(f"Created Car: {car}")

    # Set Price
    Price.objects.create(
        car=car,
        amount=Decimal('4500000.00'),
        currency='KES',
        active=True,
        set_by=user
    )
    print("Created Price")

    # Create Listing
    Listing.objects.create(
        car=car,
        is_active=True,
        featured=True
    )
    print("Created Listing")
    
    # Verify Adapter fields access
    # Mocking serialization logic briefly
    print(f"Adapter Price check: {car.current_price.amount}")
    print(f"Adapter Featured check: {car.listings.filter(is_active=True, featured=True).exists()}")

if __name__ == '__main__':
    create_data()
