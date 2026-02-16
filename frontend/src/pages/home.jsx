import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useVehicles } from '@/hooks/useVehicles';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, DollarSign, Truck, Star, ChevronRight, Sparkles, FileCheck, CreditCard, MapPin, Clock } from 'lucide-react';
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

const TRUST_STATS = [
  { number: '200+', label: 'Verified Vehicles', icon: Shield },
  { number: '100%', label: 'Transparent Pricing', icon: DollarSign },
  { number: '100+', label: 'Happy Customers', icon: Star },
  { number: '48hrs', label: 'Delivery Time', icon: Truck }
];

const WHY_CHOOSE_US = [
  {
    icon: FileCheck,
    title: 'Professional Inspection Reports',
    description: 'Every vehicle undergoes a comprehensive 150-point inspection. Get a detailed inspection report before purchase - never buy blind.',
    badge: 'Verified Quality'
  },
  {
    icon: DollarSign,
    title: 'All-Inclusive Transparent Pricing',
    description: 'No hidden fees, broker markups, or surprises. See complete costs upfront: transfer fees, duty, taxes, and delivery all included.',
    badge: 'No Hidden Fees'
  },
  {
    icon: Truck,
    title: 'Direct Import & Local Stock',
    description: 'Access fresh Japanese imports (8-15 years) and quality local vehicles. Track your import from Japan to Nairobi with our app.',
    badge: 'Fresh Imports'
  },
  {
    icon: Shield,
    title: '6-Month Engine & Gearbox Warranty',
    description: 'We stand behind our quality. Full warranty included with servicing partners across Nairobi, Mombasa, Nakuru, and Eldoret.',
    badge: 'Protected Purchase'
  }
];

export default function HomePage() {
  const [quoteModal, setQuoteModal] = useState({ open: false, vehicle: null });
  const { user } = useAuth();

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

      {/* Trust Stats Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TRUST_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-5 h-5 text-amber-600 mr-2" />
                  <p className="text-3xl font-bold text-gray-900">{stat.number}</p>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100">
              The Difference
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Smart Buyers Choose Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We solve the biggest problems in Kenya's used car market: lack of transparency,
              hidden costs, and uncertainty about vehicle quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {WHY_CHOOSE_US.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                        {feature.badge}
                      </Badge>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Brand */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Browse by Brand</h2>
              <p className="text-gray-500 mt-2">Premium vehicles from top manufacturers</p>
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
              <p className="text-gray-500 mt-2">Fresh inventory from Japan and local dealers added daily</p>
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
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
              Buy your dream car in three simple steps - fully transparent, fully protected
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse & Get Inspection Report',
                desc: 'Explore verified vehicles with detailed 150-point inspection reports. Filter by budget, make, model, and location.',
                icon: FileCheck
              },
              {
                step: '02',
                title: 'See All-In Price & Finance',
                desc: 'Get transparent pricing including transfer fees, taxes, and delivery. Access flexible financing with our trusted partners.',
                icon: CreditCard
              },
              {
                step: '03',
                title: 'Track & Receive Your Car',
                desc: 'Complete purchase securely with M-Pesa. Track your import or delivery. Get 6-month warranty and nationwide service support.',
                icon: MapPin
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
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-gray-900" />
                  </div>
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

      {/* Service Coverage */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Serving All Major Kenyan Cities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional service and support across Kenya's major urban centers
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { city: 'Nairobi', area: 'Karen, Westlands, CBD', icon: MapPin },
              { city: 'Mombasa', area: 'Ganjoni, Moi Avenue', icon: MapPin },
              { city: 'Nakuru', area: 'City Center', icon: MapPin },
              { city: 'Eldoret', area: 'Town Center', icon: MapPin }
            ].map((location, i) => (
              <motion.div
                key={location.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <location.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{location.city}</h3>
                <p className="text-sm text-gray-600">{location.area}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-amber-400 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Find Your Perfect Car?
          </h2>
          <p className="text-lg text-gray-800 mb-3">
            Join thousands of satisfied customers who found their dream vehicles with
            transparent pricing, professional inspections, and exceptional service.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-gray-900 text-sm font-medium mb-8">
            <Clock className="w-4 h-4" />
            Most deliveries within 48 hours
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </section>

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