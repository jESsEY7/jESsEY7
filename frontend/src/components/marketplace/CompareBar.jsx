import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, Trash2, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCompare } from '@/context/CompareContext';
import CompareModal from './CompareModal';

const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    const url = typeof imageUrl === 'object' ? imageUrl.image : imageUrl;
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8002';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function CompareBar() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (compareItems.length === 0) return null;

    return (
        <>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[95%] max-w-4xl"
            >
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 overflow-x-auto no-scrollbar py-1">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black shrink-0">
                                <ArrowRightLeft className="w-5 h-5" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-bold text-white leading-none">Compare</p>
                                <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">{compareItems.length} selected</p>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-white/10 hidden sm:block mx-2" />

                        <div className="flex items-center gap-3">
                            <AnimatePresence mode="popLayout">
                                {compareItems.map((vehicle) => (
                                    <motion.div
                                        key={vehicle.id}
                                        layout
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="relative group shrink-0"
                                    >
                                        <div className="w-16 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                                            <img
                                                src={getImageUrl(vehicle.primary_image) || getImageUrl(vehicle.images?.[0])}
                                                alt={vehicle.model}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeFromCompare(vehicle.id)}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearCompare}
                            className="text-white/60 hover:text-white hover:bg-white/5 text-xs h-9"
                        >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            <span className="hidden sm:inline">Clear</span>
                        </Button>

                        <Button
                            onClick={() => setIsModalOpen(true)}
                            disabled={compareItems.length < 2}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl h-10 px-4 shadow-lg shadow-amber-500/20"
                        >
                            <span className="mr-1">Compare Now</span>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>

            <CompareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                vehicles={compareItems}
            />
        </>
    );
}
