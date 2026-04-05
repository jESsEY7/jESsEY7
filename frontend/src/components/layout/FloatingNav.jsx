import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { User, Menu, Bell, Sun, Moon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';

export default function FloatingNav({ toggleSidebar }) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const location = useLocation();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        const controlNavbar = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY === 0) {
                setIsVisible(true);
                setIsScrolled(false);
            } else {
                setIsScrolled(true);
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    // Scrolling down
                    setIsVisible(false);
                } else {
                    // Scrolling up
                    setIsVisible(true);
                }
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    // Restored Navigation Links
    const navLinks = [
        { name: 'Browse', path: '/vehicles' },
        // { name: 'How It Works', path: '/#how-it-works' },
        { name: 'Sell Your Car', path: '/dealer-signup' },
    ];

    return (
        <AnimatePresence mode="wait">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{
                    y: isVisible ? 0 : -100,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={cn(
                    "fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl rounded-full transition-all duration-300 border border-black/5 backdrop-blur-md shadow-lg bg-white/10 py-3"
                )}
            >
                <div className="px-6 flex items-center justify-between">
                    {/* Left: Logo & Sidebar Toggle */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-800 hover:text-amber-500 hover:bg-black/5 rounded-full md:hidden"
                            onClick={toggleSidebar}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        <Link to="/" className="flex items-center gap-2 group">
                            {/* Logo Image */}
                            <div className="relative overflow-hidden w-28 h-10 flex items-center justify-center">
                                <img
                                    src="/Motoris logo.PNG"
                                    alt="Motoris"
                                    className="w-full h-full object-contain mix-blend-multiply"
                                    onError={(e) => {
                                        // Fallback if image fails
                                        if (e.target) {
                                            e.target.style.display = 'none';
                                            if (e.target.nextSibling) {
                                                e.target.nextSibling.style.display = 'flex';
                                            }
                                        }
                                    }}
                                />
                                {/* Fallback Logo */}
                                {/* <div className="hidden bg-gradient-to-br from-amber-500 to-amber-700 text-white w-8 h-8 rounded-lg items-center justify-center font-bold tracking-tighter">
                                    M
                                </div> */}
                            </div>
                        </Link>
                    </div>

                    {/* Center: Links (Desktop) */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a key={link.path} href={link.path}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "text-sm font-medium rounded-full px-4 hover:bg-black/5 hover:text-black transition-colors",
                                        location.pathname === link.path ? "text-amber-600 bg-amber-50" : "text-gray-600"
                                    )}
                                >
                                    {link.name}
                                </Button>
                            </a>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="text-gray-600 hover:text-black hover:bg-black/5 rounded-full"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>

                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link to="/favorites">
                                    <Button variant="ghost" size="icon" className="text-gray-600 hover:text-amber-500 hover:bg-black/5 rounded-full relative">
                                        <Bell className="w-5 h-5" />
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-white" />
                                    </Button>
                                </Link>
                                <Link to="/dashboard">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-black/10 flex items-center justify-center hover:border-amber-500 transition-colors">
                                        <span className="text-xs font-bold text-gray-800">{user.username?.[0]?.toUpperCase()}</span>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <Link to="/register">
                                <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6 shadow-lg shadow-amber-500/20">
                                    Join
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </motion.nav>
        </AnimatePresence>
    );
}
