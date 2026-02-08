import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVehicles } from '@/hooks/useVehicles';
import { useFavorites } from '@/hooks/useFavorites';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import VehicleCard from '@/components/marketplace/vehicleCard';
import SearchFilters from '@/components/marketplace/searchFilters';
import QuoteModal from '@/components/marketplace/quoteModal.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function VehiclesPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [quoteModal, setQuoteModal] = useState({ open: false, vehicle: null });
  const { isFavorited, toggleFavorite } = useFavorites();
  const [showFilters, setShowFilters] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const initialMake = urlParams.get('make') || '';
  const initialSearch = urlParams.get('search') || '';

  const [filters, setFilters] = useState({
    search: initialSearch,
    make: initialMake,
    bodyType: '',
    fuelType: '',
    condition: '',
    minPrice: 0,
    maxPrice: 500000,
    minYear: 2015,
    maxYear: 2025,
    maxMileage: 200000,
    location: ''
  });

  // Construct API params from filters
  const apiParams = {
    // Backend uses created_at, year, mileage as ordering fields
    ordering: sortBy === 'price_low' ? 'year' :
      sortBy === 'price_high' ? '-year' :
        sortBy === 'year_new' ? '-year' :
          sortBy === 'year_old' ? 'year' :
            sortBy === 'mileage' ? 'mileage' :
              '-created_at',
    search: filters.search || undefined,
    make: filters.make || undefined,
    body_type: filters.bodyType || undefined,
    fuel_type: filters.fuelType || undefined,
    condition: filters.condition || undefined,
    // Use backend-compatible price filtering
    price__gte: filters.minPrice > 0 ? filters.minPrice : undefined,
    price__lte: filters.maxPrice < 500000 ? filters.maxPrice : undefined,
    year__gte: filters.minYear > 2015 ? filters.minYear : undefined,
    year__lte: filters.maxYear < 2025 ? filters.maxYear : undefined,
    mileage__lte: filters.maxMileage < 200000 ? filters.maxMileage : undefined,
  };

  const { data: vehiclesData, isLoading } = useVehicles(apiParams);
  const vehicles = vehiclesData?.results || vehiclesData || [];
  const sortedVehicles = vehicles; // Sorting is handled by API now

  const handleFavorite = async (vehicle) => {
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }
    toggleFavorite(vehicle.id);
  };

  // Background Image Slideshow
  const BACKGROUND_IMAGES = [
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1920&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80",
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1920&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative bg-blur">
      {/* Background Image Slideshow */}
      <div className="fixed inset-0 z-0 select-none">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={BACKGROUND_IMAGES[currentImageIndex]}
            alt="Background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />
      </div>



      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar area (Contains Search + Filters) */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <SearchFilters
              filters={filters}
              onFilterChange={setFilters}
              totalResults={sortedVehicles.length}
            />
          </aside>

          {/* Vehicle Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedVehicles.length > 0 ? (
              <motion.div
                layout
                className={
                  viewMode === 'grid'
                    ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                <AnimatePresence>
                  {sortedVehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onFavorite={handleFavorite}
                      isFavorited={isFavorited(vehicle.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">No vehicles match your filters</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilters({
                    search: '',
                    make: '',
                    bodyType: '',
                    fuelType: '',
                    condition: '',
                    minPrice: 0,
                    maxPrice: 500000,
                    minYear: 2015,
                    maxYear: 2025,
                    maxMileage: 200000,
                    location: ''
                  })}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Quote Modal */}
      <QuoteModal
        open={quoteModal.open}
        onClose={() => setQuoteModal({ open: false, vehicle: null })}
        vehicle={quoteModal.vehicle}
        user={user}
      />
    </div>
  );
}