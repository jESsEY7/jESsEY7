import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Gauge, Fuel, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const url = typeof imageUrl === 'object' ? imageUrl.image : imageUrl;
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8002';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function VehicleCard({ vehicle, onFavorite, isFavorited }) {
  const formatMileage = (km) => km ? new Intl.NumberFormat('en-KE').format(km) : '0';
  const monthlyPayment = vehicle.price ? Math.round(vehicle.price / 60) : 0;
  const primaryImage = getImageUrl(vehicle.primary_image) || getImageUrl(vehicle.images?.[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-white/5 backdrop-blur-md text-white rounded-2xl overflow-hidden shadow-xl hover:shadow-amber-500/10 transition-all duration-300 border border-white/10 flex flex-col h-full"
    >
      <Link to={`/vehicles/${vehicle.id}`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={`${vehicle.make} ${vehicle.model}`}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-700 ${vehicle.status === 'sold' ? 'grayscale opacity-75' : 'group-hover:scale-110'}`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <p className="text-xs">No image</p>
              </div>
            </div>
          )}

          {/* Status Overlays */}
          {vehicle.status === 'sold' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
              <span className="px-6 py-2 border-2 border-white text-white font-bold text-xl uppercase tracking-widest transform -rotate-12">
                Sold
              </span>
            </div>
          )}

          {vehicle.status === 'reserved' && (
            <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-center py-1 text-sm font-semibold uppercase tracking-wide z-10">
              Reserved
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {vehicle.is_featured && (vehicle.status === 'active' || vehicle.status === 'available') && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0 shadow-lg shadow-amber-900/20 w-fit backdrop-blur-md">
                Featured
              </Badge>
            )}
            {vehicle.condition === 'certified_preowned' && (
              <Badge className="bg-emerald-600/90 text-white hover:bg-emerald-700 border-0 shadow-lg shadow-emerald-900/20 w-fit backdrop-blur-md">
                <Shield className="w-3 h-3 mr-1" />
                Certified
              </Badge>
            )}
            {vehicle.condition === 'new' && (
              <Badge className="bg-blue-600/90 text-white hover:bg-blue-700 border-0 shadow-lg shadow-blue-900/20 w-fit backdrop-blur-md">
                New
              </Badge>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite?.(vehicle);
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 dark:bg-black/40 hover:bg-white/20 dark:hover:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all active:scale-95 z-20"
          >
            <Heart className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white/60 hover:text-red-500'}`} />
          </button>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link to={`/vehicles/${vehicle.id}`}>
          <div className="mb-1">
            <h3 className="text-xl font-bold text-white leading-tight group-hover:text-amber-500 transition-colors">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-white/50 font-medium mt-1">
              {vehicle.year} • {vehicle.trim || vehicle.body_type || 'Base'}
            </p>
          </div>
        </Link>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/60 group-hover:text-white transition-colors">
            <Gauge className="w-4 h-4 text-amber-500/70 shrink-0" />
            <span className="truncate">{formatMileage(vehicle.mileage)} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60 group-hover:text-white transition-colors">
            <Fuel className="w-4 h-4 text-amber-500/70 shrink-0" />
            <span className="capitalize truncate">
              {vehicle.fuel_type?.replace('_', ' ') || 'Petrol'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60 group-hover:text-white transition-colors col-span-2">
            <MapPin className="w-4 h-4 text-amber-500/70 shrink-0" />
            <span className="truncate">
              {vehicle.location_city || 'Nairobi'}, {vehicle.location_state || 'Kenya'}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between mt-auto pt-2">
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-0.5">Price</p>
            <p className="text-2xl font-black text-amber-500 tracking-tight">{formatCurrency(vehicle.price)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-0.5">Est. Payment</p>
            <p className="text-sm font-bold text-white">{formatCurrency(monthlyPayment)}/mo</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}