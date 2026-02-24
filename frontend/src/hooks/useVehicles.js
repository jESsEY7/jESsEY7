import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client, { getErrorMessage } from '@/api/client';

// Query key factories for consistent cache management
export const vehicleKeys = {
    all: ['vehicles'],
    lists: () => [...vehicleKeys.all, 'list'],
    list: (params) => [...vehicleKeys.lists(), params],
    details: () => [...vehicleKeys.all, 'detail'],
    detail: (id) => [...vehicleKeys.details(), id],
    featured: () => [...vehicleKeys.all, 'featured'],
    facets: (params) => [...vehicleKeys.all, 'facets', params],
    recommendations: (userId) => [...vehicleKeys.all, 'recommendations', userId],
};

/**
 * Fetch paginated vehicle list with filters
 */
export const useVehicles = (params = {}) => {
    return useQuery({
        queryKey: vehicleKeys.list(params),
        queryFn: async () => {
            const response = await client.get('/vehicles/vehicles/', { params });
            // API returns { count, next, previous, results } for paginated responses
            return response.data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: true,
        keepPreviousData: true, // Keep data while fetching new page
    });
};

/**
 * Fetch vehicle facets for filtering
 */
export const useFacets = (params = {}) => {
    return useQuery({
        queryKey: vehicleKeys.facets(params),
        queryFn: async () => {
            const response = await client.get('/vehicles/vehicles/facets/', { params });
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Fetch single vehicle by ID
 */
export const useVehicle = (id) => {
    return useQuery({
        queryKey: vehicleKeys.detail(id),
        queryFn: async () => {
            const response = await client.get(`/vehicles/vehicles/${id}/`);
            return response.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Fetch featured vehicles
 */
export const useFeaturedVehicles = (limit = 6) => {
    return useQuery({
        queryKey: vehicleKeys.featured(),
        queryFn: async () => {
            const response = await client.get('/vehicles/vehicles/', {
                params: { is_featured: true, status: 'active', limit }
            });
            return response.data.results || response.data || [];
        },
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Create a new vehicle
 */
export const useCreateVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newVehicle) => {
            const response = await client.post('/vehicles/vehicles/', newVehicle);
            return response.data; // Return created vehicle
        },
        onSuccess: (data) => {
            // Invalidate all vehicle lists to refresh
            queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
            // Optionally add the new vehicle to cache directly
            queryClient.setQueryData(vehicleKeys.detail(data.id), data);
        },
        onError: (error) => {
            console.error('Create vehicle failed:', getErrorMessage(error));
        }
    });
};

/**
 * Update an existing vehicle
 */
export const useUpdateVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await client.patch(`/vehicles/vehicles/${id}/`, data);
            return response.data; // Return updated vehicle
        },
        onSuccess: (data, { id }) => {
            // Update the specific vehicle in cache with server response
            queryClient.setQueryData(vehicleKeys.detail(id), data);
            // Invalidate lists to ensure consistency
            queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
        },
        onError: (error) => {
            console.error('Update vehicle failed:', getErrorMessage(error));
        }
    });
};

/**
 * Delete a vehicle
 */
export const useDeleteVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            await client.delete(`/vehicles/vehicles/${id}/`);
            return id;
        },
        onSuccess: (id) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: vehicleKeys.detail(id) });
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
        },
        onError: (error) => {
            console.error('Delete vehicle failed:', getErrorMessage(error));
        }
    });
};

// ============= INQUIRIES =============

export const inquiryKeys = {
    all: ['inquiries'],
    lists: () => [...inquiryKeys.all, 'list'],
    list: (params) => [...inquiryKeys.lists(), params],
    detail: (id) => [...inquiryKeys.all, 'detail', id],
};

/**
 * Fetch user's inquiries
 */
export const useInquiries = (params = {}) => {
    return useQuery({
        queryKey: inquiryKeys.list(params),
        queryFn: async () => {
            const response = await client.get('/vehicles/inquiries/', { params });
            return response.data;
        },
        staleTime: 1000 * 60 * 2,
    });
};

/**
 * Create a new inquiry (quote request)
 */
export const useCreateInquiry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newInquiry) => {
            const response = await client.post('/vehicles/inquiries/', newInquiry);
            return response.data;
        },
        onSuccess: (data) => {
            // Invalidate inquiries list
            queryClient.invalidateQueries({ queryKey: inquiryKeys.lists() });
            // Invalidate vehicle quotes count
            if (data.car) {
                queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.car) });
            }
        },
        onError: (error) => {
            console.error('Create inquiry failed:', getErrorMessage(error));
        }
    });
};

/**
 * Update inquiry status
 */
export const useUpdateInquiry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await client.patch(`/vehicles/inquiries/${id}/`, data);
            return response.data;
        },
        onSuccess: (data, { id }) => {
            queryClient.setQueryData(inquiryKeys.detail(id), data);
            queryClient.invalidateQueries({ queryKey: inquiryKeys.lists() });
        },
    });
};

// ============= OFFERS =============

export const offerKeys = {
    all: ['offers'],
    lists: () => [...offerKeys.all, 'list'],
    list: (params) => [...offerKeys.lists(), params],
    detail: (id) => [...offerKeys.all, 'detail', id],
};

/**
 * Fetch offers
 */
export const useOffers = (params = {}) => {
    return useQuery({
        queryKey: offerKeys.list(params),
        queryFn: async () => {
            const response = await client.get('/vehicles/offers/', { params });
            return response.data;
        },
    });
};

/**
 * Create an offer
 */
export const useCreateOffer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (offerData) => {
            const response = await client.post('/vehicles/offers/', offerData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
        },
    });
};

/**
 * Update offer (accept/reject)
 */
export const useUpdateOffer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await client.patch(`/vehicles/offers/${id}/`, data);
            return response.data;
        },
        onSuccess: (data, { id }) => {
            queryClient.setQueryData(offerKeys.detail(id), data);
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
        },
    });
};

// ============= TEST DRIVES =============

export const testDriveKeys = {
    all: ['test-drives'],
    lists: () => [...testDriveKeys.all, 'list'],
    list: (params) => [...testDriveKeys.lists(), params],
};

/**
 * Fetch test drives
 */
export const useTestDrives = (params = {}) => {
    return useQuery({
        queryKey: testDriveKeys.list(params),
        queryFn: async () => {
            const response = await client.get('/vehicles/test-drives/', { params });
            return response.data;
        },
    });
};

/**
 * Schedule a test drive
 */
export const useScheduleTestDrive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (testDriveData) => {
            const response = await client.post('/vehicles/test-drives/', testDriveData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testDriveKeys.lists() });
        },
    });
};
