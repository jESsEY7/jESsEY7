import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client, { getErrorMessage } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

// Query key factory
export const quoteKeys = {
    all: ['quotes'],
    lists: () => [...quoteKeys.all, 'list'],
    list: (params) => [...quoteKeys.lists(), params],
    detail: (id) => [...quoteKeys.all, 'detail', id],
};

/**
 * Fetch user's quotes
 */
export const useQuotes = (params = {}) => {
    const { user } = useAuth();

    return useQuery({
        queryKey: quoteKeys.list(params),
        queryFn: async () => {
            const response = await client.get('/sales/quotes/', { params });
            return response.data.results || response.data || [];
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: true,
    });
};

/**
 * Fetch single quote by ID
 */
export const useQuote = (id) => {
    return useQuery({
        queryKey: quoteKeys.detail(id),
        queryFn: async () => {
            const response = await client.get(`/sales/quotes/${id}/`);
            return response.data;
        },
        enabled: !!id,
    });
};

/**
 * Create a new quote from vehicle
 */
export const useCreateQuote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (quoteData) => {
            const response = await client.post('/sales/quotes/', quoteData);
            return response.data;
        },
        onSuccess: (data) => {
            // Add to cache
            queryClient.setQueryData(quoteKeys.detail(data.id), data);
            // Invalidate list to refresh
            queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
        },
        onError: (error) => {
            console.error('Create quote failed:', getErrorMessage(error));
        }
    });
};

/**
 * Download quote PDF
 */
export const useDownloadQuotePdf = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ quoteId, referenceNumber }) => {
            const response = await client.get(`/sales/quotes/${quoteId}/pdf/`, {
                responseType: 'blob',
            });

            // Create download link
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `quote_${referenceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return { success: true };
        },
        onSuccess: () => {
            // Refresh quotes to update viewed status
            queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
        },
        onError: (error) => {
            console.error('Download PDF failed:', getErrorMessage(error));
        }
    });
};

/**
 * Calculate financing
 */
export const useFinancingCalculation = (vehiclePrice, options = {}) => {
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
