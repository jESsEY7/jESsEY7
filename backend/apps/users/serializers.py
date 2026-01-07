from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data"""
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name', 
            'role', 'phone', 'verified', 'rating', 'avatar',
            'dealer_name', 'dealer_license', 'business_address',
            'created_at'
        )
        read_only_fields = ('id', 'username', 'role', 'verified', 'rating', 'created_at')


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, required=False)
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES, 
        default='buyer', 
        required=False
    )

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'role',
            'dealer_name', 'dealer_license', 'business_address'
        )
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'dealer_name': {'required': False},
            'dealer_license': {'required': False},
            'business_address': {'required': False},
        }

    def validate(self, attrs):
        # Remove password_confirm if present (not used for creation)
        attrs.pop('password_confirm', None)
        
        # Validate dealer fields if role is dealer
        if attrs.get('role') == 'dealer':
            if not attrs.get('dealer_name'):
                raise serializers.ValidationError({
                    'dealer_name': 'Dealer name is required for dealer accounts'
                })
        
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.pop('role', 'buyer')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            role=role,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            dealer_name=validated_data.get('dealer_name', ''),
            dealer_license=validated_data.get('dealer_license', ''),
            business_address=validated_data.get('business_address', ''),
        )
        return user


from .models import Favorite, Car


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for user favorites - includes full vehicle data with images"""
    vehicle = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Favorite
        fields = ('id', 'vehicle', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_vehicle(self, obj):
        """Get car data with images for frontend display"""
        car = obj.car
        if not car:
            return None
        
        # Get primary image URL
        primary_image = None
        if car.primary_image:
            primary_image = car.primary_image.image.url
        else:
            # Fallback to first image
            first_img = car.images.first()
            if first_img:
                primary_image = first_img.image.url
        
        # Get all image URLs
        images = [img.image.url for img in car.images.all()]
        
        # Get current price
        price = None
        if car.current_price:
            price = float(car.current_price.amount)
        
        return {
            'id': car.id,
            'make': car.make,
            'model': car.model,
            'year': car.year,
            'mileage': car.mileage,
            'fuel_type': car.fuel_type,
            'transmission': car.transmission,
            'condition': car.condition,
            'body_type': car.body_type,
            'status': car.status,
            'description': car.description,
            'features': car.features,
            'price': price,
            'primary_image': primary_image,
            'images': images,
            'location_city': 'Nairobi',  # Default for Kenya
            'location_state': 'Kenya',
        }
