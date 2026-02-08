import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";

export default function WhatsAppButton() {
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show button after 2 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        // Direct WhatsApp chat link (private conversation)
        // Format: https://wa.me/<phone_number_without_plus>
        const whatsappUrl = "https://wa.me/254704275682";

        if (isMobile) {
            window.location.href = whatsappUrl;
        } else {
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
                    {/* Helper Bubble */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className="bg-white rounded-2xl shadow-xl p-4 mb-2 max-w-xs border border-gray-100 origin-bottom-right"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900">Need help?</h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    Chat with us on WhatsApp for instant support!
                                </p>
                                <Button
                                    onClick={handleClick}
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                                >
                                    Chat with Us
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Button */}
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow relative group"
                    >
                        <MessageCircle className="w-8 h-8 text-white" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                    </motion.button>
                </div>
            )}
        </AnimatePresence>
    );
}
