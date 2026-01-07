import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client, { getErrorMessage } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

// Query key factory
export const userKeys = {
    all: ['users'],
    profile: () => [...userKeys.all, 'profile'],
    detail: (id) => [...userKeys.all, 'detail', id],
    dashboard: (role) => [...userKeys.all, 'dashboard', role],
    stats: () => [...userKeys.all, 'stats'],
};

/**
 * Hook to fetch and update user profile
 */
export const useProfile = () => {
    const { user, checkAuth } = useAuth();
    const queryClient = useQueryClient();

    const profileQuery = useQuery({
        queryKey: userKeys.profile(),
        queryFn: async () => {
            const response = await client.get('/users/me/');
            return response.data;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    });

    const updateProfile = useMutation({
        mutationFn: async (profileData) => {
            const response = await client.patch('/users/me/', profileData);
            return response.data;
        },
        onSuccess: (data) => {
            // Update cache with server response
            queryClient.setQueryData(userKeys.profile(), data);
            // Also refresh auth context
            checkAuth?.();
        },
        onError: (error) => {
            console.error('Update profile failed:', getErrorMessage(error));
        }
    });

    return {
        profile: profileQuery.data,
        isLoading: profileQuery.isLoading,
        error: profileQuery.error,
        updateProfile: updateProfile.mutate,
        isUpdating: updateProfile.isPending,
        refetch: profileQuery.refetch,
    };
};

/**
 * Hook to fetch dealer dashboard data
 */
export const useDealerDashboard = () => {
    const { user } = useAuth();
    const isDealer = user?.role === 'dealer';

    const statsQuery = useQuery({
        queryKey: userKeys.dashboard('dealer'),
        queryFn: async () => {
            // Fetch dealer-specific stats
            const [vehiclesRes, inquiriesRes] = await Promise.all([
                client.get('/vehicles/vehicles/', { params: { dealer: user.id } }),
                client.get('/vehicles/inquiries/')
            ]);

            const vehicles = vehiclesRes.data.results || vehiclesRes.data || [];
            const inquiries = inquiriesRes.data.results || inquiriesRes.data || [];

            return {
                totalListings: vehicles.length,
                activeListings: vehicles.filter(v => v.status === 'active').length,
                totalViews: vehicles.reduce((sum, v) => sum + (v.views_count || 0), 0),
                totalInquiries: inquiries.length,
                pendingInquiries: inquiries.filter(i => i.status === 'open').length,
                vehicles,
                inquiries,
            };
        },
        enabled: isDealer,
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: true,
    });

    return {
        stats: statsQuery.data,
        isLoading: statsQuery.isLoading,
        error: statsQuery.error,
        refetch: statsQuery.refetch,
    };
};

/**
 * Hook to fetch admin dashboard data
 */
export const useAdminDashboard = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.is_staff;

    const statsQuery = useQuery({
        queryKey: userKeys.dashboard('admin'),
        queryFn: async () => {
            // Fetch admin stats
            const [vehiclesRes, usersRes, inquiriesRes] = await Promise.all([
                client.get('/vehicles/vehicles/'),
                client.get('/users/', { params: { limit: 100 } }).catch(() => ({ data: [] })),
                client.get('/vehicles/inquiries/')
            ]);

            const vehicles = vehiclesRes.data.results || vehiclesRes.data || [];
            const users = usersRes.data.results || usersRes.data || [];
            const inquiries = inquiriesRes.data.results || inquiriesRes.data || [];

            return {
                totalVehicles: vehicles.length,
                pendingVehicles: vehicles.filter(v => v.status === 'pending').length,
                activeVehicles: vehicles.filter(v => v.status === 'active').length,
                totalUsers: users.length,
                totalInquiries: inquiries.length,
                vehicles,
                users,
                inquiries,
            };
        },
        enabled: isAdmin,
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: true,
    });

    return {
        stats: statsQuery.data,
        isLoading: statsQuery.isLoading,
        error: statsQuery.error,
        refetch: statsQuery.refetch,
    };
};

/**
 * Hook for moderation actions (approve/reject vehicles)
 */
export const useModeration = () => {
    const queryClient = useQueryClient();

    const approveVehicle = useMutation({
        mutationFn: async (vehicleId) => {
            const response = await client.patch(`/vehicles/vehicles/${vehicleId}/`, {
                status: 'active'
            });
            return response.data;
        },
        onSuccess: () => {
            // Invalidate all vehicle and dashboard queries
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            queryClient.invalidateQueries({ queryKey: userKeys.dashboard('admin') });
        },
    });

    const rejectVehicle = useMutation({
        mutationFn: async (vehicleId) => {
            const response = await client.patch(`/vehicles/vehicles/${vehicleId}/`, {
                status: 'archived'
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            queryClient.invalidateQueries({ queryKey: userKeys.dashboard('admin') });
        },
    });

    return {
        approveVehicle: approveVehicle.mutate,
        rejectVehicle: rejectVehicle.mutate,
        isApproving: approveVehicle.isPending,
        isRejecting: rejectVehicle.isPending,
    };
};
