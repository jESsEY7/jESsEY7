from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal

# ==================== ACTORS ====================
class User(AbstractUser):
    """
    Actor: Represents all human participants in the system
    """
    ROLE_CHOICES = (
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('dealer', 'Dealer'),
        ('admin', 'Admin'),
        ('agent', 'Agent'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='buyer')
    phone = models.CharField(max_length=20, unique=True, blank=True, null=True)
    verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, 
                                 validators=[MinValueValidator(0), MaxValueValidator(5)])
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Dealer-specific fields (nullable for non-dealers)
    dealer_name = models.CharField(max_length=200, null=True, blank=True)
    dealer_license = models.CharField(max_length=100, null=True, blank=True)
    business_address = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    def clean(self):
        # Ensure dealer fields are set for dealer role
        if self.role == 'dealer':
            if not self.dealer_name or not self.dealer_license:
                raise ValidationError("Dealers must provide business name and license")

# ==================== ASSETS ====================
class Car(models.Model):
    """
    Asset: The primary economic object - physical vehicle
    """
    BODY_TYPE_CHOICES = (
        ('sedan', 'Sedan'),
        ('suv', 'SUV'),
        ('hatchback', 'Hatchback'),
        ('truck', 'Truck'),
        ('coupe', 'Coupe'),
        ('convertible', 'Convertible'),
        ('van', 'Van'),
        ('wagon', 'Wagon'),
    )
    
    CONDITION_CHOICES = (
        ('new', 'New'),
        ('used', 'Used'),
        ('salvage', 'Salvage'),
        ('rebuilt', 'Rebuilt'),
    )
    
    FUEL_TYPE_CHOICES = (
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
        ('cng', 'CNG'),
        ('lpg', 'LPG'),
    )
    
    TRANSMISSION_CHOICES = (
        ('automatic', 'Automatic'),
        ('manual', 'Manual'),
        ('semi_auto', 'Semi-Automatic'),
        ('cvt', 'CVT'),
    )
    
    # Core identification
    vin = models.CharField(max_length=50, unique=True, verbose_name="VIN")
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField(
        validators=[MinValueValidator(1900), MaxValueValidator(timezone.now().year + 1)]
    )
    body_type = models.CharField(max_length=20, choices=BODY_TYPE_CHOICES)
    
    # Specifications
    mileage = models.PositiveIntegerField(help_text="Mileage in kilometers")
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES)
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES)
    engine_cc = models.PositiveIntegerField(help_text="Engine displacement in cc")
    color = models.CharField(max_length=50)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    seats = models.PositiveSmallIntegerField(default=5)
    doors = models.PositiveSmallIntegerField(default=4)
    
    # Descriptive
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    features = models.JSONField(default=list, blank=True, null=True)  # ["AC", "ABS", "Sunroof"]
    
    # Ownership
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cars_owned')
    status = models.CharField(max_length=20, choices=(
        ('available', 'Available'),
        ('reserved', 'Reserved'),
        ('sold', 'Sold'),
        ('removed', 'Removed'),
    ), default='available')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['make', 'model']),
            models.Index(fields=['year']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.year} {self.make} {self.model} ({self.vin[:8]})"
    
    @property
    def current_price(self):
        """Get the latest active price"""
        return self.prices.filter(active=True).order_by('-set_at').first()
    
    @property
    def primary_image(self):
        """Get primary image"""
        return self.images.filter(is_primary=True).first()

class CarImage(models.Model):
    """
    Asset: Images attached to a car
    """
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='car_images/')
    is_primary = models.BooleanField(default=False)
    caption = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
    
    def __str__(self):
        return f"Image for {self.car}"

class Price(models.Model):
    """
    State: Pricing information for a car (historical)
    """
    CURRENCY_CHOICES = (
        ('KES', 'Kenyan Shilling'),
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
    )
    
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='prices')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='KES')
    negotiable = models.BooleanField(default=True)
    active = models.BooleanField(default=True)
    note = models.CharField(max_length=200, blank=True, help_text="Why price changed")
    set_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    set_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-set_at']
    
    def __str__(self):
        return f"{self.amount} {self.currency} for {self.car}"
    
    def save(self, *args, **kwargs):
        # Deactivate old prices when new active price is set
        if self.active:
            Price.objects.filter(car=self.car, active=True).update(active=False)
        super().save(*args, **kwargs)

