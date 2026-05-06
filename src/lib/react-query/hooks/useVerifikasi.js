'use client';

import { useQuery } from '@tanstack/react-query';
import {
  mockGetPaymentStatusTimeline,
  mockGetVerifikasiDetail,
  mockGetVerifikasiList,
} from '@/lib/mock-api/verifikasi';
import { uktQueryKeys } from './useTagihan';

export function useVerifikasiList(filters = {}) {
  return useQuery({
    queryKey: uktQueryKeys.adminPayments(filters),
    queryFn: () =>
      mockGetVerifikasiList({
        verification_status: filters.verificationStatus,
        search: filters.search,
      }),
    select: (response) => response?.data,
  });
}

export function useVerifikasiDetail(id) {
  return useQuery({
    queryKey: uktQueryKeys.adminPaymentDetail(id),
    queryFn: () => mockGetVerifikasiDetail(id),
    enabled: Boolean(id),
    select: (response) => response?.data,
  });
}

export function usePaymentStatusTimeline(id) {
  return useQuery({
    queryKey: uktQueryKeys.adminPaymentTimeline(id),
    queryFn: () => mockGetPaymentStatusTimeline(id),
    enabled: Boolean(id),
    select: (response) => response?.data || [],
  });
}
