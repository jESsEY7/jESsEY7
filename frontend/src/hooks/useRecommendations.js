import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to get personalized vehicle recommendations
 * Based on user's favorites, searches, and browsing history
 */
export const useRecommendations = (options = {}) => {
    const { user } = useAuth();
    const { limit = 6, enabled = true } = options;

    return useQuery({
        queryKey: ['recommendations', user?.id, limit],
        queryFn: async () => {
            // If user is logged in, get personalized recommendations
            if (user?.id) {
                try {
                    const response = await client.get('/vehicles/recommendations/', {
                        params: { limit }
                    });
                    return response.data;
                } catch (error) {
                    // Fall back to featured vehicles if recommendations fail
                    console.warn('Recommendations API failed, using featured vehicles', error);
                }
            }

            // Fall back to featured/popular vehicles for anonymous users
            const response = await client.get('/vehicles/', {
                params: {
                    limit,
                    ordering: '-views_count',
                    is_featured: true,
                    status: 'active'
                }
            });

            // Format response to match recommendations format
            const vehicles = response.data.results || response.data || [];
            return vehicles.map(v => ({ vehicle: v, score: 0, match_details: [] }));
        },
        enabled: enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 15, // 15 minutes
    });
};

/**
 * Hook to find matching vehicles based on preferences
 */
export const useVehicleMatching = (preferences, options = {}) => {
    const { enabled = true, limit = 10 } = options;

    return useQuery({
        queryKey: ['vehicle-matching', preferences, limit],
        queryFn: async () => {
            const response = await client.post('/vehicles/match/', {
                ...preferences,
                limit
            });
            return response.data;
        },
        enabled: enabled && Object.keys(preferences || {}).length > 0,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

/**
 * Hook to calculate financing options
 */
export const useFinancingCalculator = (vehiclePrice, options = {}) => {
    const {
        downPayment = 0,
        termMonths = 60,
        creditTier = 'default',
        enabled = true
    } = options;

    return useQuery({
        queryKey: ['financing', vehiclePrice, downPayment, termMonths, creditTier],
        queryFn: async () => {
            const response = await client.post('/sales/calculate-financing/', {
                vehicle_price: vehiclePrice,
                down_payment: downPayment,
                term_months: termMonths,
                credit_tier: creditTier
            });
            return response.data;
        },
        enabled: enabled && vehiclePrice > 0,
        staleTime: Infinity, // Calculations don't change
    });
};

/**
 * Hook to check affordability
 */
export const useAffordabilityCheck = (vehiclePrice, income, options = {}) => {
    const { monthlyExpenses = 0, enabled = true } = options;

    return useQuery({
        queryKey: ['affordability', vehiclePrice, income, monthlyExpenses],
        queryFn: async () => {
            const response = await client.post('/sales/check-affordability/', {
                vehicle_price: vehiclePrice,
                monthly_income: income,
                monthly_expenses: monthlyExpenses
            });
            return response.data;
        },
        enabled: enabled && vehiclePrice > 0 && income > 0,
        staleTime: Infinity,
    });
};
