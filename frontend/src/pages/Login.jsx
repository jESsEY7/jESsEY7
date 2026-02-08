import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Car, Eye, EyeOff, Sparkles, TrendingUp, Shield, Zap, Star, Quote } from 'lucide-react';

// Customer testimonials with real stories
const testimonials = [
    {
        name: "James Kimani",
        role: "First-time Buyer",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
        quote: "Found my dream car in just 2 days! The process was smooth, transparent, and the dealer support was exceptional.",
        rating: 5,
        vehicle: "Toyota Prado 2020"
    },
    {
        name: "Sarah Wanjiku",
        role: "Professional Dealer",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop",
        quote: "Motoris transformed my dealership. I now reach serious buyers faster and close deals 3x quicker than before.",
        rating: 5,
        vehicle: "Sold 47 vehicles"
    },
    {
        name: "David Ochieng",
        role: "Car Enthusiast",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop",
        quote: "The market insights helped me negotiate the best price. Saved over KSh 200,000 on my purchase!",
        rating: 5,
        vehicle: "Mercedes-Benz C-Class"
    },
    {
        name: "Grace Akinyi",
        role: "Family Buyer",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop",
        quote: "Safety was my priority. Every dealer was verified, and I felt confident throughout the entire journey.",
        rating: 5,
        vehicle: "Honda CR-V 2021"
    }
];

// Dynamic welcome messages based on time
const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: "Good Morning", emoji: "🌅", message: "Ready to start your day with the perfect ride?" };
    if (hour < 17) return { greeting: "Good Afternoon", emoji: "☀️", message: "Your dream car is waiting for you!" };
    return { greeting: "Good Evening", emoji: "🌙", message: "Let's find your perfect vehicle tonight!" };
};

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const welcomeMsg = getWelcomeMessage();

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
                setIsTransitioning(false);
            }, 400);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.username, formData.password);
            let targetPath = '/dashboard';
            if (redirectUrl) {
                try {
                    const url = new URL(redirectUrl);
                    if (url.origin === window.location.origin) {
                        targetPath = url.pathname + url.search;
                    }
                } catch (e) {
                    targetPath = redirectUrl;
                }
            }
            navigate(targetPath);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const testimonial = testimonials[currentTestimonial];

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Enhanced Branding with Testimonials */}
            <div className="hidden lg:flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-12 justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="relative overflow-hidden w-28 h-10 flex items-center justify-center">
                            <img
                                src="/Motoris logo.PNG"
                                alt="Motoris"
                                className="w-full h-full object-contain brightness-200"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="hidden bg-gradient-to-br from-amber-500 to-amber-700 text-blue w-8 h-8 rounded-lg items-center justify-center font-bold">Motoris</div>
                        </div>
                    </Link>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col justify-center space-y-10 max-w-xl">
                        {/* Welcome Message */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">Always Good to see you Back</span>
                            </div>

                            <h1 className="text-5xl font-bold leading-tight">
                                {welcomeMsg.greeting} {welcomeMsg.emoji}
                                <br />
                                <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                                    Drive Your Dreams
                                </span>
                            </h1>

                            <p className="text-gray-300 text-lg leading-relaxed">
                                {welcomeMsg.message} Connect with trusted dealers, and make informed decisions with real-time insights.
                            </p>
                        </div>

                        {/* Rotating Testimonial Card */}
                        <div
                            className={`transition-all duration-400 transform ${isTransitioning ? 'opacity-7 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
                                }`}
                        >
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                                <Quote className="w-8 h-8 text-amber-500 mb-4" />

                                <p className="text-white text-lg leading-relaxed mb-6 italic">
                                    "{testimonial.quote}"
                                </p>

                                <div className="flex items-center gap-4">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/50"
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-white">{testimonial.name}</div>
                                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                                        <div className="text-xs text-amber-400 mt-1">{testimonial.vehicle}</div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Indicators */}
                        <div className="flex gap-2 justify-center">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                            setCurrentTestimonial(index);
                                            setIsTransitioning(false);
                                        }, 400);
                                    }}
                                    className={`h-1 rounded-full transition-all duration-300 ${index === currentTestimonial
                                        ? 'w-8 bg-amber-500'
                                        : 'w-1 bg-white/30 hover:bg-white/50'
                                        }`}
                                    aria-label={`View testimonial ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Trust Indicators */}
                        {/* <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <TrendingUp className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="text-2xl font-bold text-white">5,000+</div>
                                <div className="text-xs text-gray-400">Vehicles Listed</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Shield className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="text-2xl font-bold text-white">500+</div>
                                <div className="text-xs text-gray-400">Verified Dealers</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="text-2xl font-bold text-white">15K+</div>
                                <div className="text-xs text-gray-400">Happy Customers</div>
                            </div>
                        </div> */}
                    </div>

                    {/* Footer */}
                    <div className="text-sm text-gray-500 flex items-center justify-between">
                        <span>© {new Date().getFullYear()} Jesweet Inc. All rights reserved.</span>
                        <div className="flex items-center gap-1 text-amber-500">
                            <Shield className="w-4 h-4" />
                            <span className="text-xs">Secure & Trusted</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Enhanced Login Form */}
            <div className="flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                {/* Mobile Logo */}
                <Link to="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
                    <div className="w-24 h-10 flex items-center justify-center">
                        <img
                            src="/Motoris logo.PNG"
                            alt="Motoris"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="hidden bg-gradient-to-br from-amber-500 to-amber-700 text-white px-3 py-1.5 rounded-lg items-center justify-center font-bold">
                            Motoris
                        </div>
                    </div>
                </Link>

                <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-2 pb-6">
                        {/* <div className="flex justify-center mb-2">
                            <div className="w-24 h-10 flex items-center justify-center">
                                <img
                                    src="/Motoris logo.PNG"
                                    alt="Motoris"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div className="hidden bg-gradient-to-br from-amber-500 to-amber-700 text-white px-3 py-1.5 rounded-lg items-center justify-center font-bold">
                                    Motoris
                                </div>
                            </div>
                        </div> */}
                        <CardTitle className="text-3xl font-bold">Login</CardTitle>
                        <CardDescription className="text-base text-gray-600">
                            Sign in to access your personalized dashboard and continue your automotive journey.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2 animate-shake">
                                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs">!</span>
                                    </div>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    placeholder="Enter your username"
                                    className="h-12 text-base border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                        Password
                                    </Label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-amber-600 hover:text-amber-700 font-medium hover:underline transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        placeholder="Enter your password"
                                        className="h-12 text-base pr-12 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Signing you in...
                                    </div>
                                ) : (
                                    <>
                                        Sign In
                                        <span className="ml-2">→</span>
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Quick Stats */}
                        {/* <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center mb-3">Join thousands of satisfied users</p>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-lg font-bold text-gray-900">5K+</div>
                                    <div className="text-xs text-gray-600">Vehicles</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-lg font-bold text-gray-900">500+</div>
                                    <div className="text-xs text-gray-600">Dealers</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-lg font-bold text-gray-900">15K+</div>
                                    <div className="text-xs text-gray-600">Users</div>
                                </div>
                            </div>
                        </div> */}
                    </CardContent>

                    <CardFooter className="flex-col space-y-4 border-t pt-6">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-colors">
                                Create one now
                            </Link>
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}