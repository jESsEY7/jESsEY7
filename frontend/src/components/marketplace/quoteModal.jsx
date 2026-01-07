import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, DollarSign, Truck, Calculator, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateInquiry } from '@/hooks/useVehicles';

export default function QuoteModal({ open, onClose, vehicle, user }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [formData, setFormData] = useState({
    zip: '',
    name: user?.full_name || user?.username || '',
    email: user?.email || '',
    phone: ''
  });
  const { mutate: createInquiry, isPending } = useCreateInquiry();

  const calculateQuote = async () => {
    setLoading(true);

    // Simulate delivery fee calculation based on zip
    const zipNum = parseInt(formData.zip);
    const baseDelivery = 299;
    const distanceFee = Math.abs((zipNum % 1000) - 500) * 0.5;
    const deliveryFee = Math.round(baseDelivery + distanceFee);

    // Estimate taxes (varies by state, using ~8% average)
    const taxRate = 0.08;
    const taxes = Math.round(vehicle.price * taxRate);

    const total = vehicle.price + deliveryFee + taxes;

    const quoteData = {
      // Mapping to Backend Inquiry Model Fields
      car: vehicle.id,
      // User ID if logged in, handled by backend token. 
      // But we might want to send message or other fields.
      message: `Quote request for ${vehicle.year} ${vehicle.make} ${vehicle.model}. Zip: ${formData.zip}`,
      // Meta data could be stored in a JSON field if model supported it, 
      // for now we trust backend to link buyer=request.user
    };

    console.log("Submitting quote:", quoteData);

    createInquiry(quoteData, {
      onSuccess: (data) => {
        setQuote({
          ...data,
          // Enrich with calculation details for display since backend might not return them all calculated yet
          vehicle_price: vehicle.price,
          delivery_fee: deliveryFee,
          taxes_estimate: taxes,
          total_drive_away: total,
          buyer_zip: formData.zip
        });
        setLoading(false);
        setStep(3);
      },
      onError: (error) => {
        console.error("Quote submission failed", error);
        setLoading(false);
        // Could show error state here
      }
    });
  };

  const handleSubmit = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      calculateQuote();
    }
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return 'KSH ' + new Intl.NumberFormat('en-KE', {
      maximumFractionDigits: 0
    }).format(price);
  };

  const resetModal = () => {
    setStep(1);
    setQuote(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">
              Get Your Instant Quote
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex items-center gap-4">
            <img
              src={vehicle?.primary_image || vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200'}
              alt={vehicle?.make}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div>
              <h4 className="font-semibold">{vehicle?.year} {vehicle?.make} {vehicle?.model}</h4>
              <p className="text-gray-400 text-sm">{vehicle?.location_city}, {vehicle?.location_state}</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{formatPrice(vehicle?.price)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                    <MapPin className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Enter Your Zip Code</h3>
                  <p className="text-gray-500 text-sm mt-1">We'll calculate your exact drive-away price</p>
                </div>

                <div>
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="Enter your zip code"
                    className="text-center text-2xl h-14 tracking-widest"
                    maxLength={5}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800"
                  disabled={formData.zip.length !== 5}
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate My Price
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                    <Sparkles className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Almost There!</h3>
                  <p className="text-gray-500 text-sm mt-1">Just need a few details to send your quote</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-gray-900"
                  disabled={!formData.name || !formData.email || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5 mr-2" />
                      Get My Quote
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {step === 3 && quote && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Your Drive-Away Price</h3>
                  <p className="text-gray-500 text-sm mt-1">Valid for 7 days</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Vehicle Price</span>
                    <span className="font-medium">{formatPrice(quote.base_price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Delivery to {quote.buyer_zip}
                    </span>
                    <span className="font-medium">{formatPrice(quote.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Est. Taxes & Fees</span>
                    <span className="font-medium">{formatPrice(quote.taxes_estimate)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Drive-Away</span>
                      <span className="text-3xl font-bold text-emerald-600">{formatPrice(quote.total_drive_away)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-amber-800 font-medium">🎉 No Haggle Guarantee</p>
                  <p className="text-amber-600 text-sm mt-1">This is your final out-the-door price. No surprises!</p>
                </div>

                <Button onClick={resetModal} className="w-full h-12 bg-gray-900 hover:bg-gray-800">
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}