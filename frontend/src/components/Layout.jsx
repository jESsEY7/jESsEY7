import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Button } from "@/components/ui/button";
import {
  Car,
} from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import FloatingNav from './layout/FloatingNav';
import Sidebar from './layout/Sidebar';
import CompareBar from './marketplace/CompareBar';

export default function Layout({ children, currentPageName }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pages that don't need the standard layout
  const fullWidthPages = ['Home', 'DealerDashboard', 'AdminDashboard', 'DealerSignup'];
  const isFullWidth = fullWidthPages.includes(currentPageName);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-white transition-colors duration-300">

      {/* New Navigation System */}
      <FloatingNav toggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className={`flex-1 ${(currentPageName === 'Home' || currentPageName === 'Vehicles' || currentPageName === 'DealerSignup') ? 'pt-0' : 'pt-24'}`}>
        {children}
      </main>


      {/* Footer */}
      {!['DealerDashboard', 'AdminDashboard'].includes(currentPageName) && (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {/* Minimal Logo */}
                  <div className="w-24 h-10 relative flex items-center justify-center mb-2">
                    <img
                      src="/Motoris logo.PNG"
                      alt="Motoris"
                      className="w-full h-full object-contain mix-blend-multiply dark:brightness-200 transition-all duration-300"
                      onError={(e) => {
                        if (e.target) {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }
                      }}
                    />
                    <div className="hidden bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg items-center justify-center w-8 h-8">
                      <span className="font-bold text-white text-xl">Motoris</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-light leading-relaxed mb-6 text-gray-600 dark:text-gray-400">
                  Redefining the automotive acquisition experience.
                  Premium inventory, transparent pricing, and instant gratification.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-6 uppercase tracking-wider text-xs">Inventory</h4>
                <ul className="space-y-3 font-light text-sm">
                  <li><Link to={createPageUrl('Vehicles')} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">All Vehicles</Link></li>
                  <li><Link to={createPageUrl('Vehicles?condition=new')} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">New Arrivals</Link></li>
                  <li><Link to={createPageUrl('Vehicles?condition=certified_preowned')} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">Certified Pre-Owned</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-6 uppercase tracking-wider text-xs">Partners</h4>
                <ul className="space-y-3 font-light text-sm">
                  <li><Link to={createPageUrl('DealerSignup')} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">Partner with Motoris</Link></li>
                  <li><Link to={createPageUrl('DealerDashboard')} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">Dealer Portal</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-6 uppercase tracking-wider text-xs">Legal</h4>
                <ul className="space-y-3 font-light text-sm">
                  <li><a href="#" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">Cookie Settings</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 mt-16 pt-8 text-center text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-600">
              <p>© {new Date().getFullYear()} Motoris. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
      <WhatsAppButton />
      <CompareBar />
    </div>
  );
}