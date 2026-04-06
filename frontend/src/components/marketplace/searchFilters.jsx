import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X, MapPin, Loader2 } from 'lucide-react';
import { useFacets } from '@/hooks/useVehicles';

export default function SearchFilters({ filters, onFilterChange, totalResults, apiParams }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch facets based on current selection
  const { data: facets, isLoading: isLoadingFacets } = useFacets(apiParams);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      search: '',
      make: '',
      bodyType: '',
      fuelType: '',
      condition: '',
      minPrice: 0,
      maxPrice: 10000000,
      minYear: 2000,
      maxYear: 2025,
      maxMileage: 300000,
      location: ''
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'minPrice' && value === 0) return false;
    if (key === 'maxPrice' && value === 10000000) return false;
    if (key === 'minYear' && value === 2000) return false;
    if (key === 'maxYear' && value === 2025) return false;
    if (key === 'maxMileage' && value === 300000) return false;
    return value && value !== '';
  }).length;

  const formatPrice = (price) => {
    if (price >= 1000000) return `KSH ${(price / 1000000).toFixed(1)}M`;
    return 'KSH ' + new Intl.NumberFormat('en-KE', {
      maximumFractionDigits: 0
    }).format(price);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Make */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-400">Make</Label>
          {isLoadingFacets && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
        </div>
        <Select value={localFilters.make} onValueChange={(v) => handleChange('make', v === 'all' ? '' : v)}>
          <SelectTrigger className="h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="All Makes" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="all">All Makes</SelectItem>
            {facets?.makes?.map(item => (
              <SelectItem key={item.make} value={item.make} disabled={item.count === 0}>
                <div className="flex justify-between items-center w-full min-w-[120px]">
                  <span>{item.make}</span>
                  <span className="text-xs text-white/40 ml-2">({item.count})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Body Type */}
      <div>
        <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-400">Body Type</Label>
        <Select value={localFilters.bodyType} onValueChange={(v) => handleChange('bodyType', v === 'all' ? '' : v)}>
          <SelectTrigger className="mt-1.5 h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="all">All Types</SelectItem>
            {facets?.body_types?.map(item => (
              <SelectItem key={item.body_type} value={item.body_type} className="capitalize" disabled={item.count === 0}>
                <div className="flex justify-between items-center w-full min-w-[120px]">
                  <span>{item.body_type.replace('_', ' ')}</span>
                  <span className="text-xs text-white/40 ml-2">({item.count})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-400">Price Range</Label>
        <div className="mt-3 px-2">
          <Slider
            value={[localFilters.minPrice || 0, localFilters.maxPrice || 10000000]}
            min={0}
            max={10000000}
            step={100000}
            onValueChange={([min, max]) => {
              handleChange('minPrice', min);
              handleChange('maxPrice', max);
            }}
            className="mt-2"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-500 mt-2">
            <span>{formatPrice(localFilters.minPrice || 0)}</span>
            <span>{formatPrice(localFilters.maxPrice || 10000000)}</span>
          </div>
          {localFilters.minPrice > localFilters.maxPrice && (
            <p className="text-red-400 text-[10px] mt-1">Min price cannot exceed max price</p>
          )}
        </div>
      </div>

      {/* Year Range */}
      <div>
        <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-400">Year</Label>
        <div className="mt-3 px-2">
          <Slider
            value={[localFilters.minYear || 2000, localFilters.maxYear || 2025]}
            min={2000}
            max={2025}
            step={1}
            onValueChange={([min, max]) => {
              handleChange('minYear', min);
              handleChange('maxYear', max);
            }}
            className="mt-2"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-500 mt-2">
            <span>{localFilters.minYear || 2000}</span>
            <span>{localFilters.maxYear || 2025}</span>
          </div>
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-400">Fuel Type</Label>
        <Select value={localFilters.fuelType} onValueChange={(v) => handleChange('fuelType', v === 'all' ? '' : v)}>
          <SelectTrigger className="mt-1.5 h-10 rounded-xl border-border bg-card text-foreground hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="All Fuel Types" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="all">All Fuel Types</SelectItem>
            {facets?.fuel_types?.map(item => (
              <SelectItem key={item.fuel_type} value={item.fuel_type} className="capitalize" disabled={item.count === 0}>
                <div className="flex justify-between items-center w-full min-w-[120px]">
                  <span>{item.fuel_type.replace('_', ' ')}</span>
                  <span className="text-xs text-white/40 ml-2">({item.count})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full bg-white/5 border-white/10 text-white/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all rounded-xl mt-4"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar - Sticky on Mobile */}
      <div className="sticky top-[80px] z-10 bg-black/5backdrop-blur-sm pt-2 pb-4 lg:static lg:bg-transparent lg:p-0">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by make, model..."
              value={localFilters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-10 h-11 text-sm rounded-xl border-border bg-card text-foreground focus:border-amber-500 focus:ring-amber-500 shadow-sm"
            />
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 px-4 lg:hidden relative rounded-xl border-border bg-card text-foreground hover:bg-muted">
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto bg-zinc-950 border-white/10 text-white">
              <SheetHeader>
                <SheetTitle className="text-white">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Results Count & Active Filters */}
      <div className="flex flex-wrap gap-2 items-center px-1">
        <span className="text-xs text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-wider">{totalResults} vehicles found</span>
        {activeFilterCount > 0 && (
          <>
            <span className="text-white/20">|</span>
            {localFilters.make && (
              <Badge variant="secondary" className="bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 pr-1">
                {localFilters.make}
                <button onClick={() => handleChange('make', '')} className="ml-1.5 p-0.5 hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {/* ... other badges ... */}
          </>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <FilterContent />
        </div>
      </div>
    </div>
  );
}
