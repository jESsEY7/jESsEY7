import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Car, AlertCircle, Loader2, WifiOff, Shield, Zap, Heart, TrendingUp, Users, Award } from 'lucide-react';

// Feature showcase data
const features = [
    {
        icon: Shield,
        title: "Verified Dealers",
        description: "Every dealer is thoroughly vetted for your safety and peace of mind",
        color: "from-blue-500 to-blue-600",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop"
    },
    {
        icon: Zap,
        title: "Instant Quotes",
        description: "Get competitive quotes from multiple dealers in minutes",
        color: "from-amber-500 to-orange-600",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop"
    },
    {
        icon: Heart,
        title: "Save Favorites",
        description: "Create wishlists and track vehicles you love",
        color: "from-pink-500 to-rose-600",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop"
    },
    {
        icon: TrendingUp,
        title: "Market Insights",
        description: "Access real-time pricing trends and market data",
        color: "from-green-500 to-emerald-600",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop"
    },
    {
        icon: Users,
        title: "Trusted Community",
        description: "Join thousands of satisfied buyers and sellers",
        color: "from-purple-500 to-violet-600",
        image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format&fit=crop"
    },
    {
        icon: Award,
        title: "Premium Support",
        description: "Expert assistance throughout your vehicle journey",
        color: "from-indigo-500 to-blue-600",
        image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop"
    }
];

export default function RegisterPage() {
    const { register, login, apiHealthy, error: authError, clearError } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentFeature((prev) => (prev + 1) % features.length);
                setIsTransitioning(false);
            }, 300);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Clear errors on mount
    useEffect(() => {
        clearError?.();
    }, []);

    // Update local error from auth context
    useEffect(() => {
        if (authError) {
            setError(authError);
        }
    }, [authError]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('Username is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.phone.trim()) {
            setError('Phone number is required');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setError('');
        setLoading(true);

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                full_name: formData.full_name
            });

            await login(formData.username, formData.password);
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const feature = features[currentFeature];
    const FeatureIcon = feature.icon;

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Enhanced Branding with Interactive Features */}
            <div className="hidden lg:flex flex-col bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 text-gray-900 relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-900 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-12 justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="relative overflow-hidden w-28 h-10 flex items-center justify-center">
                            <img
                                src="/Motoris logo.PNG"
                                alt="Motoris"
                                className="w-full h-full object-contain mix-blend-multiply"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="hidden bg-gradient-to-br from-gray-900 to-gray-700 text-white w-8 h-8 rounded-lg items-center justify-center font-bold">Motoris</div>
                        </div>
                    </Link>

                    {/* Main Feature Showcase */}
                    <div className="flex-1 flex flex-col justify-center space-y-8 max-w-xl">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold leading-tight">
                                Join the premier automotive marketplace.
                            </h1>
                            <p className="text-gray-800 text-lg leading-relaxed">
                                Create an account to unlock exclusive features and streamline your vehicle journey.
                            </p>
                        </div>

                        {/* Rotating Feature Card */}
                        <div
                            className={`transition-all duration-300 transform ${isTransitioning ? 'opacity-50 translate-y-4' : 'opacity-100 translate-y-0'
                                }`}
                        >
                            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
                                {/* Feature Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-60`}></div>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                                        <FeatureIcon className="w-6 h-6 text-gray-900" />
                                    </div>
                                </div>

                                {/* Feature Content */}
                                <div className="p-6 space-y-3">
                                    <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Indicators */}
                        <div className="flex gap-2 justify-center">
                            {features.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                            setCurrentFeature(index);
                                            setIsTransitioning(false);
                                        }, 300);
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentFeature
                                        ? 'w-8 bg-gray-900'
                                        : 'w-1.5 bg-gray-900/30 hover:bg-gray-900/50'
                                        }`}
                                    aria-label={`Go to feature ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Stats Row */}
                        {/* <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-900/20">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">5K+</div>
                                <div className="text-sm text-gray-800">Vehicles</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">500+</div>
                                <div className="text-sm text-gray-800">Dealers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">10K+</div>
                                <div className="text-sm text-gray-800">Happy Customers</div>
                            </div>
                        </div> */}
                    </div>

                    {/* Footer */}
                    <div className="text-sm text-gray-800">
                        © {new Date().getFullYear()} Jesweet Inc. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex items-center justify-center p-6 bg-gray-50">
                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Motoris</span>
                </div>

                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">Create an account</CardTitle>
                        <CardDescription>
                            Enter your details to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* API Connection Warning */}
                        {!apiHealthy && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700">
                                <WifiOff className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">Unable to connect to server. Please ensure the backend is running.</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username *</Label>
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="johndoe"
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input
                                        id="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email Address"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="h-11"
                                />
                                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
                                disabled={loading || !apiHealthy}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t pt-6">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-gray-900 hover:underline font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}