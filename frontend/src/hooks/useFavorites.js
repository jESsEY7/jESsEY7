import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client, { getErrorMessage } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

// Query key factory
export const favoriteKeys = {
    all: ['favorites'],
    list: (userId) => [...favoriteKeys.all, 'list', userId],
    check: (userId, vehicleId) => [...favoriteKeys.all, 'check', userId, vehicleId],
};

/**
 * Hook to manage user favorites with proper cache sync
 */
export const useFavorites = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    // Fetch favorites list
    const {
        data: favorites = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: favoriteKeys.list(userId),
        queryFn: async () => {
            const response = await client.get('/users/favorites/');
            // Handle both array and paginated response
            const data = response.data;
            return Array.isArray(data) ? data : (data.results || []);
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 2, // 2 minutes - shorter for better sync
        refetchOnWindowFocus: true,
    });

    // Toggle favorite mutation with optimistic updates
    const toggleMutation = useMutation({
        mutationFn: async (vehicleId) => {
            const response = await client.post('/users/favorites/toggle/', {
                vehicle_id: vehicleId
            });
            return response.data;
        },
        // Optimistic update for instant UI feedback
        onMutate: async (vehicleId) => {
            if (!userId) return;

            // Cancel in-flight queries
            await queryClient.cancelQueries({ queryKey: favoriteKeys.list(userId) });

            // Snapshot previous state
            const previousFavorites = queryClient.getQueryData(favoriteKeys.list(userId));

            // Optimistically update UI
            queryClient.setQueryData(favoriteKeys.list(userId), (old = []) => {
                const exists = old.some(f =>
                    (f.vehicle?.id || f.car?.id || f.vehicle_id) === vehicleId
                );

                if (exists) {
                    // Remove from favorites
                    return old.filter(f =>
                        (f.vehicle?.id || f.car?.id || f.vehicle_id) !== vehicleId
                    );
                }
                // For add, we'll let the server response update
                return old;
            });

            return { previousFavorites };
        },
        // Rollback on error
        onError: (err, vehicleId, context) => {
            console.error('Toggle favorite failed:', getErrorMessage(err));
            if (context?.previousFavorites) {
                queryClient.setQueryData(
                    favoriteKeys.list(userId),
                    context.previousFavorites
                );
            }
        },
        // Always refetch after mutation to ensure sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: favoriteKeys.list(userId) });
        }
    });

    // Check if vehicle is favorited
    const isFavorited = (vehicleId) => {
        if (!favorites || !Array.isArray(favorites)) return false;
        return favorites.some(f =>
            (f.vehicle?.id || f.car?.id || f.vehicle_id) === vehicleId
        );
    };

    // Get favorite count
    const favoriteCount = favorites?.length || 0;

    return {
        favorites,
        isLoading,
        error,
        favoriteCount,
        isFavorited,
        toggleFavorite: toggleMutation.mutate,
        toggleFavoriteAsync: toggleMutation.mutateAsync,
        isToggling: toggleMutation.isPending,
        refetch,
    };
};

/**
 * Hook to check if specific vehicle is favorited (for vehicle cards)
 */
export const useIsFavorited = (vehicleId) => {
    const { isFavorited, toggleFavorite, isToggling } = useFavorites();

    return {
        isFavorited: isFavorited(vehicleId),
        toggleFavorite: () => toggleFavorite(vehicleId),
        isToggling,
    };
};
