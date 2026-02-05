import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';

const MAKES = ['Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Tesla', 'Lexus', 'Land Rover', 'Jaguar', 'Maserati', 'Ferrari'];
const BODY_TYPES = ['sedan', 'suv', 'coupe', 'truck', 'convertible', 'wagon', 'van', 'hatchback'];
const FUEL_TYPES = ['gasoline', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid'];
const CONDITIONS = ['new', 'certified_preowned', 'excellent', 'good', 'fair'];

export default function SearchFilters({ filters, onFilterChange, totalResults }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [sheetOpen, setSheetOpen] = useState(false);

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
      maxPrice: 500000,
      minYear: 2015,
      maxYear: 2025,
      maxMileage: 200000,
      location: ''
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'minPrice' && value === 0) return false;
    if (key === 'maxPrice' && value === 500000) return false;
    if (key === 'minYear' && value === 2015) return false;
    if (key === 'maxYear' && value === 2025) return false;
    if (key === 'maxMileage' && value === 200000) return false;
    return value && value !== '';
  }).length;

  const formatPrice = (price) => {
    return 'KSH ' + new Intl.NumberFormat('en-KE', {
      maximumFractionDigits: 0
    }).format(price);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Make */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Make</Label>
        <Select value={localFilters.make} onValueChange={(v) => handleChange('make', v)}>
          <SelectTrigger className="mt-1.5 h-10 rounded-lg border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-amber-500/50 transition-colors">
            <SelectValue placeholder="All Makes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Makes">All Makes</SelectItem>
            {MAKES.map(make => (
              <SelectItem key={make} value={make}>{make}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Body Type */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Body Type</Label>
        <Select value={localFilters.bodyType} onValueChange={(v) => handleChange('bodyType', v)}>
          <SelectTrigger className="mt-1.5 h-10 rounded-lg border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-amber-500/50 transition-colors">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Types">All Types</SelectItem>
            {BODY_TYPES.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Condition</Label>
        <Select value={localFilters.condition} onValueChange={(v) => handleChange('condition', v)}>
          <SelectTrigger className="mt-1.5 h-10 rounded-lg border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-amber-500/50 transition-colors">
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Conditions">All Conditions</SelectItem>
            {CONDITIONS.map(condition => (
              <SelectItem key={condition} value={condition} className="capitalize">
                {condition.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Price Range</Label>
        <div className="mt-3 px-2">
          <Slider
            value={[localFilters.minPrice || 0, localFilters.maxPrice || 500000]}
            min={0}
            max={500000}
            step={5000}
            onValueChange={([min, max]) => {
              handleChange('minPrice', min);
              handleChange('maxPrice', max);
            }}
            className="mt-2"
          />
          <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
            <span>{formatPrice(localFilters.minPrice || 0)}</span>
            <span>{formatPrice(localFilters.maxPrice || 500000)}</span>
          </div>
        </div>
      </div>

      {/* Year Range */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Year</Label>
        <div className="mt-3 px-2">
          <Slider
            value={[localFilters.minYear || 2015, localFilters.maxYear || 2025]}
            min={2000}
            max={2025}
            step={1}
            onValueChange={([min, max]) => {
              handleChange('minYear', min);
              handleChange('maxYear', max);
            }}
            className="mt-2"
          />
          <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
            <span>{localFilters.minYear || 2015}</span>
            <span>{localFilters.maxYear || 2025}</span>
          </div>
        </div>
      </div>

      {/* Max Mileage */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Maximum Mileage</Label>
        <div className="mt-3 px-2">
          <Slider
            value={[localFilters.maxMileage || 200000]}
            min={0}
            max={200000}
            step={5000}
            onValueChange={([value]) => handleChange('maxMileage', value)}
            className="mt-2"
          />
          <div className="text-right text-xs font-medium text-gray-500 mt-2">
            {new Intl.NumberFormat('en-US').format(localFilters.maxMileage || 200000)} miles
          </div>
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Fuel Type</Label>
        <Select value={localFilters.fuelType} onValueChange={(v) => handleChange('fuelType', v)}>
          <SelectTrigger className="mt-1.5 h-10 rounded-lg border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-amber-500/50 transition-colors">
            <SelectValue placeholder="All Fuel Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Fuel Types">All Fuel Types</SelectItem>
            {FUEL_TYPES.map(type => (
              <SelectItem key={type} value={type} className="capitalize">
                {type.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar - Sticky on Mobile */}
      <div className="sticky top-[80px] z-10 bg-gray-50/95 backdrop-blur-sm pt-2 pb-4 lg:static lg:bg-transparent lg:p-0">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={localFilters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-10 h-11 text-sm rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500 shadow-sm bg-white"
            />
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 px-4 lg:hidden relative rounded-xl bg-white shadow-sm border-gray-200">
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center px-1">
          <span className="text-xs text-gray-500">{totalResults} results</span>
          <span className="text-gray-300">|</span>
          {localFilters.make && (
            <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
              {localFilters.make}
              <button onClick={() => handleChange('make', '')} className="ml-1.5 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {/* ... (Other active filter badges logic can be similar) */}
        </div>
      )}

      {/* Desktop Filters */}
      {/* Updated to transparent/minimal look per screenshot */}
      <div className="hidden lg:block pr-4">
        <FilterContent />
      </div>
    </div>
  );
}