# ==================== VISIBILITY STATE ====================
class Listing(models.Model):
    """
    State: Controls marketplace visibility of a car
    Separates asset (Car) from marketplace state
    """
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='listings')
    is_active = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    boost_count = models.PositiveIntegerField(default=0, help_text="Number of times listing was boosted")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-featured', '-created_at']
        unique_together = ['car', 'is_active']  # One active listing per car
    
    def __str__(self):
        return f"Listing for {self.car}"
    
    @property
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])

# ==================== TRANSACTIONS ====================
class Inquiry(models.Model):
    """
    Transaction: Buyer intent (lead generation)
    """
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('contacted', 'Contacted'),
        ('responded', 'Responded'),
        ('closed', 'Closed'),
        ('converted', 'Converted to Order'),
    )
    
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='inquiries')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inquiries_made')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    contact_preference = models.CharField(max_length=20, choices=(
        ('phone', 'Phone'),
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
    ), default='phone')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Inquiry from {self.buyer} for {self.car}"

class Order(models.Model):
    """
    Transaction: Formal agreement to purchase
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('agreed', 'Price Agreed'),
        ('deposit_paid', 'Deposit Paid'),
        ('full_paid', 'Fully Paid'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )
    
    car = models.ForeignKey(Car, on_delete=models.PROTECT, related_name='orders')
    buyer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders_as_buyer')
    seller = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders_as_seller')
    agreed_price = models.DecimalField(max_digits=12, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    contract_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.id}: {self.car}"
    
    @property
    def is_paid(self):
        return self.status in ['deposit_paid', 'full_paid', 'completed']
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.car.status = 'sold'
        self.car.save()
        self.save()

class Payment(models.Model):
    """
    Transaction: Money movement (separate from Order)
    """
    PAYMENT_METHOD_CHOICES = (
        ('mpesa', 'M-Pesa'),
        ('card', 'Credit/Debit Card'),
        ('bank', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('mobile', 'Mobile Money'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    metadata = models.JSONField(default=dict, blank=True)  # Store gateway response
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.reference}: {self.amount}"

# ==================== TRUST & REPUTATION ====================
class Review(models.Model):
    """
    Trust: Reputation system
    """
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, 
                             related_name='reviews')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['reviewer', 'seller']  # One review per pair
    
    def __str__(self):
        return f"{self.rating}★ review by {self.reviewer}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update seller's average rating
        self.seller.update_rating()

class InspectionReport(models.Model):
    """
    Trust: Quality assurance for used cars (optional but valuable)
    """
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='inspections')
    inspector = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    overall_score = models.DecimalField(max_digits=3, decimal_places=1, 
                                        validators=[MinValueValidator(0), MaxValueValidator(10)])
    mechanical_score = models.DecimalField(max_digits=3, decimal_places=1)
    exterior_score = models.DecimalField(max_digits=3, decimal_places=1)
    interior_score = models.DecimalField(max_digits=3, decimal_places=1)
    report_file = models.FileField(upload_to='inspection_reports/', null=True, blank=True)
    notes = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    is_passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Inspection for {self.car}: {self.overall_score}/10"

# ==================== SUPPORTING MODELS ====================
class Favorite(models.Model):
    """
    Supporting: User's watchlist
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'car']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user} favorited {self.car}"

class Comparison(models.Model):
    """
    Supporting: Compare cars side by side
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comparisons')
    cars = models.ManyToManyField(Car, related_name='compared_in')
    name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Comparison by {self.user}"

class ReportedListing(models.Model):
    """
    Supporting: User-reported issues
    """
    REASON_CHOICES = (
        ('spam', 'Spam/Fake'),
        ('scam', 'Possible Scam'),
        ('wrong_info', 'Wrong Information'),
        ('sold', 'Already Sold'),
        ('inappropriate', 'Inappropriate Content'),
        ('other', 'Other'),
    )
    
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=(
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ), default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report on {self.listing}"

class Promotion(models.Model):
    """
    Supporting: Marketing/boost packages
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField()
    features = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class PromotionPurchase(models.Model):
    """
    Supporting: Purchase of promotion packages
    """
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    payment_reference = models.CharField(max_length=100)
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    purchased_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.promotion.name} for {self.listing}"