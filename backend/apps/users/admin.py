from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Car, CarImage, Price, Listing, InspectionReport, 
    Inquiry, Favorite, Order, Payment, Review, Comparison,
    ReportedListing, Promotion, PromotionPurchase
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User Admin"""
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active', 'verified')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'dealer_name')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('role', 'phone', 'avatar', 'verified', 'rating')}),
        ('Dealer Info', {'fields': ('dealer_name', 'dealer_license', 'business_address')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Profile', {'fields': ('role', 'phone')}),
    )


class CarImageInline(admin.TabularInline):
    model = CarImage
    extra = 1


class PriceInline(admin.TabularInline):
    model = Price
    extra = 1


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    """Car/Vehicle Admin"""
    list_display = ('id', 'year', 'make', 'model', 'status', 'seller', 'condition', 'created_at')
    list_filter = ('status', 'make', 'body_type', 'fuel_type', 'transmission', 'condition')
    search_fields = ('make', 'model', 'vin', 'description', 'title')
    ordering = ('-created_at',)
    inlines = [CarImageInline, PriceInline]
    
    fieldsets = (
        (None, {'fields': ('seller', 'status', 'title')}),
        ('Vehicle Info', {'fields': ('vin', 'make', 'model', 'year', 'body_type', 'color')}),
        ('Engine & Performance', {'fields': ('engine_cc', 'fuel_type', 'transmission', 'mileage')}),
        ('Condition', {'fields': ('condition', 'description', 'features', 'seats', 'doors')}),
    )


@admin.register(CarImage)
class CarImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'car', 'is_primary', 'caption', 'uploaded_at')
    list_filter = ('is_primary',)
    search_fields = ('car__make', 'car__model', 'caption')


@admin.register(Price)
class PriceAdmin(admin.ModelAdmin):
    list_display = ('id', 'car', 'amount', 'currency', 'active', 'negotiable', 'set_at')
    list_filter = ('active', 'currency', 'negotiable')
    search_fields = ('car__make', 'car__model')


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'car', 'is_active', 'featured', 'views_count', 'created_at', 'expires_at')
    list_filter = ('is_active', 'featured')
    search_fields = ('car__make', 'car__model')
    ordering = ('-created_at',)


@admin.register(InspectionReport)
class InspectionReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'car', 'inspector', 'overall_score', 'is_passed', 'created_at')
    list_filter = ('is_passed',)
    search_fields = ('car__make', 'car__model', 'inspector__username')


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('id', 'car', 'buyer', 'status', 'contact_preference', 'created_at')
    list_filter = ('status', 'contact_preference')
    search_fields = ('car__make', 'car__model', 'buyer__username', 'buyer__email')
    ordering = ('-created_at',)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'car', 'created_at')
    search_fields = ('user__username', 'car__make', 'car__model')
    ordering = ('-created_at',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'car', 'buyer', 'seller', 'agreed_price', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('car__make', 'car__model', 'buyer__username', 'seller__username')
    ordering = ('-created_at',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'amount', 'method', 'status', 'reference', 'created_at')
    list_filter = ('status', 'method')
    search_fields = ('reference', 'order__id')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'reviewer', 'seller', 'rating', 'is_verified_purchase', 'created_at')
    list_filter = ('rating', 'is_verified_purchase')
    search_fields = ('reviewer__username', 'seller__username')


@admin.register(Comparison)
class ComparisonAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'name', 'created_at')
    search_fields = ('user__username', 'name')


@admin.register(ReportedListing)
class ReportedListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'reporter', 'reason', 'status', 'created_at')
    list_filter = ('status', 'reason')
    search_fields = ('listing__car__make', 'reporter__username')


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'duration_days', 'is_active')
    list_filter = ('is_active',)


@admin.register(PromotionPurchase)
class PromotionPurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'promotion', 'listing', 'user', 'is_active', 'starts_at', 'expires_at')
    list_filter = ('is_active',)
