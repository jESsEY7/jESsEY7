import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2, ArrowLeft, ArrowRight, CheckCircle2,
  Upload, Loader2, Shield, DollarSign, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DealerSignupPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    owner_email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    license_number: '',
    tax_id: '',
    description: '',
    logo_url: ''
  });

  useEffect(() => {
    const init = async () => {
      try {
        if (user) {
          setFormData(prev => ({ ...prev, owner_email: user.email }));

          // Check if already a dealer - Mock check
          // const dealers = await base44.entities.Dealer.filter({ owner_email: u.email });
          // Mock logic: assume not a dealer for now unless user.is_dealer is true (which we might mock later)
          if (user.dealer_id) {
            window.location.href = createPageUrl('DealerDashboard');
          }
        }
      } catch (e) {
        // Not logged in - will show signup prompt
      }
      setLoading(false);
    };
    init();
  }, [user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Mock upload
    // const { file_url } = await base44.integrations.Core.UploadFile({ file });
    // Mock URL
    const file_url = URL.createObjectURL(file);
    handleChange('logo_url', file_url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate(createPageUrl('Login'));
      return;
    }

    setSubmitting(true);

    // Mock dealer creation
    // const dealer = await base44.entities.Dealer.create({ ...formData, verification_status: 'pending' });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    // Mock user update
    // await base44.auth.updateMe({ user_type: 'dealer', dealer_id: dealer.id });

    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
              <p className="text-gray-500 mb-6">
                We'll review your application and get back to you within 1-2 business days.
                You'll receive an email once your account is verified.
              </p>
              <Link to={createPageUrl('Home')}>
                <Button className="w-full">Return to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to homepage
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Grow Your Business with Our
                <span className="text-amber-400"> Premium Marketplace</span>
              </h1>
              <p className="mt-6 text-lg text-gray-400 leading-relaxed">
                Join our network of verified dealers and reach thousands of qualified buyers
                looking for premium vehicles. No haggling, no hassle—just sales.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-6">
                <div>
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="font-semibold">Boost Sales</h3>
                  <p className="text-sm text-gray-500 mt-1">Reach qualified buyers</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-3">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="font-semibold">Fixed Pricing</h3>
                  <p className="text-sm text-gray-500 mt-1">No haggle model</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-3">
                    <Shield className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="font-semibold">Verified Badge</h3>
                  <p className="text-sm text-gray-500 mt-1">Build trust instantly</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600"
                alt="Dealership"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Signup Form */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        {!user ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Continue</h2>
              <p className="text-gray-500 mb-6">
                Please sign in or create an account to register as a dealer.
              </p>
              <Button
                onClick={() => navigate(createPageUrl('Login'))}
                className="bg-amber-500 hover:bg-amber-600 text-gray-900"
              >
                Sign In / Sign Up
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Dealer Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Logo Upload */}
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      {formData.logo_url ? (
                        <img
                          src={formData.logo_url}
                          alt="Logo"
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Dealership Logo</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Business Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        value={formData.business_name}
                        onChange={(e) => handleChange('business_name', e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://"
                      className="mt-1.5"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip_code">ZIP Code *</Label>
                      <Input
                        id="zip_code"
                        value={formData.zip_code}
                        onChange={(e) => handleChange('zip_code', e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  {/* License Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="license_number">Dealer License Number *</Label>
                      <Input
                        id="license_number"
                        value={formData.license_number}
                        onChange={(e) => handleChange('license_number', e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax_id">Tax ID / EIN</Label>
                      <Input
                        id="tax_id"
                        value={formData.tax_id}
                        onChange={(e) => handleChange('tax_id', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">About Your Dealership</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Tell us about your business, specializations, and what makes you unique..."
                      className="mt-1.5 min-h-[100px]"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                    <p className="font-medium text-gray-900 mb-2">What happens next?</p>
                    <ul className="space-y-1">
                      <li>• We'll review your application within 1-2 business days</li>
                      <li>• You'll receive an email once approved</li>
                      <li>• Start listing vehicles and reaching buyers immediately</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-gray-900"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}