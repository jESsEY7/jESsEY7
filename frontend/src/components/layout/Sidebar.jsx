import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Home, Car, Settings, HelpCircle, LogOut,
    Sparkles, LayoutDashboard, Heart, FileText, Users
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { cn } from "@/lib/utils";

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const links = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Inventory', icon: Car, path: '/vehicles' },
    ];

    const userLinks = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Favorites', icon: Heart, path: '/favorites' },
        { name: 'My Quotes', icon: FileText, path: '/my-quotes' },
    ];

    const adminLinks = [
        { name: 'Admin Panel', icon: Users, path: '/admin/dashboard' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] lg:hidden"
                    />

                    {/* Sidebar Panel */}
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-gray-200 z-[150] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Link to="/" className="flex items-center gap-2 group">
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
                                        <div className="hidden bg-gradient-to-br from-amber-500 to-amber-700 text-white w-8 h-8 rounded-lg items-center justify-center font-bold">M</div>
                                    </div>
                                </Link>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-gray-500">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">

                            {/* Main Navigation */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Menu</p>
                                {links.map((link) => (
                                    <Link key={link.path} to={link.path} onClick={onClose}>
                                        <div className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                            isActive(link.path)
                                                ? "bg-amber-50 text-amber-600"
                                                : "text-gray-600 hover:text-black hover:bg-gray-50"
                                        )}>
                                            <link.icon className="w-5 h-5" />
                                            <span className="font-medium">{link.name}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* AI Suggestions (Mock) */}
                            <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 border border-gray-200 relative overflow-hidden group shadow-sm">
                                <div className="absolute top-0 right-0 p-2 opacity-50">
                                    <Sparkles className="w-12 h-12 text-amber-500/20" />
                                </div>
                                <h4 className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    AI Insights
                                </h4>
                                <p className="text-xs text-gray-500 mb-3">
                                    Based on your browsing, we found 3 cars you might like.
                                </p>
                                <Button size="sm" variant="outline" className="w-full border-amber-500/30 text-amber-700 hover:bg-amber-50 hover:text-amber-800 text-xs">
                                    View Suggestions
                                </Button>
                            </div>

                            {/* User Links */}
                            {user && (
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Account</p>
                                    {userLinks.map((link) => (
                                        <Link key={link.path} to={link.path} onClick={onClose}>
                                            <div className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                                isActive(link.path)
                                                    ? "bg-amber-50 text-amber-600"
                                                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                                            )}>
                                                <link.icon className="w-5 h-5" />
                                                <span className="font-medium">{link.name}</span>
                                            </div>
                                        </Link>
                                    ))}

                                    {/* Admin Links */}
                                    {(user.role === 'admin' || user.user_type === 'admin') && (
                                        <>
                                            {adminLinks.map((link) => (
                                                <Link key={link.path} to={link.path} onClick={onClose}>
                                                    <div className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                                        isActive(link.path)
                                                            ? "bg-amber-50 text-amber-600"
                                                            : "text-gray-600 hover:text-black hover:bg-gray-50"
                                                    )}>
                                                        <link.icon className="w-5 h-5" />
                                                        <span className="font-medium">{link.name}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100">
                            {user ? (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                    onClick={() => {
                                        logout();
                                        onClose();
                                    }}
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    Log Out
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <Link to="/login" onClick={onClose}>
                                        <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50">
                                            Log In
                                        </Button>
                                    </Link>
                                    <Link to="/register" onClick={onClose}>
                                        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
