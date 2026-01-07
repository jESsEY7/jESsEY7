from django.contrib import admin
from .models import Vehicle, Listing, Photo, ConditionReport, VINLookupRecord, Offer, TestDrive


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('id', 'year', 'make', 'model', 'price', 'status', 'dealer_name', 'is_featured', 'created_date')
    list_filter = ('status', 'make', 'body_type', 'fuel_type', 'transmission', 'condition', 'is_featured')
    search_fields = ('make', 'model', 'vin', 'description', 'dealer_name')
    ordering = ('-created_date',)
    
    fieldsets = (
        (None, {'fields': ('dealer', 'dealer_name', 'status', 'is_featured')}),
        ('Vehicle Info', {'fields': ('vin', 'make', 'model', 'year', 'body_type', 'exterior_color', 'interior_color')}),
        ('Specs', {'fields': ('engine', 'fuel_type', 'transmission', 'drivetrain', 'mileage', 'condition')}),
        ('Pricing', {'fields': ('price',)}),
        ('Location', {'fields': ('location_city', 'location_state', 'location_zip')}),
        ('Media', {'fields': ('primary_image', 'images', 'video_url', 'has_360_view')}),
        ('Details', {'fields': ('features', 'description', 'certification', 'warranty_info')}),
    )


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle', 'price', 'status', 'is_published', 'is_verified', 'created_date')
    list_filter = ('status', 'is_published', 'is_verified')
    search_fields = ('vehicle__make', 'vehicle__model')
    ordering = ('-created_date',)


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle', 'is_primary', 'processed', 'is_duplicate', 'order', 'created_date')
    list_filter = ('is_primary', 'processed', 'is_duplicate')
    search_fields = ('vehicle__make', 'vehicle__model')


@admin.register(ConditionReport)
class ConditionReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle', 'reporter', 'engine_health', 'score', 'completed', 'created_date')
    list_filter = ('completed', 'engine_health', 'bodywork')
    search_fields = ('vehicle__make', 'vehicle__model')


@admin.register(VINLookupRecord)
class VINLookupRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'vin', 'source', 'fetched_at', 'expires_at')
    search_fields = ('vin',)
    ordering = ('-fetched_at',)
    readonly_fields = ('data',)


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'buyer', 'amount', 'status', 'created_date')
    list_filter = ('status',)
    search_fields = ('buyer__username', 'buyer__email')
    ordering = ('-created_date',)


@admin.register(TestDrive)
class TestDriveAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'requester', 'scheduled_for', 'confirmed', 'location', 'created_date')
    list_filter = ('confirmed',)
    search_fields = ('requester__username', 'requester__email', 'location')
    ordering = ('-created_date',)
