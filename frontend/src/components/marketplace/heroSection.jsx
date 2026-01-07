import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, ArrowRight, Shield, DollarSign, Truck } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const FEATURED_IMAGES = [
  'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1920',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920'
];

export default function HeroSection({ featuredVehicle, onGetQuote }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Parallax Effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]); // Background moves slower
  const opacity = useTransform(scrollY, [0, 600], [1, 0]); // Fade out on scroll

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % FEATURED_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[600px] lg:h-[85vh] flex items-center overflow-hidden bg-background">
      {/* Parallax Background */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center will-change-transform"
              style={{ backgroundImage: `url(${FEATURED_IMAGES[currentImage]})` }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gray-900/60 dark:bg-gray-950/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent dark:from-gray-950 dark:via-gray-950/90" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-500 text-sm font-medium">Premium Car Marketplace</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 tracking-tight drop-shadow-xl">
              Find Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                Dream Car
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-gray-300 mb-10 max-w-xl leading-relaxed font-light text-shadow">
              Discover premium vehicles with transparent, no-haggle pricing.
              Your drive-away price in seconds—no surprises, no negotiations.
            </p>

            {/* Search Bar - Glassmorphism */}
            <div className="bg-white/10 dark:bg-black/20 p-2 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col sm:flex-row gap-2 max-w-xl shadow-2xl ring-1 ring-white/5">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search make, model, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-none text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                />
              </div>
              <Link to={createPageUrl(`Vehicles?search=${searchQuery}`)}>
                <Button className="w-full sm:w-auto h-12 px-8 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl whitespace-nowrap shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Search
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Value Props - Glass cards */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: DollarSign, title: "No Haggle", desc: "Fixed prices" },
                { icon: Shield, title: "Certified", desc: "Verified dealers" },
                { icon: Truck, title: "Delivery", desc: "Nationwide" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                  className="flex items-center gap-4 group cursor-default"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
                    <item.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                    <p className="text-gray-400 text-sm group-hover:text-amber-200/80 transition-colors">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}