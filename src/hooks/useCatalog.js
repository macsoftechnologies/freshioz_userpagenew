import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '../api/client';

const EMPTY = { products: [], categories: [], units: [], societies: [], warehouses: [] };

// Fallback only used until the server answers. The server value always wins.
const DELIVERY_FALLBACK = { baseFee: 25, freeDeliveryThreshold: 299, enableFreeDelivery: true };

export function useCatalog() {
  const q = useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      const res = await apiClient(`/catalog?_t=${Date.now()}`);
      // Safety guard: NEVER accept null or malformed response that would wipe out the product catalog
      if (!res || !Array.isArray(res.products)) {
        throw new Error('Catalog payload is invalid or unavailable');
      }
      return res;
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,                // 15 seconds fresh before triggering background sync
    refetchInterval: 15_000,          // Refresh active prices smoothly without hammering the server
    refetchOnWindowFocus: true,       // Auto-refresh rates whenever user returns to website tab
    refetchIntervalInBackground: false,
  });
  const data = q.data || EMPTY;
  return {
    ...data,
    deliveryConfig: q.data?.deliveryConfig || DELIVERY_FALLBACK,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
  };
}
