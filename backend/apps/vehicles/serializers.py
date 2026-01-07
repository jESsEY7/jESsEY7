from rest_framework import serializers
from apps.users.models import Car, CarImage, Listing, InspectionReport, Inquiry
# Keeping local models for things not in users app yet, or if they are still needed
from .models import VINLookupRecord, TestDrive, Offer

class VehicleSerializer(serializers.ModelSerializer):
    # Adapter fields to match legacy Vehicle model expectations
    price = serializers.DecimalField(source='current_price.amount', max_digits=12, decimal_places=2, read_only=True)
    primary_image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    is_featured = serializers.SerializerMethodField()
    dealer_name = serializers.CharField(source='seller.dealer_name', read_only=True)
    
    # Map location from seller using business_address or defaults (as noted in plan)
    location_city = serializers.SerializerMethodField()
    location_state = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = [
            'id', 'make', 'model', 'year', 'mileage', 'fuel_type', 'transmission', 
            'condition', 'body_type', 'vin', 'status', 'description', 'features',
            'price', 'primary_image', 'images', 'is_featured', 
            'dealer_name', 'location_city', 'location_state', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_primary_image(self, obj):
        if obj.primary_image:
            return obj.primary_image.image.url
        # Fallback to first image if no primary marked
        first = obj.images.first()
        return first.image.url if first else None

    def get_images(self, obj):
        return [img.image.url for img in obj.images.all()]

    def get_is_featured(self, obj):
        # Check if there is an active listing that is featured
        return obj.listings.filter(is_active=True, featured=True).exists()

    def get_location_city(self, obj):
        # Placeholder parsing from seller address or default
        # Assuming address format "City, State" or just returning user city if added later
        return "Nairobi" # Default for now as per context (Kenya currency implied in models)

    def get_location_state(self, obj):
        return "Kenya"


class ListingSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer(source='car', read_only=True)
    
    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = '__all__'
        read_only_fields = ('uploaded_at',)


class ConditionReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionReport
        fields = '__all__'
        read_only_fields = ('created_at',)


# Keeping these as they were likely unchanged or not strictly replaced yet
class VINLookupRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = VINLookupRecord
        fields = '__all__'
        read_only_fields = ('fetched_at',)


class TestDriveSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)

    class Meta:
        model = TestDrive
        fields = '__all__'
        read_only_fields = ('created_date', 'confirmed')


class OfferSerializer(serializers.ModelSerializer):
    # Mapping to pure Offer model in vehicles/models.py (if intended) or users.models (no Offer in users yet? Wait users has Order)
    # The view uses Offer from .models (vehicles/models.py per my view rewrite)
    buyer_name = serializers.CharField(source='buyer.get_full_name', read_only=True)

    class Meta:
        model = Offer # This needs Offer to be imported
        fields = '__all__'
        read_only_fields = ('created_date', 'status')


class InquirySerializer(serializers.ModelSerializer):
    buyer_email = serializers.EmailField(source='buyer.email', read_only=True)
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    car_title = serializers.CharField(source='car.__str__', read_only=True)

    class Meta:
        model = Inquiry
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'status', 'buyer')

