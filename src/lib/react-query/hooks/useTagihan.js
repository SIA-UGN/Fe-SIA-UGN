'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  mockGetAdminDashboard,
  mockGetRiwayatPembayaranMahasiswa,
  mockGetTagihanAdmin,
  mockGetTagihanAdminDetail,
  mockGetTagihanDetail,
  mockGetTagihanMahasiswa,
  mockGetVirtualAccountMahasiswa,
} from '@/lib/mock-api/ukt';

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
      mockGetTagihanMahasiswa({
        nim,
        status: filters.status,
        academic_period_id: filters.academicPeriodId,
      }),
    select: (response) => response?.data,
  });
}

export function useTagihanDetailMahasiswa(id) {
  const nim = useMemo(() => resolveCurrentStudentNim(), []);

  return useQuery({
    queryKey: uktQueryKeys.mahasiswaTagihanDetail(nim, id),
    queryFn: () => mockGetTagihanDetail(id, { nim }),
    enabled: Boolean(id),
    select: (response) => response?.data,
  });
}

export function useRiwayatPembayaranMahasiswa() {
  const nim = useMemo(() => resolveCurrentStudentNim(), []);

  return useQuery({
    queryKey: uktQueryKeys.mahasiswaRiwayat(nim),
    queryFn: () => mockGetRiwayatPembayaranMahasiswa({ nim }),
    select: (response) => response?.data || [],
  });
}

export function useVirtualAccountMahasiswa() {
  const nim = useMemo(() => resolveCurrentStudentNim(), []);

  return useQuery({
    queryKey: uktQueryKeys.mahasiswaVirtualAccount(nim),
    queryFn: () => mockGetVirtualAccountMahasiswa({ nim }),
    select: (response) => response?.data || [],
  });
}

export function useAdminDashboardUKT(academicPeriodId) {
  return useQuery({
    queryKey: uktQueryKeys.adminDashboard(academicPeriodId),
    queryFn: () => mockGetAdminDashboard({ academic_period_id: academicPeriodId }),
    select: (response) => response?.data,
  });
}

export function useTagihanAdmin(filters = {}) {
  return useQuery({
    queryKey: uktQueryKeys.adminTagihan(filters),
    queryFn: () =>
      mockGetTagihanAdmin({
        academic_period_id: filters.academicPeriodId,
        status: filters.status,
        program_id: filters.programId,
        search: filters.search,
      }),
    select: (response) => response?.data || [],
  });
}

export function useTagihanAdminDetail(id) {
  return useQuery({
    queryKey: uktQueryKeys.adminTagihanDetail(id),
    queryFn: () => mockGetTagihanAdminDetail(id),
    enabled: Boolean(id),
    select: (response) => response?.data,
  });
}
