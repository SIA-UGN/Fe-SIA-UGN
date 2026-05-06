'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mockCreateTagihanIndividu,
  mockGenerateTagihanMassal,
  mockSimulatePayment,
} from '@/lib/mock-api/ukt';
import { mockApproveVerifikasi, mockRejectVerifikasi } from '@/lib/mock-api/verifikasi';
import { resolveCurrentStudentNim, uktQueryKeys } from './useTagihan';

function invalidateAllUKT(queryClient) {
  return queryClient.invalidateQueries({ queryKey: uktQueryKeys.all });
}

export function useSimulatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const nim = payload?.nim || resolveCurrentStudentNim();
      return mockSimulatePayment({ ...payload, nim });
    },
    onSuccess: async () => {
      await invalidateAllUKT(queryClient);
    },
  });
}

export function useApprovePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, admin_notes }) => mockApproveVerifikasi(id, { admin_notes }),
    onSuccess: async () => {
      await invalidateAllUKT(queryClient);
    },
  });
}

export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejection_reason, admin_notes }) =>
      mockRejectVerifikasi(id, { rejection_reason, admin_notes }),
    onSuccess: async () => {
      await invalidateAllUKT(queryClient);
    },
  });
}

export function useGenerateTagihanMassal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => mockGenerateTagihanMassal(payload),
    onSuccess: async () => {
      await invalidateAllUKT(queryClient);
    },
  });
}

export function useCreateTagihanIndividu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => mockCreateTagihanIndividu(payload),
    onSuccess: async () => {
      await invalidateAllUKT(queryClient);
    },
  });
}
