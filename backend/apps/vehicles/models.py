from django.db import models
from django.conf import settings

class Vehicle(models.Model):
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('certified_preowned', 'Certified Pre-Owned'),
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
    ]
    
    BODY_TYPE_CHOICES = [
        ('sedan', 'Sedan'), ('suv', 'SUV'), ('coupe', 'Coupe'), 
        ('truck', 'Truck'), ('convertible', 'Convertible'), 
        ('wagon', 'Wagon'), ('van', 'Van'), ('hatchback', 'Hatchback')
    ]
    
    TRANSMISSION_CHOICES = [('automatic', 'Automatic'), ('manual', 'Manual'), ('cvt', 'CVT')]
    FUEL_TYPE_CHOICES = [('gasoline', 'Gasoline'), ('diesel', 'Diesel'), ('electric', 'Electric'), ('hybrid', 'Hybrid'), ('plug_in_hybrid', 'Plug-in Hybrid')]
    DRIVETRAIN_CHOICES = [('fwd', 'FWD'), ('rwd', 'RWD'), ('awd', 'AWD'), ('4wd', '4WD')]
    STATUS_CHOICES = [('pending', 'Pending'), ('active', 'Active'), ('sold', 'Sold'), ('archived', 'Archived')]

    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    mileage = models.IntegerField(null=True, blank=True)
    condition = models.CharField(max_length=50, choices=CONDITION_CHOICES, blank=True)
    body_type = models.CharField(max_length=50, choices=BODY_TYPE_CHOICES, blank=True)
    exterior_color = models.CharField(max_length=50, blank=True)
    interior_color = models.CharField(max_length=50, blank=True)
    transmission = models.CharField(max_length=50, choices=TRANSMISSION_CHOICES, blank=True)
    fuel_type = models.CharField(max_length=50, choices=FUEL_TYPE_CHOICES, blank=True)
    engine = models.CharField(max_length=200, blank=True)
    drivetrain = models.CharField(max_length=20, choices=DRIVETRAIN_CHOICES, blank=True)
    vin = models.CharField(max_length=50, blank=True)
    
    features = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True)
    
    # Storing image URLs directly for now
    images = models.JSONField(default=list, blank=True)
    primary_image = models.URLField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    has_360_view = models.BooleanField(default=False)
    
    dealer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicles', null=True, blank=True)
    dealer_name = models.CharField(max_length=200, blank=True) # Cache for display
    
    location_city = models.CharField(max_length=100, blank=True)
    location_state = models.CharField(max_length=100, blank=True)
    location_zip = models.CharField(max_length=20, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_featured = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    quotes_count = models.IntegerField(default=0)
    
    certification = models.CharField(max_length=200, blank=True)
    warranty_info = models.TextField(blank=True)
    
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"


class Listing(models.Model):
    STATUS_CHOICES = [('pending','Pending'), ('active','Active'), ('sold','Sold'), ('archived','Archived')]

    vehicle = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='listing')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    suggested_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_published = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    verification_notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Listing {self.id} - {self.vehicle}"


class Photo(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='photos')
    url = models.URLField()
    file_key = models.CharField(max_length=512, blank=True)  # optional S3 key or storage identifier
    thumbnail_url = models.URLField(blank=True)  # generated thumbnail URL
    processed = models.BooleanField(default=False)
    phash = models.CharField(max_length=64, blank=True)  # perceptual hash (hex)
    is_duplicate = models.BooleanField(default=False)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)

    image = models.ImageField(upload_to='listings/%Y/%m/%d/', blank=True, null=True)

    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        # Logic: If this is set to primary, unset all other photos for this vehicle
        if self.is_primary:
            Photo.objects.filter(vehicle=self.vehicle).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Photo {self.id} - {self.vehicle}"


class ConditionReport(models.Model):
    ENGINE_HEALTH_CHOICES = [('good','Good'),('minor_issues','Minor Issues'),('major_issues','Major Issues')]
    BODYWORK_CHOICES = [('excellent','Excellent'),('minor_damage','Minor Damage'),('major_damage','Major Damage')]
    TIRE_TREAD_CHOICES = [('new','New'),('good','Good'),('worn','Worn')]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='condition_reports')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    engine_health = models.CharField(max_length=50, choices=ENGINE_HEALTH_CHOICES, blank=True)
    bodywork = models.CharField(max_length=50, choices=BODYWORK_CHOICES, blank=True)
    tire_tread = models.CharField(max_length=50, choices=TIRE_TREAD_CHOICES, blank=True)
    notes = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"ConditionReport {self.id} - {self.vehicle}"


class VINLookupRecord(models.Model):
    vin = models.CharField(max_length=50, unique=True)
    data = models.JSONField(default=dict)
    source = models.CharField(max_length=100, blank=True)
    fetched_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.vin


class Offer(models.Model):
    STATUS_CHOICES = [('pending','Pending'),('accepted','Accepted'),('rejected','Rejected')]

    listing = models.ForeignKey('Listing', on_delete=models.CASCADE, related_name='offers')
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='offers')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    terms = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Offer {self.id} - {self.listing} by {self.buyer}"


class TestDrive(models.Model):
    listing = models.ForeignKey('Listing', on_delete=models.CASCADE, related_name='test_drives')
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='test_drives')
    scheduled_for = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    confirmed = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TestDrive {self.id} - {self.listing} @ {self.scheduled_for}"
