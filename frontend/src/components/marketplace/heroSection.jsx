import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, ArrowRight, Shield, DollarSign, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroSection({ featuredVehicle, onGetQuote }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const BACKGROUND_IMAGES = [
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1920&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80",
    // "https://unsplash.com/photos/black-jeep-grand-cherokee-srt-parked-on-street-kUlmTTQSMhc",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1920&q=80"
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden bg-black">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0 select-none">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={BACKGROUND_IMAGES[currentImageIndex]}
            alt="Background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>
        {/* Gradients/Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-500 text-sm font-medium tracking-wide">Premium Car Marketplace</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Find Your <br />
              <span className="text-amber-500 drop-shadow-sm">
                Dream Car
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-gray-300 mb-10 max-w-xl leading-relaxed font-light">
              Discover premium vehicles with transparent, no-haggle pricing.
              Your drive-away price in seconds—no surprises, no negotiations.
            </p>

            {/* Search Bar */}
            <div className="p-2 rounded-2xl bg-gray-900/80 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row gap-2 max-w-lg shadow-2xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                <Input
                  placeholder="Search make, model, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-base w-full"
                />
              </div>
              <Link to={createPageUrl(`Vehicles?search=${searchQuery}`)}>
                <Button className="w-full sm:w-auto h-12 px-8 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Search
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Value Props */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { icon: DollarSign, title: "No Haggle", desc: "Fixed prices" },
                { icon: Shield, title: "Certified", desc: "Verified dealers" },
                { icon: Truck, title: "Delivery", desc: "Nationwide" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">{item.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}