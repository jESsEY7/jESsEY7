import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicle } from '@/hooks/useVehicles';
import { useFavorites } from '@/hooks/useFavorites';
import { formatCurrency } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import QuoteModal from '@/components/marketplace/quoteModal.jsx';
import {
    ArrowLeft, Calendar, Gauge, Fuel, Info, CheckCircle2,
    AlertCircle, Heart, Loader2, MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Get full image URL from backend response
 * Handles relative URLs by prepending backend base URL
 */
const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    // Handle object with .image property (from serializer)
    const url = typeof imageUrl === 'object' ? imageUrl.image : imageUrl;
    if (!url) return null;

    // Already absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Relative URL - prepend backend base URL
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8002';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Format vehicle ID for display (handles both number and string types)
 */
const formatVehicleId = (id) => {
    if (!id) return '--------';
    const idStr = String(id);
    // For numeric IDs, pad with zeros for consistent display
    if (/^\d+$/.test(idStr)) {
        return idStr.padStart(6, '0');
    }
    // For UUID or string IDs, take first 8 characters
    return idStr.slice(0, 8).toUpperCase();
};

export default function VehicleDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: vehicle, isLoading, error } = useVehicle(id);
    const { isFavorited, toggleFavorite } = useFavorites();
    const [quoteOpen, setQuoteOpen] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
                <p className="text-gray-500">Loading vehicle details...</p>
            </div>
        );
    }

    // Error state
    if (error || !vehicle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Vehicle Not Found</h2>
                <p className="text-gray-500 mt-2">
                    {error?.message || 'The vehicle you are looking for does not exist or has been removed.'}
                </p>
                <Button variant="outline" className="mt-6" onClick={() => navigate('/vehicles')}>
                    Back to Inventory
                </Button>
            </div>
        );
    }

    // Build images array from backend data only (no static fallbacks)
    const images = [];

    // Add primary image if exists
    if (vehicle.primary_image) {
        const primaryUrl = getImageUrl(vehicle.primary_image);
        if (primaryUrl) images.push(primaryUrl);
    }

    // Add additional images from array
    if (vehicle.images && Array.isArray(vehicle.images)) {
        vehicle.images.forEach(img => {
            const imgUrl = getImageUrl(img);
            if (imgUrl && !images.includes(imgUrl)) {
                images.push(imgUrl);
            }
        });
    }

    // Check if vehicle is favorited
    const vehicleIsFavorited = vehicle.id ? isFavorited(vehicle.id) : false;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button
                variant="ghost"
                className="mb-6 pl-0 hover:pl-2 transition-all"
                onClick={() => navigate('/vehicles')}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Inventory
            </Button>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* Left: Images */}
                <div className="space-y-4">
                    <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border relative">
                        {images.length > 0 ? (
                            <img
                                src={images[activeImage] || images[0]}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No images available</p>
                                </div>
                            </div>
                        )}

                        {/* Favorite button */}
                        <button
                            onClick={() => vehicle.id && toggleFavorite(vehicle.id)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm flex items-center justify-center shadow-md transition-colors"
                        >
                            <Heart
                                className={`w-5 h-5 transition-colors ${vehicleIsFavorited
                                        ? 'fill-red-500 text-red-500'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Thumbnail gallery */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative flex-shrink-0 w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx
                                            ? 'border-amber-500 ring-2 ring-amber-500/20'
                                            : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.parentElement.style.display = 'none';
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <Badge
                                variant={vehicle.status === 'active' || vehicle.status === 'available' ? 'default' : 'destructive'}
                                className={`px-4 py-1.5 text-base capitalize ${vehicle.status === 'sold' ? 'bg-gray-900 text-white' : ''
                                    }`}
                            >
                                {vehicle.status || 'available'}
                            </Badge>
                            <span className="text-gray-400 font-mono text-sm">
                                Stock #{formatVehicleId(vehicle.id)}
                            </span>
                        </div>

                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
                            {vehicle.make} {vehicle.model}
                        </h1>
                        <p className="text-xl text-gray-500 mt-2 font-medium">
                            {vehicle.year} • {vehicle.trim || vehicle.body_type || 'Base'}
                        </p>
                    </div>

                    {/* Price section */}
                    <div className="p-6 bg-white rounded-2xl border-2 border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider mb-1">
                                No-Haggle Price
                            </p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold text-gray-900">
                                    {formatCurrency(vehicle.price)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                size="lg"
                                className={`h-14 px-8 text-lg ${vehicle.status !== 'active' && vehicle.status !== 'available'
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'bg-amber-500 hover:bg-amber-600 text-black border-none'
                                    }`}
                                onClick={() => (vehicle.status === 'active' || vehicle.status === 'available') && setQuoteOpen(true)}
                                disabled={vehicle.status !== 'active' && vehicle.status !== 'available'}
                            >
                                {vehicle.status === 'active' || vehicle.status === 'available'
                                    ? 'Get Quote'
                                    : vehicle.status === 'sold'
                                        ? 'Sold'
                                        : 'Reserved'
                                }
                            </Button>
                        </div>
                    </div>

                    {/* Specs grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Year</p>
                                    <p className="font-semibold">{vehicle.year || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <Gauge className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Mileage</p>
                                    <p className="font-semibold">
                                        {vehicle.mileage
                                            ? `${Number(vehicle.mileage).toLocaleString()} km`
                                            : '-'
                                        }
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Fuel className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Fuel Type</p>
                                    <p className="font-semibold capitalize">
                                        {vehicle.fuel_type?.replace('_', ' ') || '-'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Transmission</p>
                                    <p className="font-semibold capitalize">
                                        {vehicle.transmission?.replace('_', ' ') || 'Automatic'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Location */}
                    {(vehicle.location_city || vehicle.location_state) && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-5 h-5" />
                            <span>{vehicle.location_city || 'Nairobi'}, {vehicle.location_state || 'Kenya'}</span>
                        </div>
                    )}

                    {/* Features */}
                    {vehicle.features && Array.isArray(vehicle.features) && vehicle.features.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">Features & Specs</h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {vehicle.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-gray-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {vehicle.description && (
                        <div className="border-t pt-8">
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {vehicle.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <QuoteModal
                open={quoteOpen}
                onClose={() => setQuoteOpen(false)}
                vehicle={vehicle}
                user={user}
            />
        </div>
    );
}
