import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl, formatCurrency } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowLeft, Trash2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Get full image URL from backend response
 * Handles relative URLs by prepending backend base URL
 */
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Already absolute URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Relative URL - prepend backend base URL
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8002';
  return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { favorites, isLoading, toggleFavorite } = useFavorites();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Please Log In</h2>
          <Link to={createPageUrl('Login')}>
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('Vehicles')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-500">{favorites.length} saved vehicles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {favorites.map((favorite) => {
                // Get image URL with proper handling
                const vehicle = favorite.vehicle;
                const imageUrl = getImageUrl(vehicle?.primary_image) ||
                  getImageUrl(vehicle?.images?.[0]);

                return (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                      <div className="relative aspect-[4/3] bg-gray-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`${vehicle?.make} ${vehicle?.model}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <AlertCircle className="w-8 h-8 mx-auto mb-1 opacity-50" />
                              <p className="text-xs">No image</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <Link to={`/vehicles/${vehicle?.id}`}>
                            <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => toggleFavorite(vehicle?.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900">
                          {vehicle?.make} {vehicle?.model}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {vehicle?.year} • {vehicle?.mileage?.toLocaleString()} km
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-2">
                          {formatCurrency(vehicle?.price)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No favorites yet</h2>
            <p className="text-gray-500 mt-2 max-w-sm">
              Mark vehicles as favorites to track price drops and availability.
            </p>
            <Link to={createPageUrl('Vehicles')}>
              <Button className="mt-8 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-8 h-12 rounded-xl">
                Browse Inventory
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}