from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal


class Quote(models.Model):
    """
    Represents a vehicle price quote requested by a user.
    Backend-persisted for retrieval and PDF generation.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('viewed', 'Viewed'),
        ('contacted', 'Contacted'),
        ('converted', 'Converted'),
        ('expired', 'Expired'),
    ]
    
    # Reference to vehicle (from vehicles app)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle', 
        on_delete=models.CASCADE, 
        related_name='quotes'
    )
    
    # User who requested the quote
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quotes'
    )
    
    # Quote details
    reference_number = models.CharField(max_length=20, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Vehicle snapshot (in case vehicle details change)
    vehicle_title = models.CharField(max_length=255)
    vehicle_year = models.IntegerField()
    vehicle_make = models.CharField(max_length=100)
    vehicle_model = models.CharField(max_length=100)
    vehicle_vin = models.CharField(max_length=50, blank=True)
    vehicle_mileage = models.IntegerField(null=True, blank=True)
    vehicle_image_url = models.URLField(blank=True)
    
    # Pricing breakdown
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    documentation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Delivery info
    buyer_name = models.CharField(max_length=200)
    buyer_email = models.EmailField()
    buyer_phone = models.CharField(max_length=20, blank=True)
    buyer_zip = models.CharField(max_length=20)
    buyer_city = models.CharField(max_length=100, blank=True)
    buyer_state = models.CharField(max_length=100, blank=True)
    
    # Financing options (optional)
    financing_term = models.IntegerField(null=True, blank=True, help_text="Months")
    financing_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    financing_monthly = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    financing_down_payment = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    dealer_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['reference_number']),
        ]
    
    def __str__(self):
        return f"Quote {self.reference_number} - {self.vehicle_title}"
    
    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = self.generate_reference()
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=14)
        if not self.total_price:
            self.calculate_total()
        super().save(*args, **kwargs)
    
    def generate_reference(self):
        """Generate unique quote reference number"""
        import random
        import string
        prefix = 'QT'
        timestamp = timezone.now().strftime('%y%m%d')
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"{prefix}{timestamp}{random_part}"
    
    def calculate_total(self):
        """Calculate total drive-away price"""
        self.total_price = (
            self.base_price +
            self.documentation_fee +
            self.registration_fee +
            self.delivery_fee +
            self.tax_amount -
            self.discount_amount
        )
        return self.total_price
    
    @property
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @property
    def days_remaining(self):
        if self.expires_at:
            delta = self.expires_at - timezone.now()
            return max(0, delta.days)
        return None


class QuoteNote(models.Model):
    """Internal notes on quotes for dealer/admin"""
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='internal_notes')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note on {self.quote.reference_number}"
