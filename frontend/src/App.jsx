import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/home.jsx'));
const VehiclesPage = lazy(() => import('@/pages/Vehicles.jsx'));
const VehicleDetailsPage = lazy(() => import('@/pages/VehicleDetails.jsx'));
const LoginPage = lazy(() => import('@/pages/Login.jsx'));
const RegisterPage = lazy(() => import('@/pages/Register.jsx'));
const FavoritesPage = lazy(() => import('@/pages/favourites.jsx'));
const MyQuotesPage = lazy(() => import('@/pages/myQuotes.jsx'));
const DealerDashboardPage = lazy(() => import('@/pages/dealerDashboard.jsx'));
const AdminDashboardPage = lazy(() => import('@/pages/adminDashboard.jsx'));
const DealerSignupPage = lazy(() => import('@/pages/dealerSignup.jsx'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

// Configure React Query for real-time state sync
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes - shorter for fresher data
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: true, // CRITICAL: Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      // Global mutation error handler
      onError: (error) => {
        console.error('[Mutation Error]', error);
      },
    },
  },
});

function LayoutWrapper({ children, pageName }) {
  return <Layout currentPageName={pageName}>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <LayoutWrapper pageName="Home">
            <HomePage />
          </LayoutWrapper>
        } />

        <Route path="/vehicles" element={
          <LayoutWrapper pageName="Vehicles">
            <VehiclesPage />
          </LayoutWrapper>
        } />

        <Route path="/vehicles/:id" element={
          <LayoutWrapper pageName="VehicleDetails">
            <VehicleDetailsPage />
          </LayoutWrapper>
        } />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dealer-signup" element={
          <LayoutWrapper pageName="DealerSignup">
            <DealerSignupPage />
          </LayoutWrapper>
        } />

        {/* Protected Routes */}
        <Route path="/favorites" element={
          <ProtectedRoute>
            <LayoutWrapper pageName="Favorites">
              <FavoritesPage />
            </LayoutWrapper>
          </ProtectedRoute>
        } />

        <Route path="/my-quotes" element={
          <ProtectedRoute>
            <LayoutWrapper pageName="MyQuotes">
              <MyQuotesPage />
            </LayoutWrapper>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <LayoutWrapper pageName="Dashboard">
              <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome to your dashboard</p>
              </div>
            </LayoutWrapper>
          </ProtectedRoute>
        } />

        {/* Dealer Routes */}
        <Route path="/dealer/dashboard" element={
          <ProtectedRoute requiredRole="dealer">
            <LayoutWrapper pageName="DealerDashboard">
              <DealerDashboardPage />
            </LayoutWrapper>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <LayoutWrapper pageName="AdminDashboard">
              <AdminDashboardPage />
            </LayoutWrapper>
          </ProtectedRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={
          <LayoutWrapper pageName="NotFound">
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300">404</h1>
                <p className="text-xl text-gray-600 mt-4">Page not found</p>
                <a href="/" className="text-amber-600 hover:text-amber-700 mt-4 inline-block">
                  Go back home
                </a>
              </div>
            </div>
          </LayoutWrapper>
        } />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <AuthProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AuthProvider>
        </ThemeProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
