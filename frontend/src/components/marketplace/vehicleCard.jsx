import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Gauge, Fuel, Shield, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
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
  const { toggleCompare, isInCompare } = useCompare();
  const isCompared = isInCompare(vehicle.id);
  const formatMileage = (km) => km ? new Intl.NumberFormat('en-KE').format(km) : '0';
  const monthlyPayment = vehicle.price ? Math.round(vehicle.price / 60) : 0;
  const primaryImage = getImageUrl(vehicle.primary_image) || getImageUrl(vehicle.images?.[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-card text-card-foreground rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 border border-border flex flex-col h-full"
    >
      <Link to={`/vehicles/${vehicle.id}`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={`${vehicle.make} ${vehicle.model}`}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-700 ${vehicle.status === 'sold' ? 'grayscale opacity-75' : 'group-hover:scale-110'}`}
              onError={(e) => {
                if (e.target) {
                  e.target.style.display = 'none';
                  if (e.target.parentElement) {
                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                  }
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
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
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {vehicle.is_featured && (vehicle.status === 'active' || vehicle.status === 'available') && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0 shadow-lg shadow-amber-900/20 w-fit">
                Featured
              </Badge>
            )}
            {vehicle.condition === 'certified_preowned' && (
              <Badge className="bg-emerald-600/90 text-white hover:bg-emerald-700 border-0 shadow-lg shadow-emerald-900/20 w-fit">
                <Shield className="w-3 h-3 mr-1" />
                Certified
              </Badge>
            )}
            {vehicle.condition === 'new' && (
              <Badge className="bg-blue-600/90 text-white hover:bg-blue-700 border-0 shadow-lg shadow-blue-900/20 w-fit">
                New
              </Badge>
            )}
          </div>

          {/* Performance Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavorite?.(vehicle);
              }}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all active:scale-95 border border-black/5 dark:border-white/10"
              title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-white/70 hover:text-red-500'}`} />
            </button>

            {/* Compare button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(vehicle);
              }}
              className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg transition-all active:scale-95 border border-black/5 dark:border-white/10 ${isCompared ? 'bg-amber-500 text-white' : 'bg-white/90 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 text-slate-600 dark:text-white/70 hover:text-amber-500'
                }`}
              title={isCompared ? "Remove from Compare" : "Add to Compare"}
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link to={`/vehicles/${vehicle.id}`}>
          <div className="mb-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-amber-500 transition-colors">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              {vehicle.year} • {vehicle.trim || vehicle.body_type || 'Base'}
            </p>
          </div>
        </Link>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-4 py-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            <Gauge className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">{formatMileage(vehicle.mileage)} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            <Fuel className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="capitalize truncate">
              {vehicle.fuel_type?.replace('_', ' ') || 'Petrol'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors col-span-2">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">
              {vehicle.location_city || 'Nairobi'}, {vehicle.location_state || 'Kenya'}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between mt-auto pt-4 border-t border-border">
          <div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-black tracking-widest mb-1">Total Price</p>
            <p className="text-2xl font-black text-amber-500 tracking-tight">{formatCurrency(vehicle.price)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-black tracking-widest mb-1">Est. Monthly</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white underline decoration-amber-500/30 underline-offset-4">{formatCurrency(monthlyPayment)}/mo</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}