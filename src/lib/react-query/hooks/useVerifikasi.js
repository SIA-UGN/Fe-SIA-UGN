'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchAdminTuitionPaymentDetail,
  fetchAdminTuitionPayments,
} from '@/features/ukt/services/tuitionService';
import { uktQueryKeys } from './useTagihan';

function summarizeVerification(rows = []) {
  return rows.reduce(
    (summary, row) => {
      if (row.verification_status === 'pending') summary.pending += 1;
      if (row.verification_status === 'verified') {
        summary.verified += 1;
        summary.total_received_amount += Number(row.amount_paid || 0);
      }
      if (row.verification_status === 'rejected') summary.rejected += 1;
      return summary;
    },
    {
      pending: 0,
      verified: 0,
      rejected: 0,
      total_received_amount: 0,
    },
  );
}

function buildTimeline(payment) {
  if (!payment) return [];

  const uploadedAt = payment.uploaded_at || null;
  const verifiedAt = payment.verified_at || null;
  const isVerified = payment.verification_status === 'verified';
  const isRejected = payment.verification_status === 'rejected';

  return [
    {
      key: 'uploaded',
      label: 'Bukti Diupload',
      time: uploadedAt,
      done: Boolean(uploadedAt),
      description: 'Mahasiswa mengunggah bukti pembayaran.',
    },
    {
      key: 'review',
      label: 'Proses Verifikasi',
      time: isVerified || isRejected ? verifiedAt : uploadedAt,
      done: isVerified || isRejected,
      description: 'Admin memeriksa kesesuaian nominal dan bukti transfer.',
    },
    {
      key: 'verified',
      label: 'Pembayaran Diverifikasi',
      time: isVerified ? verifiedAt : null,
      done: isVerified,
      description: 'Pembayaran diverifikasi dan tagihan dinyatakan lunas.',
    },
    {
      key: 'rejected',
      label: 'Pembayaran Ditolak',
      time: isRejected ? verifiedAt : null,
      done: isRejected,
      description: 'Pembayaran ditolak dan mahasiswa diminta upload ulang.',
    },
  ];
}

export function useVerifikasiList(filters = {}) {
  return useQuery({
    queryKey: uktQueryKeys.adminPayments(filters),
    queryFn: async () => {
      const response = await fetchAdminTuitionPayments({
        verification_status: filters.verificationStatus,
        search: filters.search,
      });
      const rows = response?.items || [];
      return { rows, summary: summarizeVerification(rows) };
    },
    select: (response) => response,
  });
}

export function useVerifikasiDetail(id) {
  return useQuery({
    queryKey: uktQueryKeys.adminPaymentDetail(id),
    queryFn: () => fetchAdminTuitionPaymentDetail(id),
    enabled: Boolean(id),
    select: (response) => response?.payment,
  });
}

export function usePaymentStatusTimeline(id) {
  return useQuery({
    queryKey: uktQueryKeys.adminPaymentTimeline(id),
    queryFn: async () => {
      const response = await fetchAdminTuitionPaymentDetail(id);
      return buildTimeline(response?.payment);
    },
    enabled: Boolean(id),
    select: (response) => response || [],
  });
}
