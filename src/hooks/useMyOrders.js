import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

export function useMyOrders(enabled = true) {
  const q = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getAll(),
    enabled: Boolean(enabled),
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  return {
    orders: Array.isArray(q.data) ? q.data : [],
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
  };
}
