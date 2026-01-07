"""
Populate the database with sample vehicle data for showcase.
Run: python populate_vehicles.py
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.vehicles.models import Vehicle, Listing, Photo
from apps.users.models import User
from decimal import Decimal
import random

# Sample vehicle data with real Unsplash images
SAMPLE_VEHICLES = [
    {
        "make": "Mercedes-Benz",
        "model": "S-Class",
        "year": 2024,
        "price": 115000,
        "mileage": 1200,
        "condition": "new",
        "body_type": "sedan",
        "exterior_color": "Obsidian Black",
        "interior_color": "Macchiato Beige",
        "transmission": "automatic",
        "fuel_type": "hybrid",
        "engine": "3.0L I6 Turbo + Electric Motor",
        "drivetrain": "awd",
        "vin": "WDDUG8FB0MA123456",
        "features": ["Panoramic Sunroof", "Burmester Sound System", "Massage Seats", "Head-Up Display", "Night Vision Assist"],
        "description": "The pinnacle of luxury motoring. This 2024 S-Class combines cutting-edge technology with unparalleled comfort.",
        "primary_image": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
        "images": [
            "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
            "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800"
        ],
        "is_featured": True,
        "location_city": "Los Angeles",
        "location_state": "CA",
        "dealer_name": "Prestige Motors"
    },
    {
        "make": "BMW",
        "model": "M4 Competition",
        "year": 2024,
        "price": 86500,
        "mileage": 3500,
        "condition": "excellent",
        "body_type": "coupe",
        "exterior_color": "Isle of Man Green",
        "interior_color": "Black Merino Leather",
        "transmission": "automatic",
        "fuel_type": "gasoline",
        "engine": "3.0L Twin-Turbo I6",
        "drivetrain": "rwd",
        "vin": "WBS43AZ05P1234567",
        "features": ["Carbon Fiber Roof", "M Carbon Bucket Seats", "Harman Kardon Audio", "Adaptive LED Headlights"],
        "description": "Pure driving exhilaration. The M4 Competition delivers 503 horsepower of precision engineering.",
        "primary_image": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
        "images": [
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
            "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800"
        ],
        "is_featured": True,
        "location_city": "Miami",
        "location_state": "FL",
        "dealer_name": "Elite BMW"
    },
    {
        "make": "Porsche",
        "model": "911 Carrera S",
        "year": 2023,
        "price": 138000,
        "mileage": 8500,
        "condition": "excellent",
        "body_type": "coupe",
        "exterior_color": "GT Silver Metallic",
        "interior_color": "Black/Bordeaux Red",
        "transmission": "automatic",
        "fuel_type": "gasoline",
        "engine": "3.0L Twin-Turbo Flat-6",
        "drivetrain": "rwd",
        "vin": "WP0AB2A93PS234567",
        "features": ["Sport Chrono Package", "PASM Sport Suspension", "Bose Surround Sound", "Sport Exhaust"],
        "description": "Iconic design meets modern performance. This 911 Carrera S is the quintessential sports car.",
        "primary_image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        "images": [
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"
        ],
        "is_featured": True,
        "location_city": "San Francisco",
        "location_state": "CA",
        "dealer_name": "Bay Porsche"
    },
    {
        "make": "Tesla",
        "model": "Model S Plaid",
        "year": 2024,
        "price": 108000,
        "mileage": 2000,
        "condition": "excellent",
        "body_type": "sedan",
        "exterior_color": "Pearl White",
        "interior_color": "Black and White",
        "transmission": "automatic",
        "fuel_type": "electric",
        "engine": "Tri Motor Electric AWD",
        "drivetrain": "awd",
        "vin": "5YJSA1E41PF345678",
        "features": ["Full Self-Driving", "Yoke Steering", "22\" Arachnid Wheels", "Glass Roof"],
        "description": "The fastest accelerating production car. 0-60 in under 2 seconds with zero emissions.",
        "primary_image": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
        "images": [
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
            "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800"
        ],
        "is_featured": False,
        "location_city": "Austin",
        "location_state": "TX",
        "dealer_name": "Tesla Gallery"
    },
    {
        "make": "Audi",
        "model": "RS7 Sportback",
        "year": 2024,
        "price": 128000,
        "mileage": 4200,
        "condition": "excellent",
        "body_type": "sedan",
        "exterior_color": "Nardo Gray",
        "interior_color": "Black Valcona Leather",
        "transmission": "automatic",
        "fuel_type": "gasoline",
        "engine": "4.0L Twin-Turbo V8",
        "drivetrain": "awd",
        "vin": "WUAW2AFC0PN456789",
        "features": ["RS Sport Suspension Plus", "Bang & Olufsen 3D Sound", "Carbon Optic Package", "RS Design Package"],
        "description": "Where performance meets practicality. The RS7 delivers supercar performance in a stunning four-door package.",
        "primary_image": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
        "images": [
            "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
            "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800"
        ],
        "is_featured": False,
        "location_city": "Chicago",
        "location_state": "IL",
        "dealer_name": "Audi North Shore"
    },
    {
        "make": "Lexus",
        "model": "LC 500",
        "year": 2023,
        "price": 98500,
        "mileage": 6800,
        "condition": "excellent",
        "body_type": "coupe",
        "exterior_color": "Structural Blue",
        "interior_color": "Blue Leather",
        "transmission": "automatic",
        "fuel_type": "gasoline",
        "engine": "5.0L V8",
        "drivetrain": "rwd",
        "vin": "JTHHP5BC0P1567890",
        "features": ["Mark Levinson Audio", "Carbon Fiber Roof", "Limited Slip Differential", "Adaptive Variable Suspension"],
        "description": "Japanese craftsmanship at its finest. The LC 500 combines breathtaking design with V8 performance.",
        "primary_image": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
        "images": [
            "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800"
        ],
        "is_featured": False,
        "location_city": "Seattle",
        "location_state": "WA",
        "dealer_name": "Lexus of Seattle"
    },
    {
        "make": "Range Rover",
        "model": "Sport SVR",
        "year": 2024,
        "price": 145000,
        "mileage": 3200,
        "condition": "excellent",
        "body_type": "suv",
        "exterior_color": "Carpathian Grey",
        "interior_color": "Ebony/Cirrus",
        "transmission": "automatic",
        "fuel_type": "gasoline",
        "engine": "5.0L Supercharged V8",
        "drivetrain": "awd",
        "vin": "SALWG2SV4PA678901",
        "features": ["Meridian Signature Sound", "Terrain Response 2", "Configurable Ambient Interior Lighting", "22\" Forged Wheels"],
        "description": "The ultimate performance SUV. Conquer any terrain in absolute luxury.",
        "primary_image": "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800",
        "images": [
            "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800"
        ],
        "is_featured": True,
        "location_city": "Denver",
        "location_state": "CO",
        "dealer_name": "Land Rover Denver"
    },
    {
        "make": "Ferrari",
        "model": "Roma",
        "year": 2023,
        "price": 285000,
        "mileage": 1800,
        "condition": "excellent",
        "body_type": "coupe",
        "exterior_color": "Rosso Corsa",
        "interior_color": "Cuoio Leather",
        "transmission": "automatic",
        "fuel_type": "gasoline",
        "engine": "3.9L Twin-Turbo V8",
        "drivetrain": "rwd",
        "vin": "ZFF62BHA8P0789012",
        "features": ["Carbon Fiber Steering Wheel", "Apple CarPlay", "Front Axle Lift", "Daytona Racing Seats"],
        "description": "La Nuova Dolce Vita. The Ferrari Roma embodies timeless elegance and thrilling performance.",
        "primary_image": "https://images.unsplash.com/photo-1592198084033-aade902d1f5f?w=800",
        "images": [
            "https://images.unsplash.com/photo-1592198084033-aade902d1f5f?w=800"
        ],
        "is_featured": True,
        "location_city": "New York",
        "location_state": "NY",
        "dealer_name": "Ferrari of Manhattan"
    },
    {
        "make": "Lamborghini",
        "model": "Huracán EVO",
        "year": 2023,
        "price": 265000,
        "mileage": 4500,
        "condition": "excellent",
        "body_type": "coupe",
        "exterior_color": "Verde Mantis",
        "interior_color": "Nero Ade",
        "transmission": "automatic",
        "fuel_type": "gasoline",
        "engine": "5.2L V10",
        "drivetrain": "awd",
        "vin": "ZHWUE4ZF0PLA890123",
        "features": ["Lifting System", "Sensonum Audio", "Magneto Rheological Suspension", "Carbon Ceramic Brakes"],
        "description": "Naturally aspirated V10 fury. Experience the raw emotion of Italian supercar engineering.",
        "primary_image": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
        "images": [
            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"
        ],
        "is_featured": False,
        "location_city": "Las Vegas",
        "location_state": "NV",
        "dealer_name": "Exotic Cars Vegas"
    },
    {
        "make": "Bentley",
        "model": "Continental GT",
        "year": 2024,
        "price": 238000,
        "mileage": 2100,
        "condition": "new",
        "body_type": "coupe",
        "exterior_color": "Glacier White",
        "interior_color": "Portland/Linen",
        "transmission": "automatic",
        "fuel_type": "gasoline",
        "engine": "6.0L W12 Twin-Turbo",
        "drivetrain": "awd",
        "vin": "SCBDG4ZG3PC901234",
        "features": ["Naim Audio", "Mulliner Driving Specification", "Diamond Knurled Controls", "Rotating Display"],
        "description": "Grand touring perfection. Handcrafted in Crewe, England with uncompromising attention to detail.",
        "primary_image": "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800",
        "images": [
            "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800"
        ],
        "is_featured": False,
        "location_city": "Beverly Hills",
        "location_state": "CA",
        "dealer_name": "O'Gara Beverly Hills"
    },
    {
        "make": "Maserati",
        "model": "MC20",
        "year": 2024,
        "price": 225000,
        "mileage": 900,
        "condition": "new",
        "body_type": "coupe",
        "exterior_color": "Bianco Audace",
        "interior_color": "Nero",
        "transmission": "automatic",
        "fuel_type": "gasoline",
        "engine": "3.0L Twin-Turbo V6 Nettuno",
        "drivetrain": "rwd",
        "vin": "ZAM5NXHF4P1012345",
        "features": ["Carbon Fiber Monocoque", "Butterfly Doors", "Carbon Ceramic Brakes", "F1 Derived Engine"],
        "description": "The return of the Trident to supercar territory. Born from racing, designed for the road.",
        "primary_image": "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800",
        "images": [
            "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800"
        ],
        "is_featured": True,
        "location_city": "Miami",
        "location_state": "FL",
        "dealer_name": "Maserati Miami"
    },
    {
        "make": "McLaren",
        "model": "720S Spider",
        "year": 2023,
        "price": 315000,
        "mileage": 3800,
        "condition": "excellent",
        "body_type": "convertible",
        "exterior_color": "Papaya Spark",
        "interior_color": "Carbon Black",
        "transmission": "automatic",
        "fuel_type": "gasoline",
        "engine": "4.0L Twin-Turbo V8",
        "drivetrain": "rwd",
        "vin": "SBM14DCA0PW123456",
        "features": ["Retractable Hardtop", "Performance Exhaust", "McLaren Track Telemetry", "Carbon Fiber Interior"],
        "description": "Open-air supercar excellence. Experience 710 horsepower with the sky above.",
        "primary_image": "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800",
        "images": [
            "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800"
        ],
        "is_featured": False,
        "location_city": "Scottsdale",
        "location_state": "AZ",
        "dealer_name": "McLaren Scottsdale"
    }
]

def create_dealer():
    """Create a dealer user if not exists"""
    dealer, created = User.objects.get_or_create(
        username='premium_dealer',
        defaults={
            'email': 'dealer@luxurymotors.com',
            'role': 'dealer',
            'dealer_name': 'Luxury Motors Network',
            'phone': '+1-800-555-0123'
        }
    )
    if created:
        dealer.set_password('luxury123')
        dealer.save()
        print(f"✓ Created dealer: {dealer.username}")
    else:
        print(f"✓ Using existing dealer: {dealer.username}")
    return dealer


def populate_vehicles():
    """Populate the database with sample vehicles"""
    dealer = create_dealer()
    
    # Clear existing vehicles (optional - comment out to keep existing data)
    existing_count = Vehicle.objects.count()
    if existing_count > 0:
        print(f"Found {existing_count} existing vehicles. Adding new ones...")
    
    created_count = 0
    for vehicle_data in SAMPLE_VEHICLES:
        # Check if vehicle already exists by VIN
        if Vehicle.objects.filter(vin=vehicle_data['vin']).exists():
            print(f"⏭ Skipping existing: {vehicle_data['year']} {vehicle_data['make']} {vehicle_data['model']}")
            continue
        
        # Create vehicle
        vehicle = Vehicle.objects.create(
            make=vehicle_data['make'],
            model=vehicle_data['model'],
            year=vehicle_data['year'],
            price=Decimal(str(vehicle_data['price'])),
            mileage=vehicle_data['mileage'],
            condition=vehicle_data['condition'],
            body_type=vehicle_data['body_type'],
            exterior_color=vehicle_data['exterior_color'],
            interior_color=vehicle_data['interior_color'],
            transmission=vehicle_data['transmission'],
            fuel_type=vehicle_data['fuel_type'],
            engine=vehicle_data['engine'],
            drivetrain=vehicle_data['drivetrain'],
            vin=vehicle_data['vin'],
            features=vehicle_data['features'],
            description=vehicle_data['description'],
            primary_image=vehicle_data['primary_image'],
            images=vehicle_data['images'],
            dealer=dealer,
            dealer_name=vehicle_data['dealer_name'],
            location_city=vehicle_data['location_city'],
            location_state=vehicle_data['location_state'],
            status='active',  # Set to active so it appears in listings
            is_featured=vehicle_data['is_featured'],
        )
        
        # Create listing for the vehicle
        Listing.objects.create(
            vehicle=vehicle,
            price=vehicle.price,
            is_published=True,
            is_verified=True,
            status='active'
        )
        
        # Create photos
        for i, image_url in enumerate(vehicle_data['images']):
            Photo.objects.create(
                vehicle=vehicle,
                url=image_url,
                is_primary=(i == 0),
                order=i
            )
        
        created_count += 1
        print(f"✓ Created: {vehicle}")
    
    print(f"\n{'='*50}")
    print(f"✓ Successfully created {created_count} new vehicles")
    print(f"✓ Total vehicles in database: {Vehicle.objects.count()}")
    print(f"✓ Active listings: {Listing.objects.filter(status='active').count()}")
    print(f"✓ Featured vehicles: {Vehicle.objects.filter(is_featured=True).count()}")


if __name__ == '__main__':
    print("="*50)
    print("Populating database with sample vehicles...")
    print("="*50)
    populate_vehicles()
    print("\n✓ Done! Restart the frontend to see the vehicles.")
