import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useVehicles } from '@/hooks/useVehicles';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, DollarSign, Truck, Star, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/marketplace/heroSection';
import VehicleCard from '@/components/marketplace/vehicleCard';
import QuoteModal from '@/components/marketplace/quoteModal.jsx';

const PREMIUM_BRANDS = [
  { name: 'Mercedes-Benz', logo: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=100' },
  { name: 'BMW', logo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100' },
  { name: 'Audi', logo: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=100' },
  { name: 'Porsche', logo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100' },
  { name: 'Tesla', logo: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100' },
  { name: 'Lexus', logo: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=100' }
];

export default function HomePage() {
  const [quoteModal, setQuoteModal] = useState({ open: false, vehicle: null });
  const { user } = useAuth(); // Use useAuth instead of base44.auth.me

  // Use useVehicles hook for fetch
  const { data: vehiclesData } = useVehicles({ page_size: 12, ordering: '-created_at', status: 'available' });
  const vehicles = Array.isArray(vehiclesData?.results)
    ? vehiclesData.results
    : Array.isArray(vehiclesData)
      ? vehiclesData
      : [];


  const featuredVehicle = vehicles.find(v => v.is_featured) || vehicles[0];
  const latestVehicles = vehicles.slice(0, 8);

  const formatPrice = (price) => {
    if (!price) return '-';
    return 'KSH ' + new Intl.NumberFormat('en-KE', {
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        featuredVehicle={featuredVehicle}
        onGetQuote={(vehicle) => setQuoteModal({ open: true, vehicle })}
      />



      {/* Browse by Brand */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Browse by Brand</h2>
              <p className="text-gray-500 mt-2">Explore luxury vehicles from top manufacturers</p>
            </div>
            <Link to={createPageUrl('Vehicles')}>
              <Button variant="ghost" className="text-amber-600 hover:text-amber-700">
                View All Brands
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {PREMIUM_BRANDS.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link
                  to={createPageUrl(`Vehicles?make=${encodeURIComponent(brand.name)}`)}
                  className="block p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors text-center group"
                >
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-3 bg-white shadow-sm">
                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                    {brand.name}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Vehicles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4" />
                Just Listed
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Latest Arrivals</h2>
              <p className="text-gray-500 mt-2">Fresh inventory added daily</p>
            </div>
            <Link to={createPageUrl('Vehicles')}>
              <Button className="bg-gray-900 hover:bg-gray-800">
                View All Vehicles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestVehicles.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <VehicleCard
                  vehicle={vehicle}
                  onFavorite={(v) => { }}
                />
              </motion.div>
            ))}
          </div>

          {latestVehicles.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No vehicles available yet</p>
              <p className="text-sm text-gray-400 mt-1">Check back soon for new listings</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
              Get your dream car in three simple steps with complete transparency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse & Compare',
                desc: 'Explore our curated collection of premium vehicles. Use filters to find your perfect match.'
              },
              {
                step: '02',
                title: 'Get Your Price',
                desc: 'Enter your zip code to get an instant, all-inclusive drive-away price with no hidden fees.'
              },
              {
                step: '03',
                title: 'Complete Purchase',
                desc: 'Finalize your purchase online and choose home delivery or pickup from the dealer.'
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-7xl font-bold text-gray-800 absolute -top-6 left-0">
                  {item.step}
                </div>
                <div className="pt-12 pl-4">
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to={createPageUrl('Vehicles')}>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-gray-900 h-14 px-8">
                Start Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-br from-amber-400 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Ready to Find Your Perfect Car?
          </h2>
          <p className="text-lg text-gray-800 mt-4 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their dream vehicles
            with transparent pricing and exceptional service.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Vehicles')}>
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white h-14 px-8">
                Browse Inventory
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('DealerSignup')}>
              <Button size="lg" variant="outline" className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white h-14 px-8">
                Become a Dealer
              </Button>
            </Link>
          </div>
        </div>
      </section> */}

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