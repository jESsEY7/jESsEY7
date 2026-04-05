import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, Gauge, Calendar, Fuel, Info, MapPin } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { Button } from "@/components/ui/button";

const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    const url = typeof imageUrl === 'object' ? imageUrl.image : imageUrl;
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8002';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function CompareModal({ isOpen, onClose, vehicles }) {
    if (!isOpen) return null;

    const specs = [
        { label: 'Price', key: 'price', format: (val) => formatCurrency(val), icon: Info },
        { label: 'Year', key: 'year', icon: Calendar },
        { label: 'Mileage', key: 'mileage', format: (val) => `${Number(val).toLocaleString()} km`, icon: Gauge },
        { label: 'Fuel Type', key: 'fuel_type', format: (val) => val?.replace('_', ' ') || 'Petrol', icon: Fuel },
        { label: 'Transmission', key: 'transmission', icon: Info },
        { label: 'Condition', key: 'condition', format: (val) => val?.replace('_', ' ') || 'Used', icon: Info },
        { label: 'Location', key: 'location_city', icon: MapPin },
    ];

    const getFeatures = () => {
        const allFeatures = new Set();
        vehicles.forEach(v => {
            if (Array.isArray(v.features)) {
                v.features.forEach(f => allFeatures.add(f));
            }
        });
        return Array.from(allFeatures).sort();
    };

    const features = getFeatures();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-7xl max-h-[90vh] bg-[#0F0F0F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Vehicles to Compare</h2>
                            <p className="text-white/50 text-sm mt-1">Comparing technical specifications and features side-by-side</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full bg-white/5 hover:bg-white/10 text-white"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Content Table */}
                    <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="p-8 text-left bg-transparent sticky left-0 z-10 w-64 backdrop-blur-md border-r border-white/5 ring-1 ring-white/5">
                                        <span className="text-sm font-bold uppercase tracking-widest text-white/30 italic">Specifications</span>
                                    </th>
                                    {vehicles.map((v) => (
                                        <th key={v.id} className="p-8 text-center min-w-[280px]">
                                            <div className="space-y-4">
                                                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-lg group relative">
                                                    <img
                                                        src={getImageUrl(v.primary_image) || getImageUrl(v.images?.[0])}
                                                        alt={v.model}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                                        <p className="text-amber-500 font-black text-lg">{formatCurrency(v.price)}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-500 transition-colors">
                                                        {v.make} {v.model}
                                                    </h3>
                                                    <p className="text-sm text-white/40 uppercase tracking-widest font-mono">
                                                        {v.year} • {v.trim || 'Base'}
                                                    </p>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Technical Specs */}
                                {specs.map((spec) => (
                                    <tr key={spec.key} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6 sticky left-0 z-10 bg-[#0F0F0F] border-r border-white/5 backdrop-blur-md flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <spec.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors">{spec.label}</span>
                                        </td>
                                        {vehicles.map((v) => (
                                            <td key={v.id} className="p-6 text-center">
                                                <span className="text-lg font-bold text-white leading-none">
                                                    {spec.format ? spec.format(v[spec.key]) : v[spec.key] || '-'}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                                {/* Divider for Features */}
                                <tr className="bg-white/[0.02]">
                                    <td colSpan={vehicles.length + 1} className="py-4 px-8 border-b border-white/10">
                                        <span className="text-sm font-black uppercase tracking-[0.2em] text-amber-500/80">Features & Amenities</span>
                                    </td>
                                </tr>

                                {/* Features Comparison */}
                                {features.map((feature) => (
                                    <tr key={feature} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 sticky left-0 z-10 bg-[#0F0F0F] border-r border-white/5 backdrop-blur-md">
                                            <span className="text-sm font-medium text-white/40 px-4">{feature}</span>
                                        </td>
                                        {vehicles.map((v) => {
                                            const hasFeature = Array.isArray(v.features) && v.features.includes(feature);
                                            return (
                                                <td key={v.id} className="p-4 text-center">
                                                    {hasFeature ? (
                                                        <div className="flex justify-center">
                                                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                                                <Check className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-center">
                                                            <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/30">
                                                                <XCircle className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-white/10 flex items-center justify-center bg-white/[0.02]">
                        <p className="text-white/40 text-xs italic">
                            * Specifications are based on dealer-provided information and may vary.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
