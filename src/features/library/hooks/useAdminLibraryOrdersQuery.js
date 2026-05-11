import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ADMIN_LIBRARY_QUERY_KEYS,
  confirmAdminLibraryBorrowAction,
  confirmAdminLibraryReturnAction,
  fetchAdminLibraryOrderDetail,
  fetchAdminLibraryOrders,
} from '@/features/library/services/adminLibraryService';

export function useAdminLibraryOrdersQuery(params) {
  return useQuery({
    queryKey: ADMIN_LIBRARY_QUERY_KEYS.orders(params),
    queryFn: () => fetchAdminLibraryOrders(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminLibraryOrderDetailQuery(orderId, options = {}) {
  return useQuery({
    queryKey: ADMIN_LIBRARY_QUERY_KEYS.orderDetail(orderId),
    queryFn: () => fetchAdminLibraryOrderDetail(orderId),
    enabled: Boolean(orderId) && (options.enabled ?? true),
  });
}

export function useConfirmAdminLibraryBorrowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }) => confirmAdminLibraryBorrowAction(orderId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-library-orders'] });
      if (variables?.orderId) {
        queryClient.invalidateQueries({
          queryKey: ADMIN_LIBRARY_QUERY_KEYS.orderDetail(variables.orderId),
        });
      }
    },
  });
}

export function useConfirmAdminLibraryReturnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }) => confirmAdminLibraryReturnAction(orderId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-library-orders'] });
      if (variables?.orderId) {
        queryClient.invalidateQueries({
          queryKey: ADMIN_LIBRARY_QUERY_KEYS.orderDetail(variables.orderId),
        });
      }
    },
  });
}
