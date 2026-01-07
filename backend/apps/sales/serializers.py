from rest_framework import serializers
from .models import Quote, QuoteNote
from apps.vehicles.models import Vehicle


class QuoteSerializer(serializers.ModelSerializer):
    """Full quote serializer with all details"""
    days_remaining = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = Quote
        fields = [
            'id', 'reference_number', 'status',
            # Vehicle info
            'vehicle', 'vehicle_title', 'vehicle_year', 'vehicle_make',
            'vehicle_model', 'vehicle_vin', 'vehicle_mileage', 'vehicle_image_url',
            # Pricing
            'base_price', 'documentation_fee', 'registration_fee',
            'delivery_fee', 'tax_amount', 'discount_amount', 'total_price',
            # Buyer info
            'buyer_name', 'buyer_email', 'buyer_phone',
            'buyer_zip', 'buyer_city', 'buyer_state',
            # Financing
            'financing_term', 'financing_rate', 'financing_monthly', 'financing_down_payment',
            # Meta
            'notes', 'created_at', 'updated_at', 'expires_at',
            'days_remaining', 'is_expired',
        ]
        read_only_fields = [
            'id', 'reference_number', 'created_at', 'updated_at',
            'days_remaining', 'is_expired',
        ]


class QuoteCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating quotes from vehicle data"""
    vehicle_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Quote
        fields = [
            'vehicle_id',
            'buyer_name', 'buyer_email', 'buyer_phone', 'buyer_zip',
            'notes',
            # Optional financing
            'financing_term', 'financing_rate', 'financing_down_payment',
        ]
    
    def create(self, validated_data):
        vehicle_id = validated_data.pop('vehicle_id')
        vehicle = Vehicle.objects.get(id=vehicle_id)
        user = self.context['request'].user
        
        # Calculate fees
        base_price = vehicle.price
        documentation_fee = 500  # Fixed doc fee
        registration_fee = 350  # Estimated
        
        # Calculate delivery fee based on distance (simplified)
        buyer_zip = validated_data.get('buyer_zip', '')
        delivery_fee = 250 if buyer_zip else 0  # Basic delivery fee
        
        # Calculate tax (simplified - 7%)
        tax_rate = 0.07
        tax_amount = float(base_price) * tax_rate
        
        # Calculate total
        total_price = (
            float(base_price) + documentation_fee + registration_fee +
            delivery_fee + tax_amount
        )
        
        # Calculate monthly payment if financing selected
        financing_term = validated_data.get('financing_term')
        financing_rate = validated_data.get('financing_rate', 5.99)
        financing_down_payment = validated_data.get('financing_down_payment', 0)
        financing_monthly = None
        
        if financing_term and financing_term > 0:
            loan_amount = total_price - float(financing_down_payment or 0)
            monthly_rate = float(financing_rate) / 100 / 12
            if monthly_rate > 0:
                financing_monthly = (
                    loan_amount * monthly_rate * (1 + monthly_rate) ** financing_term
                ) / ((1 + monthly_rate) ** financing_term - 1)
        
        # Create quote with vehicle snapshot
        quote = Quote.objects.create(
            vehicle=vehicle,
            user=user,
            # Vehicle snapshot
            vehicle_title=f"{vehicle.year} {vehicle.make} {vehicle.model}",
            vehicle_year=vehicle.year,
            vehicle_make=vehicle.make,
            vehicle_model=vehicle.model,
            vehicle_vin=vehicle.vin or '',
            vehicle_mileage=vehicle.mileage,
            vehicle_image_url=vehicle.primary_image or '',
            # Pricing
            base_price=base_price,
            documentation_fee=documentation_fee,
            registration_fee=registration_fee,
            delivery_fee=delivery_fee,
            tax_amount=tax_amount,
            total_price=total_price,
            # Buyer info
            buyer_name=validated_data.get('buyer_name', user.get_full_name() or user.username),
            buyer_email=validated_data.get('buyer_email', user.email),
            buyer_phone=validated_data.get('buyer_phone', getattr(user, 'phone', '') or ''),
            buyer_zip=buyer_zip,
            # Financing
            financing_term=financing_term,
            financing_rate=financing_rate,
            financing_monthly=financing_monthly,
            financing_down_payment=financing_down_payment,
            # Notes
            notes=validated_data.get('notes', ''),
        )
        
        return quote


class QuoteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for quote lists"""
    class Meta:
        model = Quote
        fields = [
            'id', 'reference_number', 'status',
            'vehicle_title', 'vehicle_image_url',
            'base_price', 'total_price',
            'buyer_zip', 'created_at', 'expires_at',
            'days_remaining', 'is_expired',
        ]


class QuoteNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = QuoteNote
        fields = ['id', 'content', 'author_name', 'created_at']
        read_only_fields = ['id', 'author_name', 'created_at']
