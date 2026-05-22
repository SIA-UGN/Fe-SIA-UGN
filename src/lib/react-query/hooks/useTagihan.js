'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAdminTuitionBillDetail,
  fetchAdminTuitionBills,
  fetchAdminTuitionDashboard,
  fetchStudentPaymentHistory,
  fetchStudentTuitionBillDetail,
  fetchStudentTuitionBills,
  fetchStudentVirtualAccount,
} from '@/features/ukt/services/tuitionService';

export const uktQueryKeys = {
  all: ['ukt'],
  mahasiswaTagihan: (nim, filters) => ['ukt', 'mahasiswa', 'tagihan', nim, filters],
  mahasiswaTagihanDetail: (nim, id) => ['ukt', 'mahasiswa', 'tagihan-detail', nim, id],
  mahasiswaRiwayat: (nim) => ['ukt', 'mahasiswa', 'riwayat', nim],
  mahasiswaVirtualAccount: (nim) => ['ukt', 'mahasiswa', 'virtual-account', nim],
  adminDashboard: (academicPeriodId) => ['ukt', 'admin', 'dashboard', academicPeriodId || 'active'],
  adminTagihan: (filters) => ['ukt', 'admin', 'tagihan', filters],
  adminTagihanDetail: (id) => ['ukt', 'admin', 'tagihan-detail', id],
  adminPayments: (filters) => ['ukt', 'admin', 'payments', filters],
  adminPaymentDetail: (id) => ['ukt', 'admin', 'payment-detail', id],
  adminPaymentTimeline: (id) => ['ukt', 'admin', 'payment-timeline', id],
};

export function resolveCurrentStudentNim() {
  if (typeof window === 'undefined') {
    return '2024001';
  }

  try {
    const userRaw = window.localStorage.getItem('user');
    if (userRaw) {
      const parsed = JSON.parse(userRaw);
      const nimCandidate =
        parsed?.registration_number ||
        parsed?.nim ||
        parsed?.student_profile?.registration_number ||
        parsed?.username;

      if (nimCandidate) {
        return String(nimCandidate);
      }
    }
  } catch (_error) {
    // Ignore localStorage parsing errors and use fallback value.
  }

  return '2024001';
}

export function useTagihanMahasiswa(filters = {}) {
  const nim = useMemo(() => resolveCurrentStudentNim(), []);

  return useQuery({
    queryKey: uktQueryKeys.mahasiswaTagihan(nim, filters),
    queryFn: () =>
      fetchStudentTuitionBills({
        status: filters.status,
        academic_period_id: filters.academicPeriodId,
      }),
    select: (response) => response,
  });
}

export function useTagihanDetailMahasiswa(id) {
  const nim = useMemo(() => resolveCurrentStudentNim(), []);

  return useQuery({
    queryKey: uktQueryKeys.mahasiswaTagihanDetail(nim, id),
    queryFn: () => fetchStudentTuitionBillDetail(id),
    enabled: Boolean(id),
    select: (response) => response?.bill,
  });
}

export function useRiwayatPembayaranMahasiswa() {
  const nim = useMemo(() => resolveCurrentStudentNim(), []);

  return useQuery({
    queryKey: uktQueryKeys.mahasiswaRiwayat(nim),
    queryFn: () => fetchStudentPaymentHistory(),
    select: (response) => response?.items || [],
  });
}

export function useVirtualAccountMahasiswa() {
  const nim = useMemo(() => resolveCurrentStudentNim(), []);

  return useQuery({
    queryKey: uktQueryKeys.mahasiswaVirtualAccount(nim),
    queryFn: () => fetchStudentVirtualAccount(),
    select: (response) => response?.account ?? null,
  });
}

export function useAdminDashboardUKT(academicPeriodId) {
  return useQuery({
    queryKey: uktQueryKeys.adminDashboard(academicPeriodId),
    queryFn: () => fetchAdminTuitionDashboard({ academic_period_id: academicPeriodId }),
    select: (response) => response?.dashboard,
  });
}

export function useTagihanAdmin(filters = {}) {
  return useQuery({
    queryKey: uktQueryKeys.adminTagihan(filters),
    queryFn: () =>
      fetchAdminTuitionBills({
        academic_period_id: filters.academicPeriodId,
        status: filters.status,
        program_id: filters.programId,
        search: filters.search,
      }),
    select: (response) => response?.items || [],
  });
}

export function useTagihanAdminDetail(id) {
  return useQuery({
    queryKey: uktQueryKeys.adminTagihanDetail(id),
    queryFn: () => fetchAdminTuitionBillDetail(id),
    enabled: Boolean(id),
    select: (response) => response?.bill,
  });
}
