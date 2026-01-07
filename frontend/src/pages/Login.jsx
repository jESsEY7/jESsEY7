import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Car } from 'lucide-react';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.username, formData.password);
            // Determine restart location, default to dashboard or home
            // Since redirectUrl might be full URL, we need to handle it.
            // For internal routing, usually we just want the path.
            let targetPath = '/dashboard';
            if (redirectUrl) {
                try {
                    const url = new URL(redirectUrl);
                    // Only redirect if it's the same origin
                    if (url.origin === window.location.origin) {
                        targetPath = url.pathname + url.search;
                    }
                } catch (e) {
                    // relative path
                    targetPath = redirectUrl;
                }
            }
            navigate(targetPath);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Branding */}
            <div className="hidden lg:flex flex-col bg-gray-900 text-white p-12 justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Car className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl">AutoElite</span>
                </div>

                <div className="space-y-6 max-w-lg">
                    <h1 className="text-4xl font-bold leading-tight">
                        Drive your dreams with confidence.
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Access thousands of verified vehicles, exclusive dealer tools, and real-time market insights.
                    </p>
                </div>

                <div className="text-sm text-gray-500">
                    © {new Date().getFullYear()} AutoElite Inc.
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex items-center justify-center p-6 bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Welcome back</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    placeholder="Enter your username"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
