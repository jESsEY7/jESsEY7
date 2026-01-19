import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Car,
  Heart,
  User,
  ChevronDown,
  FileText,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';

export default function Layout({ children, currentPageName }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pages that don't need the standard layout
  const fullWidthPages = ['Home', 'DealerDashboard', 'AdminDashboard', 'DealerSignup'];
  const isFullWidth = fullWidthPages.includes(currentPageName);

  const navLinks = [
    { name: 'Browse', href: createPageUrl('Vehicles') },
    { name: 'How It Works', href: createPageUrl('Home') + '#how-it-works' },
    { name: 'Sell Your Car', href: createPageUrl('DealerSignup') },
  ];

  const handleLogin = () => {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.href)}`;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center transform hover:rotate-3 transition-transform duration-300 shadow-md">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-foreground tracking-tight">Motoris</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-muted-foreground hover:text-foreground font-medium text-base transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-transform hover:rotate-12"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
                <Bell className="w-5 h-5" />
              </Button>

              {user ? (
                <>
                  <Link to={createPageUrl('Favorites')} className="hidden sm:block">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full">
                      <Heart className="w-5 h-5" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 ml-1 hover:bg-muted rounded-full border border-transparent hover:border-border/50">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center border border-border overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="hidden sm:inline font-medium text-sm">{user.full_name?.split(' ')[0] || 'User'}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-card">
                      <div className="px-3 py-2">
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="focus:bg-muted">
                        <Link to={createPageUrl('Favorites')} className="flex items-center gap-2 cursor-pointer w-full">
                          <Heart className="w-4 h-4" />
                          My Favorites
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-muted">
                        <Link to={createPageUrl('MyQuotes')} className="flex items-center gap-2 cursor-pointer w-full">
                          <FileText className="w-4 h-4" />
                          My Quotes
                        </Link>
                      </DropdownMenuItem>
                      {(user.user_type === 'dealer' || user.dealer_id) && (
                        <DropdownMenuItem asChild className="focus:bg-muted">
                          <Link to={createPageUrl('DealerDashboard')} className="flex items-center gap-2 cursor-pointer w-full">
                            <Building2 className="w-4 h-4" />
                            Dealer Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {(user.role === 'admin' || user.user_type === 'admin') && (
                        <DropdownMenuItem asChild className="focus:bg-muted">
                          <Link to={createPageUrl('AdminDashboard')} className="flex items-center gap-2 cursor-pointer w-full">
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={handleLogin} className="hidden sm:inline-flex font-medium hover:bg-muted">
                    Sign In
                  </Button>
                  <Button onClick={handleLogin} className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl ml-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-105 active:scale-95">
                    Get Started
                  </Button>
                </>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden ml-1 hover:bg-muted"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md absolute w-full left-0 glass shadow-lg animate-in slide-in-from-top-5">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {!['DealerDashboard', 'AdminDashboard'].includes(currentPageName) && (
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-xl">Motoris</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Premium car marketplace with transparent, no-haggle pricing.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Browse</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to={createPageUrl('Vehicles')} className="hover:text-white">All Vehicles</Link></li>
                  <li><Link to={createPageUrl('Vehicles?condition=new')} className="hover:text-white">New Cars</Link></li>
                  <li><Link to={createPageUrl('Vehicles?condition=certified_preowned')} className="hover:text-white">Certified Pre-Owned</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">For Dealers</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to={createPageUrl('DealerSignup')} className="hover:text-white">Become a Dealer</Link></li>
                  <li><Link to={createPageUrl('DealerDashboard')} className="hover:text-white">Dealer Dashboard</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
              <p>© {new Date().getFullYear()} Motoris. All rights reserved  by Jesweet.Inc .</p>
            </div>
          </div>
        </footer>
      )}
      <WhatsAppButton />
    </div>
  );
}