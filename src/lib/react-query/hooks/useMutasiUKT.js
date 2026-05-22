'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAdminTuitionBill,
  generateAdminTuitionBills,
  rejectAdminTuitionPayment,
  submitStudentPayment,
  verifyAdminTuitionPayment,
} from '@/features/ukt/services/tuitionService';
import { uktQueryKeys } from './useTagihan';

function invalidateAllUKT(queryClient) {
  return queryClient.invalidateQueries({ queryKey: uktQueryKeys.all });
}

export function useSimulatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      if (!payload?.id_tuition_fee && !payload?.id) {
        throw new Error('id_tuition_fee wajib diisi.');
      }

      if (!payload?.payment_proof) {
        throw new Error('payment_proof wajib diisi.');
      }

      const tuitionFeeId = payload.id_tuition_fee || payload.id;
      return submitStudentPayment(tuitionFeeId, {
        payment_proof: payload.payment_proof,
        payment_method: payload.payment_method || 'virtual_account',
        transaction_reference: payload.transaction_reference,
        amount_paid: payload.amount_paid,
      });
    },
    onSuccess: async () => {
      await invalidateAllUKT(queryClient);
    },
  });
}

export function useApprovePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, admin_notes }) => verifyAdminTuitionPayment(id, { admin_notes }),
    onSuccess: async () => {
      await invalidateAllUKT(queryClient);
    },
  });
}

export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejection_reason, admin_notes }) =>
      rejectAdminTuitionPayment(id, { rejection_reason, admin_notes }),
    onSuccess: async () => {
      await invalidateAllUKT(queryClient);
    },
  });
}

export function useGenerateTagihanMassal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => generateAdminTuitionBills(payload),
    onSuccess: async () => {
      await invalidateAllUKT(queryClient);
    },
  });
}

export function useCreateTagihanIndividu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createAdminTuitionBill(payload),
    onSuccess: async () => {
      await invalidateAllUKT(queryClient);
    },
  });
}
