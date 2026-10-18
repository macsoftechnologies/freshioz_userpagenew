import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

const EMPTY = { products: [], categories: [], units: [], societies: [], warehouses: [] };

// Fallback only used until the server answers. The server value always wins.
const DELIVERY_FALLBACK = { baseFee: 25, freeDeliveryThreshold: 299, enableFreeDelivery: true };

export function useCatalog() {
  const q = useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiClient('/catalog'),
    staleTime: 15_000,
    refetchInterval: 60_000,          // prices change daily; 60s is plenty and pauses in background tabs
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